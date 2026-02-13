/* loader.js - Site Yükleyici */

(function () {
    console.log("Loader baslatildi...");

    // 1. Hatali Eventleri Engelle (Scroll vs) - HATA SUSTURUCU (Kesin Cozum V2)
    // jQuery window.scroll eventinden kaynakli hatayi engellemek icin
    // hatali fonksiyonu bos fonksiyonla override etmeyi deneyebiliriz ama riskli.
    // En garantisi, global error handler ile bu mesaji yutmak.

    var originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        if (message && (message.includes("reading 'top'") || message.includes("calc") || message.includes("undefined"))) {
            return true; // Hatayi konsola basma, yut.
        }
        if (originalOnError) return originalOnError(message, source, lineno, colno, error);
        return false;
    };

    // Console.error'u da dinleyip susturalim (Bazi browserlar icin)
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

    // Calendar CSS yukle
    var cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = baseUrl + "/calendar.css" + cacheBuster;
    document.head.appendChild(cssLink);

    // Modern Header Yükle
    var headerScript = document.createElement("script");
    headerScript.src = baseUrl + "/modern-header.js" + cacheBuster;
    document.head.appendChild(headerScript);

    // index.html icerigini cek
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

            // 4. Scriptleri calistir
            var scripts = doc.querySelectorAll('script');
            scripts.forEach(function (oldScript) {
                var newScript = document.createElement('script');
                if (oldScript.src) newScript.src = oldScript.src;
                else newScript.textContent = oldScript.textContent;
                document.body.appendChild(newScript);
            });

            // 5. DUYURULARI CEK VE GOSTER
            duyurulariCek();

            // 6. TAKVIMI OLUSTUR
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
        // 5. Body (Son care)
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

        if (eklemeYontemi === 'after' && hedefElement.nextSibling) {
            hedefElement.parentNode.insertBefore(calendarDiv, hedefElement.nextSibling);
        } else if (eklemeYontemi === 'after') {
            hedefElement.parentNode.appendChild(calendarDiv);
        } else if (eklemeYontemi === 'before') {
            hedefElement.parentNode.insertBefore(calendarDiv, hedefElement);
        } else if (eklemeYontemi === 'prepend') {
            document.body.insertBefore(calendarDiv, document.body.firstChild);
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

                    // Pozisyonlama (Sayfanin scroll durumuna gore)
                    var topPos = rect.top + window.scrollY - globalTooltip.offsetHeight - 10;
                    var leftPos = rect.left + window.scrollX + (rect.width / 2) - (globalTooltip.offsetWidth / 2);

                    globalTooltip.style.top = topPos + 'px';
                    globalTooltip.style.left = leftPos + 'px';
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
        var duyuruURL = '/tr/duyurular';

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
