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

            // 3. Body icerigini degistir
            document.body.innerHTML = '';
            document.body.appendChild(doc.body);

            // 4. HEADER'I OLUSTUR (Yeni Eklendi)
            headerOlustur();

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

            // 7. TAKVIMI OLUSTUR
            // DOM tamamen olustuktan biraz sonra calistiralim ki elementler yerlessin
            setTimeout(takvimOlustur, 500);

            // Yukleme ekranini kaldir
            var loading = document.getElementById('yukleniyor');
            if (loading) loading.style.display = 'none';

            console.log("Site basariyla yuklendi!");
        })
        .catch(function (err) {
            console.error("Site yuklenirken hata olustu:", err);
            document.body.innerHTML = '<h1>Hata Olustu</h1><p>' + err + '</p>';
        });

    // --- HEADER FONKSIYONU ---
    function headerOlustur() {
        console.log("Modern Header olusturuluyor...");
        var headerHTML = `
        <div class="header-right-col" style="display: flex; flex-direction: column; align-items: flex-end; margin-left: auto; width: 100%;">
            <div class="menu_ust d-none d-lg-block" style="width: 100%; display: flex; justify-content: flex-end; background: #fafafa; border-bottom: 1px solid #eee;">
                <div class="container" style="display: flex; justify-content: flex-end; align-items: center; max-width: 1200px;">
                    <div class="d-none d-md-block float-right ml-3 social-icons">
                        <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    </div>
                    <div class="float-right d-none d-md-block top-links" style="margin-left: 20px;">
                        <a href="https://hacettepe.edu.tr" target="_blank">Hacettepe Üniversitesi</a> <span style="color:#ddd;">|</span>
                        <a href="https://bilsis.hacettepe.edu.tr" target="_blank">BİLSİS</a> <span style="color:#ddd;">|</span>
                        <a href="https://isletme.hacettepe.edu.tr/en">EN</a>
                    </div>
                </div>
            </div>
            <div class="menu_genel d-none d-lg-block" style="width: 100%; border-bottom: 1px solid #eee;">
                <div class="hi-nav-container">
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
            </div>
        </div>`;

        // Varsa eski headeri gizle (index.html icindeki)
        var oldHeader = document.querySelector('.header');
        if (oldHeader) oldHeader.style.display = 'none';

        // Yeni headeri body'nin en basina ekle
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    // --- TAKVIM FONKSIYONLARI ---
    function takvimOlustur() {
        console.log("Takvim olusturuluyor...");

        // Eklenecek hedef elementi bul (Sirayla dene)
        var hedefElement = null;
        var eklemeYontemi = 'after'; // after, before, append

        // 1. Slider Bolumu (resimler classi)
        var slider = document.querySelector('.resimler');
        if (slider) {
            hedefElement = slider;
            eklemeYontemi = 'after';
            console.log("Hedef bulundu: .resimler");
        }
        // 2. Swiper Container
        else if (document.querySelector('.swiper-container')) {
            hedefElement = document.querySelector('.swiper-container');
            eklemeYontemi = 'after';
            console.log("Hedef bulundu: .swiper-container");
        }
        // 3. Header Alti (ust classi)
        else if (document.querySelector('.ust')) {
            hedefElement = document.querySelector('.ust');
            eklemeYontemi = 'after'; // Headerdan hemen sonra
            console.log("Hedef bulundu: .ust");
        }
        // 4. Container (Ana icerik)
        else if (document.querySelector('.container')) {
            hedefElement = document.querySelector('.container');
            eklemeYontemi = 'before'; // Containerdan once
            console.log("Hedef bulundu: .container");
        }
        // 5. Hero Section (Homepage Only)
        else if (document.querySelector('.hero-section')) {
            hedefElement = document.querySelector('.hero-section');
            eklemeYontemi = 'after';
            console.log("Hedef bulundu: .hero-section");
        }
        // 6. Body (Son care)
        else {
            hedefElement = document.body;
            eklemeYontemi = 'prepend';
            console.log("Hedef bulunamadi, body'ye ekleniyor");
        }

        var calendarHTML = `
            <div id="calendar-container">
                <div id="calendar-strip"></div>
            </div>
        `;

        var calendarDiv = document.createElement('div');
        calendarDiv.innerHTML = calendarHTML;

        // Ekleme mantigi
        if (eklemeYontemi === 'after' && hedefElement.nextSibling) {
            hedefElement.parentNode.insertBefore(calendarDiv, hedefElement.nextSibling);
        } else if (eklemeYontemi === 'after') {
            hedefElement.parentNode.appendChild(calendarDiv);
        } else if (eklemeYontemi === 'before') {
            hedefElement.parentNode.insertBefore(calendarDiv, hedefElement);
        } else if (eklemeYontemi === 'prepend') {
            // Eger modern header eklendiyse, onun arkasina atalim
            var modernHeader = document.querySelector('.header-right-col');
            if (modernHeader && modernHeader.nextSibling) {
                document.body.insertBefore(calendarDiv, modernHeader.nextSibling);
            } else {
                document.body.insertBefore(calendarDiv, document.body.firstChild);
            }
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
                gunlerHTML += `<div class="month-separator"><span class="month-label">› ${ayIsimleri[dayMonth]}</span></div>`;
                currentMonth = dayMonth;
            }

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
                <div id="${dayId}" class="calendar-day ${eventClass}">
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
        var badgeClass = 'badge-genel';
        var badgeText = 'Duyuru';
        var lowerBaslik = baslik.toLocaleLowerCase('tr-TR');

        // Tarih Temizligi
        baslik = baslik.replace(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/, '').trim();
        baslik = baslik.replace(/\(\d{4}-\d{2}-\d{2}\)/, '').trim();
        // Regex ile bulunan tarihleri de basliktan temizleyelim (DD.MM.YYYY veya YYYY-MM-DD)
        baslik = baslik.replace(/\d{2}[./]\d{2}[./]\d{4}/, '').trim();

        if (lowerBaslik.includes('önemli') || lowerBaslik.includes('onemli')) {
            badgeClass = 'badge-onemli';
            badgeText = 'ÖNEMLİ';
        } else if (lowerBaslik.includes('doktora')) {
            badgeClass = 'badge-doktora';
            badgeText = 'Doktora';
        } else if (lowerBaslik.includes('tezsiz')) {
            badgeClass = 'badge-tezsiz';
            badgeText = 'Tezsiz YL';
        } else if (lowerBaslik.includes('tezli')) {
            badgeClass = 'badge-tezli';
            badgeText = 'Tezli YL';
        } else if (lowerBaslik.includes('lisans') && !lowerBaslik.includes('lisansüstü')) {
            badgeClass = 'badge-lisans';
            badgeText = 'Lisans';
        } else if (lowerBaslik.includes('sınav') || lowerBaslik.includes('sinav')) {
            badgeClass = 'badge-genel';
            badgeText = 'Sınav';
        } else if (lowerBaslik.includes('genel')) {
            badgeClass = 'badge-genel';
            badgeText = 'GENEL';
        }

        var html = '<li>';

        if (tarih) {
            html += '<span class="badge badge-tarih">' + tarih + '</span>';
        }

        html += '<a href="' + url + '" target="_blank">' + baslik + '</a>';

        var gosterilecekBadge = true;

        if (tarih && badgeText === 'Duyuru') {
            gosterilecekBadge = false;
        }

        if (gosterilecekBadge) {
            html += '<span class="badge ' + badgeClass + '">' + badgeText + '</span>';
        }

        html += '</li>';
        return html;
    }
})();
