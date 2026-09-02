# Primer TP
## Por que Git no pudo resolver el conflicto solo?
porque ambos PR estaban intentando escribir la misma linea.

## Que problemas encontre?

## Declaracion de uso de IA
No utilice IA para resolver este TP, solo segui los pasos indicados por el profe

# Segundo Tp

## ¿Buildea y corre localmente hoy, sin magia? 
Si, corre localmente, solo la base de datos corre en docker.

## ¿Tiene (o podés escribirle) tests? 
Si, tiene 31 test de prueba.

## ¿Entendés el código lo suficiente como para modificarlo?
Si, fue un desarrollo con IA supervisado, atraves de una metodologia multiagentica.

## Tamaño: CRUD basico + 2 pantallas.

## declaracion de IA
Se utilizo como guia de ayuda para el armado del dockerfile, .dockerignore y dockercompose, me sirvio para ir entendiendo el porque de cada linea de los archivos y como arma el contenedor docker.


# Tercer TP

## Por que esta mal escrita la historia "Como desarrollador quiero crear la tabla usuarios"
Esta mal escrita porque esta contando la solucion(la tabla) y no el problema a resolver, sumado a eso en la descripcion que agrega el profe "....para guardar los datos" esto te dice el beneficio de la solucion y no el para que necesitas solucionar ese problema.

## Como reescribirias la historia?
Como desarrollador quiero guardar los datos de los usuarios para acceder a ellos de forma ordenada.

## Por que elegi 2 semanas en el plazo del sprint
Simplemente porque en dos semanas es la entrega de los tps y quiero tenerlo listo antes de eso.

## limite de trabajo en progreso: 2
Porque asi evitamos empezar muchas cosas al mismo tiempo y no terminar ninguna, siempre es mejor tener una cosa finalizada que tres a medio hacer.

## Declaracion de uso de IA
No utilice IA para este practico, solo segui el video y las indicaciones del profesor.

# Cuarto TP

## Estructura elegida del pipeline
El workflow se dispara en cada Pull Request hacia main y en cada push a main. Elegi dos jobs separados, build-backend y build-frontend, porque la aplicacion tiene dos Dockerfiles independientes. Corren en paralelo para aprovechar mejor el runner y porque ninguno depende del filesystem del otro.

## Cache de capas
Cada job usa Docker Buildx y cache de GitHub Actions. El backend usa el scope backend y el frontend usa el scope frontend para evitar que sus caches se pisen. Se reutilizan especialmente las capas de instalacion de dependencias cuando no cambian requirements.txt, package.json o package-lock.json. Si el cache desaparece, el pipeline sigue funcionando y reconstruye las capas desde cero, solo tarda mas.

## Uso de los Dockerfiles
El pipeline construye las imagenes usando los Dockerfiles del TP2 en lugar de compilar por separado. Asi existe una sola definicion del build: la misma que se verifica en CI y que despues se puede desplegar, evitando que el pipeline y Docker tengan procesos diferentes.

## Problemas encontrados y soluciones
Al principio el contexto del frontend apuntaba a ./frontend, pero la aplicacion esta dentro de habit-tracker-app; se corrigio a ./habit-tracker-app/frontend. Tambien se creo por error un PR duplicado, que se cerro conservando el PR con la evidencia del cache. Para demostrar el gate se introdujo un import inexistente en App.jsx: el frontend fallo, el PR quedo bloqueado y luego se elimino el import para que ambos checks volvieran a verde. Finalmente se comprobo que una rama auxiliar quedaba desactualizada cuando main avanzaba, por strict: true.

## Declaracion de uso de IA
Se utilizo GitHub Copilot como guia para analizar el proyecto, adaptar el workflow a la estructura real, configurar el cache, revisar los estados de los Pull Requests y verificar los builds. Los cambios se comprobaron con docker build, los checks de GitHub Actions y la configuracion de proteccion de main. La decision y la explicacion de cada cambio fueron supervisadas y entendidas antes de aplicarlas.
