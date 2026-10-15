import Link from 'next/link';
import { formatKm,formatPrice } from '@/lib/catalog';
import { publicPhotoUrl } from '@/lib/supabase';
import type { Vehicle } from '@/lib/types';
export default function VehicleCard({vehicle}: {vehicle:Vehicle}) {
  const image = vehicle.vehicle_images?.[0];
  const src = image ? publicPhotoUrl(image.storage_path) : null;
  return <article className="vehicle-card">
    <Link href={`/autos/${vehicle.slug}`} className="vehicle-media" aria-label={`Ver ${vehicle.brand} ${vehicle.model}`}>
      {src ? <img loading="lazy" src={src} alt={image?.alt_text || `${vehicle.brand} ${vehicle.model}`} /> : <span>Fotografías próximamente</span>}
      {vehicle.featured && <small className="featured">Destacado</small>}
    </Link>
    <div className="vehicle-body">
      <span className="mini">{vehicle.branches?.name ?? 'Consultar sucursal'}</span>
      <h3>{vehicle.brand} {vehicle.model}</h3>
      <p>{vehicle.version || 'Consultar versión'}</p>
      <div className="specs"><span>{vehicle.model_year ?? 'Año a consultar'}</span><span>{formatKm(vehicle.mileage_km)}</span></div>
      <div className="vehicle-bottom"><strong>{formatPrice(vehicle.cash_price,vehicle.currency)}</strong><Link className="small-button" href={`/autos/${vehicle.slug}`}>Ver ficha →</Link></div>
    </div>
  </article>;
}
