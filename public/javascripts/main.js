$(document).ready(function() {
  var controls = {
    'attrib': $('#attrib').html(),
    'days': $('#days').html()
  }
  $('#controls').remove();

  getMarkers('POST', '/data', controls);

  $('nav.toggle > .body').slideUp(1000);
  $('nav.toggle .close').addClass('fa-angle-down');
});

function getMarkers(type, url, controls) {
  $.ajax({
    type: type,
    url: url,
    error: function(err) {
      console.log('Something went wrong:',JSON.stringify(err));
    },
    success: function(response) {
      buildMap(response.data, controls, response.config);
      var d = new Date();
      var n = d.getDay() + 1;
      var weekOf = new Date(d - (d.getDay() * 1000 * 3600 * 24));
      var formattedWeek = (weekOf.getMonth() + 1) + '/' + weekOf.getDate() + '/' + weekOf.getFullYear();
      $('nav .title span').append(': Week of ' + formattedWeek);
      $('.day-toggle').eq(n).click();
      $('.toggle .title').click(function() {
        $(this).siblings('.body').slideToggle(1000);
        $(this).find('.close').toggleClass('fa-angle-down').toggleClass('fa-angle-up');
        return false;
      });
      if ($(window).width() < 800) {
        $('.toggle > .body').slideUp(1000);
        $('.toggle .close').addClass('fa-angle-down');
      } else {
        $('.day-select.toggle .close').addClass('fa-angle-up');
      }
    }
  });
}
