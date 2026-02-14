/* loader.js - Site Yükleyici */

(function () {
    console.log("Loader baslatildi...");

    // 1. Hatali Eventleri Engelle (Scroll vs) - HATA SUSTURUCU (Kesin Cozum V2)
    var originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        if (message && (message.includes("reading 'top'") || message.includes("calc") || message.includes("undefined"))) {
            return true; // Hatayi konsola basma, yut.
        }
        if (originalOnError) return originalOnError(message, source, lineno, colno, error);
        return false;
    };

    var originalConsoleError = console.error;
    console.error = function () {
        var args = Array.from(arguments);
        var message = args.join(' ');
        if (message && (message.includes("reading 'top'") || message.includes("undefined"))) {
            return; // Yut
        }
        originalConsoleError.apply(console, args);
    };

    // GitHub Pages URL'nizi buraya yazacaksiniz (Otomatik bulmaya calisiyoruz)
    var scriptSrc = document.currentScript.src;
    var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

    console.log("Base URL tespit edildi: " + baseUrl);

    var cacheBuster = '?v=1.0'; // Versiyonu manuel guncelleyerek cache kontrolu saglayalim

    // --- STIL DOSYALARINI YUKLE ---

    // 1. Calendar CSS
    var cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = baseUrl + "/calendar.css" + cacheBuster;
    document.head.appendChild(cssLink);

    // 2. Modern Header CSS
    var headerCssLink = document.createElement("link");
    headerCssLink.rel = "stylesheet";
    headerCssLink.href = baseUrl + "/modern-header.css" + cacheBuster;
    document.head.appendChild(headerCssLink);

    // 3. Announcements CSS
    var annCssLink = document.createElement("link");
    annCssLink.rel = "stylesheet";
    annCssLink.href = baseUrl + "/announcements.css" + cacheBuster;
    document.head.appendChild(annCssLink);

    // 4. Homepage CSS
    var homeCssLink = document.createElement("link");
    homeCssLink.rel = "stylesheet";
    homeCssLink.href = baseUrl + "/homepage.css" + cacheBuster;
    document.head.appendChild(homeCssLink);

    // 5. Footer CSS
    var footerCssLink = document.createElement("link");
    footerCssLink.rel = "stylesheet";
    footerCssLink.href = baseUrl + "/footer.css" + cacheBuster;
    document.head.appendChild(footerCssLink);

    // 5. Font Awesome (Eger yoksa)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        var fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fa);
    }

    // --- HTML ICERIGINI CEK ---
    // --- HTML ICERIGINI CEK ---
    // --- HTML ICERIGINI CEK ---
    // --- SAYFA TURU TESPITI ---
    // Anasayfa mi yoksa alt sayfa mi?
    var path = window.location.pathname;
    // Anasayfa olabilecek URL desenleri:
    var isHomePage = path.endsWith('/tr') || path.endsWith('/tr/') || path.endsWith('index.html') || path.endsWith('index.php') || path === '/' || path.includes('preview.html');
    // Eger URL'de 'preview_subpage' varsa kesinlikle alt sayfadir (Test icin)
    if (path.includes('preview_subpage')) isHomePage = false;

    console.log("Mevcut Sayfa Yolu: " + path);
    console.log("Anasayfa Tespiti: " + isHomePage);

    // --- HTML ICERIGINI CEK (SADECE ANASAYFA ISE) ---
    if (window.OFFLINE_MODE) {
        console.log("Offline Modu Aktif: HTML cekme atlaniyor.");
        setTimeout(function () {
            baslat(document, false); // Offline mod = subpage gibi davran (mevcut body'yi kullan)
        }, 100);
    } else if (isHomePage) {
        // ANASAYFA: index.html'i cek ve body'yi degistir
        fetch(baseUrl + '/index.html' + cacheBuster)
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true); // true = Disaridan HTML geldi
            })
            .catch(function (err) {
                console.error("Site yuklenirken hata olustu:", err);
                if (!window.location.protocol.includes('file')) {
                    document.body.innerHTML = '<h1>Hata Olustu</h1><p>' + err + '</p>';
                }
            });
    } else {
        // ALT SAYFA: Mevcut icerigi koru, sadece susle
        console.log("Alt Sayfa Modu: Mevcut icerik korunaraj modernlestirilecek.");
        // DOMContentLoaded beklemeye gerek yok, script zaten body sonunda calisiyor varsayiyoruz.
        // Ama garanti olsun diye:
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                baslat(document, false);
            });
        } else {
            baslat(document, false); // false = Mevcut document kullaniliyor
        }
    }

    function baslat(doc, isFetchedContent) {
        // 1. Ortak İslemler: Stilleri Ekle
        if (isFetchedContent) {
            // Disaridan gelen doc icindeki stilleri al
            var styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(function (style) {
                document.head.appendChild(style);
            });
        }

        // 2. KRITIK MUDAHALE: Eski CMS stillerini ve scriptlerini temizle (Her iki durumda da)
        temizleVeModernlestir(document, isFetchedContent);

        // 3. Body Icerigi Yonetimi
        if (isFetchedContent) {
            // --- SENARYO A: ANASAYFA (Body degisimi) ---
            document.body.innerHTML = '';
            document.body.appendChild(doc.body);

            // 3.5 Medya Yollarini Duzelt (GitHub/Local BaseURL ekle)
            rewriteMediaPaths(document.body, baseUrl);

            // Scriptleri yeniden calistir
            var scripts = doc.querySelectorAll('script');
            scripts.forEach(function (oldScript) {
                var newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                else newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });
        } else {
            // --- SENARYO B: ALT SAYFA (Icerik sarmalama) ---
            // CMS icerigi genellikle '.item-page', '.blog' veya benzeri bir div icindedir.
            // Biz bu icerigi alip kendi container'imiza koyacagiz.

            // Hedef Icerik Bulucu
            var contentSelectors = ['.item-page', '.blog', '[itemprop="articleBody"]', '.t3-content'];
            var mainContent = null;

            for (var i = 0; i < contentSelectors.length; i++) {
                mainContent = document.querySelector(contentSelectors[i]);
                if (mainContent) break;
            }

            // Eger spesifik bir icerik divi bulamazsak, body'nin icindeki her seyi (scriptler haric) alalim
            if (!mainContent) {
                console.warn("CMS icerik divi bulunamadi, tum body sarmalaniyor.");
                // Body'deki tum cocuklari bir diziye al
                var children = Array.from(document.body.children);
                // Container olustur
                mainContent = document.createElement('div');
                // Script, Style ve Loader haric her seyi container'a tasi (Genel temizlik)
                children.forEach(function (child) {
                    if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.tagName !== 'LINK') {
                        mainContent.appendChild(child);
                    }
                });
                document.body.innerHTML = ''; // Temizle
                document.body.appendChild(mainContent); // Container'i ekle
            }

            // Simdi bu mainContent'i guzellestirelim
            mainContent.classList.add('container', 'main-content');
            mainContent.style.marginTop = '40px';
            mainContent.style.marginBottom = '60px';
            mainContent.style.backgroundColor = '#fff';
            mainContent.style.padding = '40px';
            mainContent.style.borderRadius = '16px';
            mainContent.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
            mainContent.style.border = '1px solid #edf2f9';

            // Font ayarlari (CMS'den gelen kalitesiz fontlari ezmek icin)
            mainContent.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
            mainContent.style.fontSize = "16px";
            mainContent.style.lineHeight = "1.7";
            mainContent.style.color = "#333";

            // H elementlerini duzelt
            var headings = mainContent.querySelectorAll('h1, h2, h3');
            headings.forEach(function (h) {
                h.style.fontFamily = "system-ui, -apple-system, sans-serif";
                h.style.fontWeight = "700";
                h.style.color = "#ac232d";
                h.style.marginTop = "30px";
                h.style.marginBottom = "20px";
            });

            // Linkleri duzelt
            var links = mainContent.querySelectorAll('a');
            links.forEach(function (a) {
                if (!a.classList.contains('btn')) {
                    a.style.color = "#ac232d";
                    a.style.fontWeight = "500";
                    a.style.textDecoration = "underline";
                }
            });

            // Eger container zaten body'de degilse (querySelector ile bulduysak)
            if (mainContent.parentNode !== document.body) {
                // Once body'yi temizle (Header/Footer haric - ama onlar zaten henuz eklenmedi)
                // document.body.innerHTML = ''; // Tehlikeli olabilir, onceki scriptleri silebilir

                // Daha guvenli: Sadece gorunur elementleri gizle/sil
                var bodyChildren = Array.from(document.body.children);
                bodyChildren.forEach(c => {
                    if (c !== mainContent && c.tagName !== 'SCRIPT') c.style.display = 'none';
                });
                document.body.appendChild(mainContent);
                mainContent.style.display = 'block';
            }
        }

        // 4. Header ve Footer (Ortak)
        headerVeTakvimOlustur();
        duyurulariCek(); // Duyurular alt sayfalarda da gozuksun mu? Genelde alt sayfalarda sidebar olabilir.
        // Istege bagli: Alt sayfalarda duyuru listesi olmasin derseniz if(isFetchedContent) icine alin.

        footerOlustur();

        // 5. Takvim Verisi
        setTimeout(takvimVerisiniCek, 500);

        // Yukleme ekrani temizle
        var loading = document.getElementById('yukleniyor');
        if (loading) loading.style.display = 'none';
    }

    function temizleVeModernlestir(doc, isFetchedContent) {
        // CMS'in kendi stil ve scriptlerini engelle
        var blockedCssPatterns = ['templates/template3//css/style.css', 'templates/template3/css/style.css', 'animate.css'];
        var legacyStyles = document.querySelectorAll('link[rel="stylesheet"]');
        legacyStyles.forEach(function (link) {
            if (link.href && blockedCssPatterns.some(pattern => link.href.includes(pattern))) {
                link.remove();
            }
        });

        var blockedJsPatterns = ['templates/template3//js/main.js', 'templates/template3/js/main.js'];
        var legacyScripts = document.querySelectorAll('script');
        legacyScripts.forEach(function (script) {
            if (script.src && blockedJsPatterns.some(pattern => script.src.includes(pattern))) {
                script.remove();
            }
        });

        // Eski Header/Top Bar Temizligi
        var elementsToRemove = ['.header', '.top-bar', '#sp-header', '#sp-top-bar'];
        elementsToRemove.forEach(sel => {
            var el = doc.querySelector(sel);
            if (el) el.remove();
        });

        // Wrapper temizligi
        var t3Wrapper = doc.querySelector('.t3-wrapper');
        if (t3Wrapper) {
            t3Wrapper.style.padding = '0';
            t3Wrapper.style.margin = '0';
            t3Wrapper.style.border = 'none';
            t3Wrapper.style.background = 'transparent';
        }

        document.body.style.padding = "0 !important";
        document.body.style.margin = "0 !important";
    }

    // --- HEADER VE TAKVIM OLUSTURMA ---
    function headerVeTakvimOlustur() {
        console.log("Modern Header ve Takvim olusturuluyor...");

        // 1. Menu Ust (Social & Links) - Mobil uyumluluk icin d-none kaldirildi
        var menuUstHTML = `
            <div class="menu_ust" style="width: 100%; display: flex; justify-content: flex-end; background: #fafafa; border-bottom: none;">
                <div class="container" style="display: flex; justify-content: flex-end; align-items: center; max-width: 1200px; padding: 3px 30px;">
                    <!-- Sol Taraf: Linkler (Hacettepe | Bilsis | EN) -->
                    <div class="top-links" style="display: flex; align-items: center;">
                        <a href="https://hacettepe.edu.tr" target="_blank" style="color:#666; text-decoration:none; font-size:13px;">Hacettepe</a>
                        <span style="color:#ddd; margin: 0 10px;">|</span>
                        <a href="https://bilsis.hacettepe.edu.tr" target="_blank" style="color:#666; text-decoration:none; font-size:13px;">BİLSİS</a>
                        <span style="color:#ddd; margin: 0 10px;">|</span>
                        <a href="https://isletme.hacettepe.edu.tr/en" style="color:#666; text-decoration:none; font-size:13px;">EN</a>
                    </div>

                    <!-- Sag Taraf: Sosyal Medya İkonları -->
                    <div class="social-icons" style="display: flex; align-items: center;">
                        <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank" style="margin-left: 20px; color:#ac232d;"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank" style="margin-left: 15px; color:#ac232d;"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>`;

        // 2. Takvim HTML (Arada)
        var calendarHTML = `
            <div id="calendar-container">
                <div id="calendar-strip"></div>
            </div>`;

        // 3. Menu Genel (Navigasyon) - Mobil icin basit bir stil eklendi
        // 3. Menu Genel (Navigasyon) - Logo ve Bolum Ismi Eklendi
        var menuGenelHTML = `
            <div class="menu_genel" style="width: 100%; border-bottom: none;">
                <div class="hi-nav-container">

                    <!-- LOGO VE BASLIK ALANI (SOL UST) -->
                    <!-- LOGO VE BASLIK ALANI (SOL UST) -->
                    <!-- Kullanicinin verdigi yapiya uygun (menu sinifi haric, layout bozmamasi icin) -->
                    <a href="https://isletme.hacettepe.edu.tr/tr" class="hi-brand-logo" style="text-decoration: none; margin-right: auto;">
                        <div class="logo">
                            <div class="logo_yazi">
                                <!-- Normal Gorunum -->
                                <div class="brand-normal">
                                    <div class="banner_uni">HACETTEPE ÜNİVERSİTESİ</div>
                                    <div class="banner_uni_bolum">İşletme Bölümü</div>
                                </div>
                                <!-- Sticky (Asagi Kayinca) Gorunum -->
                                <div class="brand-sticky" style="display: none;">
                                    <span class="banner_uni" style="font-size: 20px;">HACETTEPE</span>
                                    <span class="banner_uni_bolum" style="font-size: 20px; margin-left: 6px; font-weight: 300; margin-top: 0; color: #222;">İŞLETME</span>
                                </div>
                            </div>
                        </div>
                    </a>

                    <button class="mobile-menu-toggle d-lg-none" onclick="document.querySelector('.hi-main-nav').classList.toggle('active')">
                        <i class="fas fa-bars"></i> MENÜ
                    </button>

                    <nav class="hi-main-nav">
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/tr" class="hi-nav-link">Ana Sayfa</a></div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">BÖLÜM <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">KURUMSAL</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/bolum_hakkinda-75" class="dropdown-item">Bölüm Hakkında</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/yonetim-77" class="dropdown-item">Yönetim</a>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-header">PERSONEL</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/ogretim_uyelerigorevlileri-211" class="dropdown-item">Öğretim Üyeleri/Görevlileri</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/arastirma_gorevlileri-69" class="dropdown-item"> Araştırma Görevlileri</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/idari_personel-71" class="dropdown-item">İdari Personel</a>
                            </div>
                        </div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">AKADEMİK <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">DERS PROGRAMLARI</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/undergraduate-115" class="dropdown-item">Undergraduate</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/tezli_yuksek_lisans-117" class="dropdown-item">Tezli Yüksek Lisans</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/tezsiz_yuksek_lisans-213" class="dropdown-item">Tezsiz Yüksek Lisans</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/doktora-215" class="dropdown-item">Doktora</a>
                                <div class="dropdown-divider"></div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/akademik_takvimler-119" class="dropdown-header">AKADEMİK TAKVİMLER</a>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-header">ÖĞRETİM PROGRAMLARI</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/lisans_programi-91" class="dropdown-item">Lisans Programı</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/tezli_yuksek_lisans_programlari-93" class="dropdown-item">Tezli Yüksek Lisans Programı</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/tezsiz_yuksek_lisans_programlari-95" class="dropdown-item">Tezsiz Yüksek Lisans Programı</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/doktora_programi-97" class="dropdown-item">Doktora Programı</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/yan_dal_programi-99" class="dropdown-item">Yan Dal Programı</a>
                            </div>
                        </div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">ÖĞRENCİ <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">DEĞİŞİM PROGRAMLARI</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/erasmus-103" class="dropdown-item">ERASMUS</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/farabi-105" class="dropdown-item">FARABİ</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/mevlana-107" class="dropdown-item">MEVLANA</a>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-header">İŞLEMLER & BİLGİ</div>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/staj-111" class="dropdown-item">Staj</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/gerekli_formlar_ve_belgeler-173" class="dropdown-item">Gerekli Formlar ve Belgeler</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/lisans_programi_ogrencileri_icin_si-121" class="dropdown-item">Sıkça Sorulan Sorular</a>
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/etkinlikler-171" class="dropdown-item">Etkinlikler</a>
                            </div>
                        </div>
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/tr/duyurular" class="hi-nav-link">Duyurular</a></div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">İLETİŞİM <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <a href="https://isletme.hacettepe.edu.tr/tr/menu/iletisim-13" class="dropdown-item">İletişim Bilgileri</a>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>`;

        var fullHeaderHTML = `
        <div class="header-right-col" style="display: flex; flex-direction: column; width: 100%;">
            ${menuUstHTML}
            ${calendarHTML}
        </div>
        ${menuGenelHTML}`;

        // Varsa eski headeri gizle
        var oldHeader = document.querySelector('.header');
        if (oldHeader) oldHeader.style.display = 'none';

        // Yeni headeri body'nin en basina ekle
        document.body.insertAdjacentHTML('afterbegin', fullHeaderHTML);

        // --- STICKY HEADER LOGIC ---
        var menuElement = document.querySelector('.menu_genel');
        if (menuElement) {
            window.addEventListener('scroll', function () {
                // Toplam yukseklik (topbar + calendar) yaklasik 60-80px.
                // Biraz pay birakarak 60px diyelim.
                if (window.scrollY > 60) {
                    menuElement.classList.add('sticky-active');
                } else {
                    menuElement.classList.remove('sticky-active');
                }
            });
        }

        // --- MOBIL MENU DROPDOWN TIKLAMA MANTIGI ---
        // Mobilde hover sorunlu oldugu icin tiklama ile acilmasini sagliyoruz.
        var navItems = document.querySelectorAll('.hi-nav-item');
        navItems.forEach(function (item) {
            var dropdown = item.querySelector('.hi-dropdown-menu');
            var link = item.querySelector('.hi-nav-link');
            if (dropdown && link) {
                link.addEventListener('click', function (e) {
                    // Sadece mobilde (991px ve alti) devreye girsin
                    if (window.innerWidth < 992) {
                        e.preventDefault(); // Linke gitmesin (Bölüm, Akademik vb.)

                        // Opsiyonel: Diger acik menuleri kapatmak icin
                        /*
                        navItems.forEach(function(otherItem) {
                             if (otherItem !== item) {
                                 otherItem.classList.remove('dropdown-active');
                             }
                        });
                        */

                        item.classList.toggle('dropdown-active');
                    }
                });
            }
        });

        // Mobile menu toggle style (modern-header.css dosyasina tasindi, burasi temizlendi)

        // --- PRELOADER REMOVAL ---
        // CMS injection kodu ile eklenen 'hi-loading' sinifini kaldirip icerigi gosteriyoruz.
        document.documentElement.classList.remove('hi-loading');

        // Eger CSS ile body gizlendiyse, manuel olarak gosterelim (guvenlik onlemi)
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    }

    function takvimVerisiniCek() {
        // --- OFFLINE MOD DESTEGI ---
        if (window.OFFLINE_CALENDAR_DATA) {
            console.log("Offline Takvim verisi kullaniliyor.");
            renderCalendar(window.OFFLINE_CALENDAR_DATA);
            return;
        }

        // Veriyi Cek
        fetch(baseUrl + '/akademik_takvim.json' + cacheBuster)
            .then(res => res.json())
            .then(events => {
                renderCalendar(events);
            })
            .catch(err => console.log("Takvim verisi cekilemedi:", err));
    }

    function renderCalendar(events) {
        var strip = document.getElementById('calendar-strip');
        if (!strip) return;

        // Global Tooltip Olustur (Eger yoksa)
        var globalTooltip = document.getElementById('global-calendar-tooltip');
        if (!globalTooltip) {
            globalTooltip = document.createElement('div');
            globalTooltip.id = 'global-calendar-tooltip';
            globalTooltip.className = 'event-tooltip';
            document.body.appendChild(globalTooltip);
        }

        var bugun = new Date();
        var gunlerHTML = '';
        var ayIsimleri = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        var gunIsimleriEN = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

        var currentMonth = bugun.getMonth();
        var daysData = []; // Event listener eklemek icin datayi tutalim

        for (var i = 0; i < 30; i++) {
            var tempDate = new Date(bugun);
            tempDate.setDate(bugun.getDate() + i);

            var dayMonth = tempDate.getMonth();
            var dayDate = tempDate.getDate();
            var dayIndex = tempDate.getDay();

            // Ay degisimi kontrolu
            var monthLabelHTML = '';
            var isMonthStart = false;

            if (dayMonth !== currentMonth) { // Ay degisti
                currentMonth = dayMonth;
                isMonthStart = true;
                if (i !== 0 || dayDate === 1) {
                    monthLabelHTML = `<span class="month-label-floating">${ayIsimleri[dayMonth]}</span>`;
                }
            } else if (i === 0) { // Ilk gun (Bugun)
                // Bugun ayin 1'i ise veya baslangic oldugu icin label koyalim
                monthLabelHTML = `<span class="month-label-floating">${ayIsimleri[dayMonth]}</span>`;
            }

            // Gorsel ayirici cizgi icin class (Sadece gercekten ay degistiginde veya ayin 1'iyse)
            // Ama listenin en basina (bugun) cizgi cekmek cirkin olabilir, sadece i > 0 ise ekleyelim.
            var monthStartClass = (isMonthStart && i > 0) ? 'month-start' : '';

            var gununEtkinlikleri = events.filter(e => {
                var start = new Date(e.startDate);
                var end = new Date(e.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                tempDate.setHours(12, 0, 0, 0);
                return tempDate >= start && tempDate <= end;
            });

            var hasEvent = gununEtkinlikleri.length > 0;
            var eventClass = hasEvent ? 'has-event' : '';
            var dayId = 'day-' + i;

            // Veriyi sakla
            if (hasEvent) {
                daysData.push({
                    id: dayId,
                    dateStr: `${dayDate} ${ayIsimleri[dayMonth]} ${tempDate.getFullYear()}`,
                    events: gununEtkinlikleri
                });
            }

            gunlerHTML += `
                <div id="${dayId}" class="calendar-day ${eventClass} ${monthStartClass}">
                    ${monthLabelHTML}
                    <span class="day-number">${dayDate}</span>
                    <span class="day-name">${gunIsimleriEN[dayIndex]}</span>
                    <div class="event-dot"></div>
                </div>
            `;
        }

        strip.innerHTML = gunlerHTML;

        // Event Listenerlari Ekle (Mouse Over)
        daysData.forEach(function (data) {
            var el = document.getElementById(data.id);
            if (el) {
                el.addEventListener('mouseenter', function () {
                    var rect = el.getBoundingClientRect();
                    var eventTitles = data.events.map(function (e) { return e.title; }).join('<br><br>');

                    globalTooltip.innerHTML = '<span class="tooltip-date">' + data.dateStr + '</span><span class="tooltip-title">' + eventTitles + '</span>';
                    globalTooltip.style.opacity = '1';
                    globalTooltip.style.visibility = 'visible';

                    // Pozisyonlama (Fixed: Mouse/Element konumuna gore viewport bazli)
                    // Elementin viewporta gore konumu
                    var rect = el.getBoundingClientRect();

                    // Tooltip'i elementin hemen ustune koyalim
                    var topPos = rect.top - globalTooltip.offsetHeight - 10;
                    var leftPos = rect.left + (rect.width / 2) - (globalTooltip.offsetWidth / 2);

                    // Eger ekranin cok sagina tasiyorsa duzelt
                    if (leftPos + globalTooltip.offsetWidth > window.innerWidth) {
                        leftPos = window.innerWidth - globalTooltip.offsetWidth - 10;
                    }
                    // Eger ekranin cok soluna tasiyorsa
                    if (leftPos < 10) leftPos = 10;

                    // Eger ekranin ustunden tasiyorsa (cok yukarda), alta al
                    if (topPos < 10) {
                        topPos = rect.bottom + 10;
                    }

                    globalTooltip.style.top = topPos + 'px';
                    globalTooltip.style.left = leftPos + 'px';
                    globalTooltip.style.transform = 'none'; // CSS transform'u iptal et
                });

                el.addEventListener('mouseleave', function () {
                    globalTooltip.style.opacity = '0';
                    globalTooltip.style.visibility = 'hidden';
                });
            }
        });
    }

    // DUYURU CEKME FONKSIYONU
    function duyurulariCek() {
        console.log("Duyurular cekiliyor...");

        // --- OFFLINE MOD DESTEGI ---
        if (window.OFFLINE_ANNOUNCEMENTS) {
            console.log("Offline Duyuru verisi kullaniliyor.");
            var listeHTML = "";
            var sayac = 0;
            window.OFFLINE_ANNOUNCEMENTS.forEach(d => {
                if (sayac < 12) {
                    // Basitce kategori belirle
                    var category = "Genel";
                    var lowerBaslik = d.title.toLowerCase();
                    if (lowerBaslik.includes("önemli")) category = "Önemli";
                    else if (lowerBaslik.includes("tez")) category = "Lisansüstü";

                    var html = '<li>';
                    html += '<a href="' + d.url + '" target="_blank" class="announcement-title">' + d.title + '</a>';
                    html += '<div class="announcement-footer">';
                    html += '<span class="announcement-date">' + d.date + '</span>';
                    html += '<span class="separator">|</span>';
                    html += '<span class="announcement-category">' + category + '</span>';
                    html += '</div></li>';

                    listeHTML += html;
                    sayac++;
                }
            });
            var hedefListe = document.getElementById('duyuru-listesi');
            if (hedefListe) hedefListe.innerHTML = listeHTML;
            return;
        }

        var duyuruURL = '/tr/duyurular' + cacheBuster; // Cache buster ekle

        fetch(duyuruURL)
            .then(res => res.text())
            .then(html => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');

                var anaIcerik = doc.querySelector('.col-lg-9') || doc.querySelector('.icerik');
                var duyuruSatirlari = [];

                if (anaIcerik) {
                    duyuruSatirlari = anaIcerik.querySelectorAll('ul li');
                }

                console.log("Bulunan duyuru satiri (LI) sayisi: " + duyuruSatirlari.length);

                var listeHTML = '';
                var sayac = 0;

                // URL'den Tarih Cikarma (Yedek)
                function urlTarihBul(url) {
                    var match = url.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
                    if (match) return match[3] + "." + match[2] + "." + match[1];
                    return "";
                }

                // Kategori Filtreleme Listesi (Text Bazli)
                var haricTutulacakBasliklar = [
                    "Duyurular",
                    "Tezli Yüksek Lisans Programları",
                    "Lisans Programı",
                    "Tezsiz Yüksek Lisans Programları",
                    "Doktora Programı",
                    "Show",
                    "Haberler",
                    "Etkinlikler",
                    "Tümü"
                ];

                // Kategori Filtreleme Listesi (URL Bazli - User Provided)
                var haricTutulacakURLler = [
                    "duyurular-1",
                    "tezli_yuksek_lisans_programlar-33",
                    "lisans_programi-35",
                    "tezsiz_yuksek_lisans_programla-37",
                    "doktora_programi-39"
                ];

                function filtreyeTakilirMi(text, href) {
                    if (!href) return true;
                    if (haricTutulacakBasliklar.includes(text.trim())) return true;
                    for (var i = 0; i < haricTutulacakURLler.length; i++) {
                        if (href.includes(haricTutulacakURLler[i])) return true;
                    }
                    return false;
                }

                // Eger LI bulunamadiysa (Fallback)
                if (!duyuruSatirlari || duyuruSatirlari.length === 0) {
                    // console.log("LI yapisi bulunamadi, dogrudan A linkleri taraniyor...");

                    var linkler = anaIcerik ? anaIcerik.querySelectorAll('a') : [];

                    linkler.forEach((link, index) => {
                        var text = link.innerText.trim();

                        // Ozel Filtreler
                        if (filtreyeTakilirMi(text, link.href)) return;

                        var tarih = "";

                        // 1. Link metninde tarih var mi? (YYYY-MM-DD)
                        var tarihMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
                        if (tarihMatch) {
                            tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                        }

                        // 2. Linkin hemen yanindaki metinde (nextSibling) tarih var mi?
                        if (!tarih && link.nextSibling) {
                            var kardes = link.nextSibling;
                            var loopCount = 0;
                            while (kardes && loopCount < 3) {
                                if (kardes.nodeType === 3 && kardes.textContent.trim().length > 5) { // Text Node
                                    var yanMetin = kardes.textContent.trim();
                                    // YYYY-MM-DD
                                    tarihMatch = yanMetin.match(/(\d{4})-(\d{2})-(\d{2})/);
                                    if (tarihMatch) {
                                        tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                                        break;
                                    }
                                    // DD.MM.YYYY
                                    tarihMatch = yanMetin.match(/(\d{2})[./](\d{2})[./](\d{4})/);
                                    if (tarihMatch) {
                                        tarih = tarihMatch[0];
                                        break;
                                    }
                                }
                                kardes = kardes.nextSibling;
                                loopCount++;
                            }
                        }

                        // 3. Parent element icinde herhangi bir yerde tarih var mi?
                        if (!tarih && link.parentElement) {
                            var parentText = link.parentElement.innerText;
                            // YYYY-MM-DD
                            tarihMatch = parentText.match(/(\d{4})-(\d{2})-(\d{2})/);
                            if (tarihMatch) {
                                tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                            }
                            // DD.MM.YYYY
                            if (!tarih) {
                                tarihMatch = parentText.match(/(\d{2})[./](\d{2})[./](\d{4})/);
                                if (tarihMatch) {
                                    tarih = tarihMatch[0];
                                }
                            }
                        }

                        // 4. URL'den tarih
                        if (!tarih) {
                            tarih = urlTarihBul(link.href);
                        }

                        // Eger tarih yoksa ve kisa metinse ele (Guvenlik onlemi)
                        if (!tarih && text.length < 20) {
                            return;
                        }

                        // JavaScript linklerini ele
                        if (sayac < 12 && text.length > 5 && link.href && !link.href.includes('javascript')) {
                            listeHTML += olusturDuyuruHTML(tarih, text, link.href);
                            sayac++;
                        }
                    });
                } else {
                    duyuruSatirlari.forEach((satir, index) => {
                        if (sayac >= 12) return;

                        var link = satir.querySelector('a');
                        if (!link) return;

                        var text = link.innerText.trim();
                        if (filtreyeTakilirMi(text, link.href)) return;

                        var url = link.href;
                        var satirMetni = satir.innerText.trim();
                        var tarih = "";

                        var tarihMatch = satirMetni.match(/(\d{4})-(\d{2})-(\d{2})/);
                        if (tarihMatch) {
                            tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                        }
                        if (!tarih) {
                            tarihMatch = satirMetni.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                            if (tarihMatch) tarih = tarihMatch[0];
                        }
                        if (!tarih) {
                            tarih = urlTarihBul(url);
                        }

                        var baslik = link.innerText.trim();
                        listeHTML += olusturDuyuruHTML(tarih, baslik, url);
                        sayac++;
                    });
                }

                if (sayac === 0) listeHTML = '<li>Henüz duyuru bulunmamaktadır.</li>';

                var hedefListe = document.getElementById('duyuru-listesi');
                if (hedefListe) hedefListe.innerHTML = listeHTML;
            })
            .catch(err => {
                console.log("Duyuru cekme hatasi:", err);
                var hedefListe = document.getElementById('duyuru-listesi');
                if (hedefListe) hedefListe.innerHTML = '<li>Duyurular yüklenirken hata oluştu.</li>';
            });
    }

    function olusturDuyuruHTML(tarih, baslik, url) {
        // Kategori belirleme (Basit text olarak)
        var category = "Diğer";
        var lowerBaslik = baslik.toLocaleLowerCase('tr-TR');

        // Tarih Temizligi
        baslik = baslik.replace(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/, '').trim();
        baslik = baslik.replace(/\(\d{4}-\d{2}-\d{2}\)/, '').trim();
        baslik = baslik.replace(/\d{2}[./]\d{2}[./]\d{4}/, '').trim();

        if (lowerBaslik.includes('önemli') || lowerBaslik.includes('onemli')) category = "Önemli";
        else if (lowerBaslik.includes('doktora')) category = "Doktora";
        else if (lowerBaslik.includes('tezsiz')) category = "Tezsiz YL";
        else if (lowerBaslik.includes('tezli')) category = "Tezli YL";
        else if (lowerBaslik.includes('lisans') && !lowerBaslik.includes('lisansüstü')) category = "Lisans";
        else if (lowerBaslik.includes('sınav') || lowerBaslik.includes('sinav')) category = "Sınav";
        else if (lowerBaslik.includes('genel')) category = "Genel";
        else if (lowerBaslik.includes('etkinlik')) category = "Etkinlik";
        else if (lowerBaslik.includes('haber')) category = "Haber";

        var html = '<li>';

        // Title
        html += '<a href="' + url + '" target="_blank" class="announcement-title">' + baslik + '</a>';

        // Footer (Date | Category)
        html += '<div class="announcement-footer">';
        if (tarih) {
            html += '<span class="announcement-date">' + tarih + '</span>';
            html += '<span class="separator">|</span>';
        }
        html += '<span class="announcement-category">' + category + '</span>';
        html += '</div>';

        html += '</li>';
        return html;
    }

    function footerOlustur() {
        var footerHTML = `
    <!-- FOOTER BİLEŞENİ (PREMIUM DARK) -->
    <footer id="section_hu_footer">
        <div class="footer-container">

            <!-- 1. Marka ve İletişim -->
            <div class="footer-brand">
                <h4>HACETTEPE ÜNİVERSİTESİ</h4>
                <h5>İŞLETME BÖLÜMÜ</h5>

                <div class="footer-address">
                    Beytepe Yerleşkesi, 06800<br>
                    Çankaya / ANKARA
                </div>

                <div class="footer-contact">
                    <a href="tel:+903122976351"><i class="fas fa-phone"></i> +90 (312) 297 63 51 - 112</a>
                </div>
            </div>

            <!-- 2. Hızlı Erişim -->
            <div class="footer-col">
                <h3>Hızlı Erişim</h3>
                <ul class="footer-links">
                    <li><a href="https://isletme.hacettepe.edu.tr/tr/menu/lisans_programi-91">Lisans Programı</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/tr/menu/tezli_yuksek_lisans_programlari-93">Tezli Yüksek Lisans</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/tr/menu/tezsiz_yuksek_lisans_programlari-95">Tezsiz Yüksek Lisans</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/tr/menu/doktora_programi-97">Doktora Programı</a></li>
                    <li><a href="https://bilsis.hacettepe.edu.tr" target="_blank">BİLSİS</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/tr/menu/akademik_takvimler-119">Akademik Takvim</a></li>
                </ul>
            </div>

            <!-- 3. Bağlantılar -->
            <div class="footer-col">
                <h3>Bağlantılar</h3>
                <ul class="footer-links">
                    <li><a href="https://hacettepe.edu.tr" target="_blank">Hacettepe Üniversitesi</a></li>
                    <li><a href="https://sosyalbilimler.hacettepe.edu.tr" target="_blank">Sosyal Bilimler Ens.</a></li>
                    <li><a href="https://oidb.hacettepe.edu.tr/" target="_blank">Öğrenci İşleri</a></li>
                    <li><a href="https://sksdb.hacettepe.edu.tr/bidbnew/index.php" target="_blank">SKS Daire Bşk.</a></li>
                    <li><a href="https://library.hacettepe.edu.tr/" target="_blank">Kütüphane</a></li>
                </ul>
            </div>

            <!-- 4. Sosyal Medya -->
            <div class="footer-col">
                <h3>Takip Edin</h3>
                <div class="footer-social-icons">
                    <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="https://twitter.com/Hacettepe1967" target="_blank"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
            <div class="footer-copyright">
                 ${new Date().getFullYear()} <strong>Hacettepe Üniversitesi İşletme Bölümü</strong>. Nizameddin Alyaprak Tarafından Tasarlanmıştır.
            </div>
            <div class="footer-bottom-links">
                <a href="#">Gizlilik</a>
            </div>
        </div>
    </footer>`;

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
    // --- YOL DUZELTME (Path Rewriting) ---
    // CMS icine gomuldugunde relative path'leri (orn: "videos/hero.mp4")
    // GitHub Pages veya Localhost URL'ine cevirir (orn: "https://username.github.io/repo/videos/hero.mp4")
    function rewriteMediaPaths(container, baseUrl) {
        if (!container) return;

        console.log("Medya yollari duzeltiliyor... BaseURL: " + baseUrl);

        // 1. Videolar (source tagleri)
        var sources = container.querySelectorAll('source');
        sources.forEach(function (source) {
            var src = source.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                // Eger basinda slash varsa kaldir (baseUrl sonuna ekleyecegiz)
                if (src.startsWith('/')) src = src.substring(1);
                source.src = baseUrl + '/' + src;
                console.log("Video source duzeltildi: " + source.src);
            }
        });

        // 2. Resimler (img tagleri)
        var images = container.querySelectorAll('img');
        images.forEach(function (img) {
            var src = img.getAttribute('src');
            // src varsa ve relative ise
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                if (src.startsWith('/')) src = src.substring(1);
                img.src = baseUrl + '/' + src;
                // console.log("Img src duzeltildi: " + img.src);
            }
        });

        // 3. Videolar (video tag direkt src)
        var videos = container.querySelectorAll('video');
        videos.forEach(function (video) {
            var src = video.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
                if (src.startsWith('/')) src = src.substring(1);
                video.src = baseUrl + '/' + src;
            }
        });
    }

})();
