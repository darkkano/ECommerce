const { execSync } = require('child_process');
const path = require('path');
const mysql = require('mysql2/promise');
const { loadEnv } = require('./load-env');
const { products } = require('./catalog');
const { LABELS } = require('./vector');

const root = path.join(__dirname, '..', '..');
loadEnv(root);

const dbName = process.env.DB_NAME || 'mare';
const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const url = process.env.DATABASE_URL || `mysql://${user}:${password}@${host}:${port}/${dbName}`;

async function ensureDatabase() {
  const conn = await mysql.createConnection({ host, port, user, password });
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.end();
}

function pushSchema() {
  execSync('npx drizzle-kit push --force', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}

async function seed() {
  const { db, schema } = require('./db');
  await db.delete(schema.searchLogs);
  await db.delete(schema.productVectors);
  await db.delete(schema.productTags);
  await db.delete(schema.productSizes);
  await db.delete(schema.productColors);
  await db.delete(schema.products);

  for (const product of products) {
    await db.insert(schema.products).values({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      kind: product.kind,
      fabric: product.fabric,
      image: product.image,
      blurb: product.blurb,
      description: product.description,
    });
    if (product.colors.length) {
      await db.insert(schema.productColors).values(
        product.colors.map((color) => ({ productId: product.id, color })),
      );
    }
    if (product.sizes.length) {
      await db.insert(schema.productSizes).values(
        product.sizes.map((size) => ({ productId: product.id, size })),
      );
    }
    if (product.tags.length) {
      await db.insert(schema.productTags).values(
        product.tags.map((tag) => ({ productId: product.id, tag })),
      );
    }
    const vectors = product.vector
      .map((weight, dimIndex) =>
        weight ? { productId: product.id, dimIndex, dimName: LABELS[dimIndex], weight: String(weight) } : null,
      )
      .filter(Boolean);
    if (vectors.length) {
      await db.insert(schema.productVectors).values(vectors);
    }
  }

  await require('./db').pool.end();
}

async function main() {
  console.log(`Drizzle → MySQL ${user}@${host}:${port}/${dbName}`);
  await ensureDatabase();
  pushSchema();
  await seed();
  console.log(`Listo. ${products.length} productos con Drizzle.`);
}

main().catch((error) => {
  console.error('\nNo pude crear la BD. Arranca MySQL en XAMPP (MySQL → Start).\n');
  console.error(error.message);
  process.exit(1);
});
