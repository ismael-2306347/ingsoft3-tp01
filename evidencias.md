# Evidencias — TP1

## 1. Push directo a main rechazado
![push rechazado]

<img width="951" height="413" alt="image" src="https://github.com/user-attachments/assets/0f644c7a-4ddc-4d05-a618-ff00a019d4b9" />

GitHub rechaza el push porque main está protegida y la regla alcanza también al dueño del repo.

## 2. El PR de la rama B no se puede mergear: conflicto
<img width="729" height="835" alt="image" src="https://github.com/user-attachments/assets/81090085-b8bd-4849-824a-2653ecf742c6" />

##3. Resolucion de conflictos de la rama B| marcadores.

<img width="633" height="304" alt="image" src="https://github.com/user-attachments/assets/6f1e236d-2344-42a9-83e0-218f6973c36a" />

Se eligio que version quedaba, en este caso ninguna ya que se borro los marcadores y quedo como si el conflicto nunca hubiera sucedido

##4. Versionado de entrega

<img width="938" height="591" alt="image" src="https://github.com/user-attachments/assets/761fa614-3cce-479f-8b21-5009e462c2f5" />

Se publico la release en git, donde se indica cuales fueron los cambios agregados y para que fue creada.


#Evidencias tp2

##Comparar docker images: ¿cuánto pesa tu imagen final vs la imagen del SDK?
<img width="1542" height="154" alt="image" src="https://github.com/user-attachments/assets/dcdb5887-e614-453b-95ee-fe0dcbe403fb" />

##Checkpoint: en http://localhost:3000 se ve la interfaz servida desde el contenedor.
<img width="1398" height="146" alt="image" src="https://github.com/user-attachments/assets/13e25975-cc97-449d-a998-52b0b217673e" />

##Checkpoint: docker compose up -d levanta todo el sistema funcionando end-to-end (front habla con back, back con BD), y la prueba de persistencia se comporta como esperabas.

<img width="1542" height="91" alt="image" src="https://github.com/user-attachments/assets/83b3ff25-325c-4a45-8978-2c14ee45c7fd" />

prueba de persistencia:
creamos un habito 
<img width="1536" height="107" alt="image" src="https://github.com/user-attachments/assets/4aa2e6e6-dee7-4416-b854-83d769f55fd9" />
tiramos el contenedor y lo volvemos a levantar
<img width="1544" height="236" alt="image" src="https://github.com/user-attachments/assets/695b755e-b75b-4514-943f-b0d96510ba93" />
comprombamos que el habito siga ahi
<img width="1356" height="41" alt="image" src="https://github.com/user-attachments/assets/3adf8147-11a1-4c05-8ed6-f30487f93eda" />
volvemos a tirar los contenedores pero borrando los datos y levantamos, verificamos que se borraron 
<img width="1534" height="365" alt="image" src="https://github.com/user-attachments/assets/1bcf0939-5f2c-44b5-8054-e520f178f86a" />



