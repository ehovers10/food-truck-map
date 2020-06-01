$(document).ready(function() {
  var controls = {
    'attrib': $('#attrib').html(),
    'days': $('#days').html()
  }
  $('#controls').remove();

  $.ajax({
    type: 'POST',
    url: '/data',
    error: function(err) {
      console.log('Something went wrong:',JSON.stringify(err));
    },
    success: function(response) {
      $('nav.toggle > .body').slideUp(500);
      $('nav.toggle .close').addClass('cls-down');
      buildMap(response.data, controls, response.config);
      $('#loader').addClass('hide-svg');
      var d = new Date();
      var n = d.getDay() + 1;
      var weekOf = new Date(d - (d.getDay() * 1000 * 3600 * 24));
      var formattedWeek = (weekOf.getMonth() + 1) + '/' + weekOf.getDate() + '/' + weekOf.getFullYear();
      $('nav .title .intro').append(' - Week of ' + formattedWeek);
      $('.day-toggle').eq(n).click();
      $('.toggle .title').click(function() {
        $(this).siblings('.body').slideToggle(1000);
        $(this).find('.close').toggleClass('cls-down').toggleClass('cls-up');
        return false;
      });
      if ($(window).width() < 800) {
        $('.day-select.toggle > .body').slideUp(500);
        $('.day-select.toggle .close').addClass('cls-up');
        $('.day-wrap').css('margin-bottom','35px');
      } else {
        $('.day-select.toggle .close').addClass('cls-down');
      }
    }
  });
});
