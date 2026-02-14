# CMS İnjeksiyon Kodu (Size Özel)

Aşağıdaki kodu kopyalayıp CMS panelindeki **"Custom HTML"** modülüne yapıştırın.

**ÖNEMLİ:** Bu kodu **hem Anasayfa modülünde hem de Bölüm Hakkında (veya diğer tüm sayfalarda)** birebir AYNEN kullanabilirsiniz.
Bizim sistemimiz "Akıllı Loader" mantığıyla çalışır. Yani kodu nereye koyarsanız koyun, o **çalıştığı sayfanın URL'ine bakar** ve ona göre doğru tasarımı (Anasayfa mı, Hakkında mı?) yükler.

## Kopyalanacak Kod:

```html
<!-- Hacettepe Isletme Modern Loader v2.1 -->
<script src="https://nizameddinalyaprak.github.io/hacettepe-isletme-site/loader.js?v=2.1"></script>
<style>
/* Sayfa yüklenirken eski Hacettepe tasarımının görünmesini (FOUC) engeller */
body { visibility: hidden; opacity: 0; transition: opacity 0.5s; }
/* Loader işini bitirince bu class'ı siler ve sayfa görünür olur */
.hi-loading { visibility: visible !important; opacity: 1 !important; }
</style>
```

---

### Nasıl Uygulanır?

1.  **Tek Bir Modül İle Tüm Siteyi Yönetmek (Önerilen):**
    *   Mevcut "Anasayfa" modülünüzü açın.
    *   "Menu Assignment" (Menü Ataması) sekmesine gelin.
    *   **"On all pages" (Tüm sayfalarda)** seçeneğini işaretleyin.
    *   Bu durumda tek bir modül tüm işi çözer.

2.  **Ayrı Ayrı Modül Eklemek:**
    *   Eğer birinci yöntemi yapamıyorsanız, "Bölüm Hakkında" menüsü için yeni bir modül açın ve **yukarıdaki aynı kodu** oraya da yapıştırın. Kodun kendisinde bir değişiklik yapmanıza gerek yoktur via `loader.js` akıllıdır.
