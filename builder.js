var L = require('leaflet');
var miniMap = require('leaflet-minimap');

global.buildMap = function (data, controls, config) {
  var basemap = `https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={accessToken}`
  var attrib = controls.attrib;
  var othersDetail = '';
  var dayGroups = {'All': []};
  var truckGroups = {};
  var trucks = [];

  var map = L.map('mymap', {
    center: [44.7903547,-106.9516518],
    zoom: 14
  });
  var mainMap = new L.tileLayer(basemap, {
    attribution: attrib,
    maxZoom: 18,
    minZoom: 8,
    style: config.primaryMap.style,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.primaryMap.token
  }).addTo(map);

  for (var p = 0; p < data.length; p++) {

    var truck = data[p];
    var lat = truck.lat;
    var lon = truck.lon;

    truck.object.Notes = (truck.object.Notes == '') ? 'No details available' : truck.object.Notes;
    othersDetail += `
      <div class="other-truck">${truck.label}</div>
    `;

    if (truck.object.Location != '') {
      var location = L.marker([lat, lon], {
        title: truck.object.name,
        alt: truck.object.name,
        desc: truck.label,
        icon: L.divIcon({
          iconSize:     [50, 50], // size of the icon
          iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
          className: `truck-icon`
        }), //myIcon(truck.object.Days),
        riseOnHover: true
      }).bindPopup(truck.label).on('click',clickZoom).on('popupclose',goScope);

      dayGroups['All'].push(location);
      var days = truck.object.Days;
      for (var d = 0; d < days.length; d++) {
        (dayGroups[days[d]]) ? dayGroups[days[d]].push(location) : dayGroups[days[d]] = [location];
      }
    }
  }
  for (var day in dayGroups) {
    truckGroups[day] = L.featureGroup(dayGroups[day]);
  }
  function clickZoom(e) {
    map.setView(e.target.getLatLng(),16);
  }
  function goScope() {
    var day = $('.day-toggle.active').attr('data-day');
    var area = truckGroups[day].getBounds();
    map.addLayer(truckGroups[day]).fitBounds(area);
  }

  //MiniMap
  var mapbox2 = new L.tileLayer(basemap, {
    attribution: attrib,
    maxZoom: 18,
    minZoom: 8,
    style: config.secondaryMap.style,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.secondaryMap.token
  });
  if ($(window).width() > 800) var miniMap = new L.Control.MiniMap(mapbox2,{toggleDisplay: true,position: 'bottomleft'}).addTo(map);

  //Day Select
  L.Control.DayView = L.Control.extend({
    onAdd: function(map) {
      return L.DomUtil.create('div','day-wrap');
    },
    onRemove: function(map) {
        // Nothing to do here
    }
  });
  L.control.days = function(opts) {
    return new L.Control.DayView(opts);
  }
  L.control.days({ position: 'bottomleft' }).addTo(map);

  $('.day-wrap').html(controls.days);
  $('.other-trucks .body').html(othersDetail);

  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var grp in truckGroups) {
      map.removeLayer(truckGroups[grp]);
    }
    if (truckGroups[day]) {
      var area = truckGroups[day].getBounds();
      map.addLayer(truckGroups[day]).fitBounds(area);
    }
    $('.leaflet-marker-icon').append($('#marker .svg-icon').html());

    if ($(window).width() < 800) $('.day-select.toggle .title').click();

    return false;
  });
}
