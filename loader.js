/* loader.js - Site Yükleyici */

(function () {


    // 0. FAILSAFE: Eger loader bir sebepten cokerse, 2.5 saniye sonra sayfayi zorla goster.
    setTimeout(function () {
        var antiFlicker = document.getElementById('anti-flicker-style');
        if (antiFlicker) antiFlicker.remove();
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        document.documentElement.classList.remove('hi-loading');
        // ("Failsafe: Sayfa zorla görünür yapıldı.");
    }, 2500);

    // 1. Hatali Eventleri Engelle (Scroll vs) - HATA SUSTURUCU (Kesin Cozum V2)
    var originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
        if (message && (message.includes("reading 'top'") || message.includes("calc") || message.includes("undefined") || message.includes("SyntaxError"))) {
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



    var cacheBuster = '?v=1.2'; // Cache busting icin versiyon guncellendi

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
    // --- SAYFA TURU TESPITI (Guncellendi: Query Parametreleri Destegi) ---
    var fullUrl = window.location.href.toLowerCase();
    var path = window.location.pathname.toLowerCase().trim();

    // Query String kontrolu (Local Preview icin: ?page=yonetim gibi)
    var search = window.location.search.toLowerCase();

    // --- DIL TESPITI ---
    var isEnglish = path.startsWith('/en') || path.startsWith('/en/');
    var contentFolder = isEnglish ? '/en' : '';

    // 1. Anasayfa Tespiti
    var isHomePage = path === '/tr' || path === '/tr/' || path === '/en' || path === '/en/' || path === '/' || path.endsWith('/index.html') || path.endsWith('/index.php') || fullUrl.includes('preview.html') || path.includes('denemesayfasi');
    // Eger spesifik bir sayfa isteniyorsa anasayfa degildir
    if (search.includes('page=')) isHomePage = false;

    // 2. Ozel Sayfa Tespiti (Hem URL path hem de Query String icinde aranir)
    var isAboutPage = path.includes('bolum_hakkinda-75') || path.includes('about_us-145') || path.includes('about.html') || search.includes('page=about') || search.includes('page=bolum_hakkinda');
    var isManagementPage = path.includes('yonetim-77') || path.includes('administration-147') || path.includes('management.html') || search.includes('page=management') || search.includes('page=yonetim');
    var isAcademicStaffPage = path.includes('ogretim_uyelerigorevlileri') || path.includes('academic_staff-139') || path.includes('academic_staff.html') || search.includes('page=academic') || search.includes('page=ogretim_uyelerigorevlileri') || path.includes('ogretim-uyeleri-ve-gorevlileri') || path.includes('211');
    var isResearchStaffPage = path.includes('arastirma_gorevlileri') || path.includes('research_assistants-141') || path.includes('research_assistants.html') || search.includes('page=research') || search.includes('page=arastirma_gorevlileri') || path.includes('69');
    var isUndergraduatePage = path.includes('undergraduate-115') || path.includes('undergraduate.html') || search.includes('page=undergraduate');
    var isThesisGraduatePage = path.includes('tezli_yuksek_lisans-117') || path.includes('graduate_thesis.html') || search.includes('page=graduate_thesis');
    var isNonThesisGraduatePage = path.includes('tezsiz_yuksek_lisans-213') || path.includes('graduate_non_thesis.html') || search.includes('page=graduate_non_thesis');
    var isPhDPage = path.includes('doktora-215') || path.includes('phd.html') || search.includes('page=phd');
    var isPhDProgramPage = path.includes('doktora_programi-97') || path.includes('phd_program-135') || path.includes('phd_program.html') || search.includes('page=phd_program');
    var isMinorProgramPage = path.includes('yan_dal_programi-99') || path.includes('minor_program-189') || path.includes('minor_program.html') || search.includes('page=minor_program');
    var isGraduateThesisProgramPage = path.includes('tezli_yuksek_lisans_programlari-93') || path.includes('graduate_programs_thesis-131') || path.includes('graduate_thesis_program.html') || search.includes('page=graduate_thesis_program');
    var isGraduateNonThesisProgramPage = path.includes('tezsiz_yuksek_lisans_programlari-95') || path.includes('graduate_programs_nonthesis-133') || path.includes('graduate_nonthesis_program.html') || search.includes('page=graduate_nonthesis_program');
    var isBachelorProgramPage = path.includes('lisans_programi-91') || path.includes('undergraduate_program-129') || path.includes('bachelor_program.html') || search.includes('page=bachelor_program');
    var isErasmusPage = path.includes('erasmus-103') || path.includes('erasmus-193') || path.includes('erasmus_program.html') || search.includes('page=erasmus');
    var isFarabiPage = path.includes('farabi-105') || path.includes('farabi-195') || path.includes('farabi_program.html') || search.includes('page=farabi');
    var isMevlanaPage = path.includes('mevlana-107') || path.includes('mevlana-197') || path.includes('mevlana_program.html') || search.includes('page=mevlana');
    var isInternshipPage = path.includes('staj-111') || path.includes('internship-199') || path.includes('internship.html') || search.includes('page=internship');
    var isFAQPage = path.includes('lisans_programi_ogrencileri_icin_si-121') || path.includes('frequently_asked_questions_for_unde-179') || path.includes('faq.html') || search.includes('page=faq');
    var isRequiredFormsPage = path.includes('gerekli_formlar_ve_belgeler-173') || path.includes('required_forms_and_documents-175') || path.includes('required_forms.html') || search.includes('page=required_forms');
    var isEventsPage = path.includes('etkinlikler-171') || path.includes('events-177') || path.includes('events.html') || search.includes('page=events');
    var isAnnouncementsPage = path.includes('duyurular') || path.includes('duyurudeneme') || path.includes('announcements.html') || search.includes('page=announcements');
    var isContactPage = path.includes('iletisim-13') || path.includes('contact_us-149') || path.includes('contact.html') || search.includes('page=contact');
    var isAcademicCalendarPage = path.includes('akademik_takvimler-119') || path.includes('academic_calendar-185') || path.includes('academic_calendar.html') || search.includes('page=academic_calendar');
    var isAdminStaffPage = path.includes('idari_personel') || path.includes('department_staff-183') || path.includes('administrative_staff.html') || search.includes('page=admin') || search.includes('page=idari_personel');

    // Eger URL'de 'preview_subpage' varsa kesinlikle alt sayfadir (Test icin)
    if (path.includes('preview_subpage')) isHomePage = false;


    // --- STANDALONE MODE CHECK (Dosyanin kendisi acildiysa fetch yapma) ---
    // Ornegin: management.html dogrudan acildiysa, kendini fetch etmesin.
    var isStandalone = false;
    if (path.endsWith('management.html') && isManagementPage) isStandalone = true;
    if (path.endsWith('academic_staff.html') && isAcademicStaffPage) isStandalone = true;
    if (path.endsWith('about.html') && isAboutPage) isStandalone = true;
    if (path.endsWith('research_assistants.html') && isResearchStaffPage) isStandalone = true;
    if (path.endsWith('administrative_staff.html') && isAdminStaffPage) isStandalone = true;
    if (path.endsWith('undergraduate.html') && isUndergraduatePage) isStandalone = true;
    if (path.endsWith('graduate_thesis.html') && isThesisGraduatePage) isStandalone = true;
    if (path.endsWith('graduate_non_thesis.html') && isNonThesisGraduatePage) isStandalone = true;
    if (path.endsWith('phd.html') && isPhDPage) isStandalone = true;
    if (path.endsWith('phd_program.html') && isPhDProgramPage) isStandalone = true;
    if (path.endsWith('minor_program.html') && isMinorProgramPage) isStandalone = true;
    if (path.endsWith('graduate_thesis_program.html') && isGraduateThesisProgramPage) isStandalone = true;
    if (path.endsWith('graduate_nonthesis_program.html') && isGraduateNonThesisProgramPage) isStandalone = true;
    if (path.endsWith('bachelor_program.html') && isBachelorProgramPage) isStandalone = true;
    if (path.endsWith('erasmus_program.html') && isErasmusPage) isStandalone = true;
    if (path.endsWith('farabi_program.html') && isFarabiPage) isStandalone = true;
    if (path.endsWith('mevlana_program.html') && isMevlanaPage) isStandalone = true;
    if (path.endsWith('internship.html') && isInternshipPage) isStandalone = true;
    if (path.endsWith('faq.html') && isFAQPage) isStandalone = true;
    if (path.endsWith('required_forms.html') && isRequiredFormsPage) isStandalone = true;
    if (path.endsWith('events.html') && isEventsPage) isStandalone = true;
    if (path.endsWith('announcements.html') && isAnnouncementsPage) isStandalone = true;
    if (path.endsWith('contact.html') && isContactPage) isStandalone = true;
    if (path.endsWith('academic_calendar.html') && isAcademicCalendarPage) isStandalone = true;

    // --- HTML ICERIGINI CEK (SADECE ANASAYFA VEYA OZEL SAYFALAR ISE) ---
    if (window.OFFLINE_MODE || isStandalone) {
        // ("Offline/Standalone Modu Aktif: HTML cekme atlaniyor.");
        // Loader'in stil ve scriptleri enjekte etmesi icin baslat'i cagiriyoruz.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                baslat(document, false);
            });
        } else {
            baslat(document, false);
        }
    } else if (isHomePage) {
        // ANASAYFA: index.html'i cek ve body'yi degistir
        fetch(baseUrl + contentFolder + '/index.html' + cacheBuster)
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true); // true = Disaridan HTML geldi
            })
            .catch(function (err) {
                if (!window.location.protocol.includes('file')) {
                    document.body.innerHTML = '<h1>Hata Olustu</h1><p>' + err + '</p>';
                }
            });
    } else if (isAboutPage) {
        // HAKKINDA SAYFASI: about.html'i cek ve body'yi degistir
        // ("Hakkinda sayfasi yukleniyor...");
        fetch(baseUrl + contentFolder + '/about.html' + cacheBuster)
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true); // true = Disaridan HTML geldi (Ayni anasayfa mantigiyla)
            })
            .catch(function (err) {
            });
    } else if (isManagementPage) {
        // YONETIM SAYFASI: management.html'i cek ve body'yi degistir
        fetch(baseUrl + contentFolder + '/management.html' + cacheBuster)
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
            .catch(function (err) {
                document.body.innerHTML = '<div class="container" style="margin-top:150px; text-align:center;"><h3>Yükleme Hatası</h3><p>Yönetim sayfası yüklenemedi.<br><small>' + err + '</small></p></div>';
                var antiFlicker = document.getElementById('anti-flicker-style');
                if (antiFlicker) antiFlicker.remove();
                document.documentElement.style.visibility = 'visible';
                document.documentElement.style.opacity = '1';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            });
    } else if (isAcademicStaffPage) {
        // OGRETIM UYELERI SAYFASI: academic_staff.html'i cek ve body'yi degistir
        fetch(baseUrl + contentFolder + '/academic_staff.html' + cacheBuster)
            .then(function (response) {
                return response.text();
            })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
            .catch(function (err) {
                document.body.innerHTML = '<div class="container" style="margin-top:150px; text-align:center;"><h3>Yükleme Hatası</h3><p>İçerik yüklenemedi. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.<br><small>' + err + '</small></p></div>';
                var antiFlicker = document.getElementById('anti-flicker-style');
                if (antiFlicker) antiFlicker.remove();
                document.documentElement.style.visibility = 'visible';
                document.documentElement.style.opacity = '1';
                document.body.style.visibility = 'visible';
                document.body.style.opacity = '1';
            });
    } else if (isResearchStaffPage) {
        // ARASTIRMA GOREVLILERI SAYFASI
        fetch(baseUrl + contentFolder + '/research_assistants.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isAdminStaffPage) {
        // IDARI PERSONEL SAYFASI
        fetch(baseUrl + contentFolder + '/administrative_staff.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isUndergraduatePage) {
        // LISANS DERS PROGRAMI SAYFASI
        fetch(baseUrl + contentFolder + '/undergraduate.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isThesisGraduatePage) {
        fetch(baseUrl + contentFolder + '/graduate_thesis.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isNonThesisGraduatePage) {
        fetch(baseUrl + contentFolder + '/graduate_non_thesis.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isPhDPage) {
        fetch(baseUrl + contentFolder + '/phd.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isPhDProgramPage) {
        fetch(baseUrl + contentFolder + '/phd_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isMinorProgramPage) {
        fetch(baseUrl + contentFolder + '/minor_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isGraduateThesisProgramPage) {
        fetch(baseUrl + contentFolder + '/graduate_thesis_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isGraduateNonThesisProgramPage) {
        fetch(baseUrl + contentFolder + '/graduate_nonthesis_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isErasmusPage) {
        fetch(baseUrl + contentFolder + '/erasmus_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isFarabiPage) {
        fetch(baseUrl + contentFolder + '/farabi_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isMevlanaPage) {
        fetch(baseUrl + contentFolder + '/mevlana_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isInternshipPage) {
        fetch(baseUrl + contentFolder + '/internship.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isFAQPage) {
        fetch(baseUrl + contentFolder + '/faq.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isRequiredFormsPage) {
        fetch(baseUrl + contentFolder + '/required_forms.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isEventsPage) {
        fetch(baseUrl + contentFolder + '/events.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isAnnouncementsPage) {
        // --- OZEL DURUM: Duyurular Sayfasi ---
        var annState = { data: [], currentPage: 1, itemsPerPage: 15, currentFilter: 'all' };

        function loadAnnouncementsPage() {
            var sourceURL = '/tr/duyurular' + cacheBuster;
            fetch(sourceURL)
                .then(res => res.text())
                .then(html => {
                    var parser = new DOMParser();
                    var sourceDoc = parser.parseFromString(html, 'text/html');
                    var anaIcerik = sourceDoc.querySelector('.col-lg-9') || sourceDoc.querySelector('.icerik') || sourceDoc.body;
                    var items = anaIcerik.querySelectorAll('tr, li, .announcement-item');
                    if (items.length === 0) items = anaIcerik.querySelectorAll('a');

                    annState.data = [];
                    var blackList = ["duyurular-1", "tezli_yuksek_lisans_programlar-33", "lisans_programi-35", "tezsiz_yuksek_lisans_programla-37", "doktora_programi-39", "/show/"];

                    items.forEach(function (node) {
                        var link = node.tagName === 'A' ? node : node.querySelector('a');
                        if (!link) return;
                        var title = link.textContent.trim();
                        var url = link.getAttribute('href') || "";

                        // Exclusion check
                        if (!url || url.includes('javascript') || title.length < 5) return;
                        for (var j = 0; j < blackList.length; j++) {
                            if (url.includes(blackList[j])) return;
                        }

                        // Date extraction (Standard + Secondary + Span)
                        var date = "";
                        var tarihSpan = node.querySelector('.tarih, .date, .announcement-date');
                        if (tarihSpan) date = tarihSpan.textContent.trim().split(' ')[0];

                        if (!date) {
                            var m = node.textContent.match(/(\d{4})-(\d{2})-(\d{2})/) || node.textContent.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                            if (m) date = m[0];
                        }

                        if (!date && url) { // Try to extract from URL if possible
                            var urlMatch = url.match(/\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//);
                            if (urlMatch) date = urlMatch[3] + "." + urlMatch[2] + "." + urlMatch[1];
                        }

                        // Tags & Title Clean up
                        var tags = [];
                        var lt = title.toLocaleLowerCase('tr-TR');

                        // Categorization (Priority based to avoid mislabeling)
                        if (lt.includes('onemli') || lt.includes('önemli')) tags.push('ÖNEMLİ');

                        if (lt.includes('tezsiz')) tags.push('TEZSİZ YL');
                        else if (lt.includes('tezli') && (lt.includes('yüksek') || lt.includes('yl'))) tags.push('TEZLİ YL');
                        else if (lt.includes('doktora')) tags.push('DOKTORA');
                        else if (lt.includes('lisans') && !lt.includes('lisansüstü')) tags.push('LİSANS');

                        if (tags.length === 0) tags.push('Genel');

                        // Clean title from identified tags to avoid redundancy
                        tags.forEach(t => {
                            var tagLower = t.toLocaleLowerCase('tr-TR');
                            // Remove the tag text from the title if it's present
                            // Using a regex with 'gi' for global and case-insensitive replacement
                            // and ensuring whole word match if possible to avoid partial replacements.
                            // For simplicity, a direct replace is used here, but more robust regex could be applied.
                            if (title.toLocaleLowerCase('tr-TR').includes(tagLower)) {
                                // Create a regex that matches the tag word, optionally followed by punctuation or space
                                // and handles Turkish characters.
                                // This is a basic attempt; a more sophisticated regex might be needed for all cases.
                                var regex = new RegExp(`\\b${t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
                                title = title.replace(regex, '').trim();
                                // Remove common separators left behind
                                title = title.replace(/^-?\s*[-—–:]?\s*/, '').trim(); // leading dash/colon
                                title = title.replace(/\s*[-—–:]?\s*$/, '').trim(); // trailing dash/colon
                            }
                        });

                        annState.data.push({ title: title, url: url, date: date, tags: tags });
                    });

                    return fetch(baseUrl + contentFolder + '/announcements.html' + cacheBuster);
                })
                .then(res => res.text())
                .then(html => {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(html, 'text/html');
                    baslat(doc, true);
                    setupAnnUI();
                })
        }

        function setupAnnUI() {
            // Filter listeners
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.onclick = function () {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    annState.currentFilter = btn.getAttribute('data-filter');
                    annState.currentPage = 1;
                    updateAnnDisplay();
                };
            });
            updateAnnDisplay();
        }

        function updateAnnDisplay() {
            var filtered = annState.data.filter(item => {
                if (annState.currentFilter === 'all') return true;
                return item.tags.some(t => t.toUpperCase().includes(annState.currentFilter.toUpperCase()));
            });

            var totalPages = Math.ceil(filtered.length / annState.itemsPerPage);
            var start = (annState.currentPage - 1) * annState.itemsPerPage;
            var paginated = filtered.slice(start, start + annState.itemsPerPage);

            var listEl = document.getElementById('ann-display-list');
            if (!listEl) return;

            if (paginated.length === 0) {
                listEl.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">Duyuru bulunamadı.</div>';
            } else {
                listEl.innerHTML = paginated.map(item => {
                    var tagsHTML = item.tags.map(tag => {
                        var cls = 'tag-genel';
                        var t = tag.toUpperCase();
                        if (t.includes('ÖNEMLİ')) cls = 'tag-onemli';
                        else if (t.includes('LİSANS')) cls = 'tag-lisans';
                        else if (t.includes('TEZLİ')) cls = 'tag-tezli-yl';
                        else if (t.includes('TEZSİZ')) cls = 'tag-tezsiz-yl';
                        else if (t.includes('DOKTORA')) cls = 'tag-doktora';
                        return `<span class="ann-tag ${cls}">${tag}</span>`;
                    }).join('');

                    return `<a href="${item.url}" class="ann-card">
                        <div class="ann-card-left">
                            <div class="ann-card-title">${item.title}</div>
                            <div class="ann-card-meta">
                                <span><i class="far fa-calendar-alt"></i> ${item.date}</span>
                                <div style="display:flex; gap:5px;">${tagsHTML}</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
                    </a>`;
                }).join('');
            }
            renderAnnPagination(totalPages);
        }

        function renderAnnPagination(total) {
            var pagEl = document.getElementById('ann-pagination');
            if (!pagEl || total <= 1) { if (pagEl) pagEl.innerHTML = ''; return; }

            var html = `<button class="page-btn" id="ann-prev" ${annState.currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
            for (var i = 1; i <= total; i++) {
                if (i === 1 || i === total || (i >= annState.currentPage - 2 && i <= annState.currentPage + 2)) {
                    html += `<button class="page-btn ${i === annState.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                } else if (i === annState.currentPage - 3 || i === annState.currentPage + 3) {
                    html += `<span style="color:#cbd5e1">...</span>`;
                }
            }
            html += `<button class="page-btn" id="ann-next" ${annState.currentPage === total ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
            pagEl.innerHTML = html;

            pagEl.querySelectorAll('[data-page]').forEach(btn => {
                btn.onclick = function () { annState.currentPage = parseInt(btn.dataset.page); updateAnnDisplay(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
            });
            var prev = document.getElementById('ann-prev'), next = document.getElementById('ann-next');
            if (prev) prev.onclick = function () { if (annState.currentPage > 1) { annState.currentPage--; updateAnnDisplay(); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
            if (next) next.onclick = function () { if (annState.currentPage < total) { annState.currentPage++; updateAnnDisplay(); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
        }

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAnnouncementsPage);
        else loadAnnouncementsPage();

    } else if (isContactPage) {
        fetch(baseUrl + contentFolder + '/contact.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isBachelorProgramPage) {
        fetch(baseUrl + contentFolder + '/bachelor_program.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else if (isAcademicCalendarPage) {
        fetch(baseUrl + contentFolder + '/academic_calendar.html' + cacheBuster)
            .then(function (response) { return response.text(); })
            .then(function (html) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                baslat(doc, true);
            })
    } else {
        // ALT SAYFA: Mevcut icerigi koru, sadece susle
        // ("Alt Sayfa Modu: Mevcut icerik korunaraj modernlestirilecek.");
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

            // Scriptleri yeniden calistir
            var scripts = doc.querySelectorAll('script');
            scripts.forEach(function (oldScript) {
                // Loader.js'i tekrar yukleme (Recursive dongu ve 404 hatasini onle)
                if (oldScript.src && oldScript.src.includes('loader.js')) return;

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
                // Layout Onarimi: Eger mainContent bir col-lg-9 icindeyse, onu col-lg-12 yap
                var parentCol = mainContent.closest('.col-lg-9');
                if (parentCol) {
                    parentCol.classList.remove('col-lg-9');
                    parentCol.classList.add('col-lg-12');
                    parentCol.style.width = '100%';
                    parentCol.style.flex = '0 0 100%';
                    parentCol.style.maxWidth = '100%';
                }

                // Eger mainContent dogrudan bir container icindeyse ve ust bosluk varsa
                var mainContainer = mainContent.closest('.container');
                if (mainContainer) {
                    mainContainer.style.marginTop = '0';
                    mainContainer.style.paddingTop = '0';
                }

                // CMS'in verdigi ana container stili varsa onu ez
                if (mainContent.classList.contains('main-content')) {
                    mainContent.style.marginTop = '0';
                }

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
        headerVeTakvimOlustur(isEnglish);
        duyurulariCek(); // Duyurular alt sayfalarda da gozuksun mu? Genelde alt sayfalarda sidebar olabilir.
        // Istege bagli: Alt sayfalarda duyuru listesi olmasin derseniz if(isFetchedContent) icine alin.

        footerOlustur(isEnglish);

        // 5. Takvim Verisi
        setTimeout(takvimVerisiniCek, 500);

        // Yukleme ekrani temizle
        var loading = document.getElementById('yukleniyor');
        if (loading) loading.style.display = 'none';

        // EK GUVENLIK: Body'nin gorunur oldugundan emin ol
        var antiFlicker = document.getElementById('anti-flicker-style');
        if (antiFlicker) antiFlicker.remove();
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        document.documentElement.classList.remove('hi-loading');
    }

    function temizleVeModernlestir(doc, isFetchedContent) {
        // 0. ANINDA GIZLEME (Anti-Flicker & Layout Reset)
        // CMS'in kendi layout yapisini (sidebar, header, footer vb) CSS ile zorla gizle.
        // Bu, JS ile element silmekten daha hizli ve guvenilirdir.
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            /* SKULET VE ESKI YAPIYI GIZLE */
            .header, .top-bar, #sp-header, #sp-top-bar, #sp-bottom, footer, #footer,
            #sp-left, #sp-right, .sidebar, .sidebar-nav, .module, .moduletable, .sp-module, .t3-module,
            #aside, .t3-sidebar, .t3-mainbody, #t3-mainbody, .t3-footer,
            .breadcrumb, .breadcrumbs, .sp-breadcrumb,
            /* User Reported Legacy Elements */
            .mobile-nav-toggle, .ust, .site_baslangic, .resimler, .mobile-nav,
            .mobile-nav-overly, #section_hu_footer, .menu_sol, .mobil_menu_logo, .menu_title_s,

            /* Ozel: CMS icerik wraperlari (Sadece bizim injected content kalsin) */
            /* Dikkat: .item-page veya .blog'u gizlersek kendi icerigimiz de gider. */
            /* O yuzden sadece onlari layouttan kurtarmaya calisiyoruz */

            /* GLOBAL SIFIRLAMA */
            body {
                background: #fff !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important; /* Bazen flex/grid yapisi bozar */
            }

            /* Kapsayicilari Etkisizlestir */
            .t3-wrapper, .body-innerwrapper, #sp-page-builder, .sp-main-body {
                background: transparent !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                width: 100% !important;
                max-width: 100% !important;
                display: block !important;
            }

            /* Eger sidebar grid seklindeyse (col-md-3 vb) onlari gizle */
            .col-lg-3.d-none.d-sm-block, .col-lg-3 {
                display: none !important;
                width: 0 !important;
                flex: none !important;
                max-width: 0 !important;
            }

            /* Main Content genislemesi */
            .col-lg-9 {
                width: 100% !important;
                flex: 0 0 100% !important;
                max-width: 100% !important;
            }

            /* Ust bosluk temizligi */
            .container.main-content, .container.mt-5, .main-content {
                margin-top: 0 !important;
                padding-top: 20px !important; /* Hafif bir ic bosluk kalsin */
            }

            /* Body background reset (Beyaz yapmistik ama bazen container golgeli olsun istenir) */
            /* Burada sadece main content card yapisi olsun, arka plan hafif gri olabilir */
        `;
        document.head.appendChild(style);


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

        // Eski Header/Top Bar ve Sidebar Temizligi (DOM'dan silme)
        var elementsToRemove = [
            '.header', '.top-bar', '#sp-header', '#sp-top-bar',
            '#sp-left', '#sp-right', '#sp-bottom', '.sidebar', '.sidebar-nav',
            '.module', '.moduletable', '.sp-module', '.t3-module',
            '#aside', '#footer', 'footer',
            '.breadcrumb', '.breadcrumbs',
            // New user reported elements
            '.mobile-nav-toggle', '.ust', '.site_baslangic', '.resimler', '.mobile-nav',
            '.mobile-nav-overly', '#section_hu_footer', '.menu_sol', '.mobil_menu_logo'
        ];
        elementsToRemove.forEach(sel => {
            var els = doc.querySelectorAll(sel);
            els.forEach(el => el.remove());
        });

        // Wrapper temizligi
        var t3Wrapper = doc.querySelector('.t3-wrapper');
        if (t3Wrapper) {
            t3Wrapper.style.padding = '0';
            t3Wrapper.style.margin = '0';
            t3Wrapper.style.border = 'none';
            t3Wrapper.style.background = 'transparent';
        }
    }

    // --- HEADER VE TAKVIM OLUSTURMA ---
    function headerVeTakvimOlustur(isEN) {
        // ("Modern Header ve Takvim olusturuluyor...");

        // --- DİL BAZLI İÇERİK ---
        var langPrefix = isEN ? '/en' : '/tr';
        var langToggleHref = isEN ? 'https://isletme.hacettepe.edu.tr/tr' : 'https://isletme.hacettepe.edu.tr/en';
        var langToggleText = isEN ? 'TR' : 'EN';
        var universityName = isEN ? 'HACETTEPE UNIVERSITY' : 'HACETTEPE ÜNİVERSİTESİ';
        var departmentName = isEN ? 'Department of Business Administration' : 'İşletme Bölümü';
        var stickyUniName = isEN ? 'HACETTEPE' : 'HACETTEPE';
        var stickyDeptName = isEN ? 'BUSINESS' : 'İŞLETME';
        var menuBtnText = isEN ? 'MENU' : 'MENÜ';

        // 1. Menu Ust (Social & Links) - Mobil uyumluluk icin d-none kaldirildi
        var menuUstHTML = `
            <div class="menu_ust" style="width: 100%; display: flex; justify-content: flex-end; background: #fafafa; border-bottom: none;">
                <div class="container" style="display: flex; justify-content: flex-end; align-items: center; max-width: 1200px; padding: 3px 30px;">

                    <div class="top-links" style="display: flex; align-items: center;">
                        <a href="https://hacettepe.edu.tr" target="_blank" style="color:#666; text-decoration:none; font-size:13px;">Hacettepe</a>
                        <span style="color:#ddd; margin: 0 10px;">|</span>
                        <a href="https://bilsis.hacettepe.edu.tr" target="_blank" style="color:#666; text-decoration:none; font-size:13px;">BİLSİS</a>
                        <span style="color:#ddd; margin: 0 10px;">|</span>
                        <a href="${langToggleHref}" style="color:#666; text-decoration:none; font-size:13px;">${langToggleText}</a>
                    </div>


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
        var menuGenelHTML;
        if (isEN) {
            menuGenelHTML = `
            <div class="menu_genel" style="width: 100%; border-bottom: none;">
                <div class="hi-nav-container">
                    <a href="https://isletme.hacettepe.edu.tr/en" class="hi-brand-logo" style="text-decoration: none; margin-right: auto;">
                        <div class="logo">
                            <div class="logo_yazi">
                                <div class="brand-normal">
                                    <div class="banner_uni">HACETTEPE UNIVERSITY</div>
                                    <div class="banner_uni_bolum">Department of Business Administration</div>
                                </div>
                                <div class="brand-sticky" style="display: none;">
                                    <span class="banner_uni" style="font-size: 20px;">HACETTEPE</span>
                                    <span class="banner_uni_bolum" style="font-size: 20px; margin-left: 6px; font-weight: 300; margin-top: 0; color: #222;">BUSINESS</span>
                                </div>
                            </div>
                        </div>
                    </a>

                    <button class="mobile-menu-toggle d-lg-none" onclick="document.querySelector('.hi-main-nav').classList.toggle('active')">
                        <i class="fas fa-bars"></i> MENU
                    </button>

                    <nav class="hi-main-nav">
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/en" class="hi-nav-link">Home</a></div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">ABOUT US <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">INSTITUTIONAL</div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/about_us-145" class="dropdown-item">About Us</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/administration-147" class="dropdown-item">Administration</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/promotion_film-181" class="dropdown-item">Promotion Film</a>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-header">PEOPLE</div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/academic_staff-139" class="dropdown-item">Academic Staff</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/research_assistants-141" class="dropdown-item">Research Assistants</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/department_staff-183" class="dropdown-item">Department Staff</a>
                            </div>
                        </div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">EDUCATION <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">PROGRAMS</div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/undergraduate_program-129" class="dropdown-item">Undergraduate Program</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/graduate_programs_thesis-131" class="dropdown-item">Graduate Programs (Thesis)</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/graduate_programs_nonthesis-133" class="dropdown-item">Graduate Programs (Non-Thesis)</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/phd_program-135" class="dropdown-item">PhD Program</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/minor_program-189" class="dropdown-item">Minor Program</a>
                                <div class="dropdown-divider"></div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/academic_calendar-185" class="dropdown-header">ACADEMIC CALENDAR</a>
                            </div>
                        </div>
                        <div class="hi-nav-item">
                            <a href="#" class="hi-nav-link">STUDENT <i class="fas fa-chevron-down"></i></a>
                            <div class="hi-dropdown-menu">
                                <div class="dropdown-header">EXCHANGE PROGRAMS</div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/erasmus-193" class="dropdown-item">ERASMUS</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/farabi-195" class="dropdown-item">FARABİ</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/mevlana-197" class="dropdown-item">MEVLANA</a>
                                <div class="dropdown-divider"></div>
                                <div class="dropdown-header">PROCEDURES & INFO</div>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/internship-199" class="dropdown-item">Internship</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/required_forms_and_documents-175" class="dropdown-item">Required Forms and Documents</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/frequently_asked_questions_for_unde-179" class="dropdown-item">FAQ</a>
                                <a href="https://isletme.hacettepe.edu.tr/en/menu/events-177" class="dropdown-item">Events</a>
                            </div>
                        </div>
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/en/announcements" class="hi-nav-link">ANNOUNCEMENTS</a></div>
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/en/menu/contact_us-149" class="hi-nav-link">CONTACT</a></div>

                    </nav>
                </div>
            </div>`;
        } else {
            menuGenelHTML = `
            <div class="menu_genel" style="width: 100%; border-bottom: none;">
                <div class="hi-nav-container">




                    <a href="https://isletme.hacettepe.edu.tr/tr" class="hi-brand-logo" style="text-decoration: none; margin-right: auto;">
                        <div class="logo">
                            <div class="logo_yazi">

                                <div class="brand-normal">
                                    <div class="banner_uni">HACETTEPE ÜNİVERSİTESİ</div>
                                    <div class="banner_uni_bolum">İşletme Bölümü</div>
                                </div>

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
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/tr/menu/duyurular-228" class="hi-nav-link">DUYURULAR</a></div>
                        <div class="hi-nav-item"><a href="https://isletme.hacettepe.edu.tr/tr/menu/iletisim-13" class="hi-nav-link">İLETİŞİM</a></div>

                    </nav>
                </div>
            </div>`;
        }

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
            renderCalendar(window.OFFLINE_CALENDAR_DATA);
            return;
        }

        // Veriyi Cek
        fetch(baseUrl + '/akademik_takvim.json' + cacheBuster)
            .then(res => res.json())
            .then(events => {
                renderCalendar(events);
            })
            .catch(err => { });
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

        // --- OFFLINE MOD DESTEGI ---
        if (window.OFFLINE_ANNOUNCEMENTS) {
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
            .then(res => {
                return res.text();
            })
            .then(html => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');

                var anaIcerik = doc.querySelector('.col-lg-9') || doc.querySelector('.icerik');
                var duyuruSatirlari = [];

                if (anaIcerik) {
                    duyuruSatirlari = anaIcerik.querySelectorAll('ul li');
                } else {
                }



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
                    // ("LI yapisi bulunamadi, dogrudan A linkleri taraniyor...");

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

                if (sayac === 0) {
                    listeHTML = '<li>Henüz duyuru bulunmamaktadır.</li>';
                }

                var hedefListe = document.getElementById('duyuru-listesi');
                if (hedefListe) hedefListe.innerHTML = listeHTML;
            })
            .catch(err => {
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

    function footerOlustur(isEN) {
        var footerHTML;
        if (isEN) {
            footerHTML = `
    <footer id="section_hu_footer">
        <div class="footer-container">
            <div class="footer-brand">
                <h4>HACETTEPE UNIVERSITY</h4>
                <h5>DEPARTMENT OF BUSINESS ADMINISTRATION</h5>
                <div class="footer-address">
                    Beytepe Campus, 06800<br>
                    Cankaya / ANKARA, TURKEY
                </div>
                <div class="footer-contact">
                    <a href="tel:+903122976351"><i class="fas fa-phone"></i> +90 (312) 297 63 51 - 112</a>
                </div>
            </div>
            <div class="footer-col">
                <h3>Quick Links</h3>
                <ul class="footer-links">
                    <li><a href="https://isletme.hacettepe.edu.tr/en/menu/undergraduate_program-129">Undergraduate Program</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/en/menu/graduate_programs_thesis-131">Thesis Graduate</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/en/menu/graduate_programs_nonthesis-133">Non-Thesis Graduate</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/en/menu/phd_program-135">PhD Program</a></li>
                    <li><a href="https://bilsis.hacettepe.edu.tr" target="_blank">BILSIS</a></li>
                    <li><a href="https://isletme.hacettepe.edu.tr/en/menu/academic_calendar-185">Academic Calendar</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Links</h3>
                <ul class="footer-links">
                    <li><a href="https://hacettepe.edu.tr" target="_blank">Hacettepe University</a></li>
                    <li><a href="https://sosyalbilimler.hacettepe.edu.tr" target="_blank">Inst. of Social Sciences</a></li>
                    <li><a href="https://oidb.hacettepe.edu.tr/" target="_blank">Student Affairs</a></li>
                    <li><a href="https://sksdb.hacettepe.edu.tr/bidbnew/index.php" target="_blank">Student Services</a></li>
                    <li><a href="https://library.hacettepe.edu.tr/" target="_blank">Library</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h3>Follow Us</h3>
                <div class="footer-social-icons">
                    <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="https://twitter.com/Hacettepe1967" target="_blank"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-copyright">
                 ${new Date().getFullYear()} <strong>Hacettepe University Department of Business Administration</strong>. Designed by Nizameddin Alyaprak.
            </div>
            <div class="footer-bottom-links">
                <a href="https://www.hacettepe.edu.tr/hakkinda/KVKK" target="_blank">Privacy Policy</a>
            </div>
        </div>
    </footer>`;
        } else {
            footerHTML = `
    <footer id="section_hu_footer">
        <div class="footer-container">
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
            <div class="footer-col">
                <h3>Takip Edin</h3>
                <div class="footer-social-icons">
                    <a href="https://www.instagram.com/hacettepe_isletme/" target="_blank"><i class="fab fa-instagram"></i></a>
                    <a href="https://www.linkedin.com/company/hacettepe-university-department-of-business-administration/" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="https://twitter.com/Hacettepe1967" target="_blank"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="footer-copyright">
                 ${new Date().getFullYear()} <strong>Hacettepe Üniversitesi İşletme Bölümü</strong>. Nizameddin Alyaprak Tarafından Tasarlanmıştır.
            </div>
            <div class="footer-bottom-links">
                <a href="https://www.hacettepe.edu.tr/hakkinda/KVKK" target="_blank">KVKK ve Gizlilik</a>
            </div>
        </div>
    </footer>`;
        }

        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
})();


