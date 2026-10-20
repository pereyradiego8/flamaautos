import {descriptionParagraphs,equipmentGroups} from '@/lib/vehicle-details';

export default function VehicleDescription({description,specs}:{description:string|null;specs?:Record<string,string>}){
 const paragraphs=descriptionParagraphs(description);
 const groups=equipmentGroups(specs);
 const occurrences=new Map<string,number>();
 const keyedParagraphs=paragraphs.map(paragraph=>{
  const occurrence=occurrences.get(paragraph)??0;
  occurrences.set(paragraph,occurrence+1);
  return {key:paragraph+':'+occurrence,paragraph};
 });
 return <div className="vehicle-description">
   {paragraphs.length?
    <div className="vehicle-description-text">{keyedParagraphs.map(({key,paragraph})=><p key={key}>{paragraph}</p>)}</div>:
    <p>Solicitá información adicional a la agencia sobre esta unidad.</p>}
   {groups.length>0&&<div className="vehicle-features" aria-label="Equipamiento declarado en el aviso">
     <h3>Equipamiento destacado</h3>
     <p className="fine">Características informadas en la publicación. Su disponibilidad y funcionamiento deben confirmarse con la agencia.</p>
     <div className="vehicle-features-grid">{groups.map(group=>
       <section className="vehicle-feature-group" key={group.title}>
         <h4>{group.title}</h4>
         <ul>{group.items.map(item=><li key={item}>{item}</li>)}</ul>
       </section>
     )}</div>
   </div>}
 </div>;
}
