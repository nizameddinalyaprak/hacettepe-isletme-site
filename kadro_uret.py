#!/usr/bin/env python3
"""
kadro_uret.py — kadro.json'dan öğretim üyeleri ve araştırma görevlileri
sayfalarını üretir (tr + en, toplam 4 dosya).

NEDEN VAR?
----------
Kadro sayfaları elle düzenleniyordu: bir hoca eklendiğinde/çıktığında ya da
oda numarası değiştiğinde dört ayrı HTML dosyasında aynı düzeltmeyi yapmak
gerekiyordu. Türkçe ve İngilizce sayfaların birbirinden ayrışması da bu yüzden
oldu (İngilizce sayfada Türkçede olmayan bir kayıt kalmış).

Artık tek kaynak kadro.json. Bir kişiyi güncelle, scripti çalıştır.

KULLANIM
--------
    python3 kadro_uret.py            # dört sayfayı da üretir
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
        "uye_alt": "İşletme Bölümü akademik kadrosu",
        "asis_baslik": "Araştırma Görevlileri",
        "asis_alt": "İşletme Bölümü araştırma kadrosu",
        "ara": "Ada, anabilim dalına veya odaya göre ara",
        "tumu": "Tümü",
        "oda": "Oda",
        "profil": "Araştırma profili",
        "eposta": "E-posta",
        "sonuc_yok": "Aramanızla eşleşen kayıt bulunamadı.",
        "kisi": "kişi",
        "sayfa_basi": "Hacettepe Üniversitesi İktisadi ve İdari Bilimler Fakültesi",
    },
    "en": {
        "lang": "en",
        "uye_baslik": "Academic Staff",
        "uye_alt": "Department of Business Administration faculty",
        "asis_baslik": "Research Assistants",
        "asis_alt": "Department of Business Administration research staff",
        "ara": "Search by name, division or office",
        "tumu": "All",
        "oda": "Office",
        "profil": "Research profile",
        "eposta": "E-mail",
        "sonuc_yok": "No records match your search.",
        "kisi": "people",
        "sayfa_basi": "Hacettepe University Faculty of Economics and Administrative Sciences",
    },
}


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

    .kadro-hero { background:var(--k-lacivert); color:#fff; margin:0 0 30px;
      padding:clamp(34px,6vw,56px) clamp(20px,4vw,44px); border-radius:0 0 14px 14px;
      position:relative; overflow:hidden; }
    .kadro-hero::after { content:''; position:absolute; left:0; right:0; bottom:0; height:4px;
      background:linear-gradient(90deg,var(--k-kirmizi) 0%,var(--k-kirmizi) 42%,transparent 42%); }
    .kadro-ust { font-size:12px; letter-spacing:1.6px; text-transform:uppercase;
      color:rgba(255,255,255,.62); margin:0 0 10px; }
    .kadro-hero h1 { font-family:Georgia,'Times New Roman',serif; font-weight:400;
      font-size:clamp(28px,3.4vw,42px); line-height:1.15; margin:0 0 10px; color:#fff; }
    .kadro-hero p { margin:0; color:rgba(255,255,255,.78); font-size:clamp(14px,1.6vw,16px); }

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

    @media (max-width:600px) {
      .kadro-hero { border-radius:0; margin-left:calc(50% - 50vw); margin-right:calc(50% - 50vw);
        padding-left:22px; padding-right:22px; }
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

    # Ünvanı addan ayır: "Prof. Dr. Ali VELİ" -> ünvan + ad
    parcalar = ad.split()
    kesme = 0
    for i, x in enumerate(parcalar):
        if x.endswith(".") or x in ("Res", "Asst", "Assoc", "Lecturer", "Prof", "Dr"):
            kesme = i + 1
        else:
            break
    unvan = " ".join(parcalar[:kesme])
    sade_ad = " ".join(parcalar[kesme:]) or ad

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
    altbaslik = t["uye_alt"] if tur == "uye" else t["asis_alt"]

    # Anabilim dalına göre grupla, sırayı koru
    gruplar = {}
    for p in kisiler:
        b = p[dil]["birim"] or p["tr"]["birim"] or "—"
        gruplar.setdefault(b, []).append(p)

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
      <p class="kadro-ust">{k(t['sayfa_basi'])}</p>
      <h1>{k(baslik)}</h1>
      <p>{k(altbaslik)}</p>
    </header>

    <div class="kadro-arac">
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

    <p class="kadro-bos" id="kadro-bos">{k(t['sonuc_yok'])}</p>

  </div>

<script>
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
</script>

</body>

</html>
"""


def main():
    ap = argparse.ArgumentParser(description="Kadro sayfalarını üretir.")
    ap.add_argument("--kontrol", action="store_true", help="üretmeden veriyi denetle")
    args = ap.parse_args()

    kok = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(kok, "kadro.json"), encoding="utf-8") as f:
        kadro = json.load(f)

    uyari = 0
    for grup, liste in kadro.items():
        for p in liste:
            if not p.get("foto"):
                print(f"  ! fotoğrafsız: {p['tr']['ad']}", file=sys.stderr)
                uyari += 1
            if p.get("not"):
                print(f"  ! {p['tr']['ad']}: {p['not']}", file=sys.stderr)
                uyari += 1
            if not p.get("eposta"):
                print(f"  ! e-postasız: {p['tr']['ad']}", file=sys.stderr)
                uyari += 1
    if args.kontrol:
        print(f"\n{uyari} uyarı. Üretim yapılmadı (--kontrol).")
        return

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
        tam = os.path.join(kok, yol)
        with open(tam, "w", encoding="utf-8") as f:
            f.write(icerik)
        print(f"{yol}  ->  {len(secilen)} kişi, {len(icerik)} karakter")

    print(f"\n{uyari} uyarı var (yukarıda).")


if __name__ == "__main__":
    main()
