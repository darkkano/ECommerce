const DICTIONARY = [
  'playa',
  'noche',
  'ropa',
  'vestido',
  'lino',
  'verano',
  'invierno',
  'oficina',
  'comodo',
  'cómodo',
  'correr',
  'lluvia',
  'zapatos',
  'zapatillas',
  'cita',
  'elegante',
  'fiesta',
  'traje',
  'chaqueta',
  'abrigo',
  'sandalias',
  'mar',
  'anochecer',
  'bikini',
  'sombrero',
  'gafas',
  'bolso',
  'seda',
  'satén',
  'saten',
  'jersey',
  'blazer',
  'pantalon',
  'pantalón',
  'camisa',
  'outfit',
  'atuendo',
  'playa',
  'viajar',
  'viaje',
  'llueve',
  'deporte',
  'running',
  'formal',
  'casual',
  'oscuro',
  'negro',
  'blanco',
];

function fold(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (a === b) {
    return 0;
  }
  if (!a.length) {
    return b.length;
  }
  if (!b.length) {
    return a.length;
  }
  const row = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) {
    row[j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

function maxDistance(word) {
  if (word.length <= 3) {
    return 0;
  }
  if (word.length <= 5) {
    return 1;
  }
  return 2;
}

function closestWord(token) {
  let best = token;
  let bestDistance = Infinity;
  for (const word of DICTIONARY) {
    const distance = levenshtein(token, fold(word));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = fold(word);
    }
  }
  if (bestDistance <= maxDistance(token) && best !== token) {
    return { token: best, from: token, distance: bestDistance };
  }
  return { token, from: token, distance: 0 };
}

function correctQuery(query) {
  const folded = fold(query);
  const tokens = folded.split(' ').filter(Boolean);
  const corrections = [];
  const normalizedTokens = tokens.map((token) => {
    const result = closestWord(token);
    if (result.distance > 0) {
      corrections.push(result);
    }
    return result.token;
  });

  return {
    original: query,
    folded,
    tokens: normalizedTokens,
    text: normalizedTokens.join(' '),
    corrections,
  };
}

module.exports = {
  DICTIONARY,
  fold,
  levenshtein,
  correctQuery,
};
