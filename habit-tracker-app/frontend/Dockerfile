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

#ETAPA 2: runtime (imagen mínima, sin herramientas de build)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80