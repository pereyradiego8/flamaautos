import Link from 'next/link';
import Image from 'next/image';
import { formatKm,formatPrice } from '@/lib/catalog';
import { publicPhotoUrl } from '@/lib/supabase';
import type { VehicleCardData } from '@/lib/types';
import {vehicleWhatsAppUrl} from '@/lib/whatsapp';
export default function VehicleCard({vehicle,priority=false}: {vehicle:VehicleCardData;priority?:boolean}) {
  const image = vehicle.vehicle_images?.[0];
  const src = image ? publicPhotoUrl(image.storage_path) : null;
  return <article className="vehicle-card">
    <Link href={`/autos/${vehicle.slug}`} className="vehicle-media" aria-label={`Ver ${vehicle.brand} ${vehicle.model}`}>
      {src ? <Image loading={priority?undefined:"lazy"} priority={priority} fill sizes="(max-width: 480px) 90vw, (max-width: 720px) 45vw, 320px" src={src} alt={image?.alt_text || `${vehicle.brand} ${vehicle.model}`} /> : <span>Fotografías próximamente</span>}
      {vehicle.featured && <small className="featured">Destacado</small>}
    </Link>
    <div className="vehicle-body">
      <span className="mini">{vehicle.branches?.name ?? 'Consultar sucursal'}</span>
      <h3>{vehicle.brand} {vehicle.model}</h3>
      <p>{vehicle.version || 'Consultar versión'}</p>
      <div className="specs"><span>{vehicle.model_year ?? 'Año a consultar'}</span><span>{formatKm(vehicle.mileage_km)}</span></div>
      <div className="vehicle-bottom"><strong>{formatPrice(vehicle.cash_price,vehicle.currency)}</strong>
      {(vehicle.down_payment!=null||vehicle.list_price!=null)&&<div className="card-commercial-values">
       {vehicle.down_payment!=null&&<span>Anticipo: <b>{formatPrice(vehicle.down_payment,vehicle.currency)}</b></span>}
       {vehicle.list_price!=null&&vehicle.list_price!==vehicle.cash_price&&<span>Precio de lista: <b>{formatPrice(vehicle.list_price,vehicle.currency)}</b></span>}
      </div>}<div className="vehicle-bottom-actions"><Link className="small-button" href={`/autos/${vehicle.slug}`}>Ver ficha →</Link><a className="small-button vehicle-whatsapp" href={vehicleWhatsAppUrl(vehicle)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar por WhatsApp sobre ${vehicle.brand} ${vehicle.model}`}>WhatsApp ↗</a></div></div>
    </div>
  </article>;
}
