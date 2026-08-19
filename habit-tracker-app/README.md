# Rachas — rastreador de hábitos

Backend en FastAPI, frontend en React + Vite, base de datos PostgreSQL. Los tres
servicios corren contenerizados y orquestados con Docker Compose.

## Prerequisitos

- Docker Desktop (o Docker Engine + Docker Compose en Linux)

No hace falta instalar Python, Node ni PostgreSQL en tu máquina: todo corre
dentro de los contenedores.

## Levantar el sistema completo, en una máquina limpia

```bash
git clone <URL-de-este-repo>
cd <repo>/habit-tracker-app

# 1. Variables de entorno (el .env real no se commitea)
cp .env.example .env
# editá .env y poné la contraseña que quieras para la base

# 2. Construir y levantar los tres servicios
docker compose up -d --build

# 3. Esperar a que el backend esté listo (docker compose ps hasta ver "healthy" en db)
docker compose ps
```

## Verificar que anda

```bash
curl http://localhost:8000/api/health     # {"status":"ok"}
curl http://localhost:3000/api/health     # misma respuesta, a través del proxy de nginx
```

Abrí `http://localhost:3000` en el navegador: ahí está la app.

## Levantar usando las imágenes ya publicadas (sin construir nada)

Variante para correr el sistema sin tener el código fuente — descarga las
imágenes de backend y frontend desde el registry en vez de compilarlas:

```bash
cp .env.example .env   # sigue haciendo falta, las dos variantes usan el mismo secreto
docker compose -f docker-compose.registry.yml up -d
```

Las imágenes públicas están en:
- `ghcr.io/ismael-2306347/rachas-backend:v0.1.0`
- `ghcr.io/ismael-2306347/rachas-frontend:v0.1.0`

## Apagar el sistema

```bash
docker compose down       # apaga los contenedores, los datos de la BD persisten
docker compose down -v    # apaga y además borra el volumen (se pierden los datos)
```

## Estructura

```
habit-tracker-app/
├── backend/            # API FastAPI (ver backend/README.md para desarrollo local sin Docker)
├── frontend/            # SPA React + Vite (ver frontend/README.md para desarrollo local sin Docker)
├── docker-compose.yml           # construye las imágenes localmente
├── docker-compose.registry.yml  # descarga las imágenes publicadas
└── .env.example                  # plantilla de variables de entorno
```
