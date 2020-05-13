L.Control.Branding = L.Control.extend({
  onAdd: function(map) {
    return L.DomUtil.create('div','brand-wrap');
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});
L.Control.OtherTrucks = L.Control.extend({
  onAdd: function(map) {
    var titleText = 'Food Truck Finder';
    var wrap = L.DomUtil.create('div','other-trucks');
    var title = L.DomUtil.create('div','map-title',wrap);
    var others = L.DomUtil.create('div','others',wrap)
    return wrap;
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});
L.Control.LayerView = L.Control.Layers.extend({
  onAdd: function(map) {
    var wrap = L.DomUtil.create('div','day-select');

    return wrap;
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});

L.control.branding = function(opts) {
  return new L.Control.Branding(opts);
}
L.control.othertrucks = function(opts) {
  return new L.Control.OtherTrucks(opts);
}
L.control.layer = function(opts) {
  return new L.Control.LayerView(opts);
}

function buildControls(branding,daySelect,otherTrucks) {
  // Branding Control
  $('.brand-wrap').html(branding);

  // Day Selector Control
  for (var i = 0; i < daySelect.length; i++) {
    var day = daySelect[i].day;
    if (day != '') {
      var order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].indexOf(day);
      console.log(order);
      $('.day-select').append(`<a href="#" class="day-toggle" data-order="${order}" data-day="${day}">${day}</a>`);
    }
  }
  var newOrder = $('.day-select a').sort(function(a,b) {
    if (a.dataset.order > b.dataset.order) return 1;
    if (b.dataset.order > a.dataset.order) return -1;
    return 0;
  });
  $('.day-select').html(newOrder);
  $('.day-select').prepend('<h2>Day Selector</h2>');

  // Other Trucks Control
  $('.map-title').html('<a href="#"><span>Other Local Trucks</span> <i class="fas fa-info-circle"></i></a>');
  $('.others').css('display','none').html(otherTrucks);
  $('.map-title').click(function() {
    $('.others').slideToggle(1000);
    $('.map-title i').toggleClass('fa-info-circle').toggleClass('fa-window-close');
    return false;
  });
}
