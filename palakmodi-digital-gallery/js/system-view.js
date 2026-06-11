import { listenContributions } from "./firebase.js";

/* =====================================================
   SYSTEM VIEW — STABLE SILHOUETTES (DETERMINISTIC)
   ===================================================== */

const canvas = document.getElementById("systemViewCanvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;
const WIDTH = 800;
let height = 420;

const BG = "#0d0e13";
const items = [];

/* ---------------- CONFIG ---------------- */
const SIZE_MIN = 18;
const SIZE_MAX = 70;
const ALPHA = 0.32;

const CELL = 65;
const ATTRACT_STRENGTH = 0.75;
const NOISE = 0.35;

const BOTTOM_PADDING = 180;

/* ---------------- HASHED RNG ---------------- */

/* Simple deterministic hash */
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

/* Seeded random generator */
function seededRandom(seed) {
  let x = seed % 2147483647;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

/* ---------------- DENSITY FIELD ---------------- */

const densityGrid = {};

function gridKey(x, y) {
  return `${Math.floor(x / CELL)},${Math.floor(y / CELL)}`;
}

function addDensity(x, y) {
  const k = gridKey(x, y);
  densityGrid[k] = (densityGrid[k] || 0) + 1;
}

function getDensityBias(x, y) {
  const cx = Math.floor(x / CELL);
  const cy = Math.floor(y / CELL);

  let best = null;
  let max = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const k = `${cx + dx},${cy + dy}`;
      const v = densityGrid[k] || 0;
      if (v > max) {
        max = v;
        best = { x: (cx + dx) * CELL, y: (cy + dy) * CELL };
      }
    }
  }
  return best;
}

/* ---------------- RESIZE ---------------- */

function resize() {
  canvas.width = WIDTH * dpr;
  canvas.height = height * dpr;
  canvas.style.width = WIDTH + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

/* ---------------- DRAW ---------------- */

function redraw() {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, height);

  ctx.globalAlpha = ALPHA;
  for (const item of items) {
    ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
  }
  ctx.globalAlpha = 1;
}

/* ---------------- CANVAS GROW ---------------- */

function ensureSpace(y, h) {
  if (y + h > height - BOTTOM_PADDING) {
    height += 200;
    resize();
  }
}

/* ---------------- ADD CONTRIBUTION ---------------- */

function addContribution(dataURL) {
  const img = new Image();

  img.onload = () => {
    /* Seed based on image */
    const seed = hashString(dataURL);
    const rand = seededRandom(seed);

    const size =
      SIZE_MIN + rand() * (SIZE_MAX - SIZE_MIN);

    let x = rand() * (WIDTH - size);
    let y = rand() * (height - size - 40);

    /* Density attraction (still probabilistic, but seeded) */
    const bias = getDensityBias(x, y);
    if (bias && rand() < ATTRACT_STRENGTH) {
      x =
        bias.x +
        rand() * CELL * NOISE -
        size / 2;
      y =
        bias.y +
        rand() * CELL * NOISE -
        size / 2;
    }

    x = Math.max(0, Math.min(WIDTH - size, x));
    y = Math.max(0, Math.min(height - size, y));

    ensureSpace(y, size);
    addDensity(x, y);

    items.push({
      img,
      x,
      y,
      w: size,
      h: size
    });

    redraw();
  };

  img.src = dataURL;
}

/* ---------------- INIT ---------------- */

resize();

canvas.style.opacity = 0;
requestAnimationFrame(() => {
  canvas.style.transition = "opacity 1.2s ease";
  canvas.style.opacity = 1;
});

/* Firebase + local */
listenContributions(addContribution);
window.SystemView = { addContribution };