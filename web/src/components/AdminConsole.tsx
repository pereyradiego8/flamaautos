'use client';
import {useCallback,useEffect,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {browserSupabase,publicPhotoUrl} from '@/lib/supabase';
import {CATEGORIES,formatPrice,slugify} from '@/lib/catalog';
import type {Branch,Vehicle,VehicleStatus,Currency,Category} from '@/lib/types';

const statuses: {value:VehicleStatus;label:string}[] = [{value:'draft',label:'Borrador'},{value:'published',label:'Publicado'},{value:'reserved',label:'Reservado'},{value:'sold',label:'Vendido'}];
type VehicleForm={brand:string;model:string;version:string;model_year:string;mileage_km:string;category:Category;fuel:string;transmission:string;description:string;currency:Currency;cash_price:string;down_payment:string;trade_in_price:string;branch_id:string;featured:boolean;status:VehicleStatus};
const newForm:VehicleForm={brand:'',model:'',version:'',model_year:'',mileage_km:'',category:'sedan',fuel:'',transmission:'',description:'',currency:'ARS',cash_price:'',down_payment:'',trade_in_price:'',branch_id:'',featured:false,status:'draft'};
function toForm(v:Vehicle):VehicleForm {return {brand:v.brand,model:v.model,version:v.version??'',model_year:v.model_year?.toString()??'',mileage_km:v.mileage_km?.toString()??'',category:v.category,fuel:v.fuel??'',transmission:v.transmission??'',description:v.description??'',currency:v.currency??'ARS',cash_price:v.cash_price?.toString()??'',down_payment:v.down_payment?.toString()??'',trade_in_price:v.trade_in_price?.toString()??'',branch_id:v.branch_id??'',featured:v.featured,status:v.status};}
function toNum(value:string):number|null{return value.trim()===''?null:Number(value);}
function makePayload(form:VehicleForm){return {brand:form.brand.trim(),model:form.model.trim(),version:form.version.trim()||null,model_year:toNum(form.model_year),mileage_km:toNum(form.mileage_km),category:form.category,fuel:form.fuel.trim()||null,transmission:form.transmission.trim()||null,description:form.description.trim()||null,currency:form.currency,cash_price:toNum(form.cash_price),down_payment:toNum(form.down_payment),trade_in_price:toNum(form.trade_in_price),branch_id:form.branch_id||null,featured:form.featured,status:form.status};}
function validate(form:VehicleForm):string|null{
 if(!form.brand.trim()||!form.model.trim())return 'Completá marca y modelo.';
 const year=toNum(form.model_year);if(year!==null&&(!Number.isInteger(year)||year<1950||year>2100))return 'Ingresá un año válido.';
 for(const [label,value] of [['Kilometraje',form.mileage_km],['Precio',form.cash_price],['Anticipo',form.down_payment],['Permuta',form.trade_in_price]]){const n=toNum(value);if(n!==null&&(!Number.isFinite(n)||n<0))return `${label}: ingresá un número positivo.`;}
 if(form.status==='published'&&(!form.model_year||!form.currency||toNum(form.cash_price)===null))return 'Para publicar, indicá año, moneda y precio de contado.';
 return null;
}
export default function AdminConsole(){
 const client=browserSupabase();
 const [user,setUser]=useState<User|null>(null);
 const [role,setRole]=useState<'admin'|'editor'|null>(null);
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [confirmPassword,setConfirmPassword]=useState('');
 const [showPasswords,setShowPasswords]=useState(false);
 const [creatingAccess,setCreatingAccess]=useState(false);
 const [loading,setLoading]=useState(true);const [working,setWorking]=useState(false);
 const [message,setMessage]=useState('');const [error,setError]=useState('');
 const [vehicles,setVehicles]=useState<Vehicle[]>([]);const [branches,setBranches]=useState<Branch[]>([]);
 const [editing,setEditing]=useState<string|null>(null);const [form,setForm]=useState<VehicleForm>({...newForm});
 const [photos,setPhotos]=useState<FileList|null>(null);
 const [formOpen,setFormOpen]=useState(false);

 useEffect(()=>{
  if(!client){setLoading(false);return;}
  let active=true;
  client.auth.getUser().then(({data})=>{if(active){setUser(data.user);if(!data.user)setLoading(false);}}).catch(()=>{if(active)setLoading(false);});
  const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{if(active){setLoading(Boolean(session?.user));setUser(session?.user??null);setRole(null);}});
  return ()=>{active=false;subscription.unsubscribe();};
 // client estable; se genera una sola instancia en el navegador.
 },[client]);
 const refresh=useCallback(async()=>{
  if(!client)return;
  const [v,b]=await Promise.all([client.from('vehicles').select('*,branches(name,address),vehicle_images(id,vehicle_id,storage_path,alt_text,sort_order)').order('created_at',{ascending:false}).limit(500),client.from('branches').select('id,name,address,active').order('name')]);
  if(v.error||b.error){setError('No se pudo cargar el inventario o las sucursales. Revisá la conexión y los permisos.');return;}
  setVehicles((v.data??[]) as Vehicle[]);setBranches((b.data??[]) as Branch[]);
 },[client]);
 useEffect(()=>{
  if(!client||!user){setRole(null);setVehicles([]);return;}
  let active=true;
  client.from('staff').select('role').eq('user_id',user.id).maybeSingle().then(({data,error:err})=>{
   if(!active)return;
   if(err||!data||!['admin','editor'].includes(data.role)){setRole(null);setLoading(false);return;}
   setRole(data.role as 'admin'|'editor');setLoading(false);void refresh();
  });
  return()=>{active=false;};
 },[client,user,refresh]);
 async function login(e:React.FormEvent){e.preventDefault();if(!client)return;setWorking(true);setError('');setMessage('');
  const {error:err}=await client.auth.signInWithPassword({email:email.trim(),password});setWorking(false);setPassword('');setShowPasswords(false);if(err)setError('No se pudo ingresar. Verificá tus credenciales.');
 }
 async function signup(e:React.FormEvent){e.preventDefault();if(!client||working)return;
  if(password!==confirmPassword){setError('Las contraseñas no coinciden. Revisalas e intentá nuevamente.');return;}
  setWorking(true);setError('');setMessage('');
  const {error:err}=await client.auth.signUp({
   email:email.trim(),password,
   options:{emailRedirectTo:`${window.location.origin}/admin`}
  });
  setWorking(false);setPassword('');setConfirmPassword('');setShowPasswords(false);
  if(err){setError('No pudimos iniciar el registro. Revisá el correo o intentá nuevamente más tarde.');return;}
  setMessage('Revisá tu correo y confirmá la cuenta. Después, volvé a este panel e ingresá con tu contraseña. Solo el correo autorizado recibirá permisos de administración.');
  setCreatingAccess(false);
 }
 async function logout(){if(client)await client.auth.signOut();setUser(null);setRole(null);setVehicles([]);setFormOpen(false);}
 function startNew(){setEditing(null);setForm({...newForm});setPhotos(null);setError('');setMessage('');setFormOpen(true);}
 function startEdit(v:Vehicle){setEditing(v.id);setForm(toForm(v));setPhotos(null);setError('');setMessage('');setFormOpen(true);}
 async function save(e:React.FormEvent){e.preventDefault();if(!client||!role||working)return;
  const problem=validate(form);if(problem){setError(problem);return;}
  setWorking(true);setError('');setMessage('');const payload=makePayload(form);
  const result=editing
   ? await client.from('vehicles').update(payload).eq('id',editing).select('id').single()
   : await client.from('vehicles').insert({...payload,slug:`${slugify(`${payload.brand}-${payload.model}-${payload.model_year??'vehiculo'}`)}-${crypto.randomUUID().slice(0,8)}`}).select('id').single();
  if(result.error||!result.data){setError(`No se pudo guardar el vehículo (${result.error?.code??'sin confirmación'}).`);setWorking(false);return;}
  const id=result.data.id;
  if(photos?.length){
   for(const file of Array.from(photos).slice(0,12)){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Algunas imágenes no se subieron: solo JPG, PNG o WebP de hasta 5 MB.');continue;}
    const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
    const path=`${id}/${crypto.randomUUID()}.${ext}`;
    const uploaded=await client.storage.from('vehicle-images').upload(path,file,{upsert:false,contentType:file.type});
    if(uploaded.error){setError('El vehículo se guardó, pero alguna fotografía no pudo subirse.');continue;}
    const added=await client.from('vehicle_images').insert({vehicle_id:id,storage_path:path,alt_text:`${payload.brand} ${payload.model}`,sort_order:0});
    if(added.error){await client.storage.from('vehicle-images').remove([path]);setError('El vehículo se guardó, pero no se pudo registrar una fotografía.');}
   }
  }
  setWorking(false);setMessage('Vehículo guardado correctamente.');setFormOpen(false);await refresh();
 }
 async function changeStatus(id:string,status:VehicleStatus){if(!client||!role||working)return;setWorking(true);setError('');setMessage('');
  const {error:err}=await client.from('vehicles').update({status}).eq('id',id).select('id').single();
  if(err)setError('No se pudo actualizar el estado. Revisá que tenga año y precio si intentás publicarlo.');
  else {setVehicles(old=>old.map(v=>v.id===id?{...v,status}:v));setMessage('Estado actualizado.');}
  setWorking(false);
 }
 async function removePhoto(imageId:string,path:string){if(!client||!role||working)return;if(!window.confirm('¿Quitar esta fotografía?'))return;setWorking(true);setError('');
  // Se retira primero la referencia pública; una falla posterior deja únicamente un archivo huérfano, no una ficha rota.
  const {error:err}=await client.from('vehicle_images').delete().eq('id',imageId);
  if(err){setError('No se pudo quitar la fotografía.');setWorking(false);return;}
  const removed=await client.storage.from('vehicle-images').remove([path]);if(removed.error)setError('Se quitó la foto de la ficha, pero quedó pendiente limpiar el archivo del Storage.');
  await refresh();setWorking(false);
 }
 if(!client)return <div className="empty"><h2>Panel no configurado</h2><p>Para habilitar la administración hay que conectar un proyecto Supabase nuevo y exclusivo de Flama Autos. No se reutilizarán las claves de 3020.</p></div>;
 if(loading)return <p role="status">Verificando sesión…</p>;
 if(!user)return <form className="login-card" onSubmit={creatingAccess?signup:login}>
  <h2>{creatingAccess?'Crear acceso inicial':'Ingreso del personal'}</h2>
  <p className="fine">{creatingAccess?'Usá el correo autorizado por el administrador del proyecto. La autorización se verifica en Supabase, no en esta página.':'Ingresá con tu cuenta autorizada de Flama Autos.'}</p>
  <label>Correo electrónico
   <input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} />
  </label>
  <div className="password-group">
   <label htmlFor="admin-password">Contraseña</label>
   <div className="password-field">
    <input id="admin-password" type={showPasswords?'text':'password'} required autoComplete={creatingAccess?'new-password':'current-password'} value={password} onChange={e=>{setPassword(e.target.value);if(error)setError('');}} />
    <button type="button" className="password-visibility-button" aria-label={showPasswords?'Ocultar contraseñas':'Mostrar contraseñas'} aria-pressed={showPasswords} onClick={()=>setShowPasswords(v=>!v)}>{showPasswords?'Ocultar':'Mostrar'}</button>
   </div>
  </div>
  {creatingAccess&&<div className="password-group">
   <label htmlFor="admin-confirm-password">Confirmar contraseña</label>
   <div className="password-field">
    <input id="admin-confirm-password" type={showPasswords?'text':'password'} required autoComplete="new-password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);if(error)setError('');}} aria-invalid={confirmPassword.length>0&&password!==confirmPassword} aria-describedby="password-confirmation-help" />
   </div>
   <p id="password-confirmation-help" className={confirmPassword.length>0&&password!==confirmPassword?'password-mismatch':'fine'} role={confirmPassword.length>0&&password!==confirmPassword?'status':undefined}>{confirmPassword.length>0&&password!==confirmPassword?'Las contraseñas no coinciden.':'Ingresá la misma contraseña en ambos campos.'}</p>
  </div>}
  <button className="btn" type="submit" disabled={working}>{working?'Procesando…':creatingAccess?'Crear cuenta y confirmar correo':'Ingresar'}</button>
  <button type="button" className="small-button" disabled={working} onClick={()=>{setCreatingAccess(!creatingAccess);setPassword('');setConfirmPassword('');setShowPasswords(false);setError('');setMessage('');}}>{creatingAccess?'Ya tengo una cuenta':'Crear acceso inicial'}</button>
  {error&&<p className="feedback error" role="alert">{error}</p>}
  {message&&<p className="feedback success" role="status">{message}</p>}
  <p className="fine">El registro no concede permisos por sí solo: únicamente una cuenta confirmada y previamente autorizada puede administrar vehículos.</p>
 </form>;
 if(!role)return <div className="empty"><h2>Acceso no autorizado</h2><p>Tu cuenta tiene sesión, pero no está habilitada como personal de Flama Autos.</p><button className="small-button" onClick={logout}>Cerrar sesión</button></div>;
 return <div className="admin-console">
   <div className="admin-top"><div><p>Sesión: <strong>{user.email}</strong> · Rol: {role}</p><h2>Inventario ({vehicles.length})</h2></div><div className="actions"><button className="btn" onClick={startNew}>+ Agregar vehículo</button><button className="small-button" onClick={logout}>Cerrar sesión</button></div></div>
   {error&&<p className="feedback error" role="alert">{error}</p>}{message&&<p className="feedback success" role="status">{message}</p>}
   {formOpen&&<form className="vehicle-form" onSubmit={save}>
    <div className="form-top"><h3>{editing?'Editar vehículo':'Nuevo vehículo'}</h3><button type="button" className="small-button" onClick={()=>setFormOpen(false)}>Cerrar</button></div>
    <div className="form-grid">
     <label>Marca *<input required maxLength={80} value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></label>
     <label>Modelo *<input required maxLength={80} value={form.model} onChange={e=>setForm({...form,model:e.target.value})}/></label>
     <label>Versión<input maxLength={140} value={form.version} onChange={e=>setForm({...form,version:e.target.value})}/></label>
     <label>Año<input type="number" min="1950" max="2100" value={form.model_year} onChange={e=>setForm({...form,model_year:e.target.value})}/></label>
     <label>Kilometraje<input type="number" min="0" value={form.mileage_km} onChange={e=>setForm({...form,mileage_km:e.target.value})}/></label>
     <label>Categoría<select value={form.category} onChange={e=>setForm({...form,category:e.target.value as Category})}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
     <label>Combustible<input maxLength={80} value={form.fuel} onChange={e=>setForm({...form,fuel:e.target.value})}/></label>
     <label>Transmisión<input maxLength={80} value={form.transmission} onChange={e=>setForm({...form,transmission:e.target.value})}/></label>
     <label>Moneda<select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value as Currency})}><option value="ARS">Pesos argentinos</option><option value="USD">Dólares estadounidenses</option></select></label>
     <label>Precio de contado<input type="number" min="0" step="0.01" value={form.cash_price} onChange={e=>setForm({...form,cash_price:e.target.value})}/></label>
     <label>Anticipo<input type="number" min="0" step="0.01" value={form.down_payment} onChange={e=>setForm({...form,down_payment:e.target.value})}/></label>
     <label>Precio de permuta<input type="number" min="0" step="0.01" value={form.trade_in_price} onChange={e=>setForm({...form,trade_in_price:e.target.value})}/></label>
     <label>Sucursal<select value={form.branch_id} onChange={e=>setForm({...form,branch_id:e.target.value})}><option value="">Sin asignar</option>{branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
     <label>Estado<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as VehicleStatus})}>{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
     <label className="checkbox-label"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Destacado</label>
     <label>Agregar fotografías (máx. 12 por guardado, JPG/PNG/WebP, 5 MB c/u)<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e=>setPhotos(e.target.files)}/></label>
    </div><label>Descripción y equipamiento<textarea rows={5} maxLength={10000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
    {editing&&<div className="photo-admin"><p>Fotos actuales</p>{vehicles.find(v=>v.id===editing)?.vehicle_images?.map(im=>{const url=publicPhotoUrl(im.storage_path);return <div className="mini-photo" key={im.id}>{url&&<img src={url} alt={im.alt_text??'Vehículo'}/>}<button type="button" disabled={working} onClick={()=>removePhoto(im.id,im.storage_path)}>Quitar</button></div>})}</div>}
    <div className="actions"><button className="btn" disabled={working} type="submit">{working?'Guardando…':'Guardar vehículo'}</button><button className="small-button" type="button" onClick={()=>setFormOpen(false)}>Cancelar</button></div>
   </form>}
   <div className="admin-list">{vehicles.length===0&&<div className="empty">Todavía no hay vehículos cargados. Empezá por “Agregar vehículo”.</div>}{vehicles.map(v=><article className="admin-row" key={v.id}><div><strong>{v.brand} {v.model} {v.model_year??''}</strong><p>{v.version??''} · {formatPrice(v.cash_price,v.currency)} · {v.branches?.name??'Sin sucursal'}</p></div><div className="admin-controls"><label>Estado<select aria-label={`Estado de ${v.brand} ${v.model}`} disabled={working} value={v.status} onChange={e=>void changeStatus(v.id,e.target.value as VehicleStatus)}>{statuses.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label><button className="small-button" onClick={()=>startEdit(v)}>Editar</button></div></article>)}</div>
  </div>;
}
