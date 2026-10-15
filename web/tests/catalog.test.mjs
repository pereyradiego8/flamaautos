import test from 'node:test';
import assert from 'node:assert/strict';
import {slugify,formatPrice,formatKm,comparePrices,CATEGORIES} from '../src/lib/catalog.ts';

test('slug sin acentos y apto para URL',()=>{
 assert.equal(slugify('Peugeot 208 ¡Féline! 2022'), 'peugeot-208-feline-2022');
});
test('precios expresados en moneda original',()=>{
 assert.equal(formatPrice(23900000,'ARS'),'ARS 23.900.000');
 assert.equal(formatPrice(12500,'USD'),'USD 12.500');
 assert.equal(formatPrice(null,'ARS'),'Consultar precio');
});
test('kilometraje mantiene cero',()=>{
 assert.equal(formatKm(0),'0 km');
 assert.equal(formatKm(null),'Kilometraje a consultar');
});
test('orden mixto convierte USD a pesos con cotización verificada',()=>{
 const ars={cash_price:40000000,currency:'ARS'};
 const usd={cash_price:20000,currency:'USD'};
 assert.ok(comparePrices(usd,ars,1600)<0);
 assert.ok(comparePrices(usd,ars,1600,true)>0);
});
test('sin cotización disponible no mezcla importes incomparables',()=>{
 const ars={cash_price:40000000,currency:'ARS'};
 const usd={cash_price:20000,currency:'USD'};
 assert.ok(comparePrices(ars,usd,null)<0);
 assert.ok(comparePrices(usd,ars,null)>0);
});
test('los precios a consultar van al final en ambos órdenes',()=>{
 const price={cash_price:23000,currency:'USD'};
 const unknown={cash_price:null,currency:'USD'};
 assert.ok(comparePrices(unknown,price,1400)>0);
 assert.ok(comparePrices(unknown,price,1400,true)>0);
});
test('categorías únicas',()=>{
 assert.equal(new Set(CATEGORIES.map(x=>x.id)).size,CATEGORIES.length);
});
