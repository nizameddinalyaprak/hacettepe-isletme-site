//logo
$(window).scroll(function() {
  var position = $( ".site_baslangic" ).position();
  var s_top = position.top;

  if ($(this).scrollTop() > s_top) {
    // $('.logo').fadeOut('slow');
    // $('.logo_mobile').fadeIn('slow');
    $('.ust').addClass('ust-scrolled');
    $('.menu_ust').addClass('menu_ust-scrolled');
    $('.logo').addClass('logo-scrolled');
    $('.menu').addClass('menu-scrolled');
    $('.logo_link').addClass('logo_link-scrolled');
    //$('.resimler').hide();

  } else {
    // $('.logo_mobile').fadeOut('slow');
    // $('.logo').fadeIn('slow');
    $('.ust').removeClass('ust-scrolled');
    $('.menu_ust').removeClass('menu_ust-scrolled');
    $('.logo').removeClass('logo-scrolled');
    $('.menu').removeClass('menu-scrolled');
    $('.logo_link').removeClass('logo_link-scrolled');
    //$('.resimler').show();
  }
});

// Back to top button
$(window).scroll(function() {
  if ($(this).scrollTop() > 100) {
    $('.back-to-top').fadeIn('slow');
  } else {
    $('.back-to-top').fadeOut('slow');
  }
});
$( document ).ready(function() {
  $('.back-to-top').click(function(){
    //alert('dfsdf');
    $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');
    return false;
  });
  $('.site_devam_link2').click(function(){
    //alert('dfsdf');
    var position = $( ".site_baslangic" ).position();
    var s_top = position.top;
    //alert("left: " + position.left + ", top: " + position.top)
    $('html, body').animate({scrollTop : s_top},1500, 'easeInOutExpo');
    return false;
  });

  $('.site_devam_link').click(function(){
    //alert('dfsdf');
    //var bolum = $(this).attr('id');
    var bolum = 'haberler';
    var bolum_class = "#section_"+bolum;
    console.log(bolum_class);
    $("html, body").animate({ scrollTop: $(bolum_class).offset().top-70 }, 1000);
    return false;
  });


  $('.diger_bolum').click(function(){
    //alert('dfsdf');
    var bolum = $(this).attr('id');
    var bolum_class = "#section_"+bolum;
    console.log(bolum_class);
    $("html, body").animate({ scrollTop: $(bolum_class).offset().top-70 }, 1000);
    return false;
  });



});