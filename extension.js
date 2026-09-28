'use strict';

const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { StatusGarden } = require('./src/statusGarden');
const { EditorGarden } = require('./src/editorGarden');
const { KEYS } = require('./src/species');

// Every webview habitat: activity bar, Explorer pane, bottom panel.
// A view can also be dragged into the secondary side bar by hand.
const WEBVIEW_VIEWS = [
  'gardenTerrarium.view',
  'gardenTerrarium.explorer',
  'gardenTerrarium.panel'
];

class GardenViewProvider {
  /** @param {vscode.Uri} extensionUri */
  constructor(extensionUri, getConfig) {
    this.extensionUri = extensionUri;
    this.getConfig = getConfig;
    /** @type {vscode.WebviewView | undefined} */
    this.view = undefined;
  }

  resolveWebviewView(webviewView) {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')]
    };
    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg && msg.type === 'ready') this.push();
    });

    webviewView.onDidChangeVisibility(() => {
      this.post({ type: 'visibility', visible: webviewView.visible });
    });

    webviewView.onDidDispose(() => { this.view = undefined; });
  }

  post(message) {
    if (this.view) this.view.webview.postMessage(message);
  }

  push() {
    this.post({ type: 'config', config: this.getConfig().panels });
  }

  getHtml(webview) {
    const nonce = crypto.randomBytes(16).toString('base64');
    const file = path.join(this.extensionUri.fsPath, 'media', 'garden.html');
    const html = fs.readFileSync(file, 'utf8');
    return html
      .replace(/\{\{nonce\}\}/g, nonce)
      .replace(/\{\{cspSource\}\}/g, webview.cspSource);
  }
}

function readConfig() {
  const c = vscode.workspace.getConfiguration('gardenTerrarium');
  return {
    speed: c.get('speed', 1),
    panels: {
      butterflies: c.get('butterflies', 3),
      grasshoppers: c.get('grasshoppers', 2),
      caterpillars: c.get('caterpillars', 2),
      ladybugs: c.get('ladybugs', 2),
      bees: c.get('bees', 1),
      fireflies: c.get('fireflies', true),
      speed: c.get('speed', 1)
    },
    statusBar: {
      enabled: c.get('statusBar.enabled', true),
      alignment: c.get('statusBar.alignment', 'both'),
      width: c.get('statusBar.width', 18),
      maxCreatures: c.get('statusBar.maxCreatures', 3),
      tickMs: c.get('statusBar.tickMs', 140)
    },
    editor: {
      enabled: c.get('editor.enabled', true),
      maxCreatures: c.get('editor.maxCreatures', 3),
      tickMs: c.get('editor.tickMs', 200),
      pauseWhileTyping: c.get('editor.pauseWhileTyping', true)
    }
  };
}

function activate(context) {
  let config = readConfig();
  const getConfig = () => config;

  const providers = WEBVIEW_VIEWS.map((id) => {
    const p = new GardenViewProvider(context.extensionUri, getConfig);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(id, p, {
        webviewOptions: { retainContextWhenHidden: false }
      })
    );
    return p;
  });

  const statusGarden = new StatusGarden();
  const editorGarden = new EditorGarden();
  context.subscriptions.push(statusGarden, editorGarden);

  statusGarden.applyConfig(config);
  editorGarden.applyConfig(config);

  const broadcast = (msg) => providers.forEach((p) => p.post(msg));
  let running = true;

  async function flip(key, label) {
    const c = vscode.workspace.getConfiguration('gardenTerrarium');
    const next = !c.get(key, true);
    await c.update(key, next, vscode.ConfigurationTarget.Global);
    vscode.window.setStatusBarMessage(
      label + (next ? ' released \u{1F41B}' : ' sent home \u{1F343}'),
      2500
    );
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(() => editorGarden.noteEdit()),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('gardenTerrarium')) return;
      config = readConfig();
      statusGarden.applyConfig(config);
      editorGarden.applyConfig(config);
      providers.forEach((p) => p.push());
    }),

    vscode.commands.registerCommand('gardenTerrarium.toggleMotion', () => {
      running = !running;
      statusGarden.setRunning(running);
      editorGarden.setRunning(running);
      broadcast({ type: 'toggleMotion' });
      vscode.window.setStatusBarMessage(
        running ? '\u{1F98B} The garden wakes up.' : '\u{1F343} The garden holds still.',
        2500
      );
    }),

    vscode.commands.registerCommand('gardenTerrarium.addCreature', async () => {
      const kind = await vscode.window.showQuickPick(KEYS, {
        placeHolder: 'Which creature should join the garden?'
      });
      if (!kind) return;
      broadcast({ type: 'add', kind });
      statusGarden.release(kind);
      editorGarden.release(kind);
    }),

    vscode.commands.registerCommand('gardenTerrarium.shoo', () => {
      statusGarden.shoo();
    }),

    vscode.commands.registerCommand('gardenTerrarium.reset', () => {
      config = readConfig();
      statusGarden.applyConfig(config);
      editorGarden.reset();
      broadcast({ type: 'reset' });
      providers.forEach((p) => p.push());
    }),

    vscode.commands.registerCommand('gardenTerrarium.toggleStatusBar', () =>
      flip('statusBar.enabled', 'Status bar creatures')
    ),

    vscode.commands.registerCommand('gardenTerrarium.toggleEditorCreatures', () =>
      flip('editor.enabled', 'Creatures on your code')
    )
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
