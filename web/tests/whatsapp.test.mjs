import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FLAMA_WHATSAPP_NUMBER,
  FLAMA_WHATSAPP_DISPLAY,
  whatsappUrl,
  generalWhatsAppUrl,
  branchesWhatsAppUrl,
  vehicleWhatsAppUrl,
} from '../src/lib/whatsapp.ts';

test('el número oficial de Flama Autos usa el formato internacional sin símbolos',()=>{
  assert.equal(FLAMA_WHATSAPP_NUMBER,'5491176537799');
  assert.equal(FLAMA_WHATSAPP_DISPLAY,'+54 9 11 7653-7799');
});

test('los mensajes de WhatsApp se codifican correctamente para un enlace',()=>{
  const link=whatsappUrl('Hola, ¿hay vehículos disponibles?\nGracias.');
  const url=new URL(link);
  assert.equal(url.origin,'https://wa.me');
  assert.equal(url.pathname,'/5491176537799');
  assert.equal(url.searchParams.get('text'),'Hola, ¿hay vehículos disponibles?\nGracias.');
});

test('las consultas generales y de sucursales apuntan al WhatsApp oficial',()=>{
  for(const link of [generalWhatsAppUrl(),branchesWhatsAppUrl()]){
    const url=new URL(link);
    assert.equal(url.pathname,'/5491176537799');
    assert.ok(url.searchParams.get('text')?.includes('Flama Autos'));
  }
});

test('el enlace de una unidad incluye los datos comerciales y su URL pública',()=>{
  const unit={brand:'Peugeot',model:'2008',version:'Féline 1.6',model_year:2022,slug:'peugeot-2008-feline-2022'};
  const url=new URL(vehicleWhatsAppUrl(unit));
  const message=url.searchParams.get('text');
  assert.equal(url.pathname,'/5491176537799');
  assert.ok(message?.includes('Peugeot 2008 Féline 1.6 2022'));
  assert.ok(message?.includes('https://flamaautos.vercel.app/autos/peugeot-2008-feline-2022'));
  assert.ok(message?.includes('¿Sigue disponible?'));
});

test('la consulta de una unidad tolera campos opcionales vacíos',()=>{
  const message=new URL(vehicleWhatsAppUrl({brand:'Toyota',model:'Hilux',version:null,model_year:null,slug:'hilux'})).searchParams.get('text');
  assert.ok(message?.includes('Toyota Hilux de Flama Autos'));
  assert.ok(!message?.includes('null'));
});
