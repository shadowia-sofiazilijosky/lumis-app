# Lumis

Lumis es una biblioteca virtual personalizable: subís tus libros (PDF, EPUB, MOBI, CBR,
CBZ, TXT), los organizás en estanterías visuales armadas por vos, los leés desde un lector
propio y llevás tus notas, subrayados y reseñas — todo persistido en una base de datos real,
con autenticación de usuarios.

- **Autora:** Sofía A. Zilijosky
- **Repositorio:** https://github.com/shadowia-sofiazilijosky/lumis-app
- **Deploy de la API:** https://api-production-72d6.up.railway.app
- **Deploy del frontend:** https://lumis-web-sandy.vercel.app

## 📦 Este repositorio

Es un monorepo (`pnpm` workspaces + Turborepo) con dos partes:

| Carpeta | Qué es | Deploy |
|---|---|---|
| [`apps/api`](./apps/api) | Backend en NestJS + Prisma + PostgreSQL | https://api-production-72d6.up.railway.app |
| `apps/web` | Frontend en Next.js | https://lumis-web-sandy.vercel.app |

> **Cuarto Proyecto Integrador — Backend con NestJS.** El entregable evaluado de este
> proyecto es exclusivamente **[`apps/api`](./apps/api)**. El frontend (`apps/web`) es
> trabajo de proyectos integradores anteriores y queda fuera de alcance acá — se comparte
> el mismo repositorio porque frontend y backend evolucionan juntos y comparten tipos
> (`packages/shared-types`).

## 📖 Documentación

Toda la documentación técnica de la API — stack, modelo de datos, autenticación y
seguridad, variables de entorno, instalación local, y el detalle de **todos los
endpoints** — está en:

### 👉 [`apps/api/README.md`](./apps/api/README.md)

Y la guía de uso de la aplicación completa (registrarse, subir libros, armar estanterías,
leer, subrayar, tomar notas) está en:

### 👉 [`apps/api/MANUAL_USUARIO.md`](./apps/api/MANUAL_USUARIO.md)
