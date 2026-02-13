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

    var cacheBuster = '?v=' + new Date().getTime();

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

    // 5. Font Awesome (Eger yoksa)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        var fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fa);
    }

    // --- HTML ICERIGINI CEK ---
    fetch(baseUrl + '/index.html' + cacheBuster)
        .then(function (response) {
            return response.text();
        })
        .then(function (html) {
            // HTML'i parse et
            var parser = new DOMParser();
            var doc = parser.parseFromString(html, 'text/html');

            // 1. Basligi guncelle
            if (doc.title) document.title = doc.title;

            // 2. Stilleri ekle
            var styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(function (style) {
                document.head.appendChild(style);
            });

            // ⚡ KRITIK MUDAHALE: CMS'in kendi stil ve scriptlerini engelle
            // 1. CSS Dosyalari: style.css (Ana suclu), animate.css (Gereksiz hareketler)
            var blockedCssPatterns = ['templates/template3//css/style.css', 'templates/template3/css/style.css', 'animate.css'];
            var legacyStyles = document.querySelectorAll('link[rel="stylesheet"]');
            legacyStyles.forEach(function (link) {
                if (link.href && blockedCssPatterns.some(pattern => link.href.includes(pattern))) {
                    console.warn("ZARARLI CMS STILI SILINDI: " + link.href);
                    link.remove();
                }
            });

            // 2. JS Dosyalari: main.js (DOM'u elliyor olabilir)
            var blockedJsPatterns = ['templates/template3//js/main.js', 'templates/template3/js/main.js'];
            var legacyScripts = document.querySelectorAll('script');
            legacyScripts.forEach(function (script) {
                if (script.src && blockedJsPatterns.some(pattern => script.src.includes(pattern))) {
                    console.warn("ZARARLI CMS SCRIPTI SILINDI: " + script.src);
                    script.remove();
                }
            });

            // 3. Body icerigini degistir
            // ONCE: Gereksiz/Eski Elementleri Temizle (DOM Cerrahi Mudahale)
            var ghostHeader = doc.querySelector('.header');
            if (ghostHeader) ghostHeader.remove();

            var ghostTopBar = doc.querySelector('.top-bar');
            if (ghostTopBar) ghostTopBar.remove();

            var t3Wrapper = doc.querySelector('.t3-wrapper');
            if (t3Wrapper) {
                t3Wrapper.style.paddingTop = '0px';
                t3Wrapper.style.marginTop = '0px';
                t3Wrapper.style.border = 'none';
            }

            // Body uzerindeki padding/marginleri sifirla
            doc.body.style.padding = "0 !important";
            doc.body.style.margin = "0 !important";
            doc.body.style.border = "none !important";

            // Eski script etiketlerini temizle (ozellikle eski slider vs varsa)
            var oldScripts = doc.querySelectorAll('script');
            oldScripts.forEach(s => {
                if (s.src && (s.src.includes('jquery') || s.src.includes('bootstrap'))) return; // Temel libler kalsin
                // Digerlerini pasifize etme potansiyeli? Simdilik kalsin, sadece gorunur elementleri ucuralim.
            });

            document.body.innerHTML = '';
            document.body.appendChild(doc.body);

            // 4. HEADER ve TAKVIMI OLUSTUR (Birlestirildi)
            headerVeTakvimOlustur();

            // 5. Scriptleri calistir
            var scripts = doc.querySelectorAll('script');
            scripts.forEach(function (oldScript) {
                var newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                else newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            // 6. DUYURULARI CEK VE GOSTER
            duyurulariCek();

            // 7. Render Calendar Data (Veriyi cekip render et)
            setTimeout(takvimVerisiniCek, 500);

            // Yukleme ekranini kaldir
            var loading = document.getElementById('yukleniyor');
            if (loading) loading.style.display = 'none';

            console.log("Site basariyla yuklendi!");
        })
        .catch(function (err) {
            console.error("Site yuklenirken hata olustu:", err);
            document.body.innerHTML = '<h1>Hata Olustu</h1><p>' + err + '</p>';
        });

    // --- HEADER VE TAKVIM OLUSTURMA ---
    function headerVeTakvimOlustur() {
        console.log("Modern Header ve Takvim olusturuluyor...");

        // 1. Menu Ust (Social & Links) - Mobil uyumluluk icin d-none kaldirildi
        var menuUstHTML = `
            <div class="menu_ust" style="width: 100%; display: flex; justify-content: flex-end; background: #fafafa; border-bottom: none;">
                <div class="container" style="display: flex; justify-content: flex-end; align-items: center; max-width: 1200px;">
                    <div class="float-right ml-3 social-icons" style="margin-right: auto; margin-left:10px;">
                        <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    </div>
                    <div class="float-right top-links" style="margin-left: 20px;">
                        <a href="https://hacettepe.edu.tr" target="_blank">Hacettepe</a> <span style="color:#ddd;">|</span>
                        <a href="https://bilsis.hacettepe.edu.tr" target="_blank">BİLSİS</a> <span style="color:#ddd;">|</span>
                        <a href="https://isletme.hacettepe.edu.tr/en">EN</a>
                    </div>
                </div>
            </div>`;

        // 2. Takvim HTML (Arada)
        var calendarHTML = `
            <div id="calendar-container">
                <div id="calendar-strip"></div>
            </div>`;

        // 3. Menu Genel (Navigasyon) - Mobil icin basit bir stil eklendi
        var menuGenelHTML = `
            <div class="menu_genel" style="width: 100%; border-bottom: none;">
                <div class="hi-nav-container">
                    <button class="mobile-menu-toggle d-lg-none" onclick="document.querySelector('.hi-main-nav').classList.toggle('active')" style="display: none; width:100%; padding:10px; background:#ac232d; color:white; border:none;">MENÜ</button>
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
            ${menuGenelHTML}
        </div>`;

        // Varsa eski headeri gizle
        var oldHeader = document.querySelector('.header');
        if (oldHeader) oldHeader.style.display = 'none';

        // Yeni headeri body'nin en basina ekle
        document.body.insertAdjacentHTML('afterbegin', fullHeaderHTML);

        // Mobile menu toggle style
        var style = document.createElement('style');
        style.innerHTML = `
            @media (max-width: 991px) {
                .mobile-menu-toggle { display: block !important; }
                .hi-main-nav { display: none; flex-direction: column; width: 100%; }
                .hi-main-nav.active { display: flex; }
                .hi-nav-container { flex-direction: column; }
                .hi-nav-item { width: 100%; border-bottom: 1px solid #eee; }
                .hi-nav-link { padding: 15px; }
            }
        `;
        document.head.appendChild(style);
    }

    function takvimVerisiniCek() {
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
        var gunIsimleriEN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        var currentMonth = bugun.getMonth();
        var daysData = []; // Event listener eklemek icin datayi tutalim

        for (var i = 0; i < 30; i++) {
            var tempDate = new Date(bugun);
            tempDate.setDate(bugun.getDate() + i);

            var dayMonth = tempDate.getMonth();
            var dayDate = tempDate.getDate();
            var dayIndex = tempDate.getDay();

            if (dayMonth !== currentMonth) {
                // Ay degisimi algilandi, bunu gunun icine etiket olarak ekleyecegiz
                currentMonth = dayMonth;
                var monthName = ayIsimleri[dayMonth];
                // Ekstra HTML
                gunlerHTML += `
                <div id="${dayId}" class="calendar-day ${eventClass}">
                    <span class="month-label-floating">${monthName}</span>
                    <span class="day-number">${dayDate}</span>
                    <span class="day-name">${gunIsimleriEN[dayIndex]}</span>
                    <div class="event-dot"></div>
                </div>
                `;
            } else {
                // Standart gun
                gunlerHTML += `
                <div id="${dayId}" class="calendar-day ${eventClass}">
                    <span class="day-number">${dayDate}</span>
                    <span class="day-name">${gunIsimleriEN[dayIndex]}</span>
                    <div class="event-dot"></div>
                </div>
                `;
            }
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
})();
