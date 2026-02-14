# CMS İnjeksiyon Kodu (ÇALIŞAN VERSİYON)

Aşağıdaki kodu kopyalayıp CMS panelindeki **"Custom HTML"** modülüne yapıştırın.

**ÖNEMLİ:** Standart `<script>` etiketleri CMS tarafından engellendiği için, bu özel `<img>` etiketi hilesini kullanıyoruz. Bu kod, resim yüklenemediğinde (`onerror`) bizim scriptimizi sayfaya enjekte eder.

## Kopyalanacak Kod:

```html
<!-- Hacettepe Isletme Loader (Img Hack) -->
<img src="x"
     onerror="var s=document.createElement('script');s.src='https://nizameddinalyaprak.github.io/hacettepe-isletme-site/loader.js?v='+Date.now();document.body.appendChild(s);"
     style="display:none;">
```

*(Not: `Date.now()` sayesinde her seferinde güncel script çekilir, cache sorunu yaşanmaz.)*

---

### Nasıl Uygulanır?

1.  **Tek Bir Modül İle Tüm Siteyi Yönetmek (Önerilen):**
    *   Mevcut "Anasayfa" modülünüzü açın.
    *   "Menu Assignment" (Menü Ataması) sekmesine gelin.
    *   **"On all pages" (Tüm sayfalarda)** seçeneğini işaretleyin.
    *   Bu durumda tek bir modül tüm işi çözer.

2.  **Ayrı Ayrı Modül Eklemek:**
    *   Eğer birinci yöntemi yapamıyorsanız, "Bölüm Hakkında" menüsü için yeni bir modül açın ve **yukarıdaki kodu** oraya da yapıştırın.
