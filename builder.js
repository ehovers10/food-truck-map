var L = require('leaflet');
var miniMap = require('leaflet-minimap');

global.buildMap = function (response, controls) {
  var mapboxToken = `pk.eyJ1IjoiZWhvdmVyc3RlbiIsImEiOiJjazl6dDd4OGQwZ25pM2VuYTZoYm1qNmtsIn0.LysE7jICC_Id3-aFgr9_Bg`;
  var basemap = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`;
  var attrib = controls.attrib;
  var othersDetail = '';
  var dayGroups = {'All': []};
  var truckGroups = {};
  var trucks = [];

  var map = L.map('mymap', {
    center: [44.7903547,-106.9516518],
    zoom: 14
  });
  var mapbox = new L.tileLayer(basemap, {
    attribution: attrib,
    maxZoom: 18,
    minZoom: 8,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxToken
  }).addTo(map);

  for (var p = 0; p < response.length; p++) {

    var truck = parseTruckData(response[p]);

    // Markers
    var lat = response[p].Latitude;
    var lon = response[p].Longitude;
    
    truck.object.Notes = (truck.object.Notes == '') ? 'No details available' : truck.object.Notes;
    othersDetail += `
      <div class="other-truck">${truck.label}</div>
    `;
    trucks.push({
      "days": truck.object.Days,
      "name": truck.object.name,
      "other": othersDetail
    });

    if (truck.object.Location == '') {
      var location = L.marker([lat, lon], {
        title: truck.object.name,
        alt: truck.object.name,
        desc: truck.label,
        icon: myIcon(truck.object.Days),
        riseOnHover: true
      }).bindPopup(truck.label);
      trucks.push({
        "days": truck.object.Days,
        "name": truck.object.name,
        "location": location
      });
      dayGroups['All'].push(location);
      var days = [...truck.object.Days];
      for (var d = 0; d < days.length; d++) {
        (dayGroups[days[d]]) ? dayGroups[days[d]].push(location) : dayGroups[days[d]] = [location];
      }
    }
  }
  for (var day in dayGroups) {
    truckGroups[day] = L.featureGroup(dayGroups[day]);
  }

  //MiniMap
  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osm2 = new L.tileLayer(osmUrl, {minZoom: 10, maxZoom: 13, attribution: ''});
  var miniMap = new L.Control.MiniMap(osm2,{toggleDisplay: true,position: 'bottomleft'}).addTo(map);

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
  L.control.days({ position: 'topleft' }).addTo(map);
  L.control.zoom({ position: 'topright' });

  $('.day-wrap').html(controls.days);
  $('.other-trucks .body').html(othersDetail);

  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var grp in truckGroups) {
      map.removeLayer(truckGroups[grp]);
    }
    var area = truckGroups[day].getBounds();
    map.addLayer(truckGroups[day]).fitBounds(area);

    $('.leaflet-marker-icon').append($('#marker').html());
    return false;
  });
}
function myIcon(o) {
  var dayClass = [...o].join('-');
  return L.divIcon({
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    className: `truck-icon`
  });
}
function parseTruckData(item) {
  //Truck Details
  var title = item.Title;
  var slug = title.trim().replace(/\s/g,'-').toLowerCase();
  var description = item.Description.replace(/<\/*p>/g,'');

  var elements = (description.includes('<br />')) ? description.split('<br />') : description.split('\n');
  var object = {'name':title}, label = `<h2>${title}</h2>`;
  for (var i = 0; i < elements.length; i++) {
    var item = elements[i].split("&gt;");
    var key = item[0].trim().charAt(0).toUpperCase() + item[0].trim().slice(1);

    switch (key) {
      case 'Days':
        if (item[1] == '&nbsp;' || item[1] == ' ') {
          var val = '';
          label += '';
          break;
        } else {
          var daySet = new Set();
          var dayArray = (item[1]) ? item[1].split(',') : [' '];
          for (var d = 0; d < dayArray.length; d++) {
            var day = (dayArray[d] == ' ') ? 'No day data' : dayArray[d].trim();
            daySet.add(day);
          }
          var val = daySet;
          label += `<p><b>${key}:</b> ${[...val].join(', ')}</p>`;
          break;
        }
      case 'Menu':
        var val = (item[1] == '&nbsp;' || item[1] == ' ') ? '' : item[1].replace(/\&nbsp;/g,'').trim();
        label += (item[1] == '&nbsp;' || item[1] == ' ') ? '' : `<p><a href="${item[1].replace(/\&nbsp;/g,'').trim()}">Menu</a></p>`;
        break;
      default:
        var val = (item[1] == '&nbsp;' || item[1] == ' ') ? '' : item[1].replace(/\&nbsp;/g,'').trim();
        label += (item[1] == '&nbsp;' || item[1] == ' ') ? '' : `<p><b>${key}:</b> ${item[1].replace(/\&nbsp;/g,'').trim()}</p>`;
    }
    object[key] = val;
  }

  return {'object': object,'label': label};
}

