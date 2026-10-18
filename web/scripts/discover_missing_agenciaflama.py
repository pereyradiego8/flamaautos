#!/usr/bin/env python3
"""Recuperación acotada de publicaciones públicas, SIEMPRE verificando vendedor por ficha."""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
import importlib.util
import json
import re
import urllib.request
import urllib.error
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
IMPORTS = ROOT / "imports"
SELLER_ID = 117436611
ID_RE = re.compile(r"/MLA-([0-9]{9,12})-", re.I)
REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "es-AR,es;q=0.9",
}
SEARCH_PAGES = [
    "https://listado.mercadolibre.com.ar/autos-flama-en-berazategui",
    "https://listado.mercadolibre.com.ar/autos-flama-en-berazategui_Desde_49",
    "https://listado.mercadolibre.com.ar/autos-flama-en-berazategui_Desde_97",
    "https://listado.mercadolibre.com.ar/pagina/agenciaflama/",
    "https://autos.mercadolibre.com.ar/_SellerId_117436611",
]
EXTRA_CANDIDATES = [
    "https://auto.mercadolibre.com.ar/MLA-3917054036-dodge-journey-24-sxt-170cv-techo-dvd-nav-_JM",
    "https://auto.mercadolibre.com.ar/MLA-1734685255-fiat-500l-14-16v-_JM",
]

spec = importlib.util.spec_from_file_location("collector", ROOT / "scripts/collect_mercadolibre.py")
collector = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(collector)

def get_json(name):
    return json.loads((IMPORTS / name).read_text(encoding="utf-8"))

def normalized_item_url(candidate):
    try:
        raw = candidate.replace("\\u002F", "/").replace("\\/", "/").replace("&amp;", "&")
        parts = urlsplit(raw)
        if parts.scheme != "https" or parts.netloc != "auto.mercadolibre.com.ar":
            return None
        match = ID_RE.search(parts.path)
        if not match:
            return None
        return "MLA" + match.group(1), urlunsplit(("https", parts.netloc, parts.path, "", ""))
    except ValueError:
        return None

def scrape_list(url):
    request = urllib.request.Request(url, headers=REQUEST_HEADERS)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            raw=response.read(5_000_000).decode("utf8","replace")
            final=response.url
        if "account-verification" in final or "suspicious-traffic" in raw:
            return [], "bloqueo de verificación de Mercado Libre (sin intentar eludirlo)"
        soup=BeautifulSoup(raw,"lxml")
        candidates=[]
        for tag in soup.find_all("a",href=True):
            item=normalized_item_url(tag["href"])
            if item:candidates.append(item)
        # Buscar URLs de fichas en el estado público de la página (pueden estar escapadas).
        for match in re.findall(r"https?:(?:\\u002F|\\/|/){2}auto[.]mercadolibre[.]com[.]ar[^\"'<>\s]{10,300}",raw):
            item=normalized_item_url(match)
            if item:candidates.append(item)
        return candidates, f"HTTP 200, {len(candidates)} enlaces, {len(raw)} bytes"
    except Exception as ex:
        return [],type(ex).__name__+": "+str(ex)[:110]

old = get_json("agenciaflama-extracted.json")["listings"]
old += get_json("agenciaflama-additional-extracted.json")["listings"]
loaded = {x["source_id"] for x in old}

candidate_by_id={}
for src in ["agenciaflama-sources.json","agenciaflama-additional-sources.json"]:
    for url in get_json(src)["urls"]:
        item=normalized_item_url(url)
        if item:candidate_by_id.setdefault(*item)
for url in EXTRA_CANDIDATES:
    item=normalized_item_url(url)
    if item:candidate_by_id.setdefault(*item)
for url in SEARCH_PAGES:
    links,info=scrape_list(url)
    print("DISCOVERY",url,"->",info,flush=True)
    for item in links:
        candidate_by_id.setdefault(*item)

pending=[(id,url) for id,url in candidate_by_id.items() if id not in loaded]
print("CANDIDATES",json.dumps({"total":len(candidate_by_id),"already_loaded":len(loaded),"new_to_verify":len(pending)},ensure_ascii=False),flush=True)

def check(candidate):
    id,url=candidate
    try:
        result=collector.parse(url)
        if result.get("source_seller_id")!=SELLER_ID or result["source_id"]!=id:
            raise ValueError("vendedor o ID incorrecto")
        if result.get("source_status")!="active":
            raise ValueError("publicación no activa")
        if not result.get("photos"):
            raise ValueError("sin fotografías verificables")
        return "verified", result
    except Exception as err:
        return "rejected", {"source_id":id,"source_url":url,"reason":str(err)[:250]}

verified=[];rejected=[]
with ThreadPoolExecutor(max_workers=3) as pool:
    futures=[pool.submit(check, x) for x in pending]
    for future in as_completed(futures):
        state,item=future.result()
        if state=="verified":
            verified.append(item)
            print("VERIFIED",item["source_id"],item["name"][:65],item["model_year"],item["currency"],item["cash_price"],len(item["photos"]),flush=True)
        else:
            rejected.append(item)
            print("REJECTED",item["source_id"],item["reason"],flush=True)

verified.sort(key=lambda v:v["source_id"])
now=datetime.now(timezone.utc).isoformat()
(IMPORTS/"agenciaflama-missing-extracted.json").write_text(json.dumps({
    "seller_id":SELLER_ID,"captured_at":now,"listings":verified
},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
(IMPORTS/"agenciaflama-missing-discovery.json").write_text(json.dumps({
    "seller_id":SELLER_ID,"captured_at":now,"candidate_count":len(candidate_by_id),
    "already_loaded":len(loaded),"checked":len(pending),
    "verified_count":len(verified),"rejected":rejected
},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("SUMMARY",json.dumps({"candidates":len(candidate_by_id),"already_loaded":len(loaded),"new_verified":len(verified),"errors":len(rejected),"photos":sum(len(x["photos"]) for x in verified)},ensure_ascii=False),flush=True)
