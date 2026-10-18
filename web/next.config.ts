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
  },
  poweredByHeader: false,
  async headers() {
    return [{source:'/(.*)',headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
      {key:'X-Frame-Options',value:'DENY'}
    ]}];
  }
};
export default nextConfig;
