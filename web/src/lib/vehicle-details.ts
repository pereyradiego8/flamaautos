/** Presentación editorial de especificaciones declaradas por la publicación original. */
const FEATURE_GROUPS = [
 {title:'Seguridad y asistencia',items:[
  ['Frenos ABS','Frenos ABS'],
  ['Airbag para conductor y pasajero','Airbags delanteros'],
  ['Control de estabilidad','Control de estabilidad'],
  ['Tracción ASR','Sistema ASR de control de tracción'],
  ['Alarma','Alarma'],
  ['Sensor de lluvia','Sensor de lluvia'],
  ['Sensor de estacionamiento','Sensores de estacionamiento'],
 ]},
 {title:'Confort y equipamiento',items:[
  ['Aire acondicionado','Aire acondicionado'],
  ['Tapizado de cuero','Tapizado de cuero'],
  ['Piloto automático','Control de velocidad crucero'],
  ['Techo solar eléctrico retráctil','Techo solar eléctrico'],
  ['Llantas de aleación','Llantas de aleación'],
  ['Porta equipaje en techo','Barras o portaequipaje de techo'],
 ]},
 {title:'Tecnología y conectividad',items:[
  ['Bluetooth','Bluetooth'],
  ['Android auto','Android Auto'],
  ['Apple CarPlay','Apple CarPlay'],
  ['Computadora de abordo','Computadora de a bordo'],
  ['Comando remoto para radio en el volante','Comandos de audio al volante'],
  ['Entrada USB','Entrada USB'],
  ['DVD','Reproductor de DVD'],
  ['Reproductor de MP3','Reproductor MP3'],
  ['AM/FM','Radio AM/FM'],
 ]},
] as const;

export function descriptionParagraphs(value:string|null|undefined):string[]{
 return (value??'').replace(/\r\n/g,'\n').split(/\n\s*\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
}
export function equipmentGroups(specs:Record<string,string>|null|undefined){
 if(!specs)return [];
 return FEATURE_GROUPS.map(group=>({
  title:group.title,
  items:group.items.filter(([key])=>specs[key]?.trim().toLowerCase()==='sí').map(([,label])=>label),
 })).filter(group=>group.items.length>0);
}

const LABELS:Record<string,string>={
 'Computadora de abordo':'Computadora de a bordo',
 'Android auto':'Android Auto',
 'Control de tracción':'Tracción',
 'Airbag para conductor y pasajero':'Airbags delanteros',
 'Tipo de carrocería':'Carrocería',
 'Porta vasos':'Portavasos',
 'Largo x Altura x Ancho':'Largo × alto × ancho',
 'Piloto automático':'Control de velocidad crucero',
 'Comando remoto para radio en el volante':'Comandos de audio al volante',
 'Largo x Altura':'Largo × alto',
 'Capacidad de personas':'Cantidad de plazas (según aviso)',
 'Tercera luz de freno led':'Tercera luz de freno LED',
 'Tracción ASR':'Sistema ASR',
 'Techo solar eléctrico retráctil':'Techo solar eléctrico',
};
export function formatSpecLabel(label:string):string{return LABELS[label]??label;}
