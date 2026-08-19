# Rachas — frontend

App de React + Vite para el rastreador de hábitos. Esto es solo para
desarrollo local; el Dockerfile y el nginx.conf son parte del TP2 y no
viven en esta carpeta todavía.

## Requisitos

- Node 20+
- El backend corriendo en `http://localhost:8000` (ver `../backend/README.md`)

## Cómo correr en desarrollo

    npm install
    npm run dev

Abre `http://localhost:5173`. Las llamadas a `/api/...` se redirigen al
backend vía el proxy configurado en `vite.config.js` — no hace falta
CORS en desarrollo.
