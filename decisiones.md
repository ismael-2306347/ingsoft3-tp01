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
