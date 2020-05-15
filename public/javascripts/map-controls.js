// Branding Control
L.Control.Branding = L.Control.extend({
  onAdd: function(map) {
    return L.DomUtil.create('div','brand-wrap');
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});
L.control.branding = function(opts) {
  return new L.Control.Branding(opts);
}

// Other Trucks Control
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
L.control.othertrucks = function(opts) {
  return new L.Control.OtherTrucks(opts);
}

// Day Selector Control
L.Control.LayerView = L.Control.Layers.extend({
  onAdd: function(map) {
    var wrap = L.DomUtil.create('div','day-select');

    return wrap;
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});
L.control.layer = function(opts) {
  return new L.Control.LayerView(opts);
}

// Build control content
function buildControls(branding,daySelect,otherTrucks) {
  // Branding Control
  $('.brand-wrap').html(branding);

  // Day Selector Control
  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  for (var i = 0; i < days.length; i++) {
      $('.day-select').append(`<a href="#" class="day-toggle" data-day="${days[i]}">${days[i]}</a>`);
  }
  $('.day-select').prepend('<h2>Day Selector</h2>');

  // Other Trucks Control
  $('.map-title').html('<a href="#"><span>Other Local Trucks</span> <i class="fas fa-info-circle"></i></a>');
  $('.others').css('display','none').html(otherTrucks);
}
