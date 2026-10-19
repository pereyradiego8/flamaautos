import type { Metadata } from 'next';
import CatalogFilters from '@/components/CatalogFilters';
import { publishedVehicles,blueDollarRate } from '@/lib/vehicles';
import { publicSupabase } from '@/lib/supabase';
import type {Branch} from '@/lib/types';
export const revalidate = 60;
export const metadata: Metadata = {title:'Vehículos disponibles',description:'Explorá vehículos publicados por Flama Autos y filtrá por categoría, sucursal y precio.',alternates:{canonical:'/autos'},openGraph:{title:'Catálogo de vehículos | Flama Autos',url:'/autos'}};
export default async function Autos({searchParams}:{searchParams:Promise<{categoria?:string}>}){
  const {categoria}=await searchParams;
  const [vehicles,rate] = await Promise.all([publishedVehicles(),blueDollarRate()]);
  const client = publicSupabase();
  let branches: Branch[] = [];
  if (client) {const r=await client.from('branches').select('id,name,address,active').eq('active',true).order('name');branches=(r.data??[]) as Branch[];}
  return <main className="section catalog"><p className="eyebrow">CATÁLOGO FLAMA AUTOS</p><h1>Encontrá tu próximo vehículo.</h1><p>Unidades publicadas y administradas por nuestro equipo. Consultá la disponibilidad antes de acercarte.</p><CatalogFilters vehicles={vehicles} branches={branches} rate={rate?.value??null} updatedAt={rate?.updatedAt??null} initialCategory={categoria??''}/></main>;
}
