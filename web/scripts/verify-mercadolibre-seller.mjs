/** Auditoría manual de publicaciones oficiales de Agencia Flama.
 * No actualiza inventario ni usa credenciales.
 */
const SELLER_ID = 117436611;
const sources = [
  {
    "source_listing_id": "MLA1987510969",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-1987510969-volkswagen-gol-trend-16-comfortline-101cv-_JM"
  },
  {
    "source_listing_id": "MLA1987825341",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-1987825341-volkswagen-gol-trend-16-pack-iii-101cv-_JM"
  },
  {
    "source_listing_id": "MLA2052064079",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2052064079-renault-sandero-16-expression-90cv-abs-_JM"
  },
  {
    "source_listing_id": "MLA2057557547",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2057557547-peugeot-308-16-active-_JM"
  },
  {
    "source_listing_id": "MLA2058031523",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2058031523-volkswagen-bora-20-trendline-115cv-_JM"
  },
  {
    "source_listing_id": "MLA2058059311",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2058059311-toyota-corolla-18-hev-xei-ecvt-_JM"
  },
  {
    "source_listing_id": "MLA2106857291",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2106857291-ford-territory-18-ecoboost-titanium-at-_JM"
  },
  {
    "source_listing_id": "MLA2137484737",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2137484737-peugeot-207-14-quiksilver-75cv-_JM"
  },
  {
    "source_listing_id": "MLA2140582151",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-2140582151-ford-ranger-30-v6-cd-4x4-xls-at-250cv-_JM"
  },
  {
    "source_listing_id": "MLA3732296858",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3732296858-chery-qq-11-light-_JM"
  },
  {
    "source_listing_id": "MLA3761008108",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3761008108-toyota-hilux-pick-up-28-cd-srv-177cv-4x2-_JM"
  },
  {
    "source_listing_id": "MLA3809021816",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3809021816-mercedes-benz-clase-gla-16-gla200-at-urban-156cv-_JM"
  },
  {
    "source_listing_id": "MLA3906178490",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3906178490-fiat-500l-14-pop-star-105cv-_JM"
  },
  {
    "source_listing_id": "MLA3906243858",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3906243858-volkswagen-suran-16-comfortline-101cv-_JM"
  },
  {
    "source_listing_id": "MLA3917018682",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3917018682-volkswagen-amarok-20-cd-tdi-4x4-highline-cuero-hc4-_JM"
  },
  {
    "source_listing_id": "MLA3939938022",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3939938022-ford-ecosport-16-se-110cv-4x2-_JM"
  },
  {
    "source_listing_id": "MLA3940126512",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3940126512-peugeot-208-16-like-pack-_JM"
  },
  {
    "source_listing_id": "MLA3940229480",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3940229480-citron-berlingo-furgon-16-bussines-hdi-92cv-am54-_JM"
  },
  {
    "source_listing_id": "MLA3940774268",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3940774268-volkswagen-amarok-20-cd-tdi-4x4-highline-pack-at-c34-_JM"
  },
  {
    "source_listing_id": "MLA3943834144",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3943834144-fiat-cronos-13-precision-cvt-_JM"
  },
  {
    "source_listing_id": "MLA3994936646",
    "source_url": "https://auto.mercadolibre.com.ar/MLA-3994936646-ram-rampage-20-laramie-gme-at9-4x4-_JM"
  }
];
const failures=[];
for(let cursor=0;cursor<sources.length;cursor+=3){
 const results=await Promise.all(sources.slice(cursor,cursor+3).map(async ({source_listing_id:id,source_url:url})=>{
  try{
   const u=new URL(url);
   if(u.protocol!=='https:' || u.hostname!=='auto.mercadolibre.com.ar' || !/^MLA[0-9]+$/.test(id))throw Error('URL o ID inválido');
   const response=await fetch(u,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Mozilla/5.0'}});
   if(!response.ok)throw Error('HTTP '+response.status);
   const html=await response.text();
   const observedId=html.match(/"itemId"\s*:\s*"(MLA[0-9]+)"/)?.[1];
   const observedSeller=Number(html.match(/"sellerId"\s*:\s*([0-9]+)/)?.[1]??0);
   if(observedId!==id)throw Error('ID del aviso no coincide');
   if(observedSeller!==SELLER_ID)throw Error('Vendedor distinto del oficial');
   return {id,ok:true};
  }catch(err){return {id,ok:false,error:String(err.message??err).slice(0,140)}}
 }));
 for(const result of results){
  console.log(JSON.stringify(result));
  if(!result.ok)failures.push(result);
 }
}
console.log(JSON.stringify({checked:sources.length,verified:sources.length-failures.length,failed:failures.length,sellerId:SELLER_ID}));
if(failures.length)process.exitCode=1;
