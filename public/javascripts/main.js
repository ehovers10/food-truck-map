$(document).ready(function() {
  var url = "/data/truck-data.json";
  var attrib = $('#attrib').html();
  $('#attrib').remove();

  getMarkers('GET', url, attrib);
});

function getMarkers(type, url, attribution) {
  $.ajax({
    type: type,
    url: url,
    error: function(err) {
      console.log('Something went wrong:',JSON.stringify(err));
    },
    success: function(response) {
      buildMap(response, attribution);
    }
  });
}

function buildMap(response,attribution) {
  var mapboxToken = `pk.eyJ1IjoiZWhvdmVyc3RlbiIsImEiOiJjazl6dDd4OGQwZ25pM2VuYTZoYm1qNmtsIn0.LysE7jICC_Id3-aFgr9_Bg`;
  var basemap = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`;
  var attrib = '';
  var truckGroups = [], dayGroup = [], othersDetail = '', trucks = [];

  var map = L.map('mymap', {
    center: [44.79713969,-106.95568084],
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

  for (var p = 0; p < response.length; p++) {

    //Truck Details
    var title = response[p].Title;
    var slug = title.trim().replace(/\s/g,'-').toLowerCase();
    var description = response[p].Description.replace(/<\/*p>/g,'');
    var lat = response[p].Latitude;
    var lon = response[p].Longitude;

    var elements = description.split('<br />');
    var object = {}, label = '';
    for (var i = 0; i < elements.length; i++) {
      var item = elements[i].split(":");
      var key = item[0].trim().charAt(0).toUpperCase() + item[0].trim().slice(1);
      if (key == 'Days') {
        var daySet = new Set();
        var dayArray = item[1].split(',');
        for (var d = 0; d < dayArray.length; d++) {
          var day = (dayArray[d] == ' ') ? 'No day data' : dayArray[d].trim();
          daySet.add(day);
        }
        var val = daySet;
        label += `<p><b>${key}:</b> ${[...val].join(', ')}</p>`;
      } else {
        var val = item[1].trim();
        label += `<p><b>${key}:</b> ${val}</p>`;
      }
      object[key] = val;
    }

    // Popup
    var popup = `
      <h1>${title}</h1>
      ${label}
    `;

    // Markers
    if ([...object.Days].includes('No day data')) {
      object.Notes = (object.Notes == '') ? 'No details available' : object.Notes;
      othersDetail += `
        <div class="other-truck">
          <span class="title">${title}</span>
          <span class="notes">${object.Notes}</span>
          <span class="menu"><a href="${object.Website}">Menu</a></span>
        </div>
      `;
      trucks.push({
        "days": object.Days,
        "name": title,
        "other": othersDetail
      });
    } else {
      var location =  L.marker([lat, lon], {
        title: title,
        alt: title,
        icon: myIcon(object.Days)
      }).bindPopup(popup).on('click', clickZoom).addTo(map);
      trucks.push({
        "days": object.Days,
        "name": title,
        "location": location
      });
    }

  }

  $('.leaflet-marker-icon').html($('#marker').html());

  // Controls
  L.control.branding({position: 'bottomleft'}).addTo(map);
  L.control.layer({ position: 'topright' }).addTo(map);
  L.control.othertrucks({ position: 'topright' }).addTo(map);
  buildControls(attribution,trucks,othersDetail);

  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var i = 0; i < trucks.length; i++) {
      $('.leaflet-marker-icon').each(function() {
        var fill = ($(this).attr('class').includes(day)) ? 1 : 0;
        $(this).find('#highlight-img circle').attr('fill-opacity',fill);
      });
    }
    return false;
  });
  $('.map-title').click(function() {
    $('.others').slideToggle(1000);
    $('.map-title i').toggleClass('fa-info-circle').toggleClass('fa-window-close');
    return false;
  });

  function clickZoom(e) {
    map.setView(e.target.getLatLng(),15);
  }
  function myIcon(o) {
    var dayClass = [...o].join('-');
    return L.divIcon({
      iconSize:     [50, 50], // size of the icon
      iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
      popupAnchor:  [-3, -76],
      className: `${dayClass}-icon`
    });
  }
}
