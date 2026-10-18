import Link from 'next/link';
import VehicleCard from '@/components/VehicleCard';
import {publishedVehicles} from '@/lib/vehicles';
import {CATEGORIES} from '@/lib/catalog';
import {publicSupabase} from '@/lib/supabase';
import type {Branch} from '@/lib/types';
import {generalWhatsAppUrl,branchesWhatsAppUrl,FLAMA_WHATSAPP_DISPLAY} from '@/lib/whatsapp';
export const dynamic='force-dynamic';
export default async function Home(){
 const client=publicSupabase();
 const [stock,branchResult]=await Promise.all([
  publishedVehicles(),
  client?client.from('branches').select('id,name,address,active').eq('active',true).order('name'):Promise.resolve({data:[]}),
 ]);
 const latest=stock.slice(0,4);
 const branches=(branchResult.data??[]) as Branch[];
 return <main>
  <section className="hero"><div className="hero-copy"><p className="eyebrow">BERAZATEGUI · BUENOS AIRES</p><h1>Tu próximo <em>vehículo</em> está acá.</h1><p>Encontrá el vehículo que buscás y consultá con nuestro equipo por las unidades disponibles.</p><div className="actions"><Link className="btn" href="/autos">Explorar catálogo →</Link><a className="btn outline" href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer">Consultar por WhatsApp ↗</a></div></div><div className="hero-mark" aria-hidden="true"><span>F</span><div>FLAMA<br/>AUTOS</div></div></section>
  <section className="features" aria-label="Servicios"><div><strong>Atención personalizada</strong><span>Te ayudamos a elegir</span></div><div><strong>Varias categorías</strong><span>Autos, pick-ups, utilitarios y motos</span></div><div><strong>Dos sucursales</strong><span>Nos encontrás en Berazategui</span></div></section>
  <section className="section"><p className="eyebrow">EXPLORÁ EL CATÁLOGO</p><h2>Buscá por categoría.</h2><div className="categories">{CATEGORIES.slice(0,6).map(c=><Link key={c.id} href={`/autos?categoria=${c.id}`}><span><strong>{c.label}</strong><small>{c.tagline}</small></span><span aria-hidden="true">↗</span></Link>)}</div></section>
  <section className="section dark"><div className="section-title"><div><p className="eyebrow">VEHÍCULOS PUBLICADOS</p><h2>Últimos ingresos.</h2></div><Link className="outline-link" href="/autos">Ver catálogo completo →</Link></div>{latest.length?<div className="vehicle-grid">{latest.map(v=><VehicleCard vehicle={v} key={v.id}/>)}</div>:<div className="empty"><h3>Pronto vas a encontrar el inventario aquí.</h3><p>Estamos preparando el catálogo de Flama Autos. Consultá las unidades disponibles por los canales oficiales.</p><a className="btn" href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer">Consultar stock por WhatsApp ↗</a></div>}</section>
  <section className="section" id="sucursales"><p className="eyebrow">DÓNDE ESTAMOS</p><h2>Te esperamos en Berazategui.</h2>
   {branches.length?<div className="branches">{branches.map(branch=><article key={branch.id}><h3>Sucursal {branch.name}</h3><p>{branch.address}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`} target="_blank" rel="noopener noreferrer">Cómo llegar ↗</a></article>)}</div>:<div className="empty"><p>Consultá con nuestro equipo las direcciones y horarios de atención.</p><a href={branchesWhatsAppUrl()} target="_blank" rel="noopener noreferrer">Consultar sucursales por WhatsApp ↗</a></div>}
   <p className="fine">Las direcciones y horarios deben confirmarse con Flama Autos antes de visitar.</p>
  </section>
  <section className="contact section" id="contacto"><p className="eyebrow">ESTAMOS PARA AYUDARTE</p><h2>Hablemos de tu próximo vehículo.</h2><p>Consultá por stock, entrega y condiciones comerciales. WhatsApp oficial: <a className="contact-phone" href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer">{FLAMA_WHATSAPP_DISPLAY}</a>.</p><div className="actions"><a className="btn" href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp ↗</a><a className="btn outline" href="https://instagram.com/flamaautos" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div></section>
 </main>;
}
