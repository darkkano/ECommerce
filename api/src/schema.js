const {
  mysqlTable,
  varchar,
  int,
  decimal,
  text,
  timestamp,
  mysqlEnum,
  tinyint,
  primaryKey,
  index,
} = require('drizzle-orm/mysql-core');
const { relations } = require('drizzle-orm');

const products = mysqlTable(
  'products',
  {
    id: varchar('id', { length: 32 }).primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    brand: varchar('brand', { length: 80 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    kind: mysqlEnum('kind', ['garment', 'footwear', 'accessory', 'look']).notNull(),
    fabric: varchar('fabric', { length: 80 }).notNull(),
    image: varchar('image', { length: 512 }).notNull(),
    blurb: varchar('blurb', { length: 255 }).notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    kindIdx: index('idx_products_kind').on(t.kind),
    brandIdx: index('idx_products_brand').on(t.brand),
  }),
);

const productColors = mysqlTable(
  'product_colors',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    productId: varchar('product_id', { length: 32 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    color: varchar('color', { length: 80 }).notNull(),
  },
  (t) => ({ productIdx: index('idx_product_colors_product').on(t.productId) }),
);

const productSizes = mysqlTable(
  'product_sizes',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    productId: varchar('product_id', { length: 32 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    size: varchar('size', { length: 40 }).notNull(),
  },
  (t) => ({ productIdx: index('idx_product_sizes_product').on(t.productId) }),
);

const productTags = mysqlTable(
  'product_tags',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    productId: varchar('product_id', { length: 32 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    tag: varchar('tag', { length: 80 }).notNull(),
  },
  (t) => ({ tagIdx: index('idx_product_tags_tag').on(t.tag) }),
);

const productVectors = mysqlTable(
  'product_vectors',
  {
    productId: varchar('product_id', { length: 32 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    dimIndex: tinyint('dim_index', { unsigned: true }).notNull(),
    dimName: varchar('dim_name', { length: 32 }).notNull(),
    weight: decimal('weight', { precision: 6, scale: 4 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.dimIndex] }),
    nameIdx: index('idx_product_vectors_name').on(t.dimName),
  }),
);

const searchLogs = mysqlTable(
  'search_logs',
  {
    id: int('id').autoincrement().primaryKey(),
    queryText: varchar('query_text', { length: 255 }).notNull(),
    mode: mysqlEnum('mode', ['semantic', 'keyword']).notNull(),
    semanticCount: int('semantic_count').default(0).notNull(),
    keywordCount: int('keyword_count').default(0).notNull(),
    latencyMs: decimal('latency_ms', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ createdIdx: index('idx_search_logs_created').on(t.createdAt) }),
);

const productsRelations = relations(products, ({ many }) => ({
  colors: many(productColors),
  sizes: many(productSizes),
  tags: many(productTags),
  vectors: many(productVectors),
}));

const productColorsRelations = relations(productColors, ({ one }) => ({
  product: one(products, { fields: [productColors.productId], references: [products.id] }),
}));

const productSizesRelations = relations(productSizes, ({ one }) => ({
  product: one(products, { fields: [productSizes.productId], references: [products.id] }),
}));

const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, { fields: [productTags.productId], references: [products.id] }),
}));

const productVectorsRelations = relations(productVectors, ({ one }) => ({
  product: one(products, { fields: [productVectors.productId], references: [products.id] }),
}));

module.exports = {
  products,
  productColors,
  productSizes,
  productTags,
  productVectors,
  searchLogs,
  productsRelations,
  productColorsRelations,
  productSizesRelations,
  productTagsRelations,
  productVectorsRelations,
};
