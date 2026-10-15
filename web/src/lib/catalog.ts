export const CATEGORIES = [
  { id: 'pickup', label: 'Pick-ups', tagline: 'Versatilidad y fuerza' },
  { id: 'suv', label: 'SUV', tagline: 'Espacio para tus planes' },
  { id: 'sedan', label: 'Sedanes', tagline: 'Confort todos los días' },
  { id: 'hatchback', label: 'Hatchbacks', tagline: 'Agilidad urbana' },
  { id: 'utility', label: 'Utilitarios', tagline: 'Tu herramienta de trabajo' },
  { id: 'motorcycle', label: 'Motos', tagline: 'Libertad sobre ruedas' },
  { id: 'other', label: 'Otros', tagline: 'Más alternativas' }
] as const;

export function formatPrice(value: number | null, currency: string | null): string {
  if (value === null || !Number.isFinite(value) || !currency) return 'Consultar precio';
  return `${currency === 'USD' ? 'USD' : 'ARS'} ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value)}`;
}
export function formatKm(value: number | null): string {
  return value === null ? 'Kilometraje a consultar' : `${new Intl.NumberFormat('es-AR').format(value)} km`;
}
export function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
export function comparePrices(a: {cash_price:number|null; currency:string|null}, b: {cash_price:number|null; currency:string|null}, rate: number | null, descending = false): number {
  function normalized(item: {cash_price:number|null;currency:string|null}): number | null {
    if (item.cash_price === null || !Number.isFinite(item.cash_price)) return null;
    if (item.currency === 'ARS') return item.cash_price;
    if (item.currency === 'USD' && rate && Number.isFinite(rate) && rate > 0) return item.cash_price * rate;
    return null;
  }
  const x = normalized(a), y = normalized(b);
  if (x === null && y === null) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  return descending ? y - x : x - y;
}
