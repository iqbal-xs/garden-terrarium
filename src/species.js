'use strict';

/**
 * Shared creature definitions for the text-based habitats (status bar + editor).
 * Everything is expressed in "cells": one cell is roughly one emoji wide.
 */

const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

const SPECIES = {
  butterfly: {
    name: 'butterfly',
    glyphs: ['\u{1F98B}'],
    weight: 5,
    flies: true,
    // Erratic: bursts of movement, direction changes, occasional hovering.
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      if (Math.random() < 0.18) c.dir *= -1;
      if (Math.random() < 0.14) { c.pause = randInt(1, 4); return; }
      c.x += c.dir * rand(0.5, 1.4);
      c.drift = rand(-1, 1);
    }
  },
  bee: {
    name: 'bee',
    glyphs: ['\u{1F41D}'],
    weight: 3,
    flies: true,
    step(c) {
      if (Math.random() < 0.22) c.dir *= -1;
      c.x += c.dir * rand(0.8, 1.8);
      c.drift = rand(-0.6, 0.6);
    }
  },
  grasshopper: {
    name: 'grasshopper',
    glyphs: ['\u{1F997}'],
    weight: 4,
    // Sit very still, then launch several cells at once.
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      if (Math.random() < 0.3) c.dir *= -1;
      c.x += c.dir * rand(2, 4.5);
      c.pause = randInt(3, 12);
    }
  },
  caterpillar: {
    name: 'caterpillar',
    glyphs: ['\u{1F41B}'],
    weight: 5,
    // Slow, steady, almost never turns around.
    step(c) {
      if (Math.random() < 0.02) c.dir *= -1;
      c.x += c.dir * rand(0.12, 0.3);
    }
  },
  ladybug: {
    name: 'ladybug',
    glyphs: ['\u{1F41E}'],
    weight: 4,
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      if (Math.random() < 0.08) { c.pause = randInt(2, 8); return; }
      if (Math.random() < 0.06) c.dir *= -1;
      c.x += c.dir * rand(0.3, 0.6);
    }
  },
  ant: {
    name: 'ant',
    glyphs: ['\u{1F41C}'],
    weight: 4,
    // Busy and purposeful: fast, straight, rarely stops.
    step(c) {
      if (Math.random() < 0.03) c.dir *= -1;
      c.x += c.dir * rand(0.6, 1.0);
    }
  },
  snail: {
    name: 'snail',
    glyphs: ['\u{1F40C}'],
    weight: 2,
    step(c) {
      c.x += c.dir * rand(0.05, 0.12);
    }
  },
  beetle: {
    name: 'beetle',
    glyphs: ['\u{1FAB2}'],
    weight: 3,
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      if (Math.random() < 0.1) { c.pause = randInt(1, 5); return; }
      c.x += c.dir * rand(0.25, 0.5);
    }
  },
  spider: {
    name: 'spider',
    glyphs: ['\u{1F577}️'],
    weight: 2,
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      if (Math.random() < 0.25) { c.pause = randInt(2, 9); return; }
      c.x += c.dir * rand(0.7, 1.6);
    }
  },
  cricket: {
    name: 'cricket',
    glyphs: ['\u{1F997}'],
    weight: 1,
    step(c) {
      if (c.pause > 0) { c.pause--; return; }
      c.x += c.dir * rand(1.5, 3);
      c.pause = randInt(2, 7);
    }
  }
};

const KEYS = Object.keys(SPECIES);

// Weighted so caterpillars and butterflies are common and spiders are a treat.
const WEIGHTED = KEYS.reduce((acc, k) => {
  for (let i = 0; i < SPECIES[k].weight; i++) acc.push(k);
  return acc;
}, []);

function randomSpecies() {
  return pick(WEIGHTED);
}

/**
 * @param {string} kind key of SPECIES
 * @param {number} x starting cell
 * @param {number} lifeTicks how many ticks before it wanders off
 */
function spawn(kind, x, lifeTicks) {
  const sp = SPECIES[kind] || SPECIES[randomSpecies()];
  return {
    kind: sp.name,
    glyph: pick(sp.glyphs),
    flies: !!sp.flies,
    step: sp.step,
    x,
    dir: Math.random() < 0.5 ? -1 : 1,
    drift: 0,
    pause: randInt(0, 5),
    life: lifeTicks,
    age: 0
  };
}

module.exports = { SPECIES, KEYS, randomSpecies, spawn, rand, randInt, pick };
