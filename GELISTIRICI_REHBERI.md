# Hacettepe İşletme Web Sitesi - Geliştirici ve AI Asistan Rehberi

Bu belge, bu projede çalışacak olan **Geliştiriciler** ve **AI Asistanlar** için hazırlanmıştır. Projeyi başka bir ortamda açtığınızda kaldığınız yerden sorunsuz devam edebilmek için buradaki prensipleri okuyunuz.

---

## 🚀 1. Projenin Temel Amacı ve Çalışma Prensibi

Bu proje, **HU-iys (Hacettepe Üniversitesi İçerik Yönetim Sistemi)** kısıtlamalarını aşarak modern, hızlı ve premium bir web sitesi deneyimi sunmak amacıyla geliştirilmiştir.

**Temel Sorun:** Üniversitenin CMS sistemi (Joomla tabanlı eski yapı) script etiketlerini siliyor, stil dosyalarına müdahale ettirmiyor ve modern tasarıma izin vermiyor.
**Çözümümüz (Loader Injection):** CMS'in içine sadece tek bir "Truva Atı" kodu yerleştiriyoruz. Bu kod, GitHub Pages üzerinden barındırdığımız modern dosyaları (`loader.js`, CSS'ler, HTML içerikleri) asenkron olarak çekip sayfaya enjekte ediyor.

### Nasıl Çalışır?
1.  **Giriş Noktası:** CMS panelinde bir "Custom HTML" modülü var. Buraya `cms_injection_code.txt` içindeki kodu yapıştırdık.
2.  **Yükleyici (Loader):** Bu kod, `loader.js` dosyasını çağırır.
3.  **Temizlik ve İnşa:** `loader.js` çalıştığında:
    *   Eski CMS stillerini ve scriptlerini engeller/siler.
    *   Sayfa içeriğini (body) temizler.
    *   Bizim GitHub repomuzdaki `modern-header.css`, `footer.css`, `announcements.css` gibi dosyaları yükler.
    *   `index.html` (veya ilgili sayfa içeriğini) fetch eder ve sayfaya basar.
    *   React/Vue gibi davranarak Header, Footer ve diğer bileşenleri render eder.

---

## 📂 2. Önemli Dosyalar ve Görevleri

Bu klasör (`hacettepe-isletme-site`) içindeki dosyaların ne işe yaradığını bilmeniz kritiktir.

| Dosya Adı | Ne İşe Yarar? (Kritik Önem Düzeyi: 🔴 Yüksek, 🟡 Orta) |
| :--- | :--- |
| **`loader.js`** | 🔴 **BEYİN.** Tüm operasyonu yönetir. CSS'leri yükler, HTML'i çeker, Header/Footer'ı oluşturur, takvimi render eder. Projenin kalbidir. **Dikkatli düzenleyin.** |
| **`cms_injection_code.txt`** | 🔴 **ANAHTAR.** CMS paneline yapıştırılan kod. Sadece `loader.js` dosyasını çağırmaya yarar. Nadiren değişir. |
| **`modern-header.css`** | 🟡 Header, Navigasyon ve Sticky Menu tasarımları. |
| **`footer.css`** | 🟡 Premium Dark Footer tasarımı. |
| **`announcements.css`** | 🟡 Duyuru **listesinin** (kart/filtre/sayfalama) tasarımı. |
| **`duyuru.css`** | 🟡 Duyuru **içeriğinin** ortak tasarım sistemi. CMS'e yapıştırılan duyurular bunu kullanır. `loader.js` yüklemez; duyurunun kendi `<link>`'i çeker. |
| **`duyuru_uret.py`** | 🟡 JSON'dan tutarlı duyuru HTML'i üretir. Elle inline stil yazmaya son verir. |
| **`calendar.css`** | 🟡 Akademik takvim bileşeninin stilleri. |
| **`responsive.css`** | 🔴 **MOBİL KATMANI.** Tüm mobil düzeltmeler burada. `loader.js` bunu **en son** yükler, böylece çakışmalarda bu dosya kazanır. Yeni bir mobil sorunu düzelteceksen önce buraya bak. |
| **`index.html`** | 🟡 Ana sayfanın *içerik* iskeleti. `loader.js` bu dosyayı okuyup body içine yerleştirir. Slider, Misyon, Vizyon metinleri buradadır. |
| **`akademik_takvim.json`** | 🟡 Takvim verileri burada tutulur. `loader.js` buradaki JSON'ı okuyup takvimi çizer. |

---

## 🗺️ 2b. Yeni Sayfa Eklemek — Rota Tablosu

`loader.js` içinde **`ROTALAR`** adında tek bir tablo var. Yeni sayfa eklemek
artık tek satır:

```js
{ dosya: 'yeni_sayfa.html', yollar: ['cms_sayfa_adi-123'], sorgu: ['yeni'] },
```

| Alan | Ne işe yarar |
| :--- | :--- |
| `dosya` | `/tr` veya `/en` altındaki HTML dosyası |
| `yollar` | URL içinde aranacak CMS sayfa kimlikleri |
| `sorgu` | Yerel önizleme: `?page=<değer>` |
| `sabitTr` | `true` ise dilden bağımsız hep `/tr` altından çekilir |
| `loaderTemizle` | Çekilen HTML'deki enjeksiyon `<img>`'ini siler (sonsuz döngü önlemi) |

**Sıra önemlidir** — ilk eşleşen rota kazanır.

> Eskiden burada 29 adet birbirinin kopyası `else if (isXPage) { fetch(...) }`
> bloğu vardı (~450 satır) ve yeni sayfa eklemek için dosyanın **üç ayrı**
> yerine dokunmak gerekiyordu. Biri unutulduğunda sayfa sessizce boş açılıyordu.
>
> Ayrıca iki tehlikeli eşleşme kaldırıldı: `path.includes('211')` ve
> `path.includes('69')`. Bunlar URL'nin herhangi bir yerinde o rakamlar geçen
> **her** sayfayı (ör. `-2114`, `-1169`) kadro sayfasına çeviriyordu.

---

## 🛠️ 3. Geliştirme Akışı (Workflow)

Projeyi geliştirirken takip etmeniz gereken döngü şudur:

1.  **Düzenle:** Kendi bilgisayarınızda (veya bu ortamda) dosyalarda (`css`, `js`, `html`) değişiklik yapın.
2.  **🔴 SÜRÜMÜ ARTIR:** `loader.js` içindeki `SITE_VERSION` değerini güncelleyin (örn. `'2026-08-11'` → `'2026-08-12'`).
    **Bu adım atlanırsa kullanıcılar eski sürümü görmeye devam eder.**
3.  **Commit & Push:** Değişiklikleri GitHub'a gönderin.
```
git add .
git commit -m "hata duzeltme"
git push
```
4.  **Bekle (30-60sn):** GitHub Pages'in build alması yaklaşık 30-60 saniye sürer.
5.  **Test Et:** Tarayıcıda siteyi (https://isletme.hacettepe.edu.tr/tr/denemesayfasi-1240) yenileyin.

### ⚠️ Önbellek hakkında (2026-08 değişikliği)

Eskiden `cacheBuster = '?v=' + Date.now()` idi. Her istek benzersiz olduğu için
tarayıcı **hiçbir dosyayı önbelleğe alamıyordu**: her sayfa açılışında loader +
7 CSS + takvim JSON, yani **~185 KB** yeniden iniyordu. Beş sayfa gezen bir
ziyaretçi ~1 MB indiriyordu.

Artık sabit bir `SITE_VERSION` kullanılıyor. Aynı sürümde gezinen kullanıcı
dosyaları önbellekten alır (0 bayt). Bedeli: **yayın yaparken sürümü elle
artırmayı unutmamak.**

---

## 🎨 4. Tasarım Prensipleri (Design System)

Eğer yeni bir bileşen tasarlayacaksanız şu kurallara uyun:

*   **Renk Paleti:**
    *   **Ana Renk:** Hacettepe Kırmızısı (`#ac232d`)
    *   **Koyu Tema (Footer/Header):** Deep Grey (`#111214`), Soft Grey (`#222`)
    *   **Metin:** Okunabilir koyu gri (`#444`) veya beyaz (`#fff` - koyu zeminde).
*   **Tipografi:**
    *   Font Ailesi: `'Open Sans', 'Segoe UI', sans-serif`
    *   Başlıklar: Kalın (`700`, `800`), Büyük, Letter-spacing kullanın.
*   **Stil Dili:**
    *   **Premium & Modern:** Gölgeler (`box-shadow`), yuvarlatılmış köşeler (`border-radius: 8px`), yumuşak geçişler (`transition: all 0.3s`).
    *   **Bootstrap Bağımsızlığı:** Mümkün olduğunca Bootstrap grid sistemine bağımlı kalmayın, kendi CSS Grid/Flex yapılarınızı kurun (Örn: `footer.css` içinde yaptığımız gibi).

---

## ⚠️ 5. Bilinmesi Gereken Kısıtlar ve İpuçları

1.  **Backend Yok:** PHP, Python veya veritabanı kullanamazsınız. Her şey Statik HTML/JS/JSON olmak zorunda.
2.  **Cross-Origin (CORS):** `loader.js` içinde `fetch` ile dosya çekerken aynı domain (veya GitHub Pages) üzerinde olduğumuzdan emin olun.
3.  **Offline Mod:** Yerel geliştirmede `loader.js` içindeki `OFFLINE_MODE` değişkeni `true` yapılırsa, fetch yerine yerel değişkenlerden veri okur (Geliştirme hızını artırır).
4.  **FOUC (Flash of Unstyled Content):** Sayfa yüklenirken eski Hacettepe sitesinin kısa süreliğine görünmesini engellemek için `cms_injection_code.txt` içinde `<style>body{visibility:hidden}</style>` gibi önlemler aldık. `loader.js` işini bitirince sayfayı görünür kılar.

---

## 📱 6. Mobil Mimarisi (Önemli)

Mobil düzen iki katmanla çözülüyor:

### a) `responsive.css` — kural katmanı
Akıcı (fluid) tasarım token'ları kullanır, sabit piksel yerine `clamp()`:

```css
--hi-gutter:   clamp(12px, 3vw, 20px);   /* sayfa kenar boşluğu */
--hi-pad-card: clamp(14px, 2.6vw, 28px); /* kart iç boşluğu     */
--hi-fs-body:  clamp(15px, 0.95rem + 0.15vw, 16.5px);
```

Yeni bileşen yazarken sabit `padding: 24px` yerine `padding: var(--hi-pad-card)` kullan; mobil ayrıca ele alınmak zorunda kalmaz.

### b) `loader.js › hiIcerigiNormalize()` — otomatik düzeltme motoru
Eski duyurular CMS'e dev inline stillerle yapıştırıldı (`padding: 24px`, `font-size: 1.15rem`, `min-width: 250px`...). Bunları **CMS'te tek tek düzenlemek yerine** loader çalışma anında:

1. İçerikteki her inline stili tarar,
2. Aşırı olanları (padding, font-size, min-width, sabit genişlik, `nowrap`, çok kolonlu grid) yeniden ölçekler,
3. Öğeye `data-hi-m="nN"` niteliği verip **sadece `@media (max-width: 767px)` içinde geçerli** `!important` kuralları üretir.

Inline stil **bozulmaz** — masaüstü görünüm birebir korunur, ekran döndürüldüğünde JS'i tekrar çalıştırmak gerekmez.

Ayrıca her `<table>` otomatik olarak `.hi-table-scroll` sarmalayıcısına alınır (yatay kaydırma + kenarlarda kaydırma ipucu gölgesi).

### Yeni duyuru yazarken → `duyuru_uret.py` kullan

Elle HTML yazma. `duyurular/` klasörüne bir JSON koy, script HTML'i üretsin:

```bash
python3 duyuru_uret.py duyurular/man208-final.json
```

Örnek girdi için `duyurular/ornek-man208-final.json` dosyasına bak. Üretilen
HTML doğrudan HU-IYS'in HTML alanına yapıştırılabilir.

**Neden:** Mevcut 50 duyuru tarandığında 48'inin aynı iskeletin kopyası olduğu,
farkların ise bilinçli tasarım kararı değil kopyala-yapıştır sapması olduğu
görüldü — 15 farklı başlık gradienti, **11 farklı kırmızı tonu**, 12 farklı
buton stili, 8 farklı tablo başlığı. Duyuru başına ~6.500 karakterin %75-80'i
tekrar eden inline stildi.

`duyuru.css` bu kalıbı tek yerde topluyor:

| Ne | Sınıf |
| :--- | :--- |
| Kategori teması (renk otomatik) | `.hd--sinav` `.hd--ders` `.hd--onemli` `.hd--basvuru` `.hd--etkinlik` `.hd--mezuniyet` `.hd--genel` |
| Kart / başlık / etiket | `.hd-kart` `.hd-baslik` `.hd-etiket` `.hd-h2` `.hd-ozet` |
| Tarih-Saat-Yer kutusu | `.hd-meta` `.hd-meta-oge` |
| Uyarı (4 semantik tip) | `.hd-uyari--bilgi` `--uyari` `--onemli` `--basari` |
| Tablo | `.hd-tablo-kaydir` + `.hd-tablo` |
| Buton (2 tip) | `.hd-buton--birincil` `--ikincil` |

**Kurumsal kırmızı tek bir tondur: `#ac232d`.** Başka kırmızı yazma.

> Not: `responsive.css` içindeki eski `.hi-duyuru*` sınıfları hiçbir duyuru
> tarafından kullanılmamıştı; yerini `duyuru.css` aldı.

### Mobili test etme
Chrome DevTools → Toggle device toolbar → 320 / 375 / 414 px.
Kontrol listesi: yatay kaydırma çubuğu var mı, `document.documentElement.scrollWidth === clientWidth` mi, gövde metni satırında en az ~30 karakter var mı, dokunma hedefleri ≥ 44px mi.

---

**Özet:** Biz bu siteyi, CMS'in bize verdiği küçücük bir "custom html" penceresinden girip, tüm sayfayı kendi modern kodlarımızla değiştiren bir "Frontend Framework" gibi yönetiyoruz.

*İyi çalışmalar!*
