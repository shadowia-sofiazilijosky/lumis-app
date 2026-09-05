# Lumis API

Backend de **Lumis**, una biblioteca virtual personalizable: subís tus libros (PDF, EPUB,
MOBI, CBR, CBZ, TXT), los organizás en estanterías visuales armadas por vos, los leés desde
un lector propio y llevás tus notas, subrayados y reseñas — todo persistido en una base de
datos real, con autenticación de usuarios.

Este repositorio corresponde al **Cuarto Proyecto Integrador — Backend con NestJS**.

- **Autora:** Sofía A. Zilijosky
- **Proyecto:** Lumis (idea nueva, desarrollada desde cero para este proyecto integrador)
- **Entrega:** agosto 2026

> **Nota sobre la estructura del repositorio.** Lumis es un monorepo (`pnpm` workspaces +
> Turborepo) que contiene tanto esta API (`apps/api`) como su frontend en Next.js
> (`apps/web`, fuera del alcance de este proyecto integrador — no se evalúa acá). Se optó
> por no separar la API a un repositorio aparte porque frontend y backend comparten tipos
> (`packages/shared-types`) y evolucionan juntos día a día; todo el trabajo evaluable de
> este proyecto vive exclusivamente dentro de `apps/api/`.

## Índice

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación de endpoints](#documentación-de-endpoints)
- [Testing](#testing)
- [Deploy](#deploy)
- [Manual de usuario](#manual-de-usuario)

## Tecnologías

| Rol | Librería |
|---|---|
| Framework | NestJS 11 + TypeScript |
| ORM / Base de datos | Prisma 6 + PostgreSQL (Supabase) |
| Autenticación | `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` (access + refresh) |
| Hasheo de contraseñas y refresh tokens | `bcrypt` |
| Validación | `class-validator` + `class-transformer` (DTOs + `ValidationPipe` global) |
| Rate limiting | `@nestjs/throttler` |
| Cabeceras HTTP de seguridad | `helmet` |
| Configuración y validación de env | `@nestjs/config` + `zod` |
| Almacenamiento de archivos | Supabase Storage (libros, portadas, avatares) |
| Parsing de libros | `pdf-lib`, `pdfjs-dist`, `fast-xml-parser`, `node-unrar-js`, `adm-zip` |
| Testing | Jest + Supertest |

## Estructura del proyecto

```
apps/api/
├── prisma/
│   └── schema.prisma        # Modelo de datos (fuente de verdad)
├── src/
│   ├── main.ts               # Bootstrap: CORS, ValidationPipe, puerto
│   ├── app.module.ts         # Módulo raíz, registra todos los módulos y guards globales
│   ├── config/               # Validación de variables de entorno (zod)
│   ├── database/             # PrismaModule / PrismaService
│   ├── storage/              # Integración con Supabase Storage
│   └── modules/
│       ├── auth/              # Registro, login, refresh, logout, guards, estrategias JWT
│       ├── users/              # Perfil propio, avatar
│       ├── books/               # Upload y CRUD de libros
│       ├── reader/               # Lectura paginada de contenido (PDF/EPUB/imagen/texto)
│       ├── shelves/                # Estanterías visuales y su layout
│       ├── reading-progress/        # Progreso de lectura por libro
│       ├── highlights/               # Subrayados anclados a texto
│       ├── notes/                     # Notas por libro + vista agregada "Notas"
│       ├── strokes/                    # Trazos de lápiz/dibujo sobre la página
│       ├── reviews/                     # Reseña y puntaje propio por libro
│       └── stats/                        # Estadísticas de perfil/lectura
└── test/                       # Tests e2e
```

## Modelo de datos

Entidades principales del `schema.prisma`, todas asociadas al usuario dueño:

- **User** — cuenta, preferencias de tema/fuente, perfil.
- **RefreshToken** — refresh tokens hasheados, uno por sesión (permite invalidar por logout).
- **Book** — libro subido (archivo + metadata + portada), con su `BookFormat`.
- **Shelf** / **BookShelf** — estanterías y la relación many-to-many con libros, incluyendo
  posición/layout visual.
- **ReadingProgress** — página actual, modo de paso de página, estado de la regla de lectura,
  por libro y usuario.
- **Highlight** — subrayados anclados a un rango real de texto, con posibilidad de fijar
  ("pinned") como cita destacada.
- **Note** — notas libres por libro, también fijables.
- **Stroke** — trazos de dibujo/anotación manuscrita sobre una página.
- **Review** — reseña y puntaje del usuario para un libro.
- **ReadingActivityLog** — registro de actividad usado para las estadísticas de perfil.
- **SpotifyAccount** — vinculación opcional con Spotify (ambiente de lectura).

## Autenticación y seguridad

- `JwtAuthGuard` está registrado **globalmente** (`APP_GUARD`): toda ruta nueva queda
  protegida por defecto. Los únicos endpoints públicos (`/health`, `/auth/register`,
  `/auth/login`, `/auth/refresh`, `/auth/logout`) lo son de forma explícita vía el decorador
  `@Public()` — nunca por omisión.
- Contraseñas hasheadas con `bcrypt` (costo 12) y **nunca** incluidas en ninguna respuesta
  (se excluyen explícitamente antes de serializar al usuario).
- Refresh tokens también hasheados antes de persistirse; el logout invalida el token de esa
  sesión puntual.
- Access token de vida corta (15 min) + refresh token de larga duración (30 días).
- Rate limiting global (100 req/min por IP) reforzado en los endpoints más sensibles:
  `/auth/register` (5/min) y `/auth/login` (10/min).
- `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`: cualquier
  campo no declarado en el DTO correspondiente es rechazado.
- CORS configurado explícitamente contra el origen del frontend (`CORS_ORIGIN`), no abierto.
- `helmet` aplicado globalmente en el bootstrap: agrega las cabeceras HTTP de seguridad
  recomendadas (`X-Content-Type-Options`, `X-Frame-Options`, HSTS, etc.) a toda respuesta.
- Todo endpoint de escritura/lectura de datos propios del usuario valida la pertenencia del
  recurso (`ownerId`) contra el usuario autenticado antes de operar.

## Variables de entorno

Ver [`\.env.example`](./.env.example) para el listado completo. Resumen:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Cadenas de conexión a PostgreSQL (pooler / directa) |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES_IN` | Secreto y expiración del access token |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Secreto y expiración del refresh token |
| `CORS_ORIGIN` | Origen permitido para CORS (URL del frontend) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` | Acceso al storage de archivos |
| `MAX_UPLOAD_SIZE_MB` | Límite de tamaño de archivo al subir un libro |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REDIRECT_URI` | OAuth opcional de Spotify |
| `PORT` | Puerto en el que escucha la API |

Ninguna de estas variables se commitea con valores reales: en producción se configuran
directamente en el panel del proveedor de deploy.

## Instalación y ejecución local

Requiere Node 22.x, `pnpm` y una base PostgreSQL accesible (local o Supabase).

```bash
# Desde la raíz del monorepo
pnpm install

# Copiar el archivo de variables de entorno y completarlo
cp apps/api/.env.example apps/api/.env

# Generar el cliente de Prisma y aplicar las migraciones
pnpm db:generate
pnpm db:migrate

# Levantar la API en modo desarrollo (con watch)
pnpm --filter api start:dev
```

La API queda escuchando en `http://localhost:4000` (o el puerto que definas en `PORT`).

## Scripts disponibles

Ejecutados desde `apps/api/` (o con `pnpm --filter api <script>` desde la raíz):

| Script | Descripción |
|---|---|
| `start:dev` | Modo desarrollo con recarga automática |
| `start:prod` | Ejecuta el build de producción (`dist/main.js`) |
| `build` | Compila TypeScript a `dist/` |
| `lint` | ESLint sobre `src/` y `test/` |
| `test` | Tests unitarios (Jest) |
| `test:e2e` | Tests end-to-end |
| `test:cov` | Tests unitarios con reporte de cobertura |

## Documentación de endpoints

Todas las rutas (salvo las marcadas como **Pública**) requieren header
`Authorization: Bearer <access_token>`.

### Autenticación — `/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Pública | Crea un usuario nuevo (contraseña hasheada) |
| POST | `/auth/login` | Pública | Valida credenciales, devuelve access + refresh token |
| POST | `/auth/refresh` | Pública* | Emite un nuevo access token a partir de un refresh token válido |
| POST | `/auth/logout` | Pública* | Invalida el refresh token de la sesión actual |
| GET | `/auth/me` | Protegida | Devuelve el usuario autenticado |

<sub>* No requieren access token, pero sí un refresh token válido en el body/header según el guard correspondiente.</sub>

### Usuarios — `/users`

| Método | Ruta | Descripción |
|---|---|---|
| PATCH | `/users/me` | Actualiza datos del perfil propio |
| POST | `/users/me/avatar` | Sube/reemplaza el avatar (JPG/PNG/WEBP) |

### Libros — `/books`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/books` | Sube un libro nuevo (multipart: archivo + metadata) |
| GET | `/books` | Lista los libros del usuario (paginable con `skip`/`take`) |
| GET | `/books/:id` | Detalle de un libro propio |
| PATCH | `/books/:id` | Actualiza metadata de un libro |
| PUT | `/books/reorder` | Reordena la lista de libros del usuario |
| DELETE | `/books/:id` | Elimina un libro propio |

### Lector — `/books/:id/pages`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books/:id/pages/:pageNumber` | Devuelve una página (imagen o texto, según el formato) |

### Progreso de lectura — `/books/:id/progress`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books/:id/progress` | Progreso de lectura actual del libro |
| PUT | `/books/:id/progress` | Crea o actualiza el progreso (página, modo de paso, regla de lectura) |

### Reseñas — `/books/:id/review`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books/:id/review` | Reseña propia de ese libro |
| PUT | `/books/:id/review` | Crea o actualiza la reseña/puntaje |

### Subrayados — `/books/:id/highlights`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books/:id/highlights` | Lista los subrayados del libro |
| POST | `/books/:id/highlights` | Crea un subrayado anclado a texto |
| PATCH | `/books/:id/highlights/:highlightId` | Actualiza (incluye fijar/desfijar) |
| DELETE | `/books/:id/highlights/:highlightId` | Elimina un subrayado |

### Notas — `/notes` y `/books/:id/notes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/notes` | Vista agregada de notas + subrayados de todos los libros |
| GET | `/books/:id/notes` | Notas de un libro puntual |
| POST | `/books/:id/notes` | Crea una nota |
| PATCH | `/books/:id/notes/:noteId` | Actualiza (incluye fijar/desfijar) |
| DELETE | `/books/:id/notes/:noteId` | Elimina una nota |

### Trazos de dibujo — `/books/:id/strokes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/books/:id/strokes` | Lista los trazos de una página |
| POST | `/books/:id/strokes` | Crea un trazo |
| DELETE | `/books/:id/strokes/:strokeId` | Elimina un trazo |

### Estanterías — `/shelves`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/shelves` | Crea una estantería |
| GET | `/shelves` | Lista las estanterías del usuario |
| GET | `/shelves/:id` | Detalle de una estantería con sus libros |
| PATCH | `/shelves/:id` | Actualiza una estantería |
| DELETE | `/shelves/:id` | Elimina una estantería |
| POST | `/shelves/:id/books` | Agrega un libro a la estantería |
| DELETE | `/shelves/:id/books/:bookId` | Quita un libro de la estantería |
| POST | `/shelves/:id/books/:bookId/spine-image` | Sube la foto del lomo (JPG/PNG) |
| PUT | `/shelves/:id/layout` | Actualiza la posición/layout visual de los libros |

### Estadísticas — `/stats`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/stats/profile` | Estadísticas de lectura del usuario (libros, progreso, actividad) |

### Salud del servicio

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/health` | Pública | Chequeo de disponibilidad (`{ status: "ok" }`) |

## Testing

```bash
pnpm --filter api test        # unitarios (incluye el flujo de auth: registro, login, refresh)
pnpm --filter api test:e2e    # end-to-end
pnpm --filter api test:cov    # con cobertura
```

## Deploy

- **API en producción:** https://api-production-72d6.up.railway.app (Railway, con su propia
  base PostgreSQL gestionada — `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` y
  el resto de las variables sensibles configuradas directamente en el proveedor, nunca en el
  repositorio).
- **Frontend (fuera de alcance de este proyecto, informativo):** https://lumis-web-sandy.vercel.app

## Manual de usuario

La guía de uso de la aplicación completa (registro, subida de libros, estanterías, lector,
notas y subrayados) está en [`MANUAL_USUARIO.md`](./MANUAL_USUARIO.md).
