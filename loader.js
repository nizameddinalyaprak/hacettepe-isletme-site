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

                // NOT: Buradaki '.icerik ul li' secicisi tahminidir. 
                // Duyuru sayfasinin gercek yapisina gore guncellenmesi gerekebilir.
                // Genelde CMS'lerde orta alanda (.icerik veya .col-lg-9) icinde listelenir.
                var duyurular = doc.querySelectorAll('.col-lg-9 a, .icerik a');

                var listeHTML = '';
                var sayac = 0;

                duyurular.forEach(link => {
                    // Sadece mantikli linkleri al (kisa olanlari ele)
                    if (link.innerText.length > 10 && sayac < 5) {
                        listeHTML += '<li><a href="' + link.href + '" target="_blank">' + link.innerText + '</a></li>';
                        sayac++;
                    }
                });

                if (sayac === 0) listeHTML = '<li>Duyuru bulunamadı veya yapı farklı.</li>';

                var hedefListe = document.getElementById('duyuru-listesi');
                if (hedefListe) hedefListe.innerHTML = listeHTML;
            })
            .catch(err => console.log("Duyuru cekme hatasi:", err));
    }
})();
