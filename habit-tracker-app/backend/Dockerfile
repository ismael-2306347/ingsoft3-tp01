# ---- Etapa 1: build (instala dependencias en un venv) ----
FROM python:3.11-slim AS build 
#AS build  nombre de la etapa para poder referenciarla en la etapa final
WORKDIR /app

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
#Creo un virtualenv en una ruta fija y lo pongo primero en el PATH. A partir de acá, cualquier pip install o python de este stage usa ese venv automáticamente 
#— sin necesidad de source activate, porque en Docker cada RUN es un proceso nuevo y "activar" no persistiría entre capas.


# Solo el archivo de dependencias primero -> capa cacheable:
# solo se rehace si cambia requirements.txt, no con cada cambio de código.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Etapa 2: runtime (imagen mínima, sin herramientas de build) ----
FROM python:3.11-slim AS final
WORKDIR /app

COPY --from=build /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
#Trae solo el venv ya armado de la otra etapa (las librerías instaladas), no el pip ni el caché de descarga.
# Se repite el ENV PATH porque cada etapa es independiente — lo que seteaste en build no viaja.

COPY app ./app
#se copia el codigo de la app, que es lo que cambia más seguido, y no las dependencias, para aprovechar la cache de Docker.


EXPOSE 8000
ENTRYPOINT ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
#EXPOSE 8000 expone el puerto 8000 para que pueda ser accedido desde fuera del contenedor.