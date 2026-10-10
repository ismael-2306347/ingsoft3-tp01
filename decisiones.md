## Enlaces del TP7 (el más reciente)
_(el detalle y la explicación de cada uno están en la sección "Séptimo TP", más abajo. Se completa a medida que avanza el TP)_
- Paquete backend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
- Paquete frontend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend
- Corrida donde los 4 entornos pasaron a ejecutar la imagen por `imgURL` (Tarea 1): https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/37780389849
- URL de QA: https://rachas-front-qa.onrender.com (api: https://rachas-api-qa.onrender.com)
- URL de PROD: https://rachas-front-prod.onrender.com (api: https://rachas-api-prod.onrender.com)
- Commit que rompió la app (Tarea 4): `5cdfca6c84866504708ad5e3f9581c1a0e337ede`
- Corrida con integración **verde** y e2e **roja** frenando la promoción: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975
- Reporte de integración (verde) de esa corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975/artifacts/11675483809
- Reporte de e2e (rojo) de esa corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975/artifacts/11676247118
- La release `v7.0.0` se completa en la próxima fase (después de mergear el arreglo).

---

## Enlaces de este TP (TP6)
_(el detalle y la explicación de cada uno están en la sección "Sexto TP", más abajo, junto con el resto de las decisiones del práctico)_
- Paquete backend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
- Paquete frontend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend
- Corrida de un PR con "Entrar al registry" salteado: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36323844538/job/108632699527
- Corrida de `main` con el build+publish como último paso: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36323945709
- Release: https://github.com/ismael-2306347/ingsoft3-tp01/releases/tag/v6.0.0
- Rechazo documentado de `deploy-prod`: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36328813191
- Aprobación + deploy real a PROD: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36329849098
- URL de QA: https://rachas-front-qa.onrender.com (api: https://rachas-api-qa.onrender.com)
- URL de PROD: https://rachas-front-prod.onrender.com (api: https://rachas-api-prod.onrender.com)

---

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

# Quinto TP

## Qué lógica elegí testear y por qué
La app es un tracker de hábitos, y lo que el usuario ve y le importa es la racha. Si `current_streak` o `best_streak` calculan mal, la app pierde su sentido. Por eso los tests se concentran en:
- el cálculo de rachas (`app/streaks.py`);
- las validaciones de nombre y descripción (`app/schemas.py` en el backend, `src/lib/habits.js` en el frontend);
- que marcar dos veces el mismo día no duplique el check-in;
- los mensajes y el formato que ve el usuario;
- cómo el frontend habla con la API.

## La suite
**Backend (pytest)**
- 35 funciones de test (38 casos, porque el parametrizado corre 4 veces).
- Cubren más de 4 reglas distintas: racha actual, mejor racha, validación de nombre y descripción, idempotencia del check-in, y 404 sobre hábitos inexistentes.
- **Parametrizado**: `test_habit_create_rejects_invalid_name`, con `@pytest.mark.parametrize` sobre vacío, solo espacios, tabulador y 101 caracteres.
- **Bordes**: 100 caracteres pasa y 101 falla.
- **Caso de error**: `test_habit_create_rejects_description_over_500_chars`, que además verifica que el mensaje diga el límite.
- **Mock**: `tests/test_crud_mock.py` (se explica abajo).

**Frontend (vitest)**
- 18 tests (23 casos por los `it.each`).
- **Parametrizados**: `it.each` para los nombres inválidos y para `formatDays`.
- **Casos de error**: nombre de más de 100 caracteres, descripción de más de 500, y la API respondiendo con error, con y sin detalle.
- **Mock**: el cliente HTTP (se explica abajo).

## Un bug que encontraron los tests
Al escribir el parametrizado de nombres inválidos, los casos `"   "` y `"\t"` fallaron. La API aceptaba hábitos cuyo nombre era solo espacios, porque `min_length=1` cuenta los espacios como caracteres. Se corrigió con `model_config = ConfigDict(str_strip_whitespace=True)` en `HabitCreate` y `HabitUpdate`, que recorta antes de validar el largo. El formulario del frontend ahora valida la misma regla antes de enviar.

## Mocks y refactor para poder mockear
**Backend.** No hizo falta refactorizar, porque en `crud.py` la sesión de base de datos ya entraba por parámetro (inyección por parámetro de función). Con `unittest.mock.Mock(spec=Session)` reemplacé la sesión real:
- `test_checkin_existente_no_vuelve_a_escribir_en_la_base`: el doble contesta que el check-in ya existe (esa parte es un stub), y el assert verifica que `add` y `commit` **no** se llamaron (esa parte es el mock: verifica la interacción, no un valor).
- `test_crear_habito_lo_agrega_y_confirma_una_sola_vez`: verifica que `add` y `commit` se llamen exactamente una vez.

El `spec=Session` hace que el doble rechace métodos que no existen en la clase real. Una limitación que reconozco: `Session` es de SQLAlchemy y no mía, así que el test queda acoplado a la cadena `query().filter().first()`. Si cambio cómo se escribe la consulta, el test se rompe aunque la regla siga andando. La alternativa sería un repositorio propio con su interfaz, pero para el tamaño de esta app no se justifica.

**Frontend.** Acá sí hubo refactor. `src/api/habits.js` llamaba a `fetch` directamente, así que no había forma de testearlo sin la API levantada. Lo convertí en una fábrica, `createHabitsApi(traer = fetch)`: la dependencia entra desde afuera. Las pantallas siguen usando las mismas funciones exportadas, que se arman con el `fetch` real. En los tests paso un doble hecho con `vi.fn()`:
- en `devuelve la lista que contesta la API` actúa como stub (solo contesta);
- en `marcar un hábito pide POST a la ruta de checkin` actúa como mock (`toHaveBeenCalledWith` verifica la ruta y el método).

También saqué la lógica de los componentes a funciones puras en `src/lib/habits.js` (`validateHabit`, `formatDays`, `streakMessage`), que se testean sin DOM ni dobles. La interfaz completa se verifica end-to-end en el TP7.

## Umbral de cobertura
**Backend: 90 %** (`fail_under = 90` en `.coveragerc`). En coverage.py ese número combina líneas y ramas en un solo porcentaje. Hoy mido **100 % de líneas y 100 % de ramas**.

**Frontend: 90 % de líneas y 90 % de ramas** (`thresholds` en `vite.config.js`). Hoy mido **100 % de líneas y 94,73 % de ramas**.

**Por qué 90 y no 99:**
- Mi medición real está entre 95 y 100, así que 90 deja margen para que un refactor chico no bloquee el merge.
- Pero un módulo o una función nueva sin tests lo hace caer por debajo, y los dos PR de demostración lo prueban.
- En el frontend puse umbral en líneas **y** ramas porque vitest 3 no cuenta las ramas de una función que ningún test ejecuta. Con umbral solo en ramas, el PR #33 habría pasado en verde (sus ramas seguían en 100 %).
- Para subir el umbral a 100 habría que testear los atajos del cliente de API que hoy no se llaman (`updateHabit`, `deleteCheckin`). Por eso la cobertura de **funciones** del front está en 69 %: son wrappers de una línea que pasan todos por `request`, que sí está testeado. No le puse umbral a esa métrica.

## Qué dejé afuera de la cuenta de cobertura
**Backend** (`omit` en `.coveragerc`):
- `app/main.py`: el arranque. Crea la app y registra los routers, y el único endpoint que tiene es `/api/health`, sin reglas de negocio.
- `app/database.py`: configuración de la conexión.
- `app/models.py`: clases de datos de SQLAlchemy, solo columnas y ninguna regla.

`schemas.py`, `crud.py`, `streaks.py` y los routers **quedan adentro**. Usé `omit` (excluir) y no una lista de inclusión: con `source = app`, todo archivo nuevo entra solo a la cuenta. Eso se ve en el PR #34, donde `stats.py` no lo importa nadie y aun así bajó el número.

**Frontend** (`include` en `vite.config.js`): solo entran `src/lib/**` y `src/api/**`, que es donde está la lógica, y se excluyen los `*.test.js`. Quedan afuera los componentes y las páginas de React, que son interfaz. Cualquier archivo nuevo en `src/lib` entra automáticamente, como pasó en el PR #33.

## Por qué cobertura alta no garantiza calidad
La cobertura mide qué se **ejecutó**, no qué se **verificó**. Un ejemplo con mi código: un test que haga `streakMessage({ current_streak: 2, best_streak: 6, checked_in_today: true })` sin ningún `expect` suma exactamente la misma cobertura que el test real, y no comprueba nada. Si alguien rompe el mensaje, ese test sigue verde.

Otro ejemplo: `src/api` está al 100 %, pero con un doble. Si el backend cambia el formato de la respuesta, mis tests siguen en verde porque el impostor contesta lo de siempre. Eso solo lo detectan las pruebas end-to-end del TP7.

## El ejercicio de la rama sin cubrir
- **Qué línea era:** en `app/streaks.py`, línea 24, `elif d < expected:` dentro del `for` de `current_streak`. El reporte la marcaba como `24->20`: nunca se dio el caso en que la condición fuera falsa.
- **Qué entrada la recorrería:** ninguna. Haría falta un `d` mayor que `expected`, y eso es imposible por tres motivos:
  1. las fechas se ordenan de mayor a menor y sin repetidos (`sorted(set(...), reverse=True)`);
  2. el primer `d` siempre es igual a `cursor`;
  3. cada fecha siguiente es, como máximo, un día anterior a la previa.
- **Qué decidí:** no agregar un test, porque no se puede, sino **simplificar el código**. Cambié `elif d < expected:` por `else:`. El comportamiento es idéntico (los 38 tests siguieron pasando) y la rama inalcanzable desapareció. `streaks.py` pasó a 100 % de ramas.

Hay otra rama conocida en el frontend: los `?? 0` de `streakMessage`. Ningún test manda un hábito sin `current_streak`, porque la API siempre lo manda. La acepto porque el total de ramas (94,73 %) está arriba del umbral.

## Cómo corre en el pipeline
Agregué una etapa `test` a cada Dockerfile, entre la de build y la final:
- `FROM build AS test` reutiliza las dependencias ya instaladas, así que no hay una segunda receta de build.
- **Backend:** la etapa instala `requirements-dev.txt` (pytest, httpx, pytest-cov), copia `app/`, `tests/` y `.coveragerc`, y corre pytest como `ENTRYPOINT`. Para esto separé las herramientas de test de `requirements.txt`: antes pytest viajaba a la imagen de producción.
- **Frontend:** `ENTRYPOINT ["npm", "run", "test:ci"]`.
- **La imagen final no cambió**: no lleva ni tests ni herramientas de test.

En cada job de `ci.yml` agregué cuatro pasos: construir la etapa de tests (`target: test`, `load: true`, con su propio `scope` de cache), correrla con `docker run` montando una carpeta para los reportes, escribir el resumen de líneas y ramas en `$GITHUB_STEP_SUMMARY`, y publicar el reporte HTML como artefacto.

No hizo falta ningún check nuevo: la cobertura corre dentro de `build-backend` y `build-frontend`, que ya eran required checks de `main` desde el TP4. Con eso `main` queda protegido por tres guardianes: el PR obligatorio (TP1), el build verde (TP4) y los tests con su umbral (TP5).

- Corrida con los resúmenes de cobertura y los reportes descargables: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36003831071 (PR #32: https://github.com/ismael-2306347/ingsoft3-tp01/pull/32)

## El Pull Request bloqueado por calidad
**Primer PR (secuencia completa, mergeado):** https://github.com/ismael-2306347/ingsoft3-tp01/pull/33
- Agregué `streakMessage` en `src/lib/habits.js` sin tests. Compilaba y todos los tests pasaban, pero `build-frontend` quedó en rojo.
- Métrica que frenó: **líneas**, con 75,82 % contra el umbral de 90 (vitest 3.2). Las ramas seguían en 100 % porque vitest 3 no cuenta ramas de funciones que ningún test ejecuta.
- Corrida roja: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36006057085
- Para arreglarlo escribí un test por cada camino de la función (7, uno por cada `return`). Volvió a verde con 100 % de líneas y 94,73 % de ramas, y lo mergeé.

**Segundo PR (queda abierto y en rojo hasta la defensa):** https://github.com/ismael-2306347/ingsoft3-tp01/pull/34
- Agrega `app/stats.py` sin tests. Los 38 tests pasan, pero la cobertura del backend cae a 81,86 % contra el umbral de 90, así que `build-backend` queda en rojo y el merge está bloqueado.
- Corrida roja: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36007152983

**Diferencia con el freno del TP4:** allá el PR se bloqueaba porque el código no compilaba. Acá compila todo y los tests pasan, y lo frena un número que elegí yo. Lo que este freno deja pasar igual: tests sin asserts que suman cobertura sin verificar nada, un requisito mal entendido (el test congela lo que yo entendí) y errores de integración entre frontend y backend.

## Herramientas usadas (mi stack no es el de la cátedra)
| Lo que se pide | Backend (Python) | Frontend (JS) |
|---|---|---|
| Framework de tests | pytest | vitest 3 (compatible con Vite 5) |
| Test parametrizado | `@pytest.mark.parametrize` | `it.each` |
| Dependencia desde afuera | parámetro de la función (`db`) | parámetro de la fábrica (`traer`) |
| Doble / mock | `unittest.mock.Mock(spec=Session)` | `vi.fn()` |
| Medir cobertura | pytest-cov (`branch = True`) | `@vitest/coverage-v8` |
| Umbral que rompe el build | `fail_under = 90` en `.coveragerc` | `coverage.thresholds` |
| Qué entra en la cuenta | `omit` en `.coveragerc` | `include` en `vite.config.js` |
| Reporte legible | `--cov-report=html` y `xml` | reporters `html`, `lcov`, `json-summary` |
| Herramientas de test en la etapa de tests | `requirements-dev.txt` instalado solo en la etapa `test` | `npm ci` sin `--omit=dev` |

## Problemas encontrados y cómo los resolví
- El `.dockerignore` del backend excluía `tests/`, así que la etapa de tests no los habría encontrado. Saqué esa línea; la imagen final igual no los lleva, porque solo copia `app/`.
- pytest y httpx estaban en `requirements.txt` y viajaban a producción. Los pasé a `requirements-dev.txt`.
- La última versión de vitest no es compatible con Vite 5, así que fijé vitest 3 y el `@vitest/coverage-v8` de la misma versión.
- El script `test:ci` usa `${COVERAGE_DIR:-coverage}`, que no funciona en Windows. En mi máquina corro `npm test -- --run --coverage`; el script es para el contenedor, que es Linux.
- Los tests encontraron el bug de los nombres en blanco, y el reporte mostró la rama inalcanzable de `streaks.py` (los dos están explicados arriba).

## Declaración de uso de IA
Usé Claude como guía paso a paso para:
- adaptar el TP (escrito para .NET) a mi stack Python + React;
- proponer los tests nuevos, el refactor del cliente de API, la etapa de tests de los Dockerfiles y los pasos del workflow;
- redactar este documento.

**Cómo lo verifiqué:**
- Corrí cada test localmente antes de subirlo.
- Comprobé que los tests de nombres fallaban con el schema viejo y pasaban con el arreglo.
- Forcé los umbrales hacia arriba para ver que la corrida fallaba.
- Revisé en GitHub Actions que cada corrida verde y roja hiciera lo esperado.

Puedo explicar qué verifica cada assert y qué casos no están cubiertos: los `?? 0` de `streakMessage`, los wrappers del cliente de API que no se llaman, y la integración real con el backend, que queda para el TP7.

# Sexto TP

## Enlaces de este TP
- Paquete backend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-backend
- Paquete frontend: https://github.com/ismael-2306347/ingsoft3-tp01/pkgs/container/ingsoft3-tp01-frontend
- Corrida de un PR con "Entrar al registry" salteado: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36323844538/job/108632699527
- Corrida de `main` con el build+publish como último paso: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36323945709
- Release del TP: https://github.com/ismael-2306347/ingsoft3-tp01/releases/tag/v6.0.0
- Rechazo documentado de `deploy-prod`: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36328813191
- Aprobación + deploy real a PROD: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36329849098
- URL de QA: https://rachas-front-qa.onrender.com (api: https://rachas-api-qa.onrender.com)
- URL de PROD: https://rachas-front-prod.onrender.com (api: https://rachas-api-prod.onrender.com)

## Los 4 servicios en Render
Backend y frontend, por cada entorno, los cuatro con Docker y Auto-Deploy en Off (el deploy lo va a disparar el pipeline, no Render solo). El Root Directory de cada uno apunta a `habit-tracker-app/backend` o `habit-tracker-app/frontend`, porque en mi repo el código no está en la raíz. Reconfirmé el Auto-Deploy en Off en los 4 servicios antes de cerrar el TP, mirando **Settings** de cada uno en Render.

**Cómo comprobé que QA y PROD usan bases separadas de verdad**: en vez de insertar el dato a mano por SQL, usé la propia API — le hice un `POST /api/habits` a PROD creando un hábito llamado "SOY PROD", y después pedí el listado (`GET /api/habits`) en los dos entornos: apareció en PROD y **no** apareció en QA. Confirma que cada backend está escribiendo en su propia base de Neon.

## Problemas encontrados en esta fase
- **`channel_binding=requi` en vez de `requi`+`re`**: al pegar la cadena de conexión de Neon en la variable `DATABASE_URL` de Render, la palabra `require` del parámetro `channel_binding` quedó cortada a `requi`, y el backend no arrancaba (`invalid channel_binding value`). Solución: saqué directamente `&channel_binding=require` de la cadena en los dos backends — con `sslmode=require` la conexión ya queda encriptada, que es lo que necesito para el TP.
- **Me olvidé de poner `DNS_RESOLVER` en el frontend de QA**: sin esa variable, la plantilla de nginx queda con `resolver ;` (vacío), así que no puede resolver la dirección del backend y el front devuelve `502 Bad Gateway` después de colgarse un rato intentando. Al agregar `DNS_RESOLVER=8.8.8.8` y esperar el redeploy automático (cambiar una variable de entorno reinicia el servicio aunque Auto-Deploy esté en Off), se solucionó.

## Elegí Render + Neon
Es el camino que sigue la guía paso a paso de la cátedra, es gratis y no pide tarjeta. Render corre mis contenedores (uso mis mismos Dockerfiles de siempre), Neon me da la base de datos Postgres. La alternativa sin ninguna cuenta externa (todo local, con mi PC como "runner" de GitHub) también era válida, pero preferí practicar con un proveedor real porque es más parecido a un trabajo real.

## El job `deploy-qa`: la promoción automática
Agregué un job nuevo a `ci.yml` que se encarga de avisarle a Render "actualizate" y después comprobar que QA haya quedado funcionando. Tres decisiones de diseño:

- **`needs: [build-backend, build-frontend]`**: este job no arranca hasta que los dos jobs de build/test terminen bien. Si cualquiera de los dos falla, `deploy-qa` ni se ejecuta — no hay forma de que se dispare un deploy sin verificación previa.
- **`if: github.ref == 'refs/heads/main'`**: como mi workflow escucha tanto `pull_request` como `push`, y los jobs de los que depende corren en los dos casos, necesito este chequeo para que un Pull Request no dispare un deploy — solo un push real a `main` tiene `github.ref` igual a `refs/heads/main`.
- **`environment: qa`**: conecta el job al environment que creé en GitHub, así hereda sus dos secrets (los deploy hooks) sin que yo tenga que pasarlos a mano en ningún lado del YAML.

**Por qué el hook lleva `&ref=$GITHUB_SHA` y no se llama pelado**: el deploy hook de Render, sin ese parámetro, despliega lo último que haya en la rama en ese momento. Si dos merges caen seguidos (algo que puede pasar), la corrida del primer commit podría terminar desplegando el código del segundo — que todavía no pasó por ningún test. Pasándole el commit exacto (`$GITHUB_SHA`, la variable que GitHub Actions llena sola con el hash del commit que está corriendo ese job), me aseguro de que QA reciba **ese** commit y no "lo último que haya".

**Por qué el smoke test reintenta en vez de pedir una sola vez**: el hook de Render responde al toque, pero el build y el redeploy tardan unos minutos, y encima el free tier duerme el servicio si no tuvo tráfico. Un solo `curl` fallaría casi siempre por timing, no porque algo esté mal. Por eso reintento 30 veces cada 20 segundos (10 minutos en total) antes de dar el job por fallido. Y reviso **tres cosas**, no una sola: `/api/health` (el proceso está vivo), `/api/habits` (la base responde de verdad — un health check que no toca la base podría dar verde con la conexión rota) y el frontend (`/`). El `--max-time 10` va adentro de cada `curl`, no en el loop entero: si no le pongo un tope a cada intento, un servicio que "acepta la conexión pero no contesta" (típico de un cold start a medio despertar) podría colgar el job entero hasta que el runner lo mate por su propio límite, en vez de fallar ese intento puntual y reintentar.

**Primera corrida real, comprobada**: el merge del PR #39 (commit `cc18eaad39cc603cfa99a6e2f530295966248a91`) disparó `deploy-qa`, el smoke test pasó en 27 segundos, y en Render la pestaña **Deploys** de `rachas-api-qa` muestra exactamente ese commit (`cc18eaa`) con **Trigger: Deploy Hook** — o sea que lo que quedó corriendo en QA es lo mismo que el pipeline acaba de verificar, y llegó por el hook del pipeline, no por un auto-deploy de Render.

**Qué prueba mi smoke test y qué NO prueba**: prueba que el proceso está vivo, que puede hablar con su base de datos, y que el front se sirve — eso alcanza para saber que el entorno "funciona". Lo que **no** prueba es que la versión que responde sea la que el hook acaba de pedir: el hook de Render contesta al toque y el build/deploy sigue en curso en segundo plano, así que si pego el smoke justo en ese momento, podría estar recibiendo 200 OK todavía de la versión **anterior** (la que estaba corriendo antes de este deploy), no de la nueva. Mi `/api/health` no informa qué commit está corriendo, así que no tengo manera de detectar ese caso desde el smoke test tal como está. Sería necesario que `/api/health` devuelva también el commit (una variable de entorno que la imagen reciba al construirse) y que el smoke la compare contra `$GITHUB_SHA`. No lo implementé en este TP; queda como mejora conocida.

## CI, Continuous Delivery y Continuous Deployment: cuál hice
Hice **Continuous Delivery**: todo commit que llega a `main` y pasa los tests se despliega solo a QA, pero a PROD **no** llega solo — se frena en el environment `production` hasta que yo lo apruebo a mano. La diferencia con Continuous Deployment sería sacar ese `environment: production` con reviewer y dejar que `deploy-prod` corra automático apenas `deploy-qa` da verde.

No haría Continuous Deployment todavía en este proyecto: mi red de seguridad automática es un smoke test de tres chequeos (¿vive?, ¿responde la base?, ¿se sirve el front?) y nada de eso me dice si una funcionalidad puntual se rompió (por ejemplo, si el cálculo de rachas empieza a devolver mal). Sin más cobertura de tests de integración real contra un entorno desplegado, y sin métricas/alertas en producción, automatizar también el último paso significaría automatizar la propagación de un error a los usuarios reales sin que nadie lo mire antes.

## La letra chica del free tier, y cómo la maneja mi pipeline
- **Cold start**: los servicios de Render se duermen a los ~15 minutos sin tráfico, y el primer pedido después de eso puede tardar hasta ~1 minuto en contestar. Por eso el smoke test de `deploy-qa` y `deploy-prod` reintenta 30 veces cada 20 segundos en vez de pedir una sola vez — un servicio dormido no es un servicio roto, y un `curl` seco lo confundiría con uno.
- **Horas de instancia (750/mes) y minutos de build (500/mes), por workspace**: tengo 4 servicios (api/front × QA/PROD). Cada deploy de este TP dispara hasta 4 builds (2 por entorno). Si se me acaban los minutos de build, Render deja de reconstruir hasta fin de mes pero el hook sigue respondiendo 200 igual — mi smoke daría verde contra la versión **vieja**, sin que el pipeline se entere. No tengo una forma automática de detectar esto todavía (está relacionado con la misma limitación del smoke test que ya conté arriba: no sé qué commit está sirviendo cada entorno).
- **Neon duerme el cómputo a los ~5 minutos idle** (se despierta solo y más rápido que Render) y tiene límite de almacenamiento (0.5 GB) — para el tamaño de esta app no debería ser un problema durante el semestre.

## Qué garantía pierdo porque Render reconstruye en vez de correr mi imagen
Mi pipeline publica una imagen ya construida y etiquetada por commit en `ghcr.io` (Tarea 1), pero el hook de Render **no usa esa imagen** — le pide a Render que clone el repo en ese commit y la vuelva a construir con su propia infraestructura. Lo comprobé en la práctica: al confirmar el subtítulo nuevo en PROD, tuve que mirar el bundle `.js` que sirve `rachas-front-prod.onrender.com` directamente, porque la imagen que yo había publicado en `ghcr.io` para ese mismo commit es un build **distinto** (mismo código fuente, pero no el mismo artefacto binario).

Esto significa que "lo que verifiqué" y "lo que corre" son, técnicamente, dos construcciones separadas del mismo commit — no la misma unidad de release. En la enorme mayoría de los casos van a compilar exactamente igual, pero no hay ninguna garantía formal de eso: una dependencia que cambió de versión entre un build y el otro, o una imagen base de Docker que se actualizó en el medio, podría hacer que se comporten distinto. Pasar de "mismo commit, dos builds" a "mismo build en los dos lados" es, según entendí, exactamente lo que corrige el TP7.

## Deployment pattern para una producción real, y plan de rollback (Tarea 6)
**Pattern elegido: blue-green**, no canary ni rolling. Mi app no tiene tráfico real ni usuarios concurrentes que justifiquen exponer una versión nueva de a porcentajes (canary) o mantener dos versiones conviviendo mientras se reemplazan instancias de a tandas (rolling, que además me obligaría a pensar compatibilidad de esquema de BD entre versión vieja y nueva mientras conviven). Con blue-green tengo dos entornos completos (ya los tengo: es literalmente QA y PROD, aunque hoy uso QA para probar, no como "green" en espera) y el cambio de una versión a otra es un switch, no una migración gradual. Lo pagaría con el costo (2× infraestructura corriendo) pero a cambio tengo el rollback más simple posible: apuntar el tráfico de nuevo al entorno anterior.

Lo combinaría con **feature flags** para las funcionalidades específicas que sean riesgosas (por ejemplo, si mañana cambio el cálculo de rachas), para poder desplegar el código apagado y prenderlo sin un nuevo deploy — hoy no tengo ningún flag armado, así que esto es una decisión para el futuro, no algo que ya esté hecho.

**Lo que me falta hoy para hacer canary o blue-green en serio**: observabilidad. Ninguno de los dos patrones tiene sentido sin métricas que digan "esta versión nueva está fallando más que la vieja" — hoy mi única señal es el smoke test binario (responde / no responde), no una tasa de error ni latencia por versión.

**Mi plan de rollback actual, paso a paso**:
1. Identificar el último commit bueno conocido (lo veo en *Deployments* del repo, filtrado por `production`, o en el tag de la release anterior).
2. Disparar los mismos dos deploy hooks de PROD (`RENDER_HOOK_API_PROD`, `RENDER_HOOK_FRONT_PROD`) con `&ref=<ese-commit>` en vez del commit roto — el mismo mecanismo que ya uso para desplegar, apuntado hacia atrás.
3. Esperar a que en Render, pestaña **Deploys** de cada servicio, ese commit figure como **live**.

**Medido de verdad, no estimado**: para probarlo, primero mergeé y aprobé un cambio más que se nota en pantalla (subtítulo "(v2 — simulacro de rollback)"), así PROD quedó en un commit distinto al de la release. Después disparé a mano los dos deploy hooks de PROD con `&ref=891ebf68fe65e98729547d078f42ba98b62c8776` (el commit de `v6.0.0`) desde mi propia terminal — sin pasar por el pipeline, exactamente como haría en un incidente real donde no puedo esperar a un PR. Render mismo midió el tiempo entre el hook y el deploy quedando `live` (columna **DURATION** en la pestaña *Deploys* de cada servicio):

- `rachas-api-prod`: **28,1s**
- `rachas-front-prod`: **25,3s**

Confirmé el resultado contra la URL real: pedí el bundle `.js` que sirve `rachas-front-prod.onrender.com` y el subtítulo volvió a ser el original, sin el "(v2)". Rollback completo (los dos servicios) en **menos de 30 segundos** cada uno — bastante rápido, aunque hay que sumarle el tiempo de detectar el problema y decidir revertir, que no está incluido en esta medición.

Lo que este rollback **no** deshace: si el problema fue una migración de base de datos que borró o transformó una columna, volver el código atrás no revierte esos datos — para eso haría falta una migración de reversa explícita, que no es lo mismo que "desplegar la versión anterior".

## Declaración de uso de IA (Sexto TP)
Usé Claude como guía activa durante toda esta implementación, no solo al final:
- Adaptar la guía del TP (con ejemplos en .NET/Render/Neon) a mi stack Python (FastAPI + SQLAlchemy) + React, incluyendo detectar qué partes de la guía no aplicaban tal cual (formato de connection string, nombres de tabla sin comillas, rutas de `Root Directory` distintas porque mi código no está en la raíz del repo).
- Escribir y revisar los cambios de `ci.yml` (jobs `deploy-qa`/`deploy-prod`, permisos, condiciones) y la plantilla de nginx.
- Diagnosticar en vivo dos errores reales que tuve en Render (el `channel_binding` truncado en la connection string, y el `DNS_RESOLVER` que me olvidé de cargar) — en los dos casos discutí el error, entendí la causa antes de aplicar el arreglo, y lo verifiqué yo mismo mirando los logs y repitiendo la prueba.
- Redactar este documento, sección por sección, a medida que cerrábamos cada parte del TP (no como un resumen escrito al final sin haber hecho el trabajo).

**Cómo lo verifiqué**: cada corrida de Actions la miré yo en la pestaña *Actions* antes de darla por buena; el rechazo y la aprobación del gate los hice yo mismo desde la interfaz de GitHub; los cuatro servicios de Render los creé y configuré yo; y las comprobaciones de aislamiento de bases (QA vs PROD) y de que el cambio visible llegó a PROD las corrí yo contra las URLs reales, no contra una simulación.

Puedo explicar cada línea de los jobs `deploy-qa` y `deploy-prod`, por qué el `&ref=$GITHUB_SHA` es necesario, por qué `deploy-prod` no repite el `if` de rama, y qué garantías tiene (y no tiene) la cadena de publicación.

## El job `deploy-prod`: el gate humano
Es casi igual al de QA, con tres diferencias que son justamente el punto de esta tarea:

- **`environment: production`**, que tiene un *required reviewer* (yo mismo) configurado. Apenas este job llega a esa línea, GitHub lo **pausa** — no arranca ningún paso hasta que alguien con permiso lo apruebe desde la pestaña Actions. No hay ningún botón de "deploy" en mi workflow: es el propio job el que se congela solo.
- **No repetí el `if: github.ref == 'refs/heads/main'`** en este job, y no me olvidé: como `deploy-prod` depende de `deploy-qa` (`needs: deploy-qa`), y `deploy-qa` sí tiene ese `if`, en un Pull Request `deploy-qa` se saltea — y si el job del que dependo no corrió, `deploy-prod` tampoco corre. La condición de rama se hereda por la cadena, no hace falta escribirla dos veces.
- **`concurrency: { group: deploy-prod, cancel-in-progress: false }`**: agrupa todas las corridas que intenten desplegar a PROD bajo el mismo "carril", para que no se pisen dos deploys al mismo tiempo. Ojo: leí que esto **no** resuelve el caso de dos corridas esperando aprobación a la vez (un job pausado esperando reviewer no está "en cola", según la documentación de GitHub) — así que si alguna vez veo dos corridas esperando mi aprobación juntas, la regla real es mía: rechazar la más vieja a mano, con su motivo, y aprobar solo la más nueva.

El resto (el `&ref=$GITHUB_SHA` y el smoke test con reintentos) es exactamente la misma idea que en QA, aplicada a las URLs de PROD.

**Qué mira mi aprobador (yo mismo) antes de aprobar un deploy a producción**: que el job `deploy-qa` haya terminado en verde (o sea, que ya está probado en un entorno real, no solo que "compiló"), que el cambio que trae ese commit sea el que espero (lo reviso mirando el PR que se mergeó), y que no haya otra corrida más nueva esperando aprobación al mismo tiempo (si la hay, rechazo la vieja primero).

## Por qué el artefacto se publica solo si los tests pasaron
No agregué ningún `if` que diga explícitamente "si los tests pasaron, publicá". No hace falta: los pasos de un job de GitHub Actions corren en orden, uno detrás del otro, y si uno falla, el job se corta ahí y los pasos que quedan abajo **no llegan a ejecutarse**. Como el paso que construye y publica la imagen final quedó como el **último** paso del mismo job que corre los tests, si los tests fallan, ese paso nunca corre. La condición está en el orden de los pasos, no en una línea de código que la explique.

Antes, el build de la imagen (el que ya tenía desde el TP4) estaba **antes** de los tests, porque en el TP4 solo servía para comprobar que la imagen compilaba. Ahora que ese mismo build también publica, tuve que moverlo al final: si se hubiera quedado arriba, se publicaría una imagen sin saber todavía si los tests pasaron.

Además, agregué una condición extra en el paso que publica: `push: ${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}`. Esto es para que **solo** una corrida disparada por un push a `main` publique algo — las corridas de un Pull Request (que se disparan por el evento `pull_request`) construyen y testean igual, pero nunca suben nada al registro de imágenes. Así, lo único que puede llegar al registro es código que ya pasó por un Pull Request y ya está integrado a `main`.

Con esas dos cosas encadenadas (el orden de los pasos + la condición de rama) queda una garantía sin necesidad de vigilarla a mano: nada llega al registro sin haber pasado los tests, y nada llega sin haber pasado por `main`.

## Permisos mínimos para publicar
El permiso `packages: write` (poder subir paquetes/imágenes) lo puse **adentro de cada job** (`build-backend` y `build-frontend`), no una sola vez arriba de todo el archivo. Si lo hubiera puesto a nivel de todo el workflow, sería el permiso por defecto de **todos** los jobs presentes y futuros, aunque no publiquen nada. Poniéndolo por job, cada uno tiene exactamente lo que necesita y nada más — esto se llama "principio de mínimo privilegio": darle a cada parte del sistema solo el permiso que necesita para hacer su trabajo, ni uno más.

También agregué `contents: read` en los mismos jobs porque, al declarar `permissions:` explícitamente, todo lo que no se lista queda **sin permiso** — y sin `contents: read` el paso de `checkout` (bajar el código) no puede funcionar.

## No hizo falta ningún secret nuevo para esto
Para poder subir la imagen a `ghcr.io` (el registro de imágenes de GitHub) usé `secrets.GITHUB_TOKEN`, que GitHub genera automáticamente en cada corrida y que ya vive ahí sin que yo tenga que crear ni guardar nada.

## Cómo quedan nombradas las imágenes
`ghcr.io/ismael-2306347/ingsoft3-tp01-backend:sha-<commit>` y lo mismo para `-frontend`. La etiqueta es el hash del commit que la generó, así que siempre puedo saber de qué código exacto salió cada imagen — a diferencia de una etiqueta como `latest`, que no dice nada por sí sola.

## Dos bases de datos separadas en Neon
Creé `app_qa` y `app_prod` como bases distintas dentro del mismo proyecto de Neon (gratis, sin tarjeta). Si compartiera una sola base entre los dos entornos, un dato de prueba cargado en QA aparecería también en PROD — cada entorno tiene que tener su propio almacenamiento, tan separado como su propia configuración.

Mi backend usa SQLAlchemy y crea las tablas solo (`Base.metadata.create_all()` al arrancar, en `main.py`), así que no hace falta correr ninguna migración a mano contra cada base: las tablas van a aparecer la primera vez que el backend arranque en Render, apuntando a cada connection string.

📌 Mis tablas se llaman `habits` y `habit_logs`, todo en minúsculas (así las definí en `models.py`). El TP (escrito para .NET/Entity Framework) advierte de un problema con nombres de tabla en mayúsculas y comillas en Postgres — a mí no me afecta, cualquier `select count(*) from habits;` sin comillas funciona.

## El nginx del frontend ya no tiene la dirección del backend escrita fija
Mi `nginx.conf` tenía `http://backend:8000` escrito directo en el archivo — funciona en docker-compose porque ahí "backend" es el nombre del servicio, pero en Render cada entorno (QA y PROD) tiene su propia URL pública distinta, y ese nombre no existe. Si dejaba la dirección fija, necesitaría una imagen de frontend distinta para QA y otra para PROD.

La solución (siguiendo la guía): renombré el archivo a `default.conf.template` y reemplacé la dirección fija por dos variables, `${BACKEND_URL}` y `${DNS_RESOLVER}`. La imagen oficial de nginx, cuando encuentra archivos en `/etc/nginx/templates/`, los procesa al arrancar el contenedor y reemplaza esas variables por su valor real — recién ahí queda armado el archivo de configuración definitivo. Por eso el archivo tiene que vivir en `templates/` y no en `conf.d/`: en `conf.d/` nginx lo leería tal cual, con los `${...}` sin reemplazar, y ni siquiera arrancaría.

En el `Dockerfile` dejé esas dos variables con un valor por defecto igual al de mi `docker-compose.yml` (`http://backend:8000` y `127.0.0.11`, el DNS interno de Docker), así mi `docker compose up` de siempre sigue funcionando sin tocar nada. En Render, cada servicio de frontend va a tener sus propias variables (`BACKEND_URL` con la URL pública de la api de **su mismo entorno**, `DNS_RESOLVER=8.8.8.8` porque ahí no hay DNS interno de Docker) — la misma imagen, corriendo con dos configuraciones distintas.

**Cómo lo comprobé antes de subirlo**: construí la imagen y la corrí dos veces, una sin variables (como en compose) y otra con variables tipo Render, y miré el archivo de configuración que nginx arma en cada caso:
- sin variables → `resolver 127.0.0.11 ...` / `set $backend_api http://backend:8000;` (igual que antes)
- con variables → `resolver 8.8.8.8 ...` / `set $backend_api https://mi-api-qa.onrender.com;`

Los dos casos dieron lo esperado, así que la misma imagen sirve para los dos entornos.

## Evidencia del gate: un rechazo y una aprobación
La primera vez que `deploy-prod` quedó pausado esperando aprobación (corrida del merge del PR #41, commit `8cd1ce2`), lo **rechacé** a propósito, para dejar probado que el gate realmente puede decir que no. Motivo que escribí en el rechazo: *"Lo rechazo porq estoy probando la review manual"* — es corto pero es mío y real: en ese momento el job recién se había escrito, y antes de aprobar un deploy real quería una corrida más para confirmar que todo el circuito (hook + smoke test) funciona bien de punta a punta, no solo que "compiló".

El job `deploy-prod` de esa corrida quedó marcado como **failure** — no porque algo se haya roto, sino porque así es como GitHub registra un rechazo: la máquina obedeció al humano. Corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36328813191

Para la aprobación usé un cambio que se nota de verdad en pantalla (no un comentario en el YAML): un subtítulo debajo del título "Rachas" en el Dashboard (`src/pages/DashboardPage.jsx` y `src/styles.css`). Esta vez, en el "Review deployments", elegí **Approve and deploy**. Corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/36329849098 (commit `891ebf6`).

**Cómo comprobé que el cambio realmente llegó**: como es una SPA de React, el texto no aparece en el HTML crudo (`curl` no ejecuta JavaScript), así que no alcanzaba con pedir la página. Busqué el nombre del archivo `.js` que sirve `https://rachas-front-prod.onrender.com/`, pedí ese archivo y busqué el texto adentro — apareció. Esto prueba algo más importante que "el texto se ve": prueba que estoy mirando el bundle que **Render construyó de verdad** para ese commit, no la imagen que mi pipeline publicó en `ghcr.io` (que es un build distinto del mismo código — la limitación de la Fase 4 que ya documenté más arriba).

# Séptimo TP

## Enlaces del TP7
_(se completa a medida que avanza el TP)_

## Punto de partida
El TP6 dejó mi cadena de CD funcionando pero con una limitación a propósito: Render **reconstruía** mi app desde el repositorio en cada deploy, así que lo que corría en QA/PROD no era bit a bit la imagen que mi pipeline había verificado y publicado en `ghcr.io` — era otra construcción del mismo commit. Este TP cierra ese hueco (los entornos pasan a **ejecutar** la imagen) y agrega dos capas de tests nuevas (integración y e2e) como gate antes de aprobar un deploy a producción.

## Un detalle de mi stack que la guía no tiene en cuenta: 422, no 400
La guía está escrita para una API en .NET, y sus ejemplos de "dato inválido" esperan que la api conteste `400 Bad Request`. Mi backend es **FastAPI** (Python), y FastAPI/Pydantic devuelven **422 Unprocessable Entity** cuando el cuerpo del pedido no pasa la validación del schema (por ejemplo, `name` vacío, que en mi `schemas.py` tiene `min_length=1`). No es un bug ni algo que tenga que "arreglar" para que de 400: es el código de estado estándar que usa FastAPI para este caso, y mis pruebas de integración y e2e van a verificar **422**, no 400.

## Los 4 servicios de Render pasaron a "Existing Image"
Les cambié la fuente (no los recreé: así conservan la URL, las variables, el deploy hook y el historial) de **Docker** (reconstruye desde el repo) a **Existing Image**, apuntando los cuatro al `sha-53a041267335e40fffee0501884cb22320d5341d` del checkpoint — es solo el punto de partida, porque de ahí en más cada deploy del pipeline le dice a Render qué imagen correr.

Probé el mecanismo primero con **uno solo** (`rachas-api-qa`): disparé su Deploy Hook a mano con el parámetro `imgURL` apuntando a esa imagen, confirmé en *Events* que decía "Deploy live for..." con ese `sha-`, y que `/api/health` contestaba. Recién después cambié la fuente de los otros tres — a esos no hacía falta probarlos uno por uno, porque el próximo deploy del pipeline (que ya manda `imgURL` a los cuatro) iba a ejercitarlos a todos juntos.

## El pipeline: `&ref=` se convierte en `imgURL`
En `deploy-qa` y `deploy-prod`, el paso que dispara el deploy hook de Render cambió de mandar `&ref=$GITHUB_SHA` (que le decía a Render "reconstruí este commit") a mandar `imgURL=ghcr.io/.../...-backend:sha-$GITHUB_SHA` por `--get --data-urlencode` (que le dice "ejecutá esta imagen exacta"). El `&ref=` se saca del todo: ya no hay nada que construir, y dejarlo haría pensar que Render todavía compila.

`--get --data-urlencode` hace dos cosas a la vez: agrega el parámetro con `&` (el hook ya trae `?key=...` desde antes) y le escapa los `:` y `/` que tiene la URL de la imagen, que si no quedarían mal interpretados en la query string.

## Checkpoint cerrado: la cadena completa ejecutando la imagen
El merge que cambió `&ref=` por `imgURL` (commit `bcd1dc308ace39025bae358b2ad86c7af4dd1cbc`) corrió de punta a punta: `deploy-qa` disparó el deploy con `imgURL` y el smoke pasó, aprobé `deploy-prod`, y también pasó. Confirmé en **Events** de los **cuatro** servicios (api y front, QA y PROD) que el deploy más reciente dice **"Triggered via Deploy Hook"** y nombra la imagen `sha-bcd1dc3...` de ese commit — no una reconstrucción. Con esto, la Tarea 1 del TP7 queda cerrada: los cuatro entornos ejecutan la imagen que el pipeline publicó, no una reconstrucción del repo.

Corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/37780389849

## Arreglos de accesibilidad para que Playwright pueda encontrar los controles
Playwright busca los elementos como los buscaría una persona (o un lector de pantalla): por su label, por el texto de su botón, por su rol. Mi formulario ya tenía labels bien armados (`<label>Nombre<input/></label>`), pero encontré dos huecos:
- El botón "Borrar" era **igual en las cuatro tarjetas** — sin nada que lo distinga, un test no puede saber a cuál apretar cuando hay más de un hábito en la lista. Le agregué `aria-label={'Borrar ' + habit.name}` en `HabitCard.jsx`, así cada fila tiene un nombre accesible único.
- El mensaje de error del formulario (`<p className="error">`) no tenía `role="alert"`, así que no hay forma de pedirlo por rol. Se lo agregué en `HabitFormModal.jsx`.

Los dos cambios son mejoras reales de accesibilidad, no un truco para que el test pase: antes de esto, un lector de pantalla tampoco podía distinguir los botones de borrar entre sí ni enterarse de un error nuevo en la pantalla.

## Las 3 pruebas de integración, contra la api de QA ya desplegada
Viven en `frontend/e2e/api.spec.js`, usan el fixture `request` de Playwright (manda pedidos HTTP, no abre ningún navegador) y le hablan a mi api por su `API_BASE_URL` — la de QA, no la del front, por la misma razón que el `BACKEND_URL` del TP6 es una variable separada.
1. **Alta + verificación + borrado**: crea un hábito con un nombre único, confirma que aparece en el listado (que sale de la base, no de un doble), lo borra, y confirma que ya no aparece.
2. **Alta inválida**: nombre vacío → la api contesta **422** (no 400: es FastAPI, como ya documenté arriba) → y el listado no creció.
3. **La elegí yo — marcar como hecho hoy actualiza la racha**: crea un hábito, le pega al endpoint de `checkin`, y comprueba que `current_streak` pasa a `1` y `checked_in_today` a `true`. La elegí porque el cálculo de la racha (`streaks.py`) depende de fechas guardadas en Postgres — es exactamente el tipo de lógica que un test con un doble no puede ver (el doble no tiene columnas de fecha reales), y es además el corazón de lo que hace esta app: si se rompe, nadie se entera de que mantuvo su racha.

## Los 3 flujos e2e, contra QA con navegador real
Viven en `frontend/e2e/tareas.spec.js`, contra `E2E_BASE_URL` (el front de QA).
1. **Crear y borrar**: abre el formulario, completa "Nombre", guarda, confirma que aparece en la lista, lo borra, confirma que desaparece.
2. **Validación**: completo el campo con solo espacios (un campo realmente vacío ni dispara mi JS, porque el `required` del HTML frena el submit antes) — así sí llega al validador de la app, que hace `trim()` y rechaza. Confirmo que aparece el mensaje de error (`role="alert"`) y que no se creó ninguna tarjeta nueva.
3. **La elegí yo — marcar un hábito como hecho hoy**: es el uso diario real de esta app (es un *habit tracker*; si "marcar hoy" no funciona, la app no sirve para nada). Creo un hábito, aprieto "Marcar hoy" **dentro de la tarjeta de ese hábito específico** (con `.filter({ hasText: nombre })`, porque todas las tarjetas repiten los mismos botones) y confirmo que el botón cambia a "Deshacer hoy" y que aparece "🔥 1 día". Limpio borrando el hábito.

## Por qué mi integración es la "amplia" (contra QA) y no la "estrecha" (armada en el pipeline)
La guía explica que hay dos formas válidas: armar la api en memoria dentro del propio job (con una base descartable que nace y muere con la corrida), o hablarle a la api que ya está desplegada en QA. Elegí la segunda.

**Qué gano**: mucha menos configuración — no necesito levantar un Postgres como `services:` del job ni un server especial para tests, porque ya tengo QA corriendo la imagen exacta que se está por promover. Y de paso, esta suite también prueba que el *despliegue* a QA salió bien (si el deploy falló y QA quedó con la versión vieja, mis pruebas lo notarían).

**Qué pierdo**: mis pruebas de integración dependen de que QA esté levantado y despierto — si Render está teniendo un mal día, mis tests pueden fallar por una razón que no tiene nada que ver con mi código (ya me pasó con el cold start en una corrida de este mismo TP). La versión "estrecha" no tiene ese problema porque corre aislada, pero a cambio necesita mucha más configuración y no prueba nada sobre el deploy en sí.

## Cómo probé las 6 pruebas antes de subirlas
Levanté mi `docker compose` local (`docker compose up -d --build`, desde `habit-tracker-app/`) y corrí cada suite contra sus puertos: `API_BASE_URL=http://localhost:8000` para la de integración, `E2E_BASE_URL=http://localhost:3000` para la de navegador (con `--trace on` para ver que la traza se grababa incluso en los tests que pasan). Las 6 pasaron. De paso encontré un bug mío: había escrito `import { configDefaults } from "vite"` en `vite.config.js`, cuando en realidad `configDefaults` se exporta desde `vitest/config` — el build del frontend fallaba con `SyntaxError: ... does not provide an export named 'configDefaults'`. Lo arreglé separando el import.

## Las dos suites como gate: la cadena completa de `needs`
Agregué dos jobs nuevos a `ci.yml`, `integracion` y `e2e`, entre `deploy-qa` y `deploy-prod`. La cadena de dependencias quedó:

```
build-backend/build-frontend → deploy-qa → integracion → e2e → deploy-prod
```

- **`integracion` depende de `deploy-qa`**: no tiene sentido pegarle a la api de QA si el deploy a QA todavía no pasó.
- **`e2e` depende de `integracion`, no de `deploy-qa`**: si la api está rota, no vale la pena levantar un navegador para confirmar algo que ya sé. Es la misma lógica de la pirámide de tests: lo barato primero.
- **`deploy-prod` depende de `e2e`** (antes dependía de `deploy-qa` directamente): ahora, para que se le pida aprobación a mi reviewer, tienen que haber pasado **las dos** suites nuevas, no solo que QA responda.

El job `integracion` instala dependencias con `npm ci` pero **no** instala el navegador (`npx playwright install`) — esas pruebas no abren ninguno, así que ese paso de más solo agregaría tiempo. El job `e2e` sí lo instala (`--with-deps chromium`). Cada job sube su propio reporte como artefacto, con nombres distintos (`playwright-report-integracion` y `playwright-report-e2e`) — dos artefactos con el mismo nombre en la misma corrida hacen fallar la publicación.

**Qué nada puede desarmar el gate**: no usé `continue-on-error`, ni `|| true` después de los `npx playwright test`, ni ningún `if: always()` o `!cancelled()` en el paso de deploy o en `deploy-prod` — los únicos `!cancelled()` que tengo son en los dos pasos que **publican el reporte**, que tienen que subir el reporte incluso cuando el test de arriba falló (si no, perdería justo la evidencia del fallo).

**Primera corrida real de la cadena completa, en verde**: el merge que activó estos dos jobs (commit `c06f903...`) corrió de punta a punta la primera vez que lo probé: `integracion` (3/3) y `e2e` (3/3) pasaron contra QA ya desplegado, aprobé `deploy-prod`, y terminó en éxito. Corrida: https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38068028124

## La evidencia central: rompí la app, no el test
Para generar la evidencia que pide la Tarea 4, cambié `createHabit` en `src/api/habits.js` para que mande el campo `title` en vez de `name` en el `POST /api/habits` — el típico bug de "le cambiaron el nombre a un campo en el front y nadie lo notó". Elegí este archivo a propósito porque **ningún test unitario del TP5 revisa el cuerpo de ese pedido** (lo confirmé leyendo `habits.test.js` antes de tocar nada): si hubiera elegido un cambio que sí afectara algún assert existente, ese test lo habría atajado antes de llegar a e2e, y no habría conseguido el par verde/rojo que necesitaba.

**Resultado, confirmado primero en local y después en una corrida real** (commit `5cdfca6c84866504708ad5e3f9581c1a0e337ede`, corrida https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975):
- **`integracion`: 3/3 verde.** Le habla a la api directo con el campo `name` correcto — nunca pasa por el código roto del front, así que no tiene forma de ver el bug.
- **`e2e`: 2 fallaron, 1 pasó.** Los dos flujos que crean un hábito desde la pantalla ("crear y borrar", "marcar como hecho hoy") fallan, porque los dos dependen de que el alta funcione. El de validación (nombre en blanco) sigue pasando, porque nunca llega a tocar la api: el validador del lado del cliente lo frena antes.
- **`deploy-prod` quedó `skipped`**: como depende de `e2e` y `e2e` falló, ni siquiera llegó a pedir mi aprobación. No hubo que rechazar nada a mano — el gate se cerró solo.
- Reportes de esa corrida: [integración (verde)](https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975/artifacts/11675483809) · [e2e (rojo)](https://github.com/ismael-2306347/ingsoft3-tp01/actions/runs/38069005975/artifacts/11676247118)

**Cómo lo leí, contra la tabla del marco teórico (integración verde + e2e roja → el problema es el front, no la api ni la base)**: no tuve que mirar el código para saber dónde buscar. Que la integración pasara confirmó que la api y la base estaban sanas — guardan y devuelven bien un hábito creado con el campo correcto. Que la e2e fallara, y específicamente en el paso que clickea "Guardar" después de llenar el formulario, señala que el problema está en cómo el front arma el pedido. Bajé el reporte rojo (`gh run download ... -n playwright-report-e2e`) y la traza confirmó exactamente eso: el navegador mandaba el pedido, pero el hábito nunca aparecía en la lista — la pantalla no estaba usando bien la api.

**El arreglo**: deshice el cambio en `src/api/habits.js` (volver a mandar `name` tal cual). Es exactamente el revert del commit que rompió todo — lo comprobé con `git diff` contra ese commit, que no mostró ninguna diferencia.
