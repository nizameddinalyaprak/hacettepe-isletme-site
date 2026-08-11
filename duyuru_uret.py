#!/usr/bin/env python3
"""
duyuru_uret.py — JSON'dan tutarli duyuru HTML'i uretir.

NEDEN VAR?
----------
50 duyuru dosyasi tarandiginda 48'inin ayni iskeletin kopyasi oldugu,
farklarin ise bilincli tasarim karari degil kopyala-yapistir sapmasi oldugu
gorulду: 15 farkli baslik gradienti, 11 farkli kirmizi tonu, 12 farkli buton
stili, 8 farkli tablo basligi. Duyuru basina ~6.500 karakterin %75-80'i
tekrar eden inline stildi.

Bu script o tekrari ortadan kaldirir: sen sadece icerigi yaziyorsun,
gorunum duyuru.css'ten geliyor.

KULLANIM
--------
    python3 duyuru_uret.py duyurular/man208-final.json
    python3 duyuru_uret.py duyurular/man208-final.json -o ../Duyurular/man208.html
    python3 duyuru_uret.py duyurular/*.json          # toplu uretim

Uretilen HTML dogrudan HU-IYS'in "HTML" alanina yapistirilabilir.

JSON ALANLARI
-------------
  kategori   sinav | ders | onemli | basvuru | etkinlik | mezuniyet | genel
  etiket     rozet metni (yazilmazsa kategoriden turer)
  baslik     zorunlu
  ozet       baslik altindaki tek satir aciklama
  ikon       Font Awesome sinifi (yazilmazsa kategoriden turer)
  meta       [{etiket, deger, ikon}]           -> Tarih / Saat / Yer kutusu
  govde      [blok, blok, ...]                 -> asagiya bak
  imza       varsayilan "İşletme Bölüm Başkanlığı"
  alt_bant   kartin altindaki kucuk not
  loader     true (varsayilan) -> CMS enjeksiyon kodunu ekler

GOVDE BLOKLARI
--------------
  {"tip":"metin",  "icerik":"<p>...</p>" veya duz metin}
  {"tip":"baslik", "icerik":"Bolum Basligi", "ikon":"fa-list"}
  {"tip":"uyari",  "seviye":"bilgi|uyari|onemli|basari", "baslik":"...", "icerik":"..."}
  {"tip":"liste",  "ogeler":["...","..."], "sirali":false}
  {"tip":"tablo",  "basliklar":[...], "satirlar":[[...],[...]], "ortala":true}
  {"tip":"butonlar","ogeler":[{"metin":"...","url":"...","tip":"birincil|ikincil","ikon":"fa-download"}]}
"""

import argparse
import glob
import html
import json
import os
import sys

CSS_URL = "https://nizameddinalyaprak.github.io/hacettepe-isletme-site/duyuru.css"
LOADER_URL = "https://nizameddinalyaprak.github.io/hacettepe-isletme-site/loader.js"
SURUM = "2026-08-11"  # duyuru.css ile ayni surum etiketi

KATEGORILER = {
    "sinav":     ("Sınav Duyurusu",    "fa-file-signature"),
    "ders":      ("Ders Duyurusu",     "fa-chalkboard-teacher"),
    "onemli":    ("Önemli Duyuru",     "fa-exclamation-circle"),
    "basvuru":   ("Başvuru Duyurusu",  "fa-file-alt"),
    "etkinlik":  ("Etkinlik",          "fa-calendar-star"),
    "mezuniyet": ("Mezuniyet",         "fa-graduation-cap"),
    "genel":     ("Duyuru",            "fa-bullhorn"),
}

UYARI_IKON = {
    "bilgi":  "fa-info-circle",
    "uyari":  "fa-exclamation-triangle",
    "onemli": "fa-exclamation-circle",
    "basari": "fa-check-circle",
}


def kacis(s):
    """Duz metni HTML'e guvenli sekilde gomer."""
    return html.escape(str(s), quote=False)


def zengin(s):
    """Icerik alanlari HTML tasiyabilir; oldugu gibi birakilir.

    Kullanici kendi <strong>, <a> etiketlerini yazabilsin diye kacis
    uygulanmaz. Duz metin verilirse ve <> icermiyorsa <p> ile sarilir.
    """
    s = str(s).strip()
    if not s:
        return ""
    if "<" not in s:
        return "<p>" + kacis(s) + "</p>"
    return s


def blok_metin(b):
    return zengin(b.get("icerik", ""))


def blok_baslik(b):
    ikon = b.get("ikon")
    ik = f'<i class="fas {kacis(ikon)}"></i>' if ikon else ""
    return f'<h3 class="hd-bolum-basligi">{ik}{kacis(b.get("icerik", ""))}</h3>'


def blok_uyari(b):
    seviye = b.get("seviye", "bilgi")
    if seviye not in UYARI_IKON:
        seviye = "bilgi"
    ikon = b.get("ikon", UYARI_IKON[seviye])
    baslik = b.get("baslik", "")
    bas = f"<strong>{kacis(baslik)}</strong>" if baslik else ""
    govde = b.get("icerik", "")
    govde = kacis(govde) if "<" not in str(govde) else govde
    return (f'<div class="hd-uyari hd-uyari--{seviye}">'
            f'<i class="fas {kacis(ikon)}"></i>'
            f"<div>{bas}{govde}</div></div>")


def blok_liste(b):
    etiket = "ol" if b.get("sirali") else "ul"
    sinif = "hd-adimlar" if b.get("adim") else "hd-liste"
    ogeler = "".join(
        "<li>" + (o if "<" in str(o) else kacis(o)) + "</li>"
        for o in b.get("ogeler", [])
    )
    return f'<{etiket} class="{sinif}">{ogeler}</{etiket}>'


def blok_tablo(b):
    basliklar = b.get("basliklar", [])
    satirlar = b.get("satirlar", [])
    sinif = "hd-tablo hd-tablo--ortala" if b.get("ortala") else "hd-tablo"

    thead = ""
    if basliklar:
        thead = "<thead><tr>" + "".join(f"<th>{kacis(h)}</th>" for h in basliklar) + "</tr></thead>"

    govde_satir = []
    for satir in satirlar:
        # Ara satirlari (ornegin "Öğle Arası") vurgula
        ozel = ' class="hd-ara-satir"' if isinstance(satir, dict) else ""
        hucreler = satir.get("hucreler", []) if isinstance(satir, dict) else satir
        govde_satir.append(
            f"<tr{ozel}>" + "".join(f"<td>{kacis(c)}</td>" for c in hucreler) + "</tr>"
        )
    tbody = "<tbody>" + "".join(govde_satir) + "</tbody>"

    return f'<div class="hd-tablo-kaydir"><table class="{sinif}">{thead}{tbody}</table></div>'


def blok_butonlar(b):
    parcalar = []
    for o in b.get("ogeler", []):
        tip = o.get("tip", "birincil")
        if tip not in ("birincil", "ikincil"):
            tip = "birincil"
        ikon = o.get("ikon")
        ik = f'<i class="fas {kacis(ikon)}"></i>' if ikon else ""
        parcalar.append(
            f'<a class="hd-buton hd-buton--{tip}" href="{kacis(o.get("url", "#"))}" '
            f'target="_blank" rel="noopener">{ik}{kacis(o.get("metin", "Bağlantı"))}</a>'
        )
    return '<div class="hd-butonlar">' + "".join(parcalar) + "</div>"


BLOK_URETICILERI = {
    "metin": blok_metin,
    "baslik": blok_baslik,
    "uyari": blok_uyari,
    "liste": blok_liste,
    "tablo": blok_tablo,
    "butonlar": blok_butonlar,
}


def meta_kutusu(ogeler):
    if not ogeler:
        return ""
    parcalar = []
    for o in ogeler:
        ikon = o.get("ikon", "fa-info")
        parcalar.append(
            '<div class="hd-meta-oge">'
            f'<div class="hd-meta-ikon"><i class="fas {kacis(ikon)}"></i></div>'
            "<div>"
            f'<span class="hd-meta-etiket">{kacis(o.get("etiket", ""))}</span>'
            f'<span class="hd-meta-deger">{kacis(o.get("deger", ""))}</span>'
            "</div></div>"
        )
    return '<div class="hd-meta">' + "".join(parcalar) + "</div>"


def uret(veri):
    kategori = veri.get("kategori", "genel")
    if kategori not in KATEGORILER:
        print(f"  ! bilinmeyen kategori '{kategori}', 'genel' kullanildi", file=sys.stderr)
        kategori = "genel"
    varsayilan_etiket, varsayilan_ikon = KATEGORILER[kategori]

    etiket = veri.get("etiket", varsayilan_etiket)
    ikon = veri.get("ikon", varsayilan_ikon)
    baslik = veri.get("baslik", "")
    if not baslik:
        raise ValueError("'baslik' alani zorunlu")
    ozet = veri.get("ozet", "")
    imza = veri.get("imza", "İşletme Bölüm Başkanlığı")

    govde_parcalari = []
    govde_parcalari.append(meta_kutusu(veri.get("meta", [])))
    for b in veri.get("govde", []):
        tip = b.get("tip", "metin")
        uretici = BLOK_URETICILERI.get(tip)
        if not uretici:
            print(f"  ! bilinmeyen blok tipi '{tip}', atlandi", file=sys.stderr)
            continue
        govde_parcalari.append(uretici(b))

    if imza:
        govde_parcalari.append(f'<div class="hd-imza">{kacis(imza)}</div>')

    alt_bant = ""
    if veri.get("alt_bant"):
        alt_bant = f'<div class="hd-alt-bant">{zengin(veri["alt_bant"])}</div>'

    loader = ""
    if veri.get("loader", True):
        loader = (
            '<img src="x" alt="" style="display:none"\n'
            '     onerror="var s=document.createElement(\'script\');'
            f"s.src='{LOADER_URL}';"
            'document.body.appendChild(s);">\n'
        )

    ozet_html = f'<p class="hd-ozet">{kacis(ozet)}</p>' if ozet else ""

    return f"""{loader}<link rel="stylesheet" href="{CSS_URL}?v={SURUM}">

<div class="hd hd--{kategori}">
  <div class="hd-kart">
    <div class="hd-baslik">
      <div class="hd-baslik-sol">
        <span class="hd-etiket">{kacis(etiket)}</span>
        <h2 class="hd-h2">{kacis(baslik)}</h2>
        {ozet_html}
      </div>
      <i class="fas {kacis(ikon)} hd-baslik-ikon"></i>
    </div>
    <div class="hd-govde">
{chr(10).join("      " + p for p in govde_parcalari if p)}
    </div>
    {alt_bant}
  </div>
</div>
"""


def main():
    ap = argparse.ArgumentParser(description="JSON'dan duyuru HTML'i uretir.")
    ap.add_argument("girdi", nargs="+", help="JSON dosyasi/dosyalari")
    ap.add_argument("-o", "--cikti", help="Cikti dosyasi (tek girdi icin)")
    args = ap.parse_args()

    dosyalar = []
    for g in args.girdi:
        dosyalar.extend(glob.glob(g) or [g])

    if args.cikti and len(dosyalar) > 1:
        ap.error("-o sadece tek girdi dosyasiyla kullanilabilir")

    for yol in dosyalar:
        try:
            with open(yol, encoding="utf-8") as f:
                veri = json.load(f)
        except FileNotFoundError:
            print(f"HATA: bulunamadi -> {yol}", file=sys.stderr)
            continue
        except json.JSONDecodeError as e:
            print(f"HATA: {yol} gecerli JSON degil -> {e}", file=sys.stderr)
            continue

        try:
            cikti_html = uret(veri)
        except ValueError as e:
            print(f"HATA: {yol} -> {e}", file=sys.stderr)
            continue

        hedef = args.cikti or os.path.splitext(yol)[0] + ".html"
        with open(hedef, "w", encoding="utf-8") as f:
            f.write(cikti_html)
        print(f"{yol}  ->  {hedef}  ({len(cikti_html)} karakter)")


if __name__ == "__main__":
    main()
