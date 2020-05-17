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
    return L.DomUtil.create('div','other-wrap');
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
    return L.DomUtil.create('div','day-wrap');
  },
  onRemove: function(map) {
      // Nothing to do here
  }
});
L.control.layer = function(opts) {
  return new L.Control.LayerView(opts);
}

// Build control content
function buildControls(controls, others) {
  // Branding Control
  $('.brand-wrap').html(controls.attrib);

  // Other trucks control
  $('.other-wrap').html(controls.other);
  $('.other-wrap .body').html(others);

  // Day Selector Control
  $('.day-wrap').html(controls.days);
}
