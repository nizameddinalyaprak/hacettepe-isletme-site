/* modern-header.js */
(function () {
    console.log("Modern Header yukleniyor...");

    var scriptSrc = document.currentScript.src;
    var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

    // CSS Linkle
    var cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = baseUrl + "/modern-header.css";
    document.head.appendChild(cssLink);

    // Font Awesome (Eger yoksa)
    if (!document.querySelector('link[href*="font-awesome"]')) {
        var fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fa);
    }

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

    // Eski header'i bul ve degistir ya da en basa ekle
    // CMS yapisina gore header classini bulmaya calisalim.
    // Genelde .header-area veya benzeri bir container olur.
    // Simdilik body'nin en basina ekleyelim (prepend).
    // Eger .logo-bar veya .ust gibi classlar varsa onlari gizleyebiliriz.

    var existingHeader = document.querySelector('.header-area') || document.querySelector('header');

    if (existingHeader) {
        // existingHeader.innerHTML = headerHTML; // Komple degistirmek riskli olabilir
        // existingHeader.style.display = 'none'; // Kapatip bizimkini basalim
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

})();
