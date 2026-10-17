import { ImageResponse } from 'next/og';

export const size={width:1200,height:630};
export const contentType='image/png';
export const alt='Flama Autos — vehículos en Berazategui';

/** Tarjeta de redes generada con marca tipográfica, sin fotografías ni precios ficticios. */
export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{
   width:'100%',height:'100%',display:'flex',flexDirection:'column',
   alignItems:'flex-start',justifyContent:'center',padding:'72px',
   background:'linear-gradient(125deg,#0b0f12 10%,#202b30 72%,#47151e 100%)',
   color:'#f8f9fa',fontFamily:'Arial,sans-serif'
  }}>
   <div style={{display:'flex',alignItems:'center',gap:22}}>
    <div style={{width:26,height:60,background:'#ef2834',transform:'skew(-20deg)'}}/>
    <div style={{fontWeight:900,fontSize:86,letterSpacing:-4}}>FLAMA</div>
   </div>
   <div style={{fontSize:24,letterSpacing:12,fontWeight:700,marginLeft:46}}>AUTOS</div>
   <div style={{marginTop:72,fontSize:37,fontWeight:700}}>Tu próximo vehículo está acá.</div>
   <div style={{fontSize:23,color:'#bdc8cc',marginTop:13}}>Berazategui · Buenos Aires</div>
  </div>,
  {...size}
 );
}
