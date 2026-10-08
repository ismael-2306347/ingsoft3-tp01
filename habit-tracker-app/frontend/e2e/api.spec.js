import { expect, test } from '@playwright/test'

// La api tiene su propia dirección: NO es la del front. Sin barra al final.
const API = process.env.API_BASE_URL || 'http://localhost:8000'

// una ayuda, para no repetir: pide la lista y la devuelve ya convertida
async function listar(request) {
  const r = await request.get(`${API}/api/habits`)
  expect(r.status()).toBe(200)
  return await r.json()
}

test('el alta guarda en la base de verdad, y el borrado la saca', async ({ request }) => {
  const nombre = `api ${Date.now()}` // único: no choca con otra corrida

  const alta = await request.post(`${API}/api/habits`, { data: { name: nombre } })
  expect(alta.status()).toBe(201) // la api dice «creado»
  const creado = await alta.json()

  const lista = await listar(request) // y la BASE lo devuelve: no es un doble
  expect(lista.some((h) => h.name === nombre)).toBe(true)

  const borrado = await request.delete(`${API}/api/habits/${creado.id}`)
  expect(borrado.status()).toBe(204) // «borrado, no hay nada que devolver»

  const despues = await listar(request) // y el borrado, comprobado
  expect(despues.some((h) => h.name === nombre)).toBe(false)
})

test('un nombre vacío lo rechaza la api, y no crea nada', async ({ request }) => {
  const antes = await listar(request)

  const alta = await request.post(`${API}/api/habits`, { data: { name: '' } })
  // FastAPI/Pydantic contestan 422 (Unprocessable Entity) ante un dato que no
  // pasa el schema, no 400 como en los ejemplos de la guía (escritos para .NET).
  expect(alta.status()).toBe(422)

  const despues = await listar(request)
  expect(despues.length).toBe(antes.length) // y de verdad no se creó nada
})

test('marcar un hábito como hecho hoy actualiza la racha en la base de verdad', async ({
  request,
}) => {
  const nombre = `api-racha ${Date.now()}`
  const alta = await request.post(`${API}/api/habits`, { data: { name: nombre } })
  const creado = await alta.json()

  const checkin = await request.post(`${API}/api/habits/${creado.id}/checkin`)
  expect(checkin.status()).toBe(200)
  const actualizado = await checkin.json()
  // La racha la calcula el backend leyendo las fechas guardadas en Postgres:
  // un doble no tiene filas con fechas reales, así que esto sólo lo ve la
  // base de verdad.
  expect(actualizado.current_streak).toBe(1)
  expect(actualizado.checked_in_today).toBe(true)

  await request.delete(`${API}/api/habits/${creado.id}`) // limpieza
})
