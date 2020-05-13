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
  var truckGroups = [], dayGroup = [], othersDetail = '';
  var blackIcon = L.icon({
    iconUrl: '/images/food-truck.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76],
    className: 'marker' // point from which the popup should open relative to the iconAnchor
  });
  var blueIcon = L.icon({
    iconUrl: '/images/Food-Truck-press.svg',
    iconSize:     [65, 65], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  var myIcon = L.divIcon({
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76],
    className: 'my-div-icon'
  });
  var count = 0;
  for (var p = 0; p < response.length; p++) {
    var title = response[p].Title;
    var description = response[p].Description.replace(/<\/*p>/g,'');
    var lat = response[p].Latitude;
    var lon = response[p].Longitude;

    var elements = description.split('<br />');
    console.log(elements);

    var object = {},label = '';
    for (var i = 0; i < elements.length; i++) {
      var item = elements[i].split(":");
      var key = item[0].trim().charAt(0).toUpperCase() + item[0].trim().slice(1);
      var val = (key == 'Days') ? item[1].split(',') : item[1].trim();
      object[key] = val;
      label += `<p><b>${key}:</b> ${val}</p>`;
    }

    var popup = `
      <h1>${title}</h1>
      ${label}
    `;

    for (var i = 0; i < object.Days.length; i++) {
      object.Days[i] = (object.Days[i] == ' ') ? 'No day data' : object.Days[i].trim();
    }
    if (object.Days[0] != 'No day data') {
      for (var i = 0; i < object.Days.length; i++) {
        var truckDay = truckGroups.find(group => group.day == object.Days[i]);
        if (truckDay) {
          truckDay.trucks.push(
            L.marker([lat, lon], {
              title: title,
              alt: title,
              icon: myIcon
            }).bindPopup(popup).on('click', clickZoom)
          );
        } else {
          truckGroups.push({
            "day": object.Days[i],
            "trucks": [
              L.marker([lat, lon], {
                title: title,
                alt: title,
                icon: myIcon
              }).bindPopup(popup).on('click', clickZoom)
            ],
          });
        }
      }
    } else {
      object.Notes = (object.Notes == '') ? 'No details available' : object.Notes;
      othersDetail += `
        <div class="other-truck">
          <span class="title">${title}</span>
          <span class="notes">${object.Notes}</span>
          <span class="menu"><a href="${object.Website}">Menu</a></span>
        </div>
      `;
    }
  }
  var truckLayer = [], overlayMaps = {};
  for (var i = 0; i < truckGroups.length; i++) {
    if (truckGroups[i].day != '') {
      truckLayer.push(L.layerGroup(truckGroups[i].trucks));
      overlayMaps[truckGroups[i].day] = truckLayer[truckLayer.length - 1];
    }
  }

  var mapbox = L.tileLayer(basemap, {
    attribution: attrib,
    maxZoom: 18,
    minZoom: 8,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapboxToken
  });

  var map = L.map('mymap', {
    center: [44.79713969,-106.95568084],
    zoom: 14,
    layers: [mapbox, ...truckLayer]
  });

  $('.my-div-icon').html(`
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100">
      <defs>
        <style>
          .cls-1{fill:url(#radial-gradient);}
          .cls-2{fill:#0072bc;}
          .cls-3{font-size:12px;fill:#fff;font-family:Calibri-Light, Calibri;font-weight:300;}
          .cls-4{letter-spacing:-0.01em;}
          .cls-5{filter:url(#shadow);}
        </style>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="0.2"/>
        </filter>
        <radialGradient id="radial-gradient" cx="35.76" cy="47.75" r="49.74" gradientTransform="matrix(0.96, 0.27, -0.15, 0.52, 8.27, 13.45)" gradientUnits="userSpaceOnUse">
          <stop offset="0.13" stop-color="#0072bc"/>
          <stop offset="0.35" stop-color="#0374bc"/>
          <stop offset="0.53" stop-color="#0d7bbc"/>
          <stop offset="0.69" stop-color="#1f85bc"/>
          <stop offset="0.85" stop-color="#3795bc"/>
          <stop offset="0.88" stop-color="#3c98bc"/>
        </radialGradient>
      </defs>
      <g id="Compost_Site" data-name="Compost Site">
        <path class="cls-1 cls-5" d="M82.65,50.38a4.8,4.8,0,0,1-2.51-2.6L73.8,29.17a3,3,0,0,0-2.64-1.9H15.82a2,2,0,0,0-2,2v37a2,2,0,0,0,2,2h2.32c1.1,0,2-.28,1.93-.62v-.32a7,7,0,1,1,14,0v.32c0,.34.83.62,1.93.62H66.56c1.1,0,2-.28,1.93-.62v-.32a7,7,0,1,1,14,0v.32c0,.34.78.62,1.81.62a2,2,0,0,0,1.88-2V53.71A3.11,3.11,0,0,0,84.31,51Zm-38.3-4.63a2,2,0,0,1-2,2H23.73a2,2,0,0,1-2-2V35.4a2,2,0,0,1,2-2H42.35a2,2,0,0,1,2,2Zm26.26,2a2,2,0,0,1-2-2V35.4a1.85,1.85,0,0,1,1.62-2,2.71,2.71,0,0,1,2.23,1.91l3.4,10.53a1.37,1.37,0,0,1-1.38,1.91Z"/>
        <circle class="cls-2 cls-5" cx="27.23" cy="67.23" r="5.5"/>
        <circle class="cls-2 cls-5" cx="75.34" cy="67.23" r="5.5"/>
        <text class="cls-3" transform="translate(38.34 63.21) rotate(-18.37)">
          <tspan class="cls-4">F</tspan>
          <tspan x="5.4" y="0">OOD</tspan>
        </text>
      </g>
    </svg>
  `);

  L.control.branding({position: 'bottomleft'}).addTo(map);
  L.control.layer({ position: 'topright' }).addTo(map);
  L.control.othertrucks({ position: 'topright' }).addTo(map);
  buildControls(attribution,truckGroups,othersDetail);

  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var i = 0; i < truckGroups.length; i++) {
      var iconColor = (truckGroups[i].day == day) ? blueIcon : blackIcon;
      for (var j = 0; j < truckGroups[i].trucks.length; j++) {
        truckGroups[i].trucks[j].setIcon(iconColor);
      }
    }
    return false;
  });

  function clickZoom(e) {
    map.setView(e.target.getLatLng(),15);
  }
}
