'use strict';

const vscode = require('vscode');
const { spawn, randomSpecies, rand, randInt } = require('./species');

const TYPING_QUIET_MS = 1100;

/**
 * Creatures that live on the open editor. They stay in the empty space to the
 * right of your code, so they never shift a single character of it.
 */
class EditorGarden {
  constructor() {
    this.decoration = vscode.window.createTextEditorDecorationType({
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
    });
    /** @type {Map<string, {creatures: any[], spawnIn: number}>} */
    this.gardens = new Map();
    this.timer = undefined;
    this.running = true;
    this.enabled = true;
    this.max = 3;
    this.tickMs = 200;
    this.pauseWhileTyping = true;
    this.lastEdit = 0;
  }

  applyConfig(cfg) {
    this.enabled = cfg.editor.enabled;
    this.max = cfg.editor.maxCreatures;
    this.tickMs = Math.round(cfg.editor.tickMs / Math.max(cfg.speed, 0.2));
    this.pauseWhileTyping = cfg.editor.pauseWhileTyping;
    if (!this.enabled) this.clearAll();
    this.restart();
  }

  restart() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (!this.enabled) return;
    this.timer = setInterval(() => this.tick(), this.tickMs);
  }

  setRunning(v) {
    this.running = v;
    if (!v) this.clearAll();
  }

  noteEdit() { this.lastEdit = Date.now(); }

  key(editor) {
    return editor.document.uri.toString() + '#' + (editor.viewColumn || 0);
  }

  tick() {
    if (!this.enabled || !this.running) return;

    const quiet = this.pauseWhileTyping && Date.now() - this.lastEdit < TYPING_QUIET_MS;
    const alive = new Set();

    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document.uri.scheme === 'output') continue;
      const k = this.key(editor);
      alive.add(k);

      if (quiet) {
        editor.setDecorations(this.decoration, []);
        continue;
      }

      let g = this.gardens.get(k);
      if (!g) {
        g = { creatures: [], spawnIn: randInt(1, 15) };
        this.gardens.set(k, g);
      }

      const view = this.viewport(editor);
      if (!view) { editor.setDecorations(this.decoration, []); continue; }

      this.update(g, view);
      editor.setDecorations(this.decoration, this.build(g, editor, view));
    }

    // Forget gardens whose editor is gone.
    for (const k of [...this.gardens.keys()]) {
      if (!alive.has(k)) this.gardens.delete(k);
    }
  }

  /** Lines currently on screen, so creatures never crawl where you can't see. */
  viewport(editor) {
    const ranges = editor.visibleRanges;
    if (!ranges.length) return null;
    const top = ranges[0].start.line;
    const bottom = ranges[ranges.length - 1].end.line;
    if (bottom < top) return null;
    return { top, bottom, height: bottom - top + 1 };
  }

  update(g, view) {
    g.spawnIn--;
    if (g.spawnIn <= 0 && g.creatures.length < this.max) {
      const c = spawn(randomSpecies(), rand(24, 76), randInt(50, 260));
      c.line = randInt(view.top, view.bottom);
      g.creatures.push(c);
      g.spawnIn = randInt(25, 110);
    }

    for (const c of g.creatures) {
      c.age++;
      c.step(c);

      if (c.x < 2) { c.x = 2; c.dir = 1; }
      if (c.x > 108) { c.x = 108; c.dir = -1; }

      // Fliers change lines freely; crawlers only creep to a neighbouring one.
      const chance = c.flies ? 0.3 : 0.05;
      if (Math.random() < chance) {
        c.line += c.flies ? randInt(-4, 4) : (Math.random() < 0.5 ? -1 : 1);
      }
      if (c.line < view.top || c.line > view.bottom) {
        c.line = Math.max(view.top, Math.min(view.bottom, c.line));
      }
    }

    g.creatures = g.creatures.filter((c) => c.age <= c.life);
  }

  build(g, editor, view) {
    const doc = editor.document;
    const out = [];
    for (const c of g.creatures) {
      const line = Math.max(0, Math.min(doc.lineCount - 1, c.line));
      if (line < view.top || line > view.bottom) continue;
      const len = doc.lineAt(line).text.length;
      // Sit past the end of the line, so no real character ever moves.
      const gap = Math.max(2, Math.round(c.x) - len);
      out.push({
        range: new vscode.Range(line, len, line, len),
        renderOptions: {
          after: {
            contentText: c.glyph,
            margin: '0 0 0 ' + gap + 'ch'
          }
        }
      });
    }
    return out;
  }

  release(kind) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return false;
    const view = this.viewport(editor);
    if (!view) return false;
    const k = this.key(editor);
    let g = this.gardens.get(k);
    if (!g) { g = { creatures: [], spawnIn: 60 }; this.gardens.set(k, g); }
    const c = spawn(kind, rand(24, 76), randInt(80, 300));
    c.line = randInt(view.top, view.bottom);
    g.creatures.push(c);
    return true;
  }

  clearAll() {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(this.decoration, []);
    }
    this.gardens.clear();
  }

  reset() { this.clearAll(); }

  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.clearAll();
    this.decoration.dispose();
  }
}

module.exports = { EditorGarden };
