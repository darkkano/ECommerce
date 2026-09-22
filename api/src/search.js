const { getProducts, logSearch } = require('./catalog-store');
const { cosine, topDimensions, LABELS } = require('./vector');
const { correctQuery, fold } = require('./fuzzy');
const { parseIntent, significantTokens } = require('./intent');

const REASON_COPY = {
  beach: 'Encaja con un entorno de mar y orilla',
  night: 'Se lee bien cuando baja la luz',
  day: 'Está pensado para luz de día',
  summer: 'Tejido y peso de clima cálido',
  winter: 'Aísla cuando hace frío',
  formal: 'Tiene lenguaje sastre',
  casual: 'Se lleva sin esfuerzo',
  sport: 'Responde a movimiento y entrenamiento',
  party: 'Nació para pista y flash',
  office: 'Funciona en un entorno de trabajo',
  outdoor: 'Aguanta el exterior',
  indoor: 'Su sitio es un interior',
  light: 'Es liviano y respira',
  warm: 'Suma calor',
  dark: 'El tono oscuro sostiene la noche',
  pale: 'La paleta clara pide sol',
  dress: 'Construye un atuendo, no un extra',
  mens: 'Corte y proporción masculina',
  footwear: 'Resuelve el calzado del momento',
  accessory: 'Cierra el look sin peso',
  swim: 'Nació para el agua',
  layering: 'Funciona como capa',
  comfort: 'Prioriza comodidad',
  luxury: 'Tiene presencia de atelier',
  rain: 'Aguanta agua y asfalto mojado',
  urban: 'Habla de ciudad',
  nature: 'Dialoga con un entorno natural',
  romantic: 'Tiene gesto de cita',
  travel: 'Está pensado para moverse',
  knit: 'El punto da cuerpo',
  metallic: 'Un brillo contenido, de farol no de sol',
  linen: 'El lino es el tejido del calor húmedo',
};

function lexicalScore(tokens, product) {
  if (!tokens.length) {
    return 0;
  }
  const haystack = fold(`${product.name} ${product.blurb} ${product.description} ${product.tags.join(' ')}`);
  const words = haystack.split(' ').filter((word) => word.length > 2);
  let hits = 0;
  for (const token of tokens) {
    const matched = words.some((word) => {
      if (word === token) {
        return true;
      }
      if (token.length < 4 || word.length < 4) {
        return false;
      }
      return word.startsWith(token) || token.startsWith(word);
    });
    if (matched) {
      hits += 1;
    }
  }
  return hits / tokens.length;
}

function reasonsFor(queryVector, product) {
  const dims = topDimensions(queryVector, product.vector, 3);
  const lines = dims.map((item) => REASON_COPY[item.id]).filter(Boolean);
  if (!lines.length) {
    return [product.blurb];
  }
  return lines;
}

function toPublicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    kind: product.kind,
    fabric: product.fabric,
    colors: product.colors,
    sizes: product.sizes,
    image: product.image,
    blurb: product.blurb,
    description: product.description,
    tags: product.tags,
  };
}

function rank(query, mode = 'semantic') {
  const started = performance.now();
  const corrected = correctQuery(query);
  const intent = parseIntent(corrected.text, corrected.tokens);
  const meaningful = significantTokens(corrected.tokens);

  const catalog = getProducts();
  const ranked = catalog.map((product) => {
    const vectorScore = cosine(intent.vector, product.vector);
    const lexical = lexicalScore(meaningful, product);
    const hybrid = vectorScore * 0.88 + lexical * 0.12;
    return {
      product: toPublicProduct(product),
      vectorScore,
      lexicalScore: lexical,
      hybridScore: hybrid,
      affinity: Math.round(hybrid * 100),
      keywordMatch: meaningful.length > 0 && lexical === 1,
      reasons: reasonsFor(intent.vector, product),
      dims: topDimensions(intent.vector, product.vector, 3).map((item) => item.id),
    };
  });

  const semanticHits = ranked
    .filter((hit) => hit.hybridScore >= 0.42 || hit.vectorScore >= 0.48)
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, 12);

  const keywordHits = ranked
    .filter((hit) => hit.keywordMatch)
    .sort((a, b) => b.lexicalScore - a.lexicalScore || b.hybridScore - a.hybridScore)
    .slice(0, 12);

  const featuredHits = catalog.slice(0, 8).map((product) => ({
    product: toPublicProduct(product),
    vectorScore: 0,
    lexicalScore: 0,
    hybridScore: 0,
    affinity: 0,
    keywordMatch: false,
    reasons: [product.blurb],
    dims: [],
  }));

  const usedHits = !fold(query)
    ? featuredHits
    : mode === 'keyword'
      ? keywordHits
      : semanticHits;

  const payload = {
    query,
    mode,
    corrected: corrected.corrections.length
      ? {
          text: corrected.text,
          changes: corrected.corrections.map((item) => ({
            from: item.from,
            to: item.token,
          })),
        }
      : null,
    intent: {
      id: intent.occasion.id,
      summary: intent.occasion.label,
      chips: intent.chips,
      tokens: intent.tokens,
      dims: LABELS.length,
    },
    counts: {
      catalog: catalog.length,
      semantic: semanticHits.length,
      keyword: keywordHits.length,
    },
    hits: usedHits,
    keywordHits,
    semanticHits,
    metrics: {
      totalMs: Number((performance.now() - started).toFixed(2)),
      dims: LABELS.length,
      engine: 'cosine-32d-hybrid',
    },
  };

  void logSearch({
    query,
    mode,
    semanticCount: semanticHits.length,
    keywordCount: keywordHits.length,
    latencyMs: payload.metrics.totalMs,
  });

  return payload;
}

function featured() {
  return rank('', 'semantic');
}

function list() {
  return getProducts().map(toPublicProduct);
}

module.exports = { rank, featured, list };
