import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import VehicleGallery, {type GalleryPhoto} from '@/components/VehicleGallery';
import type {Vehicle} from '@/lib/types';
import {publishedVehicle} from '@/lib/vehicles';
import {formatKm,formatPrice,CATEGORIES} from '@/lib/catalog';
import {publicPhotoUrl} from '@/lib/supabase';
import {vehicleWhatsAppUrl} from '@/lib/whatsapp';
export const revalidate = 60;
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const v=await publishedVehicle(slug);
 if(!v)return {title:'Vehículo no disponible | Flama Autos',robots:{index:false}};
 const title=`${v.brand} ${v.model}${v.model_year?` ${v.model_year}`:''}`;
 const description=`Conocé ${v.brand} ${v.model}. Consultá fotos, precio y disponibilidad en Flama Autos.`;
 const image=v.vehicle_images?.[0]&&publicPhotoUrl(v.vehicle_images[0].storage_path);
 return {title,description,alternates:{canonical:`/autos/${encodeURIComponent(v.slug)}`},
  openGraph:{title:`${title} | Flama Autos`,description,url:`/autos/${encodeURIComponent(v.slug)}`,type:'website',...(image?{images:[image]}:{})}};

}
export default async function VehiclePage({params}:Props){
 const {slug}=await params;const v=await publishedVehicle(slug);if(!v)notFound();
 const category=CATEGORIES.find(c=>c.id===v.category);
 const schema=vehicleStructuredData(v);
 const photos:GalleryPhoto[]=(v.vehicle_images??[])
  .slice()
  .sort((a,b)=>a.sort_order-b.sort_order)
  .flatMap((image,index)=>{
   const photoUrl=publicPhotoUrl(image.storage_path);
   return photoUrl?[{id:image.id,src:photoUrl,alt:image.alt_text??`${v.brand} ${v.model} — foto ${index+1}`}]:[];
  });
 const extraSpecs=Object.entries(v.source_specs??{})
  .filter(([key,value])=>!['Marca','Modelo','Año','Versión','Kilómetros','Tipo de combustible','Transmisión'].includes(key)&&typeof value==='string'&&value.trim().length>0&&value.length<140)
  .slice(0,40);
 return <main className="section detail">
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
 <Link href="/autos" className="back-link">← Volver al catálogo</Link><p className="eyebrow">{category?.label??'VEHÍCULO'} · {v.branches?.name??'Sucursal a consultar'}</p><h1>{v.brand} {v.model}</h1><p className="detail-subtitle">{v.version??'Consultar versión'} {v.model_year??''}</p>
 <VehicleGallery photos={photos} vehicleName={`${v.brand} ${v.model}${v.model_year?` ${v.model_year}`:''}`}/>
 <div className="detail-columns"><section className="detail-panel"><h2>Ficha técnica</h2><dl className="details-list"><div><dt>Año</dt><dd>{v.model_year??'Consultar'}</dd></div><div><dt>Kilometraje</dt><dd>{formatKm(v.mileage_km)}</dd></div><div><dt>Combustible</dt><dd>{v.fuel??'Consultar'}</dd></div><div><dt>Transmisión</dt><dd>{v.transmission??'Consultar'}</dd></div><div><dt>Sucursal</dt><dd>{v.branches?.address??'Consultar'}</dd></div></dl><h2>Descripción</h2><p className="preserve">{v.description||'Solicitá información adicional sobre equipamiento y características de esta unidad.'}</p></section>
 <aside className="detail-panel pricing"><p className="eyebrow">VALOR DE CONTADO</p><h2>{formatPrice(v.cash_price,v.currency)}</h2>{v.list_price!=null&&v.list_price!==v.cash_price&&<p>Precio de lista: {formatPrice(v.list_price,v.currency)}</p>}{v.down_payment!==null&&<p>Anticipo: {formatPrice(v.down_payment,v.currency)}</p>}{v.trade_in_price!==null&&<p>Precio de permuta: {formatPrice(v.trade_in_price,v.currency)}</p>}<a className="btn full" href={vehicleWhatsAppUrl(v)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar por WhatsApp por ${v.brand} ${v.model}`}>Consultar por WhatsApp ↗</a><p className="fine">El mensaje incluye automáticamente la unidad y el enlace a esta ficha. Precio y disponibilidad sujetos a confirmación.</p>
 {v.source_url&&<div className="marketplace-provenance"><a href={v.source_url} target="_blank" rel="noopener noreferrer">Ver publicación original en Mercado Libre ↗</a>{v.source_checked_at&&<p className="fine">Datos consultados el {new Date(v.source_checked_at).toLocaleDateString('es-AR',{timeZone:'America/Argentina/Buenos_Aires'})}.</p>}</div>}
 </aside></div>
 {extraSpecs.length>0&&<section className="detail-panel extra-specs"><h2>Equipamiento y características</h2><dl className="details-list">{extraSpecs.map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl><p className="fine">Características informadas en la publicación original. Consultá por WhatsApp la disponibilidad y el equipamiento de cada unidad.</p></section>}
 </main>;
}

/** Información estructurada exclusivamente a partir de unidades publicadas reales. */
function vehicleStructuredData(v:Vehicle){
 const name=`${v.brand} ${v.model}${v.version?` ${v.version}`:''}`;
 const mainPhoto=v.vehicle_images?.[0]&&publicPhotoUrl(v.vehicle_images[0].storage_path);
 return {
  '@context':'https://schema.org',
  '@type':'Vehicle',
  name,brand:{'@type':'Brand',name:v.brand},model:v.model,
  ...(v.model_year?{vehicleModelDate:String(v.model_year)}:{}),
  ...(v.mileage_km!==null?{mileageFromOdometer:{'@type':'QuantitativeValue',value:v.mileage_km,unitCode:'KMT'}}:{}),
  ...(v.description?{description:v.description}:{}),
  ...(mainPhoto?{image:mainPhoto}:{}),
  ...(v.cash_price!==null&&v.currency?{offers:{
   '@type':'Offer',price:v.cash_price,priceCurrency:v.currency,
   url:`${process.env.NEXT_PUBLIC_SITE_URL||'https://flamaautos.vercel.app'}/autos/${encodeURIComponent(v.slug)}`,
  }}:{}),
 };
}
