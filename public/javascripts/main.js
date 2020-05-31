$(document).ready(function() {
  var url = "/data/truck-data.json";
  var controls = {
    'attrib': $('#attrib').html(),
    'days': $('#days').html()
  }
  $('#controls').remove();

  getMarkers('GET', url, controls);

  if ($(window).width() < 800) {
    $('.toggle > .body').slideUp(1000);
    $('.toggle .close').addClass('open');
  }
  $('nav.toggle > .body').slideUp(1000);
  $('nav.toggle .close').addClass('open');
});

function getMarkers(type, url, controls) {
  $.ajax({
    type: type,
    url: url,
    error: function(err) {
      console.log('Something went wrong:',JSON.stringify(err));
    },
    success: function(response) {
      buildMap(response, controls);
      var d = new Date();
      var n = d.getDay();
      $('.day-toggle').eq(n).click();
      $('.toggle .title').click(function() {
        $(this).siblings('.body').slideToggle(1000);
        $(this).find('.close').toggleClass('open');
        return false;
      });
    }
  });
}
