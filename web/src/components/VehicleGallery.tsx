'use client';

import Image from 'next/image';
import {useCallback,useRef,useState} from 'react';
import type {KeyboardEvent,TouchEvent} from 'react';

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
};

type Props = {
  photos: GalleryPhoto[];
  vehicleName: string;
};

type TouchPosition = {x:number;y:number};

export default function VehicleGallery({photos,vehicleName}:Props){
  const [currentIndex,setCurrentIndex]=useState(0);
  const dialogRef=useRef<HTMLDialogElement>(null);
  const thumbnailRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const touchStart=useRef<TouchPosition|null>(null);

  const count=photos.length;
  const photo=photos[currentIndex];

  const showPhoto=useCallback((index:number)=>{
    if(count<2)return;
    setCurrentIndex((index+count)%count);
    // Desplazamiento horizontal del selector, sin desplazar la página.
    const strip=thumbnailRefs.current[0]?.parentElement;
    const target=thumbnailRefs.current[(index+count)%count];
    if(strip&&target){
      const left=target.offsetLeft-(strip.clientWidth-target.clientWidth)/2;
      strip.scrollTo({left,behavior:'smooth'});
    }
  },[count]);

  const step=useCallback((delta:number)=>{
    if(count<2)return;
    setCurrentIndex(previous=>{
      const next=(previous+delta+count)%count;
      const strip=thumbnailRefs.current[0]?.parentElement;
      const target=thumbnailRefs.current[next];
      if(strip&&target){
        strip.scrollTo({left:target.offsetLeft-(strip.clientWidth-target.clientWidth)/2,behavior:'smooth'});
      }
      return next;
    });
  },[count]);

  function handleKeyDown(event:KeyboardEvent<HTMLElement>){
    if(event.key==='ArrowLeft'){
      event.preventDefault();
      step(-1);
    }else if(event.key==='ArrowRight'){
      event.preventDefault();
      step(1);
    }
  }

  function onTouchStart(event:TouchEvent<HTMLElement>){
    if(event.touches.length===1){
      touchStart.current={x:event.touches[0].clientX,y:event.touches[0].clientY};
    }
  }

  function onTouchEnd(event:TouchEvent<HTMLElement>){
    const from=touchStart.current;
    touchStart.current=null;
    if(!from||count<2)return;
    const dx=event.changedTouches[0].clientX-from.x;
    const dy=event.changedTouches[0].clientY-from.y;
    // No interceptar desplazamientos verticales de la página.
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){
      step(dx<0?1:-1);
    }
  }

  if(!photo){
    return <div className="vehicle-gallery-empty" role="status">
      Fotos próximamente. Consultá por imágenes oficiales de esta unidad.
    </div>;
  }

  const status=`Foto ${currentIndex+1} de ${count}`;

  return <section
    className="vehicle-carousel"
    aria-label={`Galería de fotografías de ${vehicleName}`}
    aria-roledescription="carrusel"
    role="region"
    tabIndex={0}
    onKeyDown={handleKeyDown}
  >
    <div
      className="vehicle-carousel-stage"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Image
        key={photo.id}
        className="vehicle-carousel-image"
        src={photo.src}
        alt={photo.alt}
        fill
        priority={currentIndex===0}
        sizes="(max-width: 600px) 100vw, (max-width: 1100px) 90vw, 85vw"
      />
      {count>1&&<>
        <button
          type="button"
          className="vehicle-carousel-arrow previous"
          onClick={()=>step(-1)}
          aria-label="Foto anterior"
        >‹</button>
        <button
          type="button"
          className="vehicle-carousel-arrow next"
          onClick={()=>step(1)}
          aria-label="Foto siguiente"
        >›</button>
      </>}
      <span className="vehicle-carousel-counter" aria-live="polite" aria-atomic="true">
        {status}
      </span>
      <button
        type="button"
        className="vehicle-carousel-expand"
        onClick={()=>dialogRef.current?.showModal()}
        aria-label="Ampliar fotografía"
      >Ampliar <span aria-hidden="true">↗</span></button>
    </div>

    {count>1&&<div
      className="vehicle-carousel-thumbnails"
      role="group"
      aria-label="Elegir fotografía"
    >
      {photos.map((item,index)=><button
        ref={element=>{thumbnailRefs.current[index]=element;}}
        type="button"
        key={item.id}
        className={index===currentIndex?'vehicle-carousel-thumbnail is-active':'vehicle-carousel-thumbnail'}
        aria-label={`Ver foto ${index+1} de ${count}`}
        aria-current={index===currentIndex?'true':undefined}
        onClick={()=>showPhoto(index)}
      >
        <Image
          src={item.src}
          alt=""
          width={112}
          height={84}
          sizes="(max-width: 600px) 72px, 94px"
          loading="lazy"
        />
      </button>)}
    </div>}

    <dialog ref={dialogRef} className="vehicle-carousel-dialog" aria-label={`Fotografía ampliada de ${vehicleName}`}>
      <div className="vehicle-carousel-dialog-header">
        <span aria-live="polite">{status}</span>
        <button type="button" onClick={()=>dialogRef.current?.close()} aria-label="Cerrar fotografía ampliada">Cerrar ✕</button>
      </div>
      <div
        className="vehicle-carousel-dialog-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          className="vehicle-carousel-dialog-image"
          key={photo.id}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
        />
        {count>1&&<>
          <button type="button" className="vehicle-carousel-arrow previous" onClick={()=>step(-1)} aria-label="Foto anterior ampliada">‹</button>
          <button type="button" className="vehicle-carousel-arrow next" onClick={()=>step(1)} aria-label="Foto siguiente ampliada">›</button>
        </>}
      </div>
    </dialog>
    {count>1&&<p className="vehicle-carousel-help">Usá las flechas, las miniaturas o deslizá para ver más fotos.</p>}
  </section>;
}
