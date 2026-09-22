-- MARE — referencia SQL. La fuente de verdad es api/src/schema.js (Drizzle).
-- El arranque real es: npm run db:setup  (drizzle-kit push + seed)

CREATE DATABASE IF NOT EXISTS mare
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mare;

-- ---------------------------------------------------------------------------
-- products
-- Pieza de catálogo. `kind` decide qué tarjeta Angular pinta el MFE:
--   garment | footwear | accessory | look
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  brand VARCHAR(80) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  kind ENUM('garment', 'footwear', 'accessory', 'look') NOT NULL,
  fabric VARCHAR(80) NOT NULL,
  image VARCHAR(512) NOT NULL,
  blurb VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_kind (kind),
  KEY idx_products_brand (brand)
) ENGINE=InnoDB;

-- Colores de cada prenda (1:N)
CREATE TABLE IF NOT EXISTS product_colors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id VARCHAR(32) NOT NULL,
  color VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_product_colors_product (product_id),
  CONSTRAINT fk_product_colors_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tallas (1:N)
CREATE TABLE IF NOT EXISTS product_sizes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id VARCHAR(32) NOT NULL,
  size VARCHAR(40) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_product_sizes_product (product_id),
  CONSTRAINT fk_product_sizes_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tags de texto para la búsqueda léxica (1:N)
CREATE TABLE IF NOT EXISTS product_tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id VARCHAR(32) NOT NULL,
  tag VARCHAR(80) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_product_tags_tag (tag),
  CONSTRAINT fk_product_tags_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Embedding de 32 dimensiones (búsqueda vectorial / cosine similarity)
-- dim_name: beach, night, summer, office, rain, linen...
-- weight: 0..1 qué tanto esa prenda “es” esa dimensión
CREATE TABLE IF NOT EXISTS product_vectors (
  product_id VARCHAR(32) NOT NULL,
  dim_index TINYINT UNSIGNED NOT NULL,
  dim_name VARCHAR(32) NOT NULL,
  weight DECIMAL(6, 4) NOT NULL,
  PRIMARY KEY (product_id, dim_index),
  KEY idx_product_vectors_dim (dim_name),
  CONSTRAINT fk_product_vectors_product
    FOREIGN KEY (product_id) REFERENCES products (id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- Historial de búsquedas del buscador semántico vs keyword
CREATE TABLE IF NOT EXISTS search_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  query_text VARCHAR(255) NOT NULL,
  mode ENUM('semantic', 'keyword') NOT NULL,
  semantic_count INT UNSIGNED NOT NULL DEFAULT 0,
  keyword_count INT UNSIGNED NOT NULL DEFAULT 0,
  latency_ms DECIMAL(10, 2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_search_logs_created (created_at)
) ENGINE=InnoDB;
