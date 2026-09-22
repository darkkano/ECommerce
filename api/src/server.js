const express = require('express');
const cors = require('cors');
const { initCatalog, getSource, getProducts } = require('./catalog-store');
const { rank, featured, list } = require('./search');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/health
// Comprueba que el API está vivo y si el catálogo salió de MySQL o de memoria.
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'mare-search',
    engine: 'cosine-32d',
    catalog: getSource(),
    products: getProducts().length,
  });
});

// GET /api/products
// Lista el catálogo público (sin el vector interno).
app.get('/api/products', (_req, res) => {
  res.json({ products: list(), source: getSource() });
});

// GET /api/featured
// Home sin query: primeras 8 piezas del catálogo.
app.get('/api/featured', (_req, res) => {
  res.json(featured());
});

// GET /api/search?q=...&mode=semantic|keyword
// rank() corrige typos, arma el vector de intención, compara cosine y opcionalmente exige match léxico.
app.get('/api/search', (req, res) => {
  const query = String(req.query.q || '');
  const mode = req.query.mode === 'keyword' ? 'keyword' : 'semantic';
  res.json(rank(query, mode));
});

async function boot() {
  await initCatalog();
  app.listen(port, () => {
    console.log(`MARE search API ready on http://localhost:${port} [${getSource()}]`);
  });
}

boot().catch((error) => {
  console.error(error);
  process.exit(1);
});
