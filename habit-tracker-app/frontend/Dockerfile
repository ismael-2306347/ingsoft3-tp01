#ETAPA 1: build (instala dependencias y compila el bundle estático)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
#copia package.json y package-lock.json explícitamente, antes que el resto del código:
# misma razón que con requirements.txt: si no cambiaron las dependencias, Docker no vuelve a bajar todo node_modules.
RUN npm ci 
#instala dependencias de node_modules según package-lock.json, sin modificarlo. npm ci es más rápido y reproducible que npm install.
COPY . .
RUN npm run build

#ETAPA 2: tests (parte del build: ya tiene Node y las dependencias de desarrollo)
FROM build AS test
ENTRYPOINT ["npm", "run", "test:ci"]

#ETAPA 3: runtime (imagen mínima, sin herramientas de build). Tiene que quedar ÚLTIMA.
FROM nginx:alpine
# La plantilla va en templates/, no en conf.d/: ahí nginx reemplaza las
# variables ${...} al arrancar. En conf.d/ las dejaría tal cual, sin resolver.
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
# Valores por defecto: los que usa docker-compose (el nombre del servicio y el
# DNS interno de Docker). Render los pisa con las variables del servicio.
ENV BACKEND_URL=http://backend:8000 \
    DNS_RESOLVER=127.0.0.11
EXPOSE 80