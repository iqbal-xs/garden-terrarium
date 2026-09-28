'use strict';

const vscode = require('vscode');
const { spawn, randomSpecies, rand, randInt } = require('./species');

// A cell of empty ground. Regular spaces collapse in the status bar, so this
// uses figure space (U+2007), which keeps its width and is not trimmed.
const CELL = '  ';

/**
 * One roaming strip of status bar. Creatures walk in from an edge, live for a
 * while, and wander back off; new ones show up on their own.
 */
class Strip {
  /** @param {vscode.StatusBarAlignment} alignment */
  constructor(alignment, priority) {
    this.item = vscode.window.createStatusBarItem(alignment, priority);
    this.item.command = 'gardenTerrarium.shoo';
    this.item.text = '';
    this.creatures = [];
    this.width = 18;
    this.max = 3;
    this.spawnIn = randInt(2, 20);
  }

  tick(running) {
    if (running) {
      this.spawnIn--;
      if (this.spawnIn <= 0 && this.creatures.length < this.max) {
        this.release();
        this.spawnIn = randInt(20, 90);
      }

      for (const c of this.creatures) {
        c.age++;
        c.step(c);
        // Near the end of its life it heads for the nearest edge and leaves.
        if (c.age > c.life) c.x += c.dir * (c.flies ? 1.2 : 0.5);
      }

      this.creatures = this.creatures.filter(
        (c) => c.x > -2.5 && c.x < this.width + 2.5
      );
    }
    this.render();
  }

  release(kind) {
    const fromLeft = Math.random() < 0.5;
    const c = spawn(
      kind || randomSpecies(),
      fromLeft ? -1 : this.width + 1,
      randInt(60, 300)
    );
    c.dir = fromLeft ? 1 : -1;
    this.creatures.push(c);
  }

  render() {
    const cells = new Array(this.width).fill(CELL);
    const here = [];
    for (const c of this.creatures) {
      const i = Math.round(c.x);
      if (i < 0 || i >= this.width) continue;
      cells[i] = c.glyph;
      here.push(c.kind);
    }
    const text = here.length ? cells.join('') : '';
    if (text !== this.item.text) this.item.text = text;

    const tip = here.length
      ? 'In the garden: ' + [...new Set(here)].join(', ') + '\nClick to shoo them.'
      : '';
    if (tip !== this.item.tooltip) this.item.tooltip = tip;

    if (text) this.item.show();
    else this.item.hide();
  }

  shoo() {
    for (const c of this.creatures) {
      c.age = c.life + 1;                       // send everyone home
      c.dir = c.x < this.width / 2 ? -1 : 1;
      c.pause = 0;
    }
  }

  clear() {
    this.creatures = [];
    this.item.text = '';
    this.item.hide();
  }

  dispose() {
    this.item.dispose();
  }
}

class StatusGarden {
  constructor() {
    /** @type {Strip[]} */
    this.strips = [];
    this.timer = undefined;
    this.running = true;
    this.enabled = true;
    this.tickMs = 140;
  }

  applyConfig(cfg) {
    const sb = cfg.statusBar;
    this.enabled = sb.enabled;
    this.tickMs = Math.round(sb.tickMs / Math.max(cfg.speed, 0.2));

    for (const s of this.strips) s.dispose();
    this.strips = [];

    if (this.enabled) {
      if (sb.alignment === 'left' || sb.alignment === 'both') {
        this.strips.push(new Strip(vscode.StatusBarAlignment.Left, -50));
      }
      if (sb.alignment === 'right' || sb.alignment === 'both') {
        this.strips.push(new Strip(vscode.StatusBarAlignment.Right, -50));
      }
      for (const s of this.strips) {
        s.width = sb.width;
        s.max = sb.maxCreatures;
      }
    }
    this.restart();
  }

  restart() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    if (!this.enabled || !this.strips.length) return;
    this.timer = setInterval(() => {
      for (const s of this.strips) s.tick(this.running);
    }, this.tickMs);
  }

  setRunning(v) { this.running = v; }

  release(kind) {
    if (!this.strips.length) return;
    const s = this.strips[(Math.random() * this.strips.length) | 0];
    s.release(kind);
  }

  shoo() { for (const s of this.strips) s.shoo(); }

  reset() { for (const s of this.strips) s.clear(); }

  dispose() {
    if (this.timer) clearInterval(this.timer);
    for (const s of this.strips) s.dispose();
    this.strips = [];
  }
}

module.exports = { StatusGarden, rand };
