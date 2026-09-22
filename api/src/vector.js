const DIM = {
  beach: 0,
  night: 1,
  day: 2,
  summer: 3,
  winter: 4,
  formal: 5,
  casual: 6,
  sport: 7,
  party: 8,
  office: 9,
  outdoor: 10,
  indoor: 11,
  light: 12,
  warm: 13,
  dark: 14,
  pale: 15,
  dress: 16,
  mens: 17,
  footwear: 18,
  accessory: 19,
  swim: 20,
  layering: 21,
  comfort: 22,
  luxury: 23,
  rain: 24,
  urban: 25,
  nature: 26,
  romantic: 27,
  travel: 28,
  knit: 29,
  metallic: 30,
  linen: 31,
};

const SIZE = Object.keys(DIM).length;
const LABELS = Object.keys(DIM);

function vec(partial = {}) {
  const vector = new Array(SIZE).fill(0);
  for (const [key, value] of Object.entries(partial)) {
    if (DIM[key] === undefined) {
      throw new Error(`Unknown dimension: ${key}`);
    }
    vector[DIM[key]] = value;
  }
  return vector;
}

function add(target, extra, weight = 1) {
  for (let i = 0; i < SIZE; i++) {
    target[i] += (extra[i] || 0) * weight;
  }
  return target;
}

function clamp01(vector) {
  return vector.map((value) => Math.max(0, Math.min(1, value)));
}

function magnitude(vector) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function normalize(vector) {
  const mag = magnitude(vector);
  if (!mag) {
    return vector.slice();
  }
  return vector.map((value) => value / mag);
}

function cosine(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom ? dot / denom : 0;
}

function topDimensions(queryVector, productVector, limit = 3) {
  const contributions = LABELS.map((label, index) => ({
    id: label,
    score: queryVector[index] * productVector[index],
  }))
    .filter((item) => item.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return contributions;
}

module.exports = {
  DIM,
  SIZE,
  LABELS,
  vec,
  add,
  clamp01,
  magnitude,
  normalize,
  cosine,
  topDimensions,
};
