import type {MetadataRoute} from 'next';
import {publishedVehicles} from '@/lib/vehicles';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.NEXT_PUBLIC_SITE_URL;if(!base)return [];
 const root=base.replace(/\/$/,'');const vehicles=await publishedVehicles();
 return [{url:root,changeFrequency:'weekly',priority:1},{url:`${root}/autos`,changeFrequency:'daily',priority:.9},...vehicles.map(v=>({url:`${root}/autos/${encodeURIComponent(v.slug)}`,lastModified:new Date(v.updated_at),changeFrequency:'weekly' as const,priority:.7}))];
}
