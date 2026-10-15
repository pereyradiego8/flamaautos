'use client';
import { useMemo,useState } from 'react';
import VehicleCard from './VehicleCard';
import {CATEGORIES,comparePrices} from '@/lib/catalog';
import type {Vehicle,Branch} from '@/lib/types';
export default function CatalogFilters({vehicles,branches,rate,updatedAt,initialCategory=''}:{vehicles:Vehicle[];branches:Branch[];rate:number|null;updatedAt:string|null;initialCategory?:string}) {
  const [search,setSearch] = useState('');
  const [category,setCategory] = useState(initialCategory);
  const [branch,setBranch] = useState('');
  const [sort,setSort] = useState('recent');
  const priceSort = sort.startsWith('price');
  const filtered = useMemo(() => {
    const needle = search.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const arr = vehicles.filter(v => {
      const haystack = `${v.brand} ${v.model} ${v.version||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return (!needle || haystack.includes(needle)) && (!category || v.category === category) && (!branch || v.branch_id === branch);
    });
    return arr.sort((a,b) => {
      if (sort === 'year_desc') return (b.model_year??0)-(a.model_year??0);
      if (sort === 'year_asc') return (a.model_year??9999)-(b.model_year??9999);
      if (sort === 'price_asc') return comparePrices(a,b,rate,false);
      if (sort === 'price_desc') return comparePrices(a,b,rate,true);
      return Date.parse(b.created_at)-Date.parse(a.created_at);
    });
  },[vehicles,search,category,branch,sort,rate]);
  return <>
    <div className="filters">
      <label>Buscar<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Marca, modelo o versión" /></label>
      <label>Categoría<select value={category} onChange={e=>setCategory(e.target.value)}><option value="">Todas</option>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
      <label>Sucursal<select value={branch} onChange={e=>setBranch(e.target.value)}><option value="">Todas</option>{branches.map(b=><option value={b.id} key={b.id}>{b.name}</option>)}</select></label>
      <label>Ordenar<select value={sort} onChange={e=>setSort(e.target.value)}><option value="recent">Últimos ingresos</option><option value="year_desc">Año: mayor a menor</option><option value="year_asc">Año: menor a mayor</option><option value="price_asc">Precio: menor a mayor</option><option value="price_desc">Precio: mayor a menor</option></select></label>
    </div>
    {priceSort && (rate ? <p className="sort-note">Ordenamiento por equivalente en ARS. Dólar blue venta: ARS {rate.toLocaleString('es-AR')} · {updatedAt ? new Date(updatedAt).toLocaleString('es-AR') : 'actualización disponible'}. Los precios originales se mantienen en su moneda.</p> : <p className="sort-note warning">No se pudo verificar una cotización reciente del dólar blue. Los vehículos en USD quedarán después de los que tienen precio en ARS; el orden mixto no es comparable.</p>)}
    <p className="results" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'vehículo' : 'vehículos'}</p>
    {filtered.length ? <div className="vehicle-grid">{filtered.map(v=><VehicleCard key={v.id} vehicle={v}/>)}</div> : <div className="empty"><h2>No encontramos vehículos para estos filtros.</h2><p>Probá otra categoría o consultá el inventario por nuestros canales oficiales.</p><a className="btn" href="https://linktr.ee/flamaautos" target="_blank" rel="noopener noreferrer">Consultar disponibilidad ↗</a></div>}
  </>;
}
