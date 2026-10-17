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
 const [showPasswords,setShowPasswords]=useState(false);
 const [inviteEmail,setInviteEmail]=useState('');
 const [inviteRole,setInviteRole]=useState<'admin'|'editor'>('editor');
 const [inviteOpen,setInviteOpen]=useState(false);
 const [newPassword,setNewPassword]=useState('');
 const [newPasswordConfirmation,setNewPasswordConfirmation]=useState('');
 const [passwordOpen,setPasswordOpen]=useState(false);
 const [accountBusy,setAccountBusy]=useState(false);
 const [adminSearch,setAdminSearch]=useState('');
 const [adminStatus,setAdminStatus]=useState('all');
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
 async function inviteStaff(e:React.FormEvent){
  e.preventDefault();if(!client||role!=='admin'||accountBusy)return;
  setAccountBusy(true);setError('');setMessage('');
  try{
   const {data, error:err}=await client.functions.invoke('invite-staff',{
    body:{email:inviteEmail.trim(),role:inviteRole}
   });
   if(err||!data?.ok){
    setError(typeof data?.error==='string'?data.error:'No se pudo enviar la invitación. Revisá la sesión y los permisos.');
   }else{
    setMessage('Invitación enviada. El nuevo usuario debe aceptar el correo y configurar su contraseña.');
    setInviteEmail('');setInviteOpen(false);
   }
  }catch{setError('No se pudo contactar el servicio de invitaciones.');}
  finally{setAccountBusy(false);}
 }
 async function changeAccountPassword(e:React.FormEvent){
  e.preventDefault();if(!client||accountBusy)return;
  if(newPassword!==newPasswordConfirmation){setError('Las contraseñas no coinciden.');return;}
  setAccountBusy(true);setError('');setMessage('');
  const {error:err}=await client.auth.updateUser({password:newPassword});
  if(err)setError('No se pudo actualizar la contraseña. Revisá los requisitos de Supabase Auth.');
  else{setMessage('Contraseña actualizada.');setNewPassword('');setNewPasswordConfirmation('');setPasswordOpen(false);}
  setAccountBusy(false);
 }
 async function logout(){if(client)await client.auth.signOut();setUser(null);setRole(null);setVehicles([]);setFormOpen(false);}
 function startNew(){setEditing(null);setForm({...newForm});setPhotos(null);setError('');setMessage('');setFormOpen(true);}
 function startDuplicate(v:Vehicle){
  setEditing(null);
  setForm({...toForm(v),status:'draft',featured:false});
  setPhotos(null);setError('');
  setMessage('Revisá los datos antes de guardar una nueva unidad. Las fotos no se duplican.');
  setFormOpen(true);
 }
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
   const currentImages=vehicles.find(v=>v.id===editing)?.vehicle_images??[];
   let nextOrder=Math.max(-1,...currentImages.map(image=>image.sort_order))+1;
   for(const file of Array.from(photos).slice(0,12)){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError('Algunas imágenes no se subieron: solo JPG, PNG o WebP de hasta 5 MB.');continue;}
    const ext=file.type==='image/jpeg'?'jpg':file.type==='image/png'?'png':'webp';
    const path=`${id}/${crypto.randomUUID()}.${ext}`;
    const uploaded=await client.storage.from('vehicle-images').upload(path,file,{upsert:false,contentType:file.type});
    if(uploaded.error){setError('El vehículo se guardó, pero alguna fotografía no pudo subirse.');continue;}
    const added=await client.from('vehicle_images').insert({vehicle_id:id,storage_path:path,alt_text:`${payload.brand} ${payload.model}`,sort_order:nextOrder++});
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
 async function movePhoto(imageId:string,direction:-1|1){
  if(!client||!editing||working)return;
  const images=[...(vehicles.find(v=>v.id===editing)?.vehicle_images??[])]
   .sort((a,b)=>a.sort_order-b.sort_order||a.id.localeCompare(b.id));
  const oldIndex=images.findIndex(image=>image.id===imageId);
  const newIndex=oldIndex+direction;
  if(oldIndex<0||newIndex<0||newIndex>=images.length)return;
  const ids=images.map(image=>image.id);
  [ids[oldIndex],ids[newIndex]]=[ids[newIndex],ids[oldIndex]];
  setWorking(true);setError('');setMessage('');
  const {error:err}=await client.rpc('reorder_vehicle_images',{
   p_vehicle_id:editing,p_image_ids:ids,
  });
  if(err)setError('No pudimos cambiar el orden de las fotos.');
  else{await refresh();setMessage('Orden de fotografías actualizado.');}
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
 if(!user)return <form className="login-card" onSubmit={login}>
  <h2>Ingreso del personal</h2>
  <p className="fine">Acceso exclusivo para las cuentas autorizadas de Flama Autos. Los usuarios nuevos se incorporan por invitación del administrador.</p>
  <label>Correo electrónico
   <input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} />
  </label>
  <div className="password-group">
   <label htmlFor="admin-password">Contraseña</label>
   <div className="password-field">
    <input id="admin-password" type={showPasswords?'text':'password'} required autoComplete="current-password" value={password} onChange={e=>{setPassword(e.target.value);if(error)setError('');}} />
    <button type="button" className="password-visibility-button" aria-label={showPasswords?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={showPasswords} onClick={()=>setShowPasswords(v=>!v)}>{showPasswords?'Ocultar':'Mostrar'}</button>
   </div>
  </div>
  <button className="btn" type="submit" disabled={working}>{working?'Ingresando…':'Ingresar'}</button>
  {error&&<p className="feedback error" role="alert">{error}</p>}
  {message&&<p className="feedback success" role="status">{message}</p>}
 </form>;
 if(!role)return <div className="empty"><h2>Acceso no autorizado</h2><p>Tu cuenta tiene sesión, pero no está habilitada como personal de Flama Autos.</p><button className="small-button" onClick={logout}>Cerrar sesión</button></div>;
 const shownVehicles=vehicles.filter(v=>{
  const query=adminSearch.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const searchText=`${v.brand} ${v.model} ${v.version??''} ${v.model_year??''}`
   .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return (!query||searchText.includes(query))&&(adminStatus==='all'||v.status===adminStatus);
 });
 return <div className="admin-console">
   <div className="admin-top"><div><p>Sesión: <strong>{user.email}</strong> · Rol: {role}</p><h2>Inventario ({vehicles.length})</h2></div><div className="actions"><button className="btn" onClick={startNew}>+ Agregar vehículo</button>{role==='admin'&&<button type="button" className="small-button" onClick={()=>{setInviteOpen(v=>!v);setPasswordOpen(false)}}>Invitar personal</button>}<button type="button" className="small-button" onClick={()=>{setPasswordOpen(v=>!v);setInviteOpen(false)}}>Cambiar contraseña</button><button className="small-button" onClick={logout}>Cerrar sesión</button></div></div>
   {role==='admin'&&inviteOpen&&<form className="access-settings" onSubmit={inviteStaff}>
    <h3>Invitar personal</h3>
    <p className="fine">Solo administradores pueden invitar usuarios. Supabase enviará un enlace para aceptar la invitación.</p>
    <div className="access-settings-fields">
     <label>Correo electrónico<input type="email" required autoComplete="off" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)}/></label>
     <label>Permiso<select value={inviteRole} onChange={e=>setInviteRole(e.target.value as 'admin'|'editor')}><option value="editor">Editor de vehículos</option><option value="admin">Administrador</option></select></label>
    </div>
    <div className="actions"><button className="btn" disabled={accountBusy} type="submit">{accountBusy?'Enviando…':'Enviar invitación'}</button><button className="small-button" type="button" onClick={()=>setInviteOpen(false)}>Cancelar</button></div>
   </form>}
   {passwordOpen&&<form className="access-settings" onSubmit={changeAccountPassword}>
    <h3>Cambiar contraseña</h3>
    <p className="fine">Ingresá la contraseña nueva dos veces. Supabase puede aplicar sus propias políticas de seguridad.</p>
    <div className="access-settings-fields">
     <label>Contraseña nueva<input type="password" required autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label>
     <label>Confirmar contraseña<input type="password" required autoComplete="new-password" value={newPasswordConfirmation} onChange={e=>setNewPasswordConfirmation(e.target.value)}/></label>
    </div>
    <div className="actions"><button className="btn" disabled={accountBusy} type="submit">Actualizar contraseña</button><button className="small-button" type="button" onClick={()=>setPasswordOpen(false)}>Cancelar</button></div>
   </form>}
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
    {editing&&<div className="photo-admin"><p>Fotografías actuales (la primera es la principal)</p>{[...(vehicles.find(v=>v.id===editing)?.vehicle_images??[])].sort((a,b)=>a.sort_order-b.sort_order||a.id.localeCompare(b.id)).map((im,index,all)=>{const url=publicPhotoUrl(im.storage_path);return <div className="mini-photo" key={im.id}>{url&&<img src={url} alt={im.alt_text??'Vehículo'}/>}<span className="photo-order-label">{index===0?'Principal':`Foto ${index+1}`}</span><div className="photo-order-buttons"><button type="button" className="small-button" title="Mover foto hacia el principio" aria-label="Mover foto hacia el principio" disabled={working||index===0} onClick={()=>movePhoto(im.id,-1)}>←</button><button type="button" className="small-button" title="Mover foto hacia el final" aria-label="Mover foto hacia el final" disabled={working||index===all.length-1} onClick={()=>movePhoto(im.id,1)}>→</button></div><button type="button" className="small-button" disabled={working} onClick={()=>removePhoto(im.id,im.storage_path)}>Quitar</button></div>})}</div>}
    <div className="actions"><button className="btn" disabled={working} type="submit">{working?'Guardando…':'Guardar vehículo'}</button><button className="small-button" type="button" onClick={()=>setFormOpen(false)}>Cancelar</button></div>
   </form>}
   {vehicles.length>0&&<div className="admin-searchbar"><label>Buscar unidades<input type="search" value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Marca, modelo, año o versión"/></label><label>Estado<select value={adminStatus} onChange={e=>setAdminStatus(e.target.value)}><option value="all">Todos</option>{statuses.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label><span className="fine" aria-live="polite">Mostrando {shownVehicles.length} de {vehicles.length}</span></div>}
   <div className="admin-list">{vehicles.length===0&&<div className="empty">Todavía no hay vehículos cargados. Empezá por “Agregar vehículo”.</div>}{vehicles.length>0&&shownVehicles.length===0&&<div className="empty">No hay vehículos que coincidan con los filtros.</div>}{shownVehicles.map(v=><article className="admin-row" key={v.id}><div><strong>{v.brand} {v.model} {v.model_year??''}</strong><p>{v.version??''} · {formatPrice(v.cash_price,v.currency)} · {v.branches?.name??'Sin sucursal'}</p></div><div className="admin-controls"><label>Estado<select aria-label={`Estado de ${v.brand} ${v.model}`} disabled={working} value={v.status} onChange={e=>void changeStatus(v.id,e.target.value as VehicleStatus)}>{statuses.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label><button type="button" className="small-button" onClick={()=>startEdit(v)}>Editar</button><button type="button" className="small-button" onClick={()=>startDuplicate(v)}>Duplicar</button></div></article>)}</div>
  </div>;
}
