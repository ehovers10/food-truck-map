$(document).ready(function() {
  var url = "/data/truck-data.json";
  var controls = {
    'attrib': $('#attrib').html(),
    'other': $('#other').html(),
    'days': $('#days').html()
  }
  $('#controls').remove();

  getMarkers('GET', url, controls);
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
    }
  });
}

function buildMap(response, controls) {
  var mapboxToken = `pk.eyJ1IjoiZWhvdmVyc3RlbiIsImEiOiJjazl6dDd4OGQwZ25pM2VuYTZoYm1qNmtsIn0.LysE7jICC_Id3-aFgr9_Bg`;
  var basemap = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`;
  var attrib = '<a href="https://www.mapbox.com/">Mapbox</a> | <a href="https://www.openstreetmap.org/">OpenStreetMap</a>';
  var othersDetail = '';
  var truckGroups = [], dayGroup = [], trucks = [];

  var map = L.map('mymap', {
    center: [44.7903547,-106.9516518],
    zoom: 14
  });
  var mapbox = L.tileLayer(basemap, {
    attribution: attrib,
    maxZoom: 18,
    minZoom: 8,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxToken
  }).addTo(map);

  var oms = new OverlappingMarkerSpiderfier(map,{
    keepSpiderfied: true,
    circleSpiralSwitchover: 5,
    nearbyDistance: 25,
    legWeight: 10
  });
  oms.addListener('spiderfy', function(markers) {
    //map.setView(markers[0].getLatLng(),17);
  });
  var popup = new L.Popup();
  oms.addListener('click', function(marker) {
    popup.setContent(marker.options.desc);
    popup.setLatLng(marker.getLatLng());
    map.openPopup(popup);
    map.setView(marker.getLatLng(),17);
  });

  for (var p = 0; p < response.length; p++) {

    var truck = parseTruckData(response[p]);

    // Markers
    var lat = response[p].Latitude;
    var lon = response[p].Longitude;
    if (truck.object.Location == '') {
      truck.object.Notes = (truck.object.Notes == '') ? 'No details available' : truck.object.Notes;
      othersDetail += `
        <div class="other-truck">${truck.label}</div>
      `;
      trucks.push({
        "days": truck.object.Days,
        "name": truck.object.name,
        "other": othersDetail
      });
    } else {
      var location =  L.marker([lat, lon], {
        title: truck.object.name,
        alt: truck.object.name,
        desc: truck.label,
        icon: myIcon(truck.object.Days),
        riseOnHover: true
      }).addTo(map);
      oms.addMarker(location);
      trucks.push({
        "days": truck.object.Days,
        "name": truck.object.name,
        "location": location
      });
    }
  }
  $('.leaflet-marker-icon').append($('#marker').html());

  // Controls
  L.control.branding({position: 'bottomleft'}).addTo(map);
  L.control.layer({ position: 'topright' }).addTo(map);
  L.control.othertrucks({ position: 'topright' }).addTo(map);
  buildControls(controls, othersDetail);

  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var i = 0; i < trucks.length; i++) {
      $('.leaflet-marker-icon').each(function() {
        var fill = ($(this).attr('class').includes(day)) ? 1 : 0;
        $(this).find('.highlight circle').attr('fill-opacity',fill);
      });
    }
    return false;
  });
  var d = new Date();
  var n = d.getDay() - 1;
  $('.day-toggle').eq(n).click();

  $('.other-trucks .body').slideUp(1000);
  $('.other-trucks .close').fadeOut(1000);
  var elem = L.DomUtil.get('other-body');
  L.DomEvent.on(elem, 'mousewheel', L.DomEvent.stopPropagation);
  $('.other-trucks .title').click(function() {
    $('.other-trucks .body').slideToggle(1000);
    $('.other-trucks .close').fadeToggle(1000);
    return false;
  });
}
function myIcon(o) {
  var dayClass = [...o].join('-');
  return L.divIcon({
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    className: `${dayClass}-icon`
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
