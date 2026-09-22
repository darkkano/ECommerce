const path = require('path');
const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const { loadEnv } = require('./load-env');
const schema = require('./schema');

loadEnv(path.join(__dirname, '..', '..'));

if (!process.env.DATABASE_URL) {
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || '3306';
  const name = process.env.DB_NAME || 'mare';
  process.env.DATABASE_URL = `mysql://${user}:${password}@${host}:${port}/${name}`;
}

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
});

const db = drizzle(pool, { schema, mode: 'default' });

module.exports = { db, schema, pool };
