import type { Metadata } from 'next';
import Link from 'next/link';
import './styles.css';
export const metadata: Metadata={
 metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flamaautos.vercel.app'),
 title:{default:'Flama Autos | Berazategui',template:'%s | Flama Autos'},
 description:'Explorá el catálogo de Flama Autos en Berazategui. Vehículos, sucursales y contacto.',
 alternates:{canonical:'/'},
 robots:{index:true,follow:true},
 openGraph:{
  type:'website',locale:'es_AR',siteName:'Flama Autos',
  title:'Flama Autos | Berazategui',
  description:'Encontrá tu próximo vehículo. Explorá nuestro catálogo en Berazategui.',
  url:'/',
 },
 twitter:{card:'summary',title:'Flama Autos | Berazategui'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><body><header className="header"><Link href="/" className="brand" aria-label="Flama Autos: inicio"><span className="brand-flame">◢</span> FLAMA<small>AUTOS</small></Link><nav aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/autos">Vehículos</Link><Link href="/#sucursales">Sucursales</Link><Link href="/#contacto">Contacto</Link></nav><a href="https://linktr.ee/flamaautos" className="header-contact" target="_blank" rel="noopener noreferrer">Consultanos ↗</a></header>{children}<footer><div><strong>FLAMA AUTOS</strong><span>Berazategui · Buenos Aires</span></div><div><Link href="/autos">Catálogo</Link><a href="https://instagram.com/flamaautos" target="_blank" rel="noopener noreferrer">Instagram</a><Link href="/admin">Administración</Link></div><small>© {new Date().getFullYear()} Flama Autos</small></footer></body></html>}
