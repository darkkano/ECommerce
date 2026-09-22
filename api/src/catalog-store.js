const { SIZE, LABELS } = require('./vector');
const memoryCatalog = require('./catalog');

let products = memoryCatalog.products;
let source = 'memory';
let db;
let schema;

function hydrate(row) {
  const vector = new Array(SIZE).fill(0);
  for (const item of row.vectors) {
    vector[item.dimIndex] = Number(item.weight);
  }
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    kind: row.kind,
    fabric: row.fabric,
    image: row.image,
    blurb: row.blurb,
    description: row.description,
    colors: row.colors.map((item) => item.color),
    sizes: row.sizes.map((item) => item.size),
    tags: row.tags.map((item) => item.tag),
    vector,
  };
}

async function loadFromDatabase() {
  ({ db, schema } = require('./db'));
  const rows = await db.query.products.findMany({
    with: { colors: true, sizes: true, tags: true, vectors: true },
    orderBy: (p, { asc }) => [asc(p.id)],
  });
  if (!rows.length) {
    throw new Error('La tabla products está vacía. Corre npm run db:setup');
  }
  products = rows.map(hydrate);
  source = 'drizzle';
  return products;
}

async function initCatalog() {
  try {
    await loadFromDatabase();
    console.log(`Catálogo Drizzle listo: ${products.length} productos, ${LABELS.length} dimensiones.`);
  } catch (error) {
    products = memoryCatalog.products;
    source = 'memory';
    console.warn(
      `Drizzle/MySQL no disponible (${String(error.message || error).split('\n')[0]}). Uso catálogo en memoria.`,
    );
  }
}

function getProducts() {
  return products;
}

function getSource() {
  return source;
}

async function logSearch({ query, mode, semanticCount, keywordCount, latencyMs }) {
  if (source !== 'drizzle' || !db) {
    return;
  }
  try {
    await db.insert(schema.searchLogs).values({
      queryText: query.slice(0, 255),
      mode,
      semanticCount,
      keywordCount,
      latencyMs: latencyMs == null ? null : String(latencyMs),
    });
  } catch (error) {
    console.warn('No pude guardar search_logs:', error.message);
  }
}

module.exports = {
  initCatalog,
  getProducts,
  getSource,
  logSearch,
};
