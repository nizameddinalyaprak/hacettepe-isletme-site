/* loader.js - Site Yükleyici */

(function () {
    console.log("Loader baslatildi...");

    // 1. Hatali Scroll Eventlerini Engelle
    window.addEventListener('error', function (e) {
        if (e.message && (e.message.includes("reading 'top'") || e.message.includes("Cannot read properties of undefined"))) {
            if (e.filename && e.filename.includes("main.js")) {
                e.preventDefault();
                e.stopPropagation();
                return true;
            }
        }
    }, true);

    // GitHub Pages URL'nizi buraya yazacaksiniz (Otomatik bulmaya calisiyoruz)
    var scriptSrc = document.currentScript.src;
    var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

    console.log("Base URL tespit edildi: " + baseUrl);

    // index.html icerigini cek
    fetch(baseUrl + '/index.html')
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

            // Yukleme ekranini kaldir
            var loading = document.getElementById('yukleniyor');
            if (loading) loading.style.display = 'none';

            console.log("Site basariyla yuklendi!");
        })
        .catch(function (err) {
            console.error("Site yuklenirken hata olustu:", err);
            document.body.innerHTML = '<h1>Hata Olustu</h1><p>' + err + '</p>';
        });

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

                // Eger LI bulunamadiysa (Fallback)
                if (!duyuruSatirlari || duyuruSatirlari.length === 0) {
                    console.log("LI yapisi bulunamadi, dogrudan A linkleri taraniyor...");

                    var linkler = anaIcerik ? anaIcerik.querySelectorAll('a') : [];
                    console.log("Bulunan link sayisi: " + linkler.length);

                    linkler.forEach(link => {
                        var text = link.innerText.trim();

                        // Tarih Bulma (Fallback Modu)
                        var tarih = "";

                        // 1. Link metninin icinde tarih var mi?
                        var tarihMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
                        if (tarihMatch) {
                            tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                        }

                        // 2. Linkin hemen yanindaki metinde (nextSibling) tarih var mi? (CMS Bazen boyle yapar)
                        if (!tarih && link.nextSibling && link.nextSibling.nodeType === 3) {
                            var yanMetin = link.nextSibling.textContent.trim();
                            tarihMatch = yanMetin.match(/(\d{4})-(\d{2})-(\d{2})/);
                            if (tarihMatch) {
                                tarih = tarihMatch[3] + "." + tarihMatch[2] + "." + tarihMatch[1];
                            }
                        }

                        // 3. URL'den tarih
                        if (!tarih) {
                            tarih = urlTarihBul(link.href);
                        }

                        // Kisa linkleri ve boslari ele
                        if (sayac < 12 && text.length > 5 && link.href && !link.href.includes('javascript')) {
                            listeHTML += olusturDuyuruHTML(tarih, text, link.href);
                            sayac++;
                        }
                    });
                } else {
                    // Normal LI Isleyisi
                    duyuruSatirlari.forEach((satir, index) => {
                        if (sayac >= 12) return;

                        var link = satir.querySelector('a');
                        if (!link) return;

                        var url = link.href;
                        var satirMetni = satir.innerText.trim();

                        if (index < 3) {
                            console.log("Duyuru " + index + " Metni:", satirMetni);
                        }

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
