#!/usr/bin/env python3
"""Extrae avisos públicos de Agenciaflama; no accede a cuentas privadas.
El resultado es un manifiesto para revisión antes de publicar."""
import json, re, time, sys, html as html_module, unicodedata, urllib.request, urllib.error
from pathlib import Path
from datetime import datetime, timezone
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/'imports/agenciaflama-sources.json'
OUTPUT=ROOT/'imports/agenciaflama-extracted.json'
ERRORS=ROOT/'imports/agenciaflama-errors.json'
HEADERS={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
 'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
 'Accept-Language':'es-AR,es;q=0.9'}
SELLER_ID=117436611
COMPANY_MARKER=re.compile(r'Conoc[eé]\s+algo\s+m[aá]s\s+sobre\s+nosotros\s*:',re.I)
MONEY=re.compile(r'(U\s*\$\s*S|US\$|USD|\$)\s*([0-9][0-9.,]*)',re.I)
def number(value):
 try:return int(re.sub(r'[^0-9]','',str(value)))
 except:return None
def currency_amount(match):
 if not match:return None,None
 return ('USD' if 'u' in match.group(1).lower() else 'ARS'),number(match.group(2))
def read_url(url):
 req=urllib.request.Request(url,headers=HEADERS)
 with urllib.request.urlopen(req,timeout=22) as res:
  if res.status!=200:raise ValueError(f'HTTP {res.status}')
  return res.read(5000000).decode('utf-8','replace'),res.url
def parse_jsonld(soup):
 for x in soup.find_all('script',type='application/ld+json'):
  try:
   obj=json.loads(x.string or x.get_text())
   for v in obj if isinstance(obj,list) else [obj]:
    if isinstance(v,dict) and v.get('@type') in ('Vehicle','Car','Product') and v.get('productID'):
     return v
  except Exception:pass
 return None
def pictures(html):
 matches=list(re.finditer(r'"pictures":\[',html))
 for m in matches:
  try:
   arr,idx=json.JSONDecoder().raw_decode(html[m.end()-1:])
   if isinstance(arr,list) and arr and isinstance(arr[0],dict) and arr[0].get('id'):
    result=[]
    for n,x in enumerate(arr[:30]):
     raw_id=x.get('id','')
     if not re.fullmatch(r'[0-9]{4,8}-MLA[0-9]+_[0-9]{6}',raw_id):continue
     url=f'https://http2.mlstatic.com/D_NQ_NP_{raw_id}-F.webp'
     result.append({'url':url,'sort_order':n,'alt_text':x.get('alt'),'width':x.get('width'),'height':x.get('height')})
    if result:return result
  except Exception:continue
 return []
def attr_rows(soup):
 attrs={}
 # Los pares de las tablas provienen de la ficha del vehículo, no de comparaciones de otros vendedores.
 for row in soup.select('table tr'):
  cells=[x.get_text(' ',strip=True) for x in row.find_all(['th','td'],recursive=False)]
  if len(cells)==2 and cells[0] and cells[1] and len(cells[0])<90:
   attrs.setdefault(cells[0],cells[1])
 return attrs
def find_year_km(soup,attrs,src_html):
 year=number(attrs.get('Año'))
 km=number(attrs.get('Kilómetros'))
 text=soup.get_text(' ',strip=True)
 if not year or km is None:
  m=re.search(r'\b((?:19|20)\d{2})\s*\|\s*([\d.,]+)\s*km',text,re.I)
  if m:year=year or number(m.group(1));km=km if km is not None else number(m.group(2))
 return year,km
def parse(url):
 raw,final=read_url(url)
 soup=BeautifulSoup(raw,'lxml')
 page_title=soup.title.get_text(' ',strip=True) if soup.title else ''
 if 'suspicious-traffic' in raw or 'account-verification' in final:
  raise ValueError('La publicación requiere verificación de Mercado Libre')
 obj=parse_jsonld(soup)
 if obj is None:raise ValueError('Faltan los datos estructurados de la publicación')
 item_id=obj.get('productID') or obj.get('sku')
 if not re.fullmatch(r'MLA\d{9,12}',str(item_id)):raise ValueError('Identificador inválido')
 if item_id not in url.replace('-',''):raise ValueError('La publicación respondió con otro ID')
 seller_markers=[r'"seller_id"\s*:\s*117436611\b',r'"sellerId"\s*:\s*117436611\b']
 seller_ok=any(re.search(p,raw) for p in seller_markers)
 if not seller_ok or 'Agenciaflama' not in raw:raise ValueError('El aviso no pertenece al vendedor verificado')
 status_match=re.search(r'"item_status"\s*:\s*"([a-z_]+)"',raw)
 status=status_match.group(1) if status_match else 'unknown'
 offer=obj.get('offers') if isinstance(obj.get('offers'),dict) else {}
 original_price=offer.get('price')
 currency=offer.get('priceCurrency')
 if isinstance(original_price,(int,float,str)):
  try:price=int(float(original_price))
  except:price=None
 else:price=None
 if currency not in ('ARS','USD'):currency=None
 name=obj.get('name') or soup.find('h1').get_text(' ',strip=True)
 attrs=attr_rows(soup)
 year,km=find_year_km(soup,attrs,raw)
 brand=obj.get('brand')
 if isinstance(brand,dict):brand=brand.get('name')
 brand=brand or attrs.get('Marca')
 model=attrs.get('Modelo')
 version=attrs.get('Versión')
 if not model:
  # Se intentará solo si el nombre comienza con la marca verificable.
  bits=str(name).split()
  brand_str=str(brand or '').split()
  if bits[:len(brand_str)]==brand_str and len(bits)>len(brand_str):
   model=bits[len(brand_str)]
 if not brand or not model:raise ValueError('Marca o modelo sin identificación confiable')
 full_text=soup.get_text(' ',strip=True)
 m=re.search(r'Anticipo de\s*(US\$|U\$S|USD|\$)\s*([0-9.,]+)',full_text,re.I)
 down_currency,down_payment=currency_amount(m)
 if down_currency!=currency:down_payment=None
 meta_desc=soup.find('meta',attrs={'name':'twitter:description'})
 source_description=(meta_desc.get('content') if meta_desc else '') or ''
 if not source_description:
  # Solo descripción verificable; no usar eslóganes sugeridos.
  node=soup.find(string=re.compile('Precio de lista|Precio contado',re.I))
  source_description=node.strip() if node else ''
 description_snippet=COMPANY_MARKER.split(source_description,maxsplit=1)[0].strip()
 if not description_snippet:
  description_snippet=source_description[:2000]
 def explicit(label):
  m=re.search(r'\b'+label+r'\s*[:=]?\s*(U\s*\$\s*S|US\$|USD|\$)\s*([0-9][0-9.,]*)',description_snippet,re.I)
  return currency_amount(m)
 list_currency,list_price=explicit(r'precio\s+(?:de\s+|del\s+)?lista')
 cash_currency,cash_explicit=explicit(r'precio\s+(?:de\s+)?contado')
 if list_currency!=currency:list_price=None
 if cash_explicit is not None and cash_currency==currency and price is not None and cash_explicit!=price:
  raise ValueError(f'Conflicto de precio publicado: {price} vs contado {cash_explicit}')
 perm_currency,perm_price=explicit(r'precio\s+(?:de\s+)?permuta')
 if perm_currency!=currency:perm_price=None
 description_snippet=re.sub(r'(?i)precio\s+(?:de\s+|del\s+)?(?:lista|contado|permuta)\s*[:=]?\s*(?:U\s*\$\s*S|US\$|USD|\$)\s*[0-9][0-9.,]*','',description_snippet).strip()
 description_snippet=' '.join(description_snippet.split())
 # No incluir eslóganes genéricos ni supuestas garantías externas sin comprobación.
 description_snippet=re.split(r'(?i)aceptamos\s+permutas|tenemos\s+financiaci[oó]n',description_snippet,maxsplit=1)[0].strip()
 # El dato "año" puede contradecir texto libre. Se revisará fuera del scraper.
 year_mentions=re.findall(r'\b(?:19\d{2}|20[012]\d)\b',description_snippet)
 note_conflict=bool(year and year_mentions and all(int(y)!=year for y in year_mentions))
 photo_list=pictures(raw)
 if not photo_list and obj.get('image'):
  photo_list=[{'url':obj['image'],'sort_order':0,'alt_text':str(name),'width':None,'height':None}]
 if not photo_list:raise ValueError('No se pudieron extraer imágenes del aviso')
 condition='new' if 'NewCondition' in str(obj.get('itemCondition','')) else 'used'
 body_type=str(obj.get('bodyType') or attrs.get('Tipo de carrocería') or '')
 body=unicodedata.normalize('NFD',body_type).encode('ascii','ignore').decode().lower()
 if any(x in body for x in ['pick-up','pick up','camioneta','pickup']):category='pickup'
 elif any(x in body for x in ['suv','todoterreno']):category='suv'
 elif any(x in body for x in ['hatchback','coupe','monovolumen']):category='hatchback'
 elif any(x in body for x in ['sedan','sedán']):category='sedan'
 elif any(x in body for x in ['furgon','furgón','utilitario','van']):category='utility'
 elif any(x in body for x in ['moto']):category='motorcycle'
 else:category='other'
 return {
  'source_id':item_id,'source_url':final.split('#')[0].split('?')[0],
  'source_seller_id':SELLER_ID,'source_status':status,'name':name,'brand':brand,'model':model,
  'version':version,'model_year':year,'mileage_km':km,'category':category,'condition':condition,
  'fuel':attrs.get('Tipo de combustible') or obj.get('fuelType'),
  'transmission':attrs.get('Transmisión') or obj.get('vehicleTransmission'),
  'currency':currency,'cash_price':price,'down_payment':down_payment,'list_price':list_price,
  'trade_in_price':perm_price,'description_source':description_snippet[:3800],
  'attrs':attrs,'photos':photo_list,'year_conflict':note_conflict,
  'captured_at':datetime.now(timezone.utc).isoformat(),
  'price_valid_until':offer.get('priceValidUntil'),
 }
def main():
 data=json.loads(SOURCES.read_text())
 results=[];errors=[];total=len(data['urls'])
 for i,url in enumerate(data['urls'],1):
  try:
   item=parse(url)
   results.append(item)
   print(f"OK {i}/{total} {item['source_id']} {item['name'][:45]} | {item['model_year']} | {item['mileage_km']}km | {item['currency']} {item['cash_price']} | adelanto={item['down_payment']} lista={item['list_price']} | fotos={len(item['photos'])} | {item['source_status']} | conflicto={item['year_conflict']}",flush=True)
  except Exception as exc:
   errors.append({'source_url':url,'error':str(exc)[:250]})
   print(f'ERR {i}/{total} {url} {str(exc)[:200]}',flush=True)
  if i<total:time.sleep(.5)
 seen=set();uniq=[]
 for item in results:
  if item['source_id'] in seen:continue
  seen.add(item['source_id']);uniq.append(item)
 OUTPUT.write_text(json.dumps({'seller_id':SELLER_ID,'captured_at':datetime.now(timezone.utc).isoformat(),'listings':uniq},ensure_ascii=False,indent=2)+'\n')
 ERRORS.write_text(json.dumps({'errors':errors},ensure_ascii=False,indent=2)+'\n')
 print('SUMMARY',json.dumps({'total':total,'verified':len(uniq),'errors':len(errors),'photographs':sum(len(i['photos']) for i in uniq),'active':sum(i['source_status']=='active' for i in uniq),'conflicts':sum(i['year_conflict'] for i in uniq)},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
