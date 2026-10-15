import { publicSupabase } from './supabase';
import type { Vehicle } from './types';
const select = '*,branches(name,address),vehicle_images(id,vehicle_id,storage_path,alt_text,sort_order)';
export async function publishedVehicles(): Promise<Vehicle[]> {
  const client = publicSupabase();
  if (!client) return [];
  const { data, error } = await client.from('vehicles').select(select).eq('status', 'published').order('created_at', {ascending: false}).limit(250);
  if (error) { console.error('Flama Autos: error al consultar el catálogo:', error.code); return []; }
  return ((data ?? []) as Vehicle[]).map(v => ({...v,vehicle_images: (v.vehicle_images ?? []).sort((a,b)=>a.sort_order-b.sort_order)}));
}
export async function publishedVehicle(slug: string): Promise<Vehicle | null> {
  const client = publicSupabase();
  if (!client) return null;
  const { data, error } = await client.from('vehicles').select(select).eq('status','published').eq('slug',slug).maybeSingle();
  if (error) { console.error('Flama Autos: error al consultar la ficha:', error.code); return null; }
  const v = data as Vehicle | null;
  return v ? {...v,vehicle_images:(v.vehicle_images??[]).sort((a,b)=>a.sort_order-b.sort_order)} : null;
}
export type BlueRate = { value: number; updatedAt: string };
export async function blueDollarRate(): Promise<BlueRate | null> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/blue', {next:{revalidate:3600}, signal: AbortSignal.timeout(4500)});
    if (!response.ok) return null;
    const json: unknown = await response.json();
    if (!json || typeof json !== 'object') return null;
    const item = json as {venta?:unknown;fechaActualizacion?:unknown};
    if (typeof item.venta !== 'number' || !Number.isFinite(item.venta) || item.venta <= 0) return null;
    if (typeof item.fechaActualizacion !== 'string' || Number.isNaN(Date.parse(item.fechaActualizacion))) return null;
    const age = Date.now() - Date.parse(item.fechaActualizacion);
    if (age < -60*60*1000 || age > 4*24*60*60*1000) return null;
    return {value:item.venta,updatedAt:item.fechaActualizacion};
  } catch {return null;}
}
