import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'kldsrenndnyttvfuoauf.supabase.co',
      pathname: '/storage/v1/object/public/vehicle-images/**'
    },{
      protocol: 'https',
      hostname: 'http2.mlstatic.com',
      pathname: '/D_NQ_NP_**'
    }],
    formats: ['image/webp'],
    qualities: [60,65,75],
    minimumCacheTTL: 86400,
  },
  poweredByHeader: false,

  // CSP compatible con el runtime App Router (scripts inline de hidratación).
  // Las fuentes se restringen al CDN de fotos y Supabase usados por este sitio.
  async headers() {
    const policy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://http2.mlstatic.com https://kldsrenndnyttvfuoauf.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://kldsrenndnyttvfuoauf.supabase.co https://dolarapi.com",
      "media-src 'self'",
      "upgrade-insecure-requests",
    ].join('; ');
    return [{ source:'/(.*)', headers:[
      {key:'Content-Security-Policy',value:policy},
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
      {key:'X-Frame-Options',value:'DENY'}
    ]}];
  }
};
export default nextConfig;
