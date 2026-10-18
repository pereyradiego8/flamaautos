import type {Vehicle} from './types';

/** WhatsApp oficial de Flama Autos. El enlace de wa.me no lleva símbolos ni espacios. */
export const FLAMA_WHATSAPP_NUMBER = '5491176537799';
export const FLAMA_WHATSAPP_DISPLAY = '+54 9 11 7653-7799';

const SITE_URL = 'https://flamaautos.vercel.app';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${FLAMA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generalWhatsAppUrl(): string {
  return whatsappUrl('Hola, quiero consultar por los vehículos disponibles en Flama Autos.');
}

export function branchesWhatsAppUrl(): string {
  return whatsappUrl('Hola, quisiera confirmar las direcciones y horarios de las sucursales de Flama Autos.');
}

export function vehicleWhatsAppUrl(vehicle: Pick<Vehicle,'brand'|'model'|'version'|'model_year'|'slug'>): string {
  const vehicleName = [vehicle.brand,vehicle.model,vehicle.version,vehicle.model_year]
    .filter(part => part !== null && part !== undefined && String(part).trim() !== '')
    .join(' ');
  const vehicleUrl = `${SITE_URL}/autos/${encodeURIComponent(vehicle.slug)}`;
  return whatsappUrl(`Hola, quiero consultar por ${vehicleName} de Flama Autos. ¿Sigue disponible?\n${vehicleUrl}`);
}
