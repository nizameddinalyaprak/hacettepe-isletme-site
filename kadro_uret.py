#!/usr/bin/env python3
"""
kadro_uret.py — kadro.json'dan kadro sayfalarını üretir (tr + en, 8 dosya):

    academic_staff.html        öğretim üyeleri      (arama + anabilim dalı filtresi)
    research_assistants.html   araştırma görevlileri (arama + filtre)
    management.html            yönetim               (akademik kadrodan beslenir)
    administrative_staff.html  idari personel        (fotoğrafsız, avatar ikonu)

NEDEN VAR?
----------
Kadro sayfaları elle düzenleniyordu: bir hoca eklendiğinde/çıktığında ya da
oda numarası değiştiğinde sekiz ayrı HTML dosyasında aynı düzeltmeyi yapmak
gerekiyordu. Türkçe ve İngilizce sayfaların birbirinden ayrışması da bu yüzden
oldu (İngilizce sayfada Türkçede olmayan bir kayıt kalmış).

Artık tek kaynak kadro.json. Bir kişiyi güncelle, scripti çalıştır.

KULLANIM
--------
    python3 kadro_uret.py            # sekiz sayfayı da üretir
    python3 kadro_uret.py --kontrol  # üretmeden veriyi denetler

FOTOĞRAFLAR
-----------
Hacettepe Araştırma Portalı'ndan (research.hacettepe.edu.tr) sunuluyor.
Portal CDN'i boyutlandırmayı kendi yapıyor:
    <adres>.jpeg?w=400&f=webp
Bu sayede fotoğrafları depoda tutmuyoruz; hoca portaldeki fotoğrafını
güncellediğinde site de kendiliğinden güncelleniyor.
Eski fs.hacettepe.edu.tr adresleri HTML yorumu olarak korunuyor.
"""

import argparse
import html
import json
import os
import sys

FOTO_BOYUT = "?w=400&f=webp"   # 400px yeterli; kart 96-128px, retina için 2x+

METIN = {
    "tr": {
        "lang": "tr",
        "uye_baslik": "Öğretim Üyeleri",
        "asis_baslik": "Araştırma Görevlileri",
        "yon_baslik": "Yönetim",
        "idari_baslik": "İdari Personel",
        "ara": "Ada, anabilim dalına veya odaya göre ara",
        "tumu": "Tümü",
        "oda": "Oda",
        "profil": "Araştırma profili",
        "eposta": "E-posta",
        "sonuc_yok": "Aramanızla eşleşen kayıt bulunamadı.",
        "kisi": "kişi",
    },
    "en": {
        "lang": "en",
        "uye_baslik": "Academic Staff",
        "asis_baslik": "Research Assistants",
        "yon_baslik": "Administration",
        "idari_baslik": "Administrative Staff",
        "ara": "Search by name, division or office",
        "tumu": "All",
        "oda": "Office",
        "profil": "Research profile",
        "eposta": "E-mail",
        "sonuc_yok": "No records match your search.",
        "kisi": "people",
    },
}


# ============================================================================
# SIRALAMA
# ----------------------------------------------------------------------------
# Sayfada "neden bu sırada?" diye sorulduğunda verilecek cevap burada tanımlı.
# Önceki sürümde sıra, eski HTML dosyalarındaki diziliş neyse oydu; anabilim
# dallarının sırası da tesadüfen "alfabetik olarak ilk hocası kim" sorusuna
# bağlıydı. Artık iki kural açıkça yazılı:
#
#   1) Anabilim dalları  : Türkçe alfabede TERS sırada (Z-A). Bölüm tercihi.
#   2) Kişiler           : önce akademik unvan (aşağıdaki UNVAN_KURALLARI),
#                          aynı unvanda soyadın SON kelimesine göre A-Z.
#
# Dikkat: yalnızca dal başlıkları Z-A. Dal içindeki kişiler normal A-Z sırada.
#
# Çift soyadlılar son kelimeye göre sıralanır: ÖZYİĞİT GÜLTEKİN "G"de,
# ÖZKAN TEKTAŞ "T"de yer alır. Bu, resmî kadro listelerindeki yerleşik
# kullanımla uyumludur.
# ============================================================================

# Türk alfabesi — Python'un varsayılan sıralaması Ç/Ğ/İ/Ö/Ş/Ü'yü yanlış yerleştirir.
TR_ALFABE = "aâbcçdefgğhıiîjklmnoöpqrsştuüûvwxyz"
TR_SIRA = {h: i for i, h in enumerate(TR_ALFABE)}

# Sıra ÖNEMLİ: en özgül işaret en üstte olmalı.
# "Assoc. Prof. Dr." içinde "prof" da geçer; "Res. Asst." içinde "asst" da geçer.
# Bu yüzden önce "assoc" ve "res"e bakıyoruz, sonra "prof" ve "asst"a.
UNVAN_KURALLARI = [
    # Doktoralı araştırma görevlileri, aynı ailedeki diğerlerinden önce gelir.
    (("dr. arş", "dr. ars", "dr. res"), 3.8),
    (("arş.", "ars.", "res. asst", "res.asst", "araştırma görevlisi"), 4.0),
    (("öğr. gör", "ogr. gor", "lecturer"), 3.0),
    (("dr. öğr", "dr. ogr", "asst. prof", "assist"), 2.0),
    (("doç", "doc.", "assoc"), 1.0),
    (("prof",), 0.0),
]
UNVANSIZ_DR = 3.5   # sade "Dr." — Öğr. Gör. ile Arş. Gör. arasında


def tr_anahtar(s):
    """Türkçe alfabeye göre sıralama anahtarı."""
    s = (s or "").casefold()
    return [TR_SIRA.get(ch, 99) for ch in s]


def unvan_puani(ad):
    d = (ad or "").casefold()
    for isaretler, puan in UNVAN_KURALLARI:
        if any(i in d for i in isaretler):
            return puan
    if d.startswith("dr.") or d.startswith("dr "):
        return UNVANSIZ_DR
    return 9.0


# Ünvanı oluşturan kelimeler. "Üyesi" nokta ile bitmediği için ayrıca gerekli;
# aksi halde "Dr. Öğr. Üyesi Gizem ARI YILMAZ" adı "Üyesi Gizem..." diye başlar.
UNVAN_KELIMELERI = {
    "prof", "prof.", "doç", "doç.", "doc", "doc.", "dr", "dr.",
    "öğr", "öğr.", "ogr", "ogr.", "gör", "gör.", "gor", "gor.",
    "üyesi", "uyesi", "arş", "arş.", "ars", "ars.",
    "assoc", "assoc.", "asst", "asst.", "assist", "assist.",
    "res", "res.", "lecturer", "prof.dr.",
}


def unvan_ayir(ad):
    """'Dr. Öğr. Üyesi Gizem ARI YILMAZ' -> ('Dr. Öğr. Üyesi', 'Gizem ARI YILMAZ')"""
    parcalar = (ad or "").split()
    kesme = 0
    for i, x in enumerate(parcalar):
        if x.casefold() in UNVAN_KELIMELERI:
            kesme = i + 1
        else:
            break
    if kesme >= len(parcalar):      # tamamı ünvan gibi göründüyse dokunma
        return "", ad
    return " ".join(parcalar[:kesme]), " ".join(parcalar[kesme:])


def soyad_son_kelime(ad):
    """Ünvanı atıp adın son kelimesini döndürür (soyadın son parçası)."""
    parcalar = [p for p in (ad or "").split() if p]
    # Ünvan kısaltmalarını at
    while parcalar and (parcalar[0].endswith(".") or
                        parcalar[0].casefold() in
                        ("üyesi", "uyesi", "gör", "gor", "prof", "dr", "assoc",
                         "asst", "res", "lecturer", "arş", "ars")):
        parcalar.pop(0)
    return parcalar[-1] if parcalar else (ad or "")


def kisi_sira_anahtari(p, dil):
    ad = p[dil]["ad"] or p["tr"]["ad"]
    return (unvan_puani(ad), tr_anahtar(soyad_son_kelime(ad)))


def k(s):
    return html.escape(str(s or ""), quote=True)


def bas_harfler(ad):
    """Fotoğrafı olmayanlar için baş harf rozeti."""
    parcalar = [p for p in ad.split() if not p.endswith(".") and len(p) > 1]
    if not parcalar:
        return "?"
    if len(parcalar) == 1:
        return parcalar[0][0].upper()
    return (parcalar[0][0] + parcalar[-1][0]).upper()


def stil():
    return """
    :root {
      --k-kirmizi:#ac232d; --k-kirmizi-koyu:#7e161d;
      --k-lacivert:#0f172a; --k-metin:#1e293b; --k-soluk:#64748b;
      --k-kenar:#e2e8f0; --k-zemin:#f8fafc;
    }
    .kadro { font-family:'Open Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      color:var(--k-metin); max-width:1080px; margin:0 auto; padding:0 clamp(14px,3vw,24px) 60px; }

    /* Sitenin yerleşik hero'su — kırmızı gradyan + elips kesim.
       Diğer sayfalarla uyumlu kalsın diye korunuyor. */
    .kadro-hero { background:linear-gradient(135deg,#ac232d 0%,#7e161d 100%); color:#fff;
      padding:clamp(52px,8vw,80px) 20px clamp(66px,10vw,100px); text-align:center;
      clip-path:ellipse(150% 100% at 50% 0%);
      margin:0 calc(50% - 50vw) 40px; }
    .kadro-hero h1 { font-size:clamp(28px,3.4vw,3rem); font-weight:700;
      line-height:1.15; margin:0; color:#fff; }

    .kadro-arac { display:flex; flex-wrap:wrap; gap:12px; align-items:center;
      margin:0 0 26px; padding-bottom:18px; border-bottom:1px solid var(--k-kenar); }
    .kadro-arama { flex:1 1 260px; position:relative; }
    .kadro-arama input { width:100%; box-sizing:border-box; padding:11px 14px 11px 40px;
      border:1px solid var(--k-kenar); border-radius:8px; font-size:14.5px; font-family:inherit;
      color:var(--k-metin); background:#fff; transition:border-color .2s,box-shadow .2s; }
    .kadro-arama input:focus { outline:none; border-color:var(--k-kirmizi);
      box-shadow:0 0 0 3px rgba(172,35,45,.10); }
    .kadro-arama i { position:absolute; left:14px; top:50%; transform:translateY(-50%);
      color:var(--k-soluk); font-size:14px; pointer-events:none; }
    .kadro-sayac { font-size:13.5px; color:var(--k-soluk); white-space:nowrap; }

    .kadro-filtre { display:flex; flex-wrap:wrap; gap:8px; margin:0 0 30px; }
    .kadro-filtre button { font-family:inherit; font-size:13px; padding:7px 15px; min-height:36px;
      border:1px solid var(--k-kenar); background:#fff; color:var(--k-soluk);
      border-radius:20px; cursor:pointer; transition:all .2s; }
    .kadro-filtre button:hover { border-color:#cbd5e1; color:var(--k-metin); }
    .kadro-filtre button.aktif { background:var(--k-lacivert); border-color:var(--k-lacivert); color:#fff; }

    .kadro-bolum { margin:0 0 38px; }
    .kadro-bolum-baslik { display:flex; align-items:baseline; gap:12px; margin:0 0 16px; }
    .kadro-bolum-baslik h2 { font-family:Georgia,'Times New Roman',serif; font-weight:400;
      font-size:19px; color:var(--k-lacivert); margin:0; }
    .kadro-bolum-cizgi { flex:1; height:1px; background:var(--k-kenar); }
    .kadro-bolum-adet { font-size:12.5px; color:var(--k-soluk); }

    .kadro-izgara { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr)); gap:14px; }

    .kisi { display:flex; gap:16px; padding:16px; background:#fff;
      border:1px solid var(--k-kenar); border-radius:10px; transition:border-color .2s,box-shadow .2s; }
    .kisi:hover { border-color:#cbd5e1; box-shadow:0 3px 10px rgba(15,23,42,.06); }

    .kisi-foto { width:76px; height:96px; flex:0 0 76px; border-radius:8px; overflow:hidden;
      background:var(--k-zemin); }
    .kisi-foto img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
    .kisi-bas { width:100%; height:100%; display:grid; place-items:center;
      font-family:Georgia,serif; font-size:24px; color:#94a3b8; background:var(--k-zemin); }

    .kisi-govde { min-width:0; flex:1; display:flex; flex-direction:column; }
    .kisi-unvan { font-size:11.5px; letter-spacing:.7px; text-transform:uppercase;
      color:var(--k-kirmizi); margin:0 0 3px; }
    .kisi-ad { font-family:Georgia,'Times New Roman',serif; font-size:16.5px; font-weight:400;
      line-height:1.3; margin:0 0 6px; }
    .kisi-ad a { color:var(--k-lacivert); text-decoration:none; border-bottom:1px solid transparent; }
    .kisi-ad a:hover { color:var(--k-kirmizi); border-bottom-color:var(--k-kirmizi); }
    .kisi-birim { font-size:13px; color:var(--k-soluk); margin:0 0 auto; }
    .kisi-alt { display:flex; flex-wrap:wrap; gap:6px 14px; margin-top:12px;
      padding-top:10px; border-top:1px solid #f1f5f9; font-size:12.5px; }
    .kisi-alt a, .kisi-alt span { color:var(--k-soluk); text-decoration:none;
      display:inline-flex; align-items:center; gap:6px; }
    .kisi-alt a:hover { color:var(--k-kirmizi); }
    .kisi-alt i { font-size:12px; opacity:.75; }

    .kadro-bos { display:none; text-align:center; padding:50px 20px; color:var(--k-soluk); font-size:15px; }

    /* --- Yönetim kartları --- */
    .kadro-yonetim { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));
      gap:18px; margin:0 0 20px; }
    .yon-kart { background:#fff; border:1px solid var(--k-kenar); border-radius:12px;
      padding:28px 20px; text-align:center; transition:border-color .2s,box-shadow .2s; }
    .yon-kart:hover { border-color:#cbd5e1; box-shadow:0 6px 18px rgba(15,23,42,.07); }
    .yon-kart.baskan { border-color:var(--k-kirmizi); }
    .yon-foto { width:120px; height:150px; margin:0 auto 18px; border-radius:10px;
      overflow:hidden; background:var(--k-zemin); }
    .yon-foto img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block; }
    .yon-rol { display:inline-block; font-size:12px; text-transform:uppercase; letter-spacing:1px;
      color:var(--k-kirmizi); font-weight:700; background:#fef2f2; padding:4px 12px;
      border-radius:20px; margin-bottom:10px; }
    .yon-ad { font-family:Georgia,'Times New Roman',serif; font-weight:400; font-size:17px;
      line-height:1.35; margin:0 0 6px; }
    .yon-ad a { color:var(--k-lacivert); text-decoration:none; }
    .yon-ad a:hover { color:var(--k-kirmizi); }
    .yon-birim { font-size:13px; color:var(--k-soluk); margin:0; }

    /* --- İdari personel kartları --- */
    .kadro-idari { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr)); gap:18px; }
    .idari-kart { background:#fff; border:1px solid var(--k-kenar); border-radius:12px;
      padding:36px 20px; text-align:center; transition:border-color .2s,box-shadow .2s; }
    .idari-kart:hover { border-color:#cbd5e1; box-shadow:0 6px 18px rgba(15,23,42,.07); }
    .idari-avatar { width:100px; height:100px; margin:0 auto 18px; border-radius:50%;
      background:var(--k-zemin); display:grid; place-items:center; font-size:36px; color:#94a3b8; }
    .idari-rol { display:inline-block; font-size:12px; text-transform:uppercase; letter-spacing:1px;
      color:var(--k-kirmizi); font-weight:700; background:#fef2f2; padding:4px 12px;
      border-radius:20px; margin-bottom:10px; }
    .idari-ad { font-family:Georgia,'Times New Roman',serif; font-weight:400; font-size:17px;
      color:var(--k-lacivert); margin:0 0 10px; }
    .idari-iletisim { font-size:13px; color:var(--k-soluk); }
    .idari-iletisim a { color:var(--k-soluk); text-decoration:none; }
    .idari-iletisim a:hover { color:var(--k-kirmizi); }
    .idari-iletisim i { margin-right:6px; opacity:.75; }

    @media (max-width:600px) {
      .kisi { padding:14px; gap:13px; }
      .kisi-foto { width:64px; height:80px; flex-basis:64px; }
      .kadro-sayac { width:100%; }
    }
    @media print {
      .kadro-arac,.kadro-filtre { display:none; }
      .kisi { break-inside:avoid; border-color:#bbb; }
    }
    """


def kisi_html(p, dil, t):
    ad = p[dil]["ad"]
    birim = p[dil]["birim"] or p["tr"]["birim"]
    profil = p["profil_en"] if dil == "en" else p["profil_tr"]

    unvan, sade_ad = unvan_ayir(ad)

    if p.get("foto"):
        gorsel = (f'<img src="{k(p["foto"] + FOTO_BOYUT)}" alt="{k(ad)}" '
                  f'loading="lazy" width="76" height="96">')
    else:
        gorsel = f'<div class="kisi-bas" aria-hidden="true">{k(bas_harfler(sade_ad))}</div>'

    eski = ""
    if p.get("eski_foto"):
        eski = f"\n        <!-- eski fotoğraf adresi: {p['eski_foto']} -->"

    ad_html = (f'<a href="{k(profil)}" target="_blank" rel="noopener">{k(sade_ad)}</a>'
               if profil else k(sade_ad))

    alt = []
    if p.get("oda"):
        alt.append(f'<span><i class="fas fa-door-open"></i>{k(t["oda"])} {k(p["oda"])}</span>')
    if p.get("eposta"):
        alt.append(f'<a href="mailto:{k(p["eposta"])}"><i class="fas fa-envelope"></i>{k(p["eposta"])}</a>')

    arama = " ".join([ad, birim, p.get("oda", ""), p.get("eposta", "")]).lower()

    return f"""      <article class="kisi" data-birim="{k(birim)}" data-ara="{k(arama)}">
        <div class="kisi-foto">{gorsel}</div>{eski}
        <div class="kisi-govde">
          {'<p class="kisi-unvan">' + k(unvan) + '</p>' if unvan else ''}
          <h3 class="kisi-ad">{ad_html}</h3>
          <p class="kisi-birim">{k(birim)}</p>
          <div class="kisi-alt">{''.join(alt)}</div>
        </div>
      </article>"""


def sayfa_uret(kisiler, dil, tur):
    t = METIN[dil]
    baslik = t["uye_baslik"] if tur == "uye" else t["asis_baslik"]

    # --- SIRALAMA -----------------------------------------------------------
    # Anabilim dalları: Türkçe alfabeye göre.
    # Kişiler: önce akademik unvan, aynı unvanda soyadın SON kelimesine göre.
    # (Ayrıntılı gerekçe için SIRALAMA bölümüne bak.)
    gruplar = {}
    for p in sorted(kisiler, key=lambda p: kisi_sira_anahtari(p, dil)):
        b = p[dil]["birim"] or p["tr"]["birim"] or "—"
        gruplar.setdefault(b, []).append(p)
    # Dallar Z-A (ters alfabetik) — bilinçli tercih, kişiler A-Z kalıyor.
    gruplar = {b: gruplar[b] for b in sorted(gruplar, key=tr_anahtar, reverse=True)}

    filtreler = [f'<button class="aktif" data-birim="">{k(t["tumu"])}</button>']
    for b in gruplar:
        filtreler.append(f'<button data-birim="{k(b)}">{k(b)}</button>')

    bolumler = []
    for b, liste in gruplar.items():
        bolumler.append(f"""    <section class="kadro-bolum" data-bolum="{k(b)}">
      <div class="kadro-bolum-baslik">
        <h2>{k(b)}</h2><span class="kadro-bolum-cizgi"></span>
        <span class="kadro-bolum-adet">{len(liste)}</span>
      </div>
      <div class="kadro-izgara">
{chr(10).join(kisi_html(p, dil, t) for p in liste)}
      </div>
    </section>""")

    govde = f"""    <div class="kadro-arac">
      <div class="kadro-arama">
        <i class="fas fa-search" aria-hidden="true"></i>
        <input type="search" id="kadro-ara" placeholder="{k(t['ara'])}" aria-label="{k(t['ara'])}">
      </div>
      <span class="kadro-sayac"><strong id="kadro-adet">{len(kisiler)}</strong> {k(t['kisi'])}</span>
    </div>

    <nav class="kadro-filtre" aria-label="{k(t['tumu'])}">
{chr(10).join('      ' + f for f in filtreler)}
    </nav>

{chr(10).join(bolumler)}

    <p class="kadro-bos" id="kadro-bos">{k(t['sonuc_yok'])}</p>"""

    betik = """
(function () {{
  var kok = document.querySelector('.kadro');
  if (!kok) return;
  var ara = kok.querySelector('#kadro-ara');
  var adet = kok.querySelector('#kadro-adet');
  var bos = kok.querySelector('#kadro-bos');
  var kisiler = [].slice.call(kok.querySelectorAll('.kisi'));
  var bolumler = [].slice.call(kok.querySelectorAll('.kadro-bolum'));
  var dugmeler = [].slice.call(kok.querySelectorAll('.kadro-filtre button'));
  var secili = '';

  function normalize(s) {{
    return (s || '').toLocaleLowerCase('tr-TR')
      .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's')
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c');
  }}

  function tazele() {{
    var q = normalize(ara.value.trim());
    var gorunen = 0;
    kisiler.forEach(function (el) {{
      var birimTamam = !secili || el.getAttribute('data-birim') === secili;
      var aramaTamam = !q || normalize(el.getAttribute('data-ara')).indexOf(q) !== -1;
      var goster = birimTamam && aramaTamam;
      el.style.display = goster ? '' : 'none';
      if (goster) gorunen++;
    }});
    bolumler.forEach(function (b) {{
      var acik = b.querySelectorAll('.kisi:not([style*="none"])').length;
      b.style.display = acik ? '' : 'none';
      var s = b.querySelector('.kadro-bolum-adet');
      if (s) s.textContent = acik;
    }});
    adet.textContent = gorunen;
    bos.style.display = gorunen ? 'none' : 'block';
  }}

  ara.addEventListener('input', tazele);
  dugmeler.forEach(function (d) {{
    d.addEventListener('click', function () {{
      dugmeler.forEach(function (x) {{ x.classList.remove('aktif'); }});
      d.classList.add('aktif');
      secili = d.getAttribute('data-birim');
      tazele();
    }});
  }});
}})();
""".replace("{{", "{").replace("}}", "}")

    return iskelet(baslik, govde, dil, betik)


def iskelet(baslik, govde, dil, betik=""):
    """Tüm kadro sayfalarının ortak kabuğu: hero + gövde (+ betik).

    Hero'da yalnızca sayfa başlığı var. "Hacettepe Üniversitesi İktisadi ve
    İdari Bilimler Fakültesi" ve "İşletme Bölümü akademik kadrosu" gibi
    açıklamalar kaldırıldı: zaten İşletme Bölümü sitesindeyiz, "Öğretim
    Üyeleri" başlığı tek başına yeterli.
    """
    t = METIN[dil]
    betik_html = f"\n<script>{betik}</script>\n" if betik else ""
    return f"""<!DOCTYPE html>
<html lang="{t['lang']}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hacettepe İşletme - {k(baslik)}</title>
    <script src="../loader.js"></script>

    <style>{stil()}</style>
</head>

<body>

  <div class="kadro">

    <header class="kadro-hero">
      <h1>{k(baslik)}</h1>
    </header>

{govde}

  </div>
{betik_html}
</body>

</html>
"""


def yonetim_uret(yonetim, kisi_dizini, dil):
    """Yönetim sayfası — başkan ve yardımcıları, fotoğraflı kartlar."""
    t = METIN[dil]
    kartlar = []
    for y in yonetim:
        p = kisi_dizini.get(y["eposta"], {})
        ad = p.get(dil, {}).get("ad") or p.get("tr", {}).get("ad", "")
        birim = p.get(dil, {}).get("birim") or p.get("tr", {}).get("birim", "")
        profil = p.get("profil_en" if dil == "en" else "profil_tr", "")
        unvan, sade_ad = unvan_ayir(ad)
        tam = f"{unvan} {sade_ad}".strip()

        if p.get("foto"):
            gorsel = (f'<img src="{k(p["foto"] + FOTO_BOYUT)}" alt="{k(tam)}" '
                      f'loading="lazy" width="120" height="150">')
        else:
            gorsel = f'<div class="kisi-bas" aria-hidden="true">{k(bas_harfler(sade_ad))}</div>'

        eski = f"\n        <!-- eski fotoğraf adresi: {p['eski_foto']} -->" if p.get("eski_foto") else ""
        ad_html = (f'<a href="{k(profil)}" target="_blank" rel="noopener">{k(tam)}</a>'
                   if profil else k(tam))

        kartlar.append(f"""      <article class="yon-kart{' baskan' if y.get('baskan') else ''}">
        <div class="yon-foto">{gorsel}</div>{eski}
        <span class="yon-rol">{k(y['rol'][dil])}</span>
        <h3 class="yon-ad">{ad_html}</h3>
        <p class="yon-birim">{k(birim)}</p>
      </article>""")

    govde = '    <div class="kadro-yonetim">\n' + "\n".join(kartlar) + "\n    </div>"
    return iskelet(t["yon_baslik"], govde, dil)


def idari_uret(idari, dil):
    """İdari personel sayfası — fotoğraf yok, avatar ikonu kullanılır."""
    t = METIN[dil]
    kartlar = []
    for kisi in idari:
        iletisim = []
        if kisi.get("telefon"):
            tel = kisi["telefon"]
            sade = "".join(ch for ch in tel if ch.isdigit() or ch == "+")
            iletisim.append(f'<a href="tel:{k(sade)}"><i class="fas fa-phone-alt"></i>{k(tel)}</a>')
        if kisi.get("eposta"):
            iletisim.append(f'<a href="mailto:{k(kisi["eposta"])}">'
                            f'<i class="fas fa-envelope"></i>{k(kisi["eposta"])}</a>')
        iletisim_html = "<br>".join(iletisim) or "&nbsp;"

        kartlar.append(f"""      <article class="idari-kart">
        <div class="idari-avatar"><i class="fas {k(kisi.get('ikon', 'fa-user'))}"></i></div>
        <span class="idari-rol">{k(kisi['rol'][dil])}</span>
        <h3 class="idari-ad">{k(kisi['ad'])}</h3>
        <div class="idari-iletisim">{iletisim_html}</div>
      </article>""")

    govde = '    <div class="kadro-idari">\n' + "\n".join(kartlar) + "\n    </div>"
    return iskelet(t["idari_baslik"], govde, dil)


def main():
    ap = argparse.ArgumentParser(description="Kadro sayfalarını üretir.")
    ap.add_argument("--kontrol", action="store_true", help="üretmeden veriyi denetle")
    args = ap.parse_args()

    kok = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(kok, "kadro.json"), encoding="utf-8") as f:
        kadro = json.load(f)

    uyari = 0
    # Denetim yalnızca akademik kayıtlar için; yönetim ve idari personel
    # farklı biçimde (fotoğrafsız / referanslı) tutuluyor.
    for grup in ("ogretim_uyeleri", "arastirma_gorevlileri"):
        for p in kadro.get(grup, []):
            ad = p["tr"]["ad"]
            if not p.get("foto"):
                print(f"  ! fotoğrafsız: {ad}", file=sys.stderr)
                uyari += 1
            if p.get("not"):
                print(f"  ! {ad}: {p['not']}", file=sys.stderr)
                uyari += 1
            if not p.get("eposta"):
                print(f"  ! e-postasız: {ad}", file=sys.stderr)
                uyari += 1
    if args.kontrol:
        print(f"\n{uyari} uyarı. Üretim yapılmadı (--kontrol).")
        return

    # Yönetim sayfası akademik kadrodan besleniyor (fotoğraf, birim, profil linki)
    dizin = {p["eposta"]: p for grup in ("ogretim_uyeleri", "arastirma_gorevlileri")
             for p in kadro.get(grup, []) if p.get("eposta")}
    for y in kadro.get("yonetim", []):
        if y["eposta"] not in dizin:
            print(f"  ! yönetim kaydı akademik kadroda bulunamadı: {y['eposta']}", file=sys.stderr)
            uyari += 1

    hedefler = [
        ("tr/academic_staff.html", kadro["ogretim_uyeleri"], "tr", "uye"),
        ("en/academic_staff.html", kadro["ogretim_uyeleri"], "en", "uye"),
        ("tr/research_assistants.html", kadro["arastirma_gorevlileri"], "tr", "asis"),
        ("en/research_assistants.html", kadro["arastirma_gorevlileri"], "en", "asis"),
    ]
    for yol, liste, dil, tur in hedefler:
        # İngilizce sayfada yalnızca İngilizce kaydı olanları da göster;
        # Türkçe sayfada 'sadece en' notu olanları atla.
        secilen = [p for p in liste if not (dil == "tr" and p.get("not"))]
        icerik = sayfa_uret(secilen, dil, tur)
        with open(os.path.join(kok, yol), "w", encoding="utf-8") as f:
            f.write(icerik)
        print(f"{yol}  ->  {len(secilen)} kişi, {len(icerik)} karakter")

    for dil in ("tr", "en"):
        icerik = yonetim_uret(kadro.get("yonetim", []), dizin, dil)
        yol = f"{dil}/management.html"
        with open(os.path.join(kok, yol), "w", encoding="utf-8") as f:
            f.write(icerik)
        print(f"{yol}  ->  {len(kadro.get('yonetim', []))} kişi, {len(icerik)} karakter")

        icerik = idari_uret(kadro.get("idari_personel", []), dil)
        yol = f"{dil}/administrative_staff.html"
        with open(os.path.join(kok, yol), "w", encoding="utf-8") as f:
            f.write(icerik)
        print(f"{yol}  ->  {len(kadro.get('idari_personel', []))} kişi, {len(icerik)} karakter")

    print(f"\n{uyari} uyarı var (yukarıda).")


if __name__ == "__main__":
    main()
