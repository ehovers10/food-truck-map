$(document).ready(function() {
  var url = {
    "local": "/xml/food-trucks.xml",
    "remote": "https://mapitfast.agterra.com/api/Points/?projectId=2572"
  };
  getMarkers('GET', url.remote);
});

function getMarkers(type, url) {
  $.ajax({
    type: type,
    url: url,
    headers: {
      "Authorization": "Basic dGhlc2hlcmlkYW5wcmVzczoxNDRlZ3Jpbm5lbGw="
    },
    error: function(err) {
      console.log('Something went wrong:',JSON.stringify(err));
    },
    success: function(response) {
      buildMap(response)
    }
  });
}

function buildMap(response) {
  var mapboxToken = `pk.eyJ1IjoiZWhvdmVyc3RlbiIsImEiOiJjazl6dDd4OGQwZ25pM2VuYTZoYm1qNmtsIn0.LysE7jICC_Id3-aFgr9_Bg`;
  var basemap = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}`;
  var attrib = `
    Food Truck Data compiled by
      <a href="https://www.thesheridanpress.com">The Sheridan Press</a>.
    Map powered by
      <a href="https://www.agterra.com">AgTerra Technologies</a>,
      <a href="https://www.mapbox.com/">Mapbox</a> and
      <a href="https://www.openstreetmap.org/">OpenStreetMap</a>
  `;
  var truckGroups = [], dayGroup = [], othersDetail = '';
  var blackIcon = L.icon({
    iconUrl: '/images/food-truck.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  var greenIcon = L.icon({
    iconUrl: '/images/Food-Truck-green.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  var blueIcon = L.icon({
    iconUrl: '/images/Food-Truck-blue.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  var count = 0;
  $(response).find('Point').each(function() {
    var title = $(this).find('Title').text();
    var description = $(this).find('Description p').html();
    var lat = $(this).find('Latitude').text();
    var lon = $(this).find('Longitude').text();

    var elements = description.split('<br xmlns=\"http://schemas.datacontract.org/2004/07/MapItFast.Models.Map\"/>');

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
              icon: greenIcon
            }).bindPopup(popup)
          );
        } else {
          truckGroups.push({
            "day": object.Days[i],
            "trucks": [
              L.marker([lat, lon], {
                title: title,
                alt: title,
                icon: greenIcon
              }).bindPopup(popup)
            ],
          });
        }
      }
    } else {
      object.Notes = (object.Notes == '') ? 'No details available' : object.Notes;
      var row = (count % 2 == 0) ? 'even' : 'odd';
      othersDetail += `
        <div class="other-truck ${row}">
          <span class="title">${title}</span>
          <span class="notes">${object.Notes}</span>
          <span class="menu"><a href="${object.Website}">Menu</a></span>
        </div>
      `;
      count++;
    }
  });
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

  var baseLayers = {
    "Mapbox": mapbox
  };

  var map = L.map('mymap', {
    center: [44.79713969,-106.95568084],
    zoom: 14,
    layers: [mapbox, ...truckLayer]
  });

  L.Control.Branding = L.Control.extend({
    onAdd: function(map) {
      var wrap = L.DomUtil.create('div','branding');
      var brands = L.DomUtil.create('div','brands',wrap);
      var brand1 = L.DomUtil.create('div','brand1',brands);
      var brand2 = L.DomUtil.create('div','brand2',brands);
      var title = L.DomUtil.create('div','title',brand2);
      var brand3 = L.DomUtil.create('div','brand3',brand2);
      var img1 = L.DomUtil.create('img','logo1',brand1);
      var power = L.DomUtil.create('div','powered',brand3);
      var img2 = L.DomUtil.create('img','logo2',brand3);
      return wrap;
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
  L.control.branding({position: 'topleft'}).addTo(map);
  L.control.layer({ position: 'topright' }).addTo(map);
  L.control.othertrucks({ position: 'topright' }).addTo(map);

  $('.map-title').html('<a href="#">Other Local Trucks <i class="fas fa-info-circle"></i></a>');
  $('.day-select').append('<h2>Day Selector</h2>');
  var count = 0;
  for (var i = 0; i < truckGroups.length; i++) {
    if (truckGroups[i].day != '') {
      var row = (count % 2 == 0) ? 'even' : 'odd';
      $('.day-select').append(`<a href="#" class="day-toggle ${row}" data-day="${truckGroups[i].day}">${truckGroups[i].day}</a>`);
      count++;
    }
  }

  $('.branding .logo1').attr('src','/images/press.png');
  $('.branding .logo2').attr('src','/images/agterra.png');
  $('.branding .title').text('Food Truck Finder');
  $('.branding .powered').text('Powered by');
  $('.others').css('display','none').html(othersDetail);
  $('.map-title').click(function() {
    $('.others').slideToggle(1000);
    $('.map-title i').toggleClass('fa-info-circle').toggleClass('fa-window-close');
    return false;
  });
  $('.day-toggle').click(function() {
    var day = $(this).attr('data-day');
    $(this).siblings().removeClass('active');
    $(this).addClass('active');

    for (var i = 0; i < truckGroups.length; i++) {
      for (var j = 0; j < truckGroups[i].trucks.length; j++) {
        truckGroups[i].trucks[j].setIcon(blackIcon);
      }
    }
    var truckMarkers = truckGroups.find(group => group.day == day);
    console.log(day, truckMarkers);

    for (var i = 0; i < truckMarkers.trucks.length; i++) {
      console.log(truckMarkers.trucks[i].getIcon());
      truckMarkers.trucks[i].setIcon(greenIcon);
    }
    return false;
  });
}
