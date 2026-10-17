import { NextResponse } from 'next/server';
import { publicSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/** Chequeo de conectividad real. No expone claves, esquema ni mensajes internos. */
export async function GET(){
 const client=publicSupabase();
 if(!client){
  return NextResponse.json(
   {status:'degraded',service:'flamaautos',databaseConfigured:false,databaseConnected:false},
   {status:503,headers:{'Cache-Control':'no-store'}}
  );
 }
 try{
  const {error}=await client.from('branches')
   .select('id',{head:true,count:'exact'})
   .abortSignal(AbortSignal.timeout(3500));
  const ok=!error;
  return NextResponse.json(
   {status:ok?'ok':'degraded',service:'flamaautos',databaseConfigured:true,databaseConnected:ok},
   {status:ok?200:503,headers:{'Cache-Control':'no-store'}}
  );
 }catch{
  return NextResponse.json(
   {status:'degraded',service:'flamaautos',databaseConfigured:true,databaseConnected:false},
   {status:503,headers:{'Cache-Control':'no-store'}}
  );
 }
}
