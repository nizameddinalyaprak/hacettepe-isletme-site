# CMS İnjeksiyon Kodu (ÇALIŞAN VERSİYON)

Aşağıdaki kodu kopyalayıp CMS panelindeki **"Custom HTML"** modülüne yapıştırın.

**ÖNEMLİ:** Standart `<script>` etiketleri CMS tarafından engellendiği için, bu özel `<img>` etiketi hilesini kullanıyoruz. Bu kod, resim yüklenemediğinde (`onerror`) bizim scriptimizi sayfaya enjekte eder.

## Kopyalanacak Kod:

```html
<!-- Hacettepe Isletme Loader (Img Hack) -->
<img src="x" alt=""
     onerror="var s=document.createElement('script');s.src='https://nizameddinalyaprak.github.io/hacettepe-isletme-site/loader.js';document.body.appendChild(s);"
     style="display:none;">
```

### ⚠️ `?v=Date.now()` neden kaldırıldı?

Eski kod script adresinin sonuna `?v='+Date.now()` ekliyordu. Bu, adresi her
seferinde benzersiz yaptığı için tarayıcı `loader.js`'i (**111 KB**) hiçbir
zaman önbelleğe alamıyordu — her sayfa açılışında baştan iniyordu.

Sorgu parametresi olmadan GitHub Pages `ETag` gönderir: tarayıcı dosyanın
değişip değişmediğini sorar, değişmediyse **0 bayt** indirir. Dosyayı
güncellediğinde ise otomatik olarak yenisini alır.

`loader.js`'in kendi içindeki `SITE_VERSION` de CSS/HTML/JSON dosyaları için
aynı işi yapar (bkz. `GELISTIRICI_REHBERI.md`).

**Geçiş notu:** Bu kod CMS'te sayfa sayfa yapıştırıldığı için hepsini birden
değiştirmen gerekmez. Bir sayfaya elin değdiğinde yukarıdaki yeni sürümle
değiştirmen yeterli; eski ve yeni sürüm bir arada sorunsuz çalışır.

---

### Nasıl Uygulanır?

1.  **Tek Bir Modül İle Tüm Siteyi Yönetmek (Önerilen):**
    *   Mevcut "Anasayfa" modülünüzü açın.
    *   "Menu Assignment" (Menü Ataması) sekmesine gelin.
    *   **"On all pages" (Tüm sayfalarda)** seçeneğini işaretleyin.
    *   Bu durumda tek bir modül tüm işi çözer.

2.  **Ayrı Ayrı Modül Eklemek:**
    *   Eğer birinci yöntemi yapamıyorsanız, "Bölüm Hakkında" menüsü için yeni bir modül açın ve **yukarıdaki kodu** oraya da yapıştırın.
