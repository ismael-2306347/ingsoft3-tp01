import { expect, test } from '@playwright/test'

test('crear un hábito lo muestra en la lista, y borrarlo lo saca', async ({ page }) => {
  await page.goto('/')
  const nombre = `e2e ${Date.now()}` // único: no choca con otra corrida

  await page.getByRole('button', { name: '+ Nuevo hábito' }).click()
  await page.getByLabel('Nombre').fill(nombre)
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(page.getByText(nombre)).toBeVisible() // el dato que ESTE test creó, sin sleeps

  await page.getByRole('button', { name: `Borrar ${nombre}` }).click()
  await expect(page.getByText(nombre)).toHaveCount(0) // y el borrado, comprobado
})

test('un nombre en blanco muestra el error y no crea nada', async ({ page }) => {
  await page.goto('/')
  const antes = await page.locator('.habit-card').count()

  await page.getByRole('button', { name: '+ Nuevo hábito' }).click()
  // Un campo vacío de verdad no llega a disparar nuestro validador: el
  // atributo `required` del input frena el submit antes. Con solo espacios,
  // el navegador lo deja pasar y el validador de la app (que SÍ hace trim)
  // lo rechaza — es el camino que ejercita el error que el usuario ve.
  await page.getByLabel('Nombre').fill('   ')
  await page.getByRole('button', { name: 'Guardar' }).click()

  await expect(page.getByRole('alert')).toHaveText('El nombre es obligatorio.')
  await expect(page.locator('.habit-card')).toHaveCount(antes) // no se creó nada
})

test('marcar un hábito como hecho hoy actualiza su racha en pantalla', async ({ page }) => {
  await page.goto('/')
  const nombre = `e2e-racha ${Date.now()}`

  await page.getByRole('button', { name: '+ Nuevo hábito' }).click()
  await page.getByLabel('Nombre').fill(nombre)
  await page.getByRole('button', { name: 'Guardar' }).click()

  // Cada tarjeta repite los mismos botones ("Marcar hoy", "Borrar"): hay que
  // acotar la búsqueda a LA tarjeta de este hábito, no a toda la página.
  const tarjeta = page.locator('.habit-card').filter({ hasText: nombre })
  await tarjeta.getByRole('button', { name: 'Marcar hoy' }).click()

  await expect(tarjeta.getByRole('button', { name: 'Deshacer hoy' })).toBeVisible()
  await expect(tarjeta.getByText('🔥 1 día')).toBeVisible()

  await tarjeta.getByRole('button', { name: `Borrar ${nombre}` }).click() // limpieza
  await expect(page.getByText(nombre)).toHaveCount(0)
})
