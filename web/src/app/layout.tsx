import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {generalWhatsAppUrl,FLAMA_WHATSAPP_DISPLAY} from '@/lib/whatsapp';
import './styles.css';
export const metadata: Metadata={
 metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flamaautos.vercel.app'),
 title:{default:'Flama Autos | Berazategui',template:'%s | Flama Autos'},
 description:'Explorá el catálogo de Flama Autos en Berazategui. Vehículos, sucursales y contacto.',
 alternates:{canonical:'/'},
 icons:{
  icon:[
   {url:'/flama-favicon-large.svg',type:'image/svg+xml',sizes:'any'},
   {url:'/flama-favicon-32.png',type:'image/png',sizes:'32x32'},
   {url:'/flama-favicon-16.png',type:'image/png',sizes:'16x16'},
  ],
  shortcut:'/flama-favicon-large.svg',
  apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}],
 },
 robots:{index:true,follow:true},
 openGraph:{
  type:'website',locale:'es_AR',siteName:'Flama Autos',
  title:'Flama Autos | Berazategui',
  description:'Encontrá tu próximo vehículo. Explorá nuestro catálogo en Berazategui.',
  url:'/',
 },
 twitter:{card:'summary',title:'Flama Autos | Berazategui'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es-AR"><body><header className="header"><Link href="/" className="brand" aria-label="Flama Autos: inicio"><Image src="/flama-logo.svg" alt="Flama Autos" className="brand-logo" width={820} height={273} priority unoptimized /></Link><nav aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/autos">Vehículos</Link><Link href="/#sucursales">Sucursales</Link><Link href="/#contacto">Contacto</Link></nav><a href={generalWhatsAppUrl()} className="header-contact" target="_blank" rel="noopener noreferrer" aria-label={`Consultanos por WhatsApp al ${FLAMA_WHATSAPP_DISPLAY}`}>WhatsApp ↗</a></header>{children}<footer><div><Link href="/" className="footer-brand-link" aria-label="Flama Autos: volver al inicio"><Image src="/flama-logo.svg" alt="Flama Autos" className="footer-logo" width={820} height={273} unoptimized /></Link><span>Berazategui · Buenos Aires</span></div><div><Link href="/autos">Catálogo</Link><a href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp: ${FLAMA_WHATSAPP_DISPLAY}`}>WhatsApp</a><a href="https://instagram.com/flamaautos" target="_blank" rel="noopener noreferrer">Instagram</a><Link href="/admin">Administración</Link></div><small>© {new Date().getFullYear()} Flama Autos</small></footer></body></html>}
