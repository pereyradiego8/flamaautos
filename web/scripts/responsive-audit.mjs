/* Pruebas de layout reales con Chromium, sobre la URL pública de Flama Autos.
   No crean usuarios ni vehículos y no requieren claves privadas. */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const origin = process.env.AUDIT_URL || 'https://flamaautos.vercel.app';
const sizes = [
  [1920, 1080], [1366, 720], [1024, 768], [768, 1024],
  [430, 932], [390, 844], [320, 568],
];
const pages = [
  ['inicio','/'],
  ['catalogo','/autos'],
  ['administracion','/admin'],
];
const dest = path.resolve('responsive-artifacts');
await fs.mkdir(dest, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
let checks = 0;
const failures = [];

async function inspect(page, label, width, height) {
  const info = await page.evaluate(() => {
    const d = document.documentElement;
    const max = Math.max(d.scrollWidth, document.body.scrollWidth);
    const font = (query) => {
      const el = document.querySelector(query);
      return el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : null;
    };
    return {
      viewport: window.innerWidth,
      scrollWidth: max,
      horizontalOverflow: Math.max(0, max - window.innerWidth),
      adminTitlePx: font('.admin-page > h1'),
      inventoryTitlePx: font('.admin-top h2'),
      heroTitlePx: font('.hero h1'),
      catalogTitlePx: font('.catalog > h1'),
      detailTitlePx: font('.detail > h1'),
    };
  });
  console.log(JSON.stringify({ page: label, width, height, ...info }));
  checks++;
  if (info.horizontalOverflow > 2) {
    failures.push(`${label} ${width}x${height}: desbordamiento horizontal de ${info.horizontalOverflow}px`);
  }
  if (info.adminTitlePx && info.adminTitlePx > (width <= 600 ? 34 : 44)) {
    failures.push(`${label} ${width}x${height}: título administrativo de ${info.adminTitlePx}px`);
  }
  if (info.inventoryTitlePx && info.inventoryTitlePx > 32) {
    failures.push(`${label} ${width}x${height}: título inventario de ${info.inventoryTitlePx}px`);
  }
  if (info.heroTitlePx && info.heroTitlePx > 65) {
    failures.push(`${label} ${width}x${height}: portada de ${info.heroTitlePx}px`);
  }
  if (info.catalogTitlePx && info.catalogTitlePx > 44) {
    failures.push(`${label} ${width}x${height}: catálogo de ${info.catalogTitlePx}px`);
  }
  if (info.detailTitlePx && info.detailTitlePx > 44) {
    failures.push(`${label} ${width}x${height}: ficha de ${info.detailTitlePx}px`);
  }
  await page.screenshot({ path: path.join(dest, `${label}-${width}x${height}.png`), fullPage: true });
}

try {
  for (const [width,height] of sizes) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const [label,pathname] of pages) {
      const response = await page.goto(origin + pathname, { waitUntil: 'domcontentloaded', timeout: 60000 });
      assert.equal(response?.status(), 200, `${pathname} responde HTTP 200`);
      await page.locator('h1').first().waitFor({state:'attached',timeout:15000});
      await inspect(page, label, width, height);
      if (pathname === '/admin') {
        // El registro público inicial está cerrado tras crear el primer administrador.
        await page.getByRole('button', {name: 'Ingresar', exact: true}).waitFor({timeout:20000});
        await inspect(page, 'inicio-sesion', width, height);
        // Maqueta visual para auditar el panel autenticado sin usar credenciales.
        await page.evaluate(() => {
          const form = document.querySelector('.admin-page > .login-card');
          if (!form) throw Error('No se encontró el formulario de autenticación');
          form.remove();
          const content = document.createElement('div');
          content.className = 'admin-console';
          content.innerHTML = `
            <div class="admin-top"><div><p>Sesión: usuario@example.com · Rol: admin</p>
            <h2>Inventario (0)</h2></div>
            <div class="actions"><button class="btn">+ Agregar vehículo</button>
            <button class="small-button">Invitar personal</button>
            <button class="small-button">Cambiar contraseña</button>
            <button class="small-button">Cerrar sesión</button></div></div>
            <form class="access-settings"><h3>Invitar personal</h3>
              <div class="access-settings-fields"><label>Correo electrónico
              <input type="email" placeholder="editor@example.com"></label>
              <label>Permiso<select><option>Editor</option></select></label></div>
              <div class="actions"><button class="btn">Enviar invitación</button></div></form>
            <div class="admin-list"><div class="empty">Todavía no hay vehículos cargados. Empezá por “Agregar vehículo”.</div></div>`;
          document.querySelector('.admin-page').append(content);
        });
        await inspect(page, 'inventario-fixture', width, height);
      }
      if (pathname === '/autos') {
        // Ficha técnica y tarjetas sintéticas para comprobar el diseño sin inventar stock real.
        await page.evaluate(() => {
          const main = document.querySelector('main.catalog');
          if (!main) throw Error('No se encontró catálogo');
          main.className = 'section detail';
          main.innerHTML = `<a class="back-link">← Volver al catálogo</a>
            <p class="eyebrow">SUV · Sucursal</p><h1>Vehículo de prueba SUV</h1>
            <p class="detail-subtitle">Versión y año de prueba</p>
            <div class="detail-gallery"><div class="photo-empty">Fotografías de prueba</div></div>
            <div class="detail-columns"><section class="detail-panel">
            <h2>Ficha técnica</h2><dl class="details-list"><div><dt>Combustible</dt><dd>Nafta</dd></div>
            <div><dt>Transmisión</dt><dd>Automática</dd></div>
            <div><dt>Sucursal</dt><dd>Dirección de prueba</dd></div></dl>
            <h2>Descripción</h2><p>Texto de prueba para comprobar la distribución adaptable.</p></section>
            <aside class="detail-panel pricing"><p class="eyebrow">VALOR DE CONTADO</p>
            <h2>US$ 30.000</h2><a class="btn full">Consultar por este vehículo ↗</a></aside></div>`;
        });
        await inspect(page, 'ficha-fixture', width, height);

        // Ficha real: comprobamos que el carrusel tenga una sola imagen principal
        // y que los controles funcionen en cada resolución, sin credenciales.
        const detailResponse=await page.goto(origin+'/autos/ford-territory-2023-mla2106857291',{
          waitUntil:'load',timeout:60000
        });
        assert.equal(detailResponse?.status(),200,'Ficha real responde HTTP 200');
        const gallery=page.getByRole('region',{name:/Galería de fotografías de Ford Territory/});
        await gallery.waitFor({state:'visible',timeout:20000});
        assert.equal(await gallery.locator('.vehicle-carousel-stage img').count(),1,
          'Solo una fotografía principal a la vez');
        assert.ok(await gallery.locator('.vehicle-carousel-thumbnail').count()>1,
          'Las miniaturas de varias fotos están disponibles');
        assert.match(await gallery.locator('.vehicle-carousel-counter').innerText(),/Foto 1 de \\d+/);
        await gallery.getByRole('button',{name:'Foto siguiente',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('.vehicle-carousel-counter')?.textContent?.includes('Foto 2 de'));
        await gallery.getByRole('button',{name:/Ver foto 5 de/}).click();
        await page.waitForFunction(()=>document.querySelector('.vehicle-carousel-counter')?.textContent?.includes('Foto 5 de'));
        await gallery.focus();
        await page.keyboard.press('ArrowLeft');
        await page.waitForFunction(()=>document.querySelector('.vehicle-carousel-counter')?.textContent?.includes('Foto 4 de'));
        await gallery.getByRole('button',{name:'Ampliar fotografía'}).click();
        const modal=page.getByRole('dialog',{name:/Fotografía ampliada de Ford Territory/});
        await modal.waitFor({state:'visible'});
        await modal.getByRole('button',{name:'Foto siguiente ampliada'}).click();
        await modal.getByRole('button',{name:'Cerrar fotografía ampliada'}).click();
        assert.equal(await modal.isVisible(),false,'El visor ampliado se cierra');
        await inspect(page,'ficha-real-carrusel',width,height);
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
console.log(`Comprobaciones realizadas: ${checks}, problemas detectados: ${failures.length}`);
if (failures.length) {
  failures.forEach(f => console.error('ERROR RESPONSIVO:', f));
  process.exitCode = 1;
}
