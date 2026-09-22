# MARE — E-commerce headless con búsqueda semántica

## Resumen (qué hace este proyecto)

Es una **tienda de moda** donde el buscador clásico falla si escribes mal o describes un momento.

Ejemplo: buscas *«ropa para ir a la playa de noche»*. Ninguna prenda tiene esa frase. La búsqueda por palabra exacta da **0**. La semántica entiende playa + anochecer + ropa ligera y muestra caftán, lino oscuro, sandalias, etc.

El catálogo no es un monolito: el **shell** (layout, buscador, carrito) carga un **micro-frontend** que pinta la tarjeta según el tipo de producto (look, prenda, calzado, accesorio).

**Stack:** Angular 21 + Native Federation · Node/Express · **Drizzle** · MySQL (XAMPP) con vectores de 32 dimensiones.

---

## Arquitectura hexagonal

El hexágono es el **motor de búsqueda** (typos → intención → cosine). HTTP, Angular Federation y MySQL son adaptadores: se pueden cambiar sin reescribir `search.js`.

```
     shell :4200 (adaptador UI host)          catalog :4201 (adaptador UI MFE)
     buscador, carrito, layout                LookCard / GarmentCard / …
                         │  GET /api/search
                         ▼
              ┌──────────┴──────────┐
              │   DOMINIO MARE      │
              │  fuzzy · intent     │
              │  vector · search    │
              └──────────┬──────────┘
                         │ puerto “catálogo + log”
              ┌──────────┴──────────┐
              │ catalog-store.js    │
              │ Drizzle MySQL  o    │
              │ catalog.js memoria  │
              └─────────────────────┘
```

| Capa | Qué es | Archivos |
|---|---|---|
| **Dominio** | Corregir query, armar vector 32d, rankear, exigir keyword. No sabe de Express ni de filas SQL. | `fuzzy.js`, `intent.js`, `vector.js`, `search.js` |
| **Puerto de entrada** | “Busca esta query en este modo”. | `GET /api/search`, `/api/products`, `/api/featured` |
| **Adaptador de entrada** | Express traduce HTTP → `rank()`. El shell traduce teclado → HTTP. El MFE traduce `kind` → tarjeta. | `server.js`, `projects/shell`, `projects/catalog` |
| **Puerto de salida** | “Dame productos con vector” / “loguea la búsqueda”. | `getProducts()`, `logSearch()` |
| **Adaptador de salida** | Drizzle (`products` + `product_vectors`) o el array en `catalog.js`. | `catalog-store.js`, `db.js`, `schema.js` |

`search.js` solo llama `getProducts()`. No importa si el catálogo salió de MySQL o de memoria. El MFE no calcula cosine: recibe `hits` ya rankeados.

---

## Arranque

### 1. Base de datos (Drizzle)

1. Panel XAMPP → **MySQL → Start**.
2. Copia `.env.example` a `.env` si usas otra clave (default XAMPP: `root` / password vacío / `3306`).
3. Desde esta carpeta:

```bash
cd c:\xampp\htdocs\nivelDos\ECommerce
npm run db:setup
```

Ese comando:

1. Crea la base `mare` (mysql2 solo para `CREATE DATABASE`; Drizzle no crea el schema vacío).
2. `npx drizzle-kit push` — sincroniza `api/src/schema.js` con MySQL.
3. Siembra **36 productos** con colores, tallas, tags y vectores 32d.

Scripts:

```bash
npm run db:setup   # drizzle-kit push + seed
npm run db:push    # solo sincroniza tablas
```

### 2. Tienda

```bash
npm start
```

| Proceso | Puerto | URL |
|---|---|---|
| API búsqueda | `3001` | http://localhost:3001/api/health |
| Catalog MFE | `4201` | http://localhost:4201 |
| Shell host | `4200` | http://localhost:4200 |

`proxy.conf.json` manda `/api` de ambos Angular al `:3001`. El shell espera `remoteEntry.json` del MFE antes de servir.

---

## Drizzle (tablas)

Fuente de verdad: `api/src/schema.js`. `api/sql/schema.sql` es solo referencia.

`DATABASE_URL=mysql://root:@127.0.0.1:3306/mare`

| Tabla Drizzle | Tabla MySQL | Qué guarda |
|---|---|---|
| `products` | `products` | Pieza: nombre, marca, precio, `kind`, tela, imagen, textos |
| `productColors` | `product_colors` | Colores 1:N |
| `productSizes` | `product_sizes` | Tallas 1:N |
| `productTags` | `product_tags` | Tags para match léxico |
| `productVectors` | `product_vectors` | Embedding 32d (`beach`, `night`, `linen`…). Ahí corre cosine |
| `searchLogs` | `search_logs` | Cada búsqueda: query, modo, counts, ms |

Enums: `ProductKind` (`garment` \| `footwear` \| `accessory` \| `look`) · `SearchMode` (`semantic` \| `keyword`).

El runtime usa Drizzle sobre un pool mysql2. `catalog-store.js` hace `db.query.products.findMany({ with })` y `db.insert(searchLogs)`. mysql2 a pelo queda en `setup-db.js` para crear la base.

Si MySQL no está, el API cae a catálogo en memoria y `/api/health` dice `"catalog": "memory"`. Con seed hecho: `"catalog": "drizzle"`.

---

## Rutas

Angular **no tiene rutas de página** (`app.routes.ts` vacío en shell y catalog). Una pantalla: buscador + grid federado.

### HTTP API (`:3001`)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/health` | Liveness + origen del catálogo (`drizzle` / `memory`) |
| `GET` | `/api/products` | Catálogo público (sin vector) |
| `GET` | `/api/featured` | Home: 8 primeras piezas |
| `GET` | `/api/search?q=...&mode=semantic` | Vectorial (demo) |
| `GET` | `/api/search?q=...&mode=keyword` | Palabra exacta (en la demo da **0**) |

Ejemplo:

`http://localhost:3001/api/search?q=ropa%20para%20ir%20a%20la%20playa%20de%20noche&mode=semantic`

### Federation (módulos, no URLs de página)

- Manifiesto del host: `catalog` → `http://localhost:4201/remoteEntry.json`
- El shell hace `loadRemoteModule('catalog', './ProductGrid')`
- El remote **expone**:
  - `./ProductGrid` — lo consume el shell
  - `./Component` — preview si abres `:4201` solo

---

## Flujo de una búsqueda

1. El usuario escribe → `SearchService` debounce 160 ms → `GET /api/search`.
2. `fuzzy.js` corrige typos (`plalla` → `playa`).
3. `intent.js` arma el vector 32d (playa + noche + lino…).
4. `search.js` cosine vs vectores hidratados desde Drizzle. Híbrido: **88 % vector + 12 % texto**.
5. `mode=keyword` exige **todas** las palabras en la ficha. “ropa + playa + noche” no está en ningún producto → 0.
6. Cada búsqueda se loguea en `search_logs` con Drizzle.
7. El shell pasa `hits` al MFE. `ProductGrid` pinta:
   - `look` → `LookCard`
   - `garment` → `GarmentCard`
   - `footwear` → `FootwearCard`
   - `accessory` → `AccessoryCard`
8. “Añadir” dispara `window` event `mare:add-to-cart`; el shell mete la pieza al carrito.

---

## Archivos

```
ECommerce/
  drizzle.config.mjs           drizzle-kit (MySQL)
  api/src/schema.js            tablas products, colores, tallas, tags, vectores, search_logs
  .env.example                 DATABASE_URL + DB_*
  api/sql/schema.sql           referencia SQL (no se usa en runtime)
  api/src/setup-db.js          npm run db:setup (CREATE DATABASE + drizzle-kit push + seed)
  api/src/load-env.js          lee .env
  api/src/db.js                drizzle + pool mysql2
  api/src/catalog.js           36 productos (semilla)
  api/src/catalog-store.js     findMany con relaciones + insert search_logs; fallback memoria
  api/src/vector.js            32 dims + cosine
  api/src/fuzzy.js             Levenshtein / typos
  api/src/intent.js            ocasión + conceptos → vector
  api/src/search.js            rank semántico vs keyword
  api/src/server.js            Express
  projects/shell/              host :4200 (buscador, layout, carrito)
  projects/catalog/            MFE :4201 (tarjetas dinámicas)
```

---

## Demo

- `ropa para ir a la playa de noche` → semántica ~12, keyword **0**
- `ropa para la plalla de noche` → corrige playa
- `algo cómodo para oficina en verano`
- `zapatos para correr cuando llueve`
- `outfit para una cita elegante`

---

## Cómo se construyó (paso a paso)

Backend **Node/Express**. ORM **Drizzle**. Front **dos apps** federadas (no un monolito).

1. Workspace Angular 21 con Native Federation (host `shell` + remote `catalog`):

```bash
cd c:\xampp\htdocs\nivelDos
ng new mare --directory ECommerce --routing --style=scss --ssr=false --skip-git --defaults
cd ECommerce
npm install @angular-architects/native-federation@21.2.6
```

`angular.json`: esbuild, `shell` en `:4200`, `catalog` en `:4201`, `proxy.conf.json` → API `:3001`.

2. API:

```bash
npm install express cors mysql2 drizzle-orm concurrently wait-on
npm install -D drizzle-kit
```

3. **Dominio**: `vector.js` (32 dims + cosine) → `fuzzy.js` (Levenshtein) → `intent.js` (playa/noche/lino → vector) → `search.js` (88 % vector + 12 % texto; keyword estricto).

4. **Puerto de salida / catálogo**: `catalog.js` (36 productos semilla) y `catalog-store.js` (carga Drizzle o memoria).

5. **Adaptador DB**: `schema.js` (6 tablas), `db.js`, `drizzle.config.mjs`, `setup-db.js` (`CREATE DATABASE mare` + `drizzle-kit push` + seed anidado colores/tallas/tags/vectores). `api/sql/schema.sql` es referencia, no se ejecuta en runtime.

6. **Adaptador HTTP**: `server.js` en `:3001` (`/api/health`, `/products`, `/featured`, `/search`).

7. **Adaptador UI host**: `projects/shell` — debounce 160 ms, carrito, `loadRemoteModule('catalog', './ProductGrid')`.

8. **Adaptador UI remote**: `projects/catalog` — `ProductGrid` elige tarjeta por `kind`. Evento `mare:add-to-cart` hacia el shell.

9. `npm start` = `concurrently` API + catalog MFE + shell (el shell espera `remoteEntry.json` y `/api/health`).
