import Link from 'next/link';
import Image from 'next/image';
import { formatKm,formatPrice } from '@/lib/catalog';
import { publicPhotoUrl } from '@/lib/supabase';
import type { Vehicle } from '@/lib/types';
import {vehicleWhatsAppUrl} from '@/lib/whatsapp';
export default function VehicleCard({vehicle}: {vehicle:Vehicle}) {
  const image = vehicle.vehicle_images?.[0];
  const src = image ? publicPhotoUrl(image.storage_path) : null;
  return <article className="vehicle-card">
    <Link href={`/autos/${vehicle.slug}`} className="vehicle-media" aria-label={`Ver ${vehicle.brand} ${vehicle.model}`}>
      {src ? <Image loading="lazy" fill sizes="(max-width: 600px) 95vw, (max-width: 1080px) 45vw, 25vw" src={src} alt={image?.alt_text || `${vehicle.brand} ${vehicle.model}`} /> : <span>Fotografías próximamente</span>}
      {vehicle.featured && <small className="featured">Destacado</small>}
    </Link>
    <div className="vehicle-body">
      <span className="mini">{vehicle.branches?.name ?? 'Consultar sucursal'}</span>
      <h3>{vehicle.brand} {vehicle.model}</h3>
      <p>{vehicle.version || 'Consultar versión'}</p>
      <div className="specs"><span>{vehicle.model_year ?? 'Año a consultar'}</span><span>{formatKm(vehicle.mileage_km)}</span></div>
      <div className="vehicle-bottom"><strong>{formatPrice(vehicle.cash_price,vehicle.currency)}</strong><div className="vehicle-bottom-actions"><Link className="small-button" href={`/autos/${vehicle.slug}`}>Ver ficha →</Link><a className="small-button vehicle-whatsapp" href={vehicleWhatsAppUrl(vehicle)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar por WhatsApp sobre ${vehicle.brand} ${vehicle.model}`}>WhatsApp ↗</a></div></div>
    </div>
  </article>;
}
