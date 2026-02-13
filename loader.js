/* loader.js - Site Yükleyici */

(function () {
    console.log("Loader baslatildi...");

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
        // CMS'in duyuru sayfasi (Link yapisi degisirse burayi guncellemek gerekir)
        var duyuruURL = '/tr/duyurular';

        fetch(duyuruURL)
            .then(res => res.text())
            .then(html => {
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');

                // CMS Yapisina Gore Duyuru Listesini Bulma
                // Genelde icerik alani .col-lg-9 veya .icerik class'ina sahiptir.
                // Duyurular da genelde <ul><li>...</li></ul> seklindedir.

                var anaIcerik = doc.querySelector('.col-lg-9') || doc.querySelector('.icerik');
                var duyuruSatirlari = [];

                if (anaIcerik) {
                    // Sadece ana icerik alanindaki listeleri al, menuleri vs. alma.
                    duyuruSatirlari = anaIcerik.querySelectorAll('ul li');
                }

                var listeHTML = '';
                var sayac = 0;

                // Eger hic li bulamazsa (bazen div yapisi kullanilir), linkleri tarayalim
                if (!duyuruSatirlari || duyuruSatirlari.length === 0) {
                    var linkler = anaIcerik ? anaIcerik.querySelectorAll('a') : [];
                    linkler.forEach(link => {
                        // Linkin metni makul uzunluktaysa ve href'i varsa
                        if (sayac < 10 && link.innerText.trim().length > 10 && link.href) {
                            listeHTML += olusturDuyuruHTML('', link.innerText.trim(), link.href);
                            sayac++;
                        }
                    });
                } else {
                    duyuruSatirlari.forEach(satir => {
                        if (sayac >= 10) return;

                        var link = satir.querySelector('a');
                        if (!link) return; // Linki olmayan satiri gec

                        var baslik = link.innerText.trim();
                        var url = link.href;

                        // Tarih Bulma (Regex ile DD.MM.YYYY veya DD/MM/YYYY)
                        var tarih = "";
                        var textContent = satir.innerText;

                        // 1. Once span icine bakalim (bazen tarih span class="date" vs olur)
                        var tarihSpan = satir.querySelector('span');
                        if (tarihSpan && tarihSpan.innerText.match(/(\d{2}[./]\d{2}[./]\d{4})/)) {
                            tarih = tarihSpan.innerText.trim();
                        }

                        // 2. Bulamazsak tum satir metninde tarih arayalim
                        if (!tarih) {
                            var tarihMatch = textContent.match(/(\d{2}[./]\d{2}[./]\d{4})/);
                            if (tarihMatch) tarih = tarihMatch[0];
                        }

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
        // Kategori Belirleme ve Rozet Rengi
        var badgeClass = 'badge-genel';
        var badgeText = 'Duyuru';
        var lowerBaslik = baslik.toLowerCase();

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
        } else if (lowerBaslik.includes('lisans')) {
            badgeClass = 'badge-lisans';
            badgeText = 'Lisans';
        }

        // HTML Olustur
        var html = '<li>';

        // 1. Tarih (Varsa goster)
        if (tarih) {
            html += '<span class="badge badge-tarih">' + tarih + '</span>';
        }

        // 2. Link
        html += '<a href="' + url + '" target="_blank">' + baslik + '</a>';

        // 3. Sagda Renkli Etiket (Eger ozel bir kategori ise veya tarih yoksa "Duyuru" yazmasin diye)
        if (badgeText !== 'Duyuru' || !tarih) {
            html += '<span class="badge ' + badgeClass + '">' + badgeText + '</span>';
        }

        html += '</li>';
        return html;
    }
})();
