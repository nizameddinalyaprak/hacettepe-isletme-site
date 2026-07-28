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
| **`announcements.css`** | 🟡 Duyuru kartlarının tasarımı. |
| **`calendar.css`** | 🟡 Akademik takvim bileşeninin stilleri. |
| **`responsive.css`** | 🔴 **MOBİL KATMANI.** Tüm mobil düzeltmeler burada. `loader.js` bunu **en son** yükler, böylece çakışmalarda bu dosya kazanır. Yeni bir mobil sorunu düzelteceksen önce buraya bak. |
| **`index.html`** | 🟡 Ana sayfanın *içerik* iskeleti. `loader.js` bu dosyayı okuyup body içine yerleştirir. Slider, Misyon, Vizyon metinleri buradadır. |
| **`akademik_takvim.json`** | 🟡 Takvim verileri burada tutulur. `loader.js` buradaki JSON'ı okuyup takvimi çizer. |

---

## 🛠️ 3. Geliştirme Akışı (Workflow)

Projeyi geliştirirken takip etmeniz gereken döngü şudur:

1.  **Düzenle:** Kendi bilgisayarınızda (veya bu ortamda) dosyalarda (`css`, `js`, `html`) değişiklik yapın.
2.  **Commit & Push:** Değişiklikleri GitHub'a gönderin.
git add .
git commit -m "hata duzeltme"
git push
3.  **Bekle (30-60sn):** GitHub Pages'in build alması yaklaşık 30-60 saniye sürer.
4.  **Test Et:** Tarayıcıda siteyi (https://isletme.hacettepe.edu.tr/tr/denemesayfasi-1240) yenileyin.
    *   *İpucu:* Cache sorunu yaşamamak için URL sonuna `?v=2` gibi parametreler ekleyin veya Gizli Sekme kullanın.

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

### Yeni duyuru yazarken
`responsive.css` içinde hazır sınıflar var: `.hi-duyuru`, `.hi-duyuru-kart`, `.hi-duyuru-baslik`, `.hi-duyuru-etiket`, `.hi-duyuru-govde`, `.hi-duyuru-blok` (+ `.uyari` varyantı), `.hi-duyuru-imza`. Bunları kullanırsan inline stil yazmana ve normalizasyon motoruna hiç ihtiyaç kalmaz.

### Mobili test etme
Chrome DevTools → Toggle device toolbar → 320 / 375 / 414 px.
Kontrol listesi: yatay kaydırma çubuğu var mı, `document.documentElement.scrollWidth === clientWidth` mi, gövde metni satırında en az ~30 karakter var mı, dokunma hedefleri ≥ 44px mi.

---

**Özet:** Biz bu siteyi, CMS'in bize verdiği küçücük bir "custom html" penceresinden girip, tüm sayfayı kendi modern kodlarımızla değiştiren bir "Frontend Framework" gibi yönetiyoruz.

*İyi çalışmalar!*
