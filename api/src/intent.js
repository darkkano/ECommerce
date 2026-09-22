const { vec, add, clamp01, SIZE } = require('./vector');
const { fold } = require('./fuzzy');

const STOP = new Set([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'al',
  'a',
  'para',
  'por',
  'con',
  'sin',
  'en',
  'y',
  'o',
  'que',
  'se',
  'su',
  'mi',
  'me',
  'te',
  'ir',
  'voy',
  'quiero',
  'busco',
  'algo',
  'cuando',
  'como',
  'más',
  'mas',
  'muy',
  'the',
  'for',
  'to',
  'of',
]);

const CONCEPTS = {
  playa: { beach: 1, outdoor: 0.6, summer: 0.5, nature: 0.4 },
  playas: { beach: 1, outdoor: 0.6 },
  mar: { beach: 0.85, outdoor: 0.5, nature: 0.5 },
  costa: { beach: 0.8, outdoor: 0.5 },
  orilla: { beach: 0.8, outdoor: 0.5 },
  arena: { beach: 0.7, outdoor: 0.4 },
  piscina: { beach: 0.45, swim: 0.7, summer: 0.5, day: 0.4 },
  noche: { night: 1, dark: 0.45 },
  noches: { night: 1, dark: 0.4 },
  anochecer: { night: 0.9, beach: 0.15, dark: 0.35 },
  atardecer: { night: 0.7, day: 0.2, outdoor: 0.3 },
  luna: { night: 0.8, romantic: 0.3 },
  copa: { night: 0.55, party: 0.35, luxury: 0.2 },
  cena: { night: 0.6, romantic: 0.45, formal: 0.25 },
  terraza: { night: 0.35, outdoor: 0.6 },
  dia: { day: 1 },
  sol: { day: 0.9, summer: 0.5, outdoor: 0.4 },
  mediodia: { day: 1, summer: 0.4 },
  verano: { summer: 0.95, light: 0.4 },
  calor: { summer: 0.8, light: 0.6 },
  fresco: { light: 0.7, summer: 0.35 },
  ligero: { light: 0.85 },
  ligera: { light: 0.85 },
  invierno: { winter: 1, warm: 0.7 },
  frio: { winter: 0.8, warm: 0.7 },
  abrigo: { winter: 0.85, warm: 0.8, layering: 0.5 },
  elegante: { luxury: 0.55, formal: 0.55, romantic: 0.2 },
  formal: { formal: 0.95, office: 0.3 },
  sastre: { formal: 0.8, office: 0.6 },
  oficina: { office: 1, indoor: 0.5, urban: 0.4, formal: 0.5 },
  trabajo: { office: 0.9, indoor: 0.4 },
  reunion: { office: 0.8, formal: 0.5 },
  comodo: { comfort: 0.95, casual: 0.4 },
  comodidad: { comfort: 0.9 },
  casual: { casual: 0.9 },
  deporte: { sport: 0.95, outdoor: 0.4 },
  correr: { sport: 1, footwear: 0.5, outdoor: 0.5 },
  running: { sport: 1, footwear: 0.5 },
  entrenar: { sport: 0.9 },
  lluvia: { rain: 1, outdoor: 0.4 },
  llueve: { rain: 1 },
  mojado: { rain: 0.7 },
  fiesta: { party: 1, night: 0.5 },
  club: { party: 0.9, night: 0.6 },
  cita: { romantic: 1, night: 0.45 },
  romantico: { romantic: 0.95, night: 0.3 },
  viaje: { travel: 0.95 },
  viajar: { travel: 0.95 },
  avion: { travel: 0.8 },
  aeropuerto: { travel: 0.85 },
  vestido: { dress: 0.95 },
  ropa: { dress: 0.25, casual: 0.15, layering: 0.1 },
  atuendo: { dress: 0.3, layering: 0.2 },
  outfit: { dress: 0.3, layering: 0.2 },
  prenda: { dress: 0.2 },
  zapatos: { footwear: 1 },
  zapato: { footwear: 1 },
  zapatillas: { footwear: 0.9, sport: 0.4, casual: 0.3 },
  sandalias: { footwear: 0.9, summer: 0.5, beach: 0.35 },
  sandalia: { footwear: 0.9, summer: 0.5 },
  bolso: { accessory: 0.95 },
  clutch: { accessory: 0.8, night: 0.4 },
  gafas: { accessory: 0.8, day: 0.4 },
  sombrero: { accessory: 0.8, day: 0.5, beach: 0.3 },
  lino: { linen: 1, light: 0.5, summer: 0.4 },
  seda: { luxury: 0.4, light: 0.3 },
  saten: { luxury: 0.35, romantic: 0.35, night: 0.25 },
  negro: { dark: 0.9, night: 0.25 },
  oscuro: { dark: 0.9, night: 0.3 },
  blanco: { pale: 0.9, day: 0.2 },
  hombre: { mens: 0.9 },
  hombres: { mens: 0.9 },
  mujer: { dress: 0.35 },
  bikini: { swim: 1, beach: 0.8, day: 0.6, summer: 0.5 },
  bañador: { swim: 1, beach: 0.7, day: 0.5 },
  jersey: { knit: 0.9, warm: 0.6 },
  urban: { urban: 0.8 },
  ciudad: { urban: 0.85 },
};

const OCCASIONS = [
  {
    id: 'beach-night',
    label: 'Atuendo para el anochecer junto al mar',
    chips: ['Playa', 'Noche', 'Ligero', 'Oscuro'],
    test: (tokens) =>
      intersects(tokens, ['playa', 'mar', 'costa', 'orilla', 'arena']) &&
      intersects(tokens, ['noche', 'noches', 'anochecer', 'atardecer', 'luna', 'copa', 'cena']),
    vector: vec({
      beach: 1,
      night: 1,
      summer: 0.72,
      casual: 0.4,
      outdoor: 0.82,
      light: 0.78,
      dark: 0.74,
      dress: 0.52,
      layering: 0.48,
      luxury: 0.38,
      romantic: 0.46,
      linen: 0.7,
      metallic: 0.28,
      footwear: 0.38,
      accessory: 0.22,
      swim: 0.08,
      nature: 0.4,
      party: 0.12,
    }),
  },
  {
    id: 'beach-day',
    label: 'Sol, agua y sombra — look de mediodía',
    chips: ['Playa', 'Día', 'Baño'],
    test: (tokens) =>
      intersects(tokens, ['playa', 'mar', 'bikini', 'banador', 'piscina']) &&
      intersects(tokens, ['dia', 'sol', 'mediodia', 'nadar', 'baño']),
    vector: vec({
      beach: 1,
      day: 1,
      summer: 0.9,
      swim: 0.8,
      outdoor: 0.85,
      pale: 0.4,
      accessory: 0.35,
      footwear: 0.3,
    }),
  },
  {
    id: 'office-summer',
    label: 'Oficina en verano, sin perder el sastre',
    chips: ['Oficina', 'Verano', 'Cómodo'],
    test: (tokens) =>
      intersects(tokens, ['oficina', 'trabajo', 'reunion', 'sastre']) &&
      intersects(tokens, ['verano', 'calor', 'comodo', 'fresco', 'ligero', 'ligera']),
    vector: vec({
      office: 1,
      summer: 0.7,
      formal: 0.75,
      indoor: 0.6,
      urban: 0.55,
      light: 0.55,
      comfort: 0.5,
      mens: 0.35,
    }),
  },
  {
    id: 'run-rain',
    label: 'Correr cuando el asfalto está mojado',
    chips: ['Deporte', 'Lluvia', 'Agarre'],
    test: (tokens) =>
      intersects(tokens, ['correr', 'running', 'entrenar', 'deporte', 'zapatillas']) &&
      intersects(tokens, ['lluvia', 'llueve', 'mojado', 'agua']),
    vector: vec({
      sport: 1,
      rain: 1,
      outdoor: 0.85,
      footwear: 0.7,
      layering: 0.35,
      light: 0.4,
    }),
  },
  {
    id: 'date-night',
    label: 'Cita elegante, luz baja',
    chips: ['Cita', 'Noche', 'Elegante'],
    test: (tokens) =>
      intersects(tokens, ['cita', 'romantico', 'elegante']) ||
      (intersects(tokens, ['cena']) && intersects(tokens, ['elegante', 'vestido', 'saten'])),
    vector: vec({
      romantic: 1,
      night: 0.8,
      dress: 0.7,
      luxury: 0.6,
      indoor: 0.5,
      formal: 0.4,
      party: 0.25,
    }),
  },
];

function intersects(tokens, words) {
  return tokens.some((token) => words.includes(token));
}

function significantTokens(tokens) {
  return tokens.filter((token) => token.length > 2 && !STOP.has(token));
}

function parseIntent(correctedText, tokens) {
  const meaningful = significantTokens(tokens);
  const queryVector = new Array(SIZE).fill(0);
  const chips = [];
  const matchedConcepts = [];

  const occasion = OCCASIONS.find((item) => item.test(meaningful));
  if (occasion) {
    add(queryVector, occasion.vector, 1.25);
    chips.push(...occasion.chips);
  }

  for (const token of meaningful) {
    const concept = CONCEPTS[token];
    if (concept) {
      add(queryVector, vec(concept), 1);
      matchedConcepts.push(token);
    }
  }

  if (!occasion && !matchedConcepts.length) {
    add(queryVector, vec({ casual: 0.3, comfort: 0.2, urban: 0.15 }), 1);
  }

  const uniqueChips = [...new Set(chips)];
  if (!uniqueChips.length) {
    uniqueChips.push(...matchedConcepts.slice(0, 4).map(capitalize));
  }

  return {
    occasion: occasion
      ? { id: occasion.id, label: occasion.label }
      : {
          id: 'open',
          label: matchedConcepts.length
            ? `Busco el sentido de: ${matchedConcepts.slice(0, 4).join(', ')}`
            : 'Todavía estoy leyendo el contexto',
        },
    chips: uniqueChips.slice(0, 6).map((label) => ({ id: fold(label), label })),
    vector: clamp01(queryVector),
    tokens: meaningful,
  };
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
  STOP,
  parseIntent,
  significantTokens,
};
