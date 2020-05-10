$(document).ready(function() {
  var url = {
    "local": "/xml/food-trucks.xml",
    "remote": "https://mapitfast.agterra.com/api/Points/?projectId=2572"
  };

  $('#refresh').click(function() {
    getMarkers('GET', url.local);

    return false;
  });

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
  var trucks = [];
  var greenIcon = L.icon({
    iconUrl: '/images/food-truck.svg',
    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });
  $(response).find('Point').each(function() {
    var title = $(this).find('Title').text();
    var description = $(this).find('Description').html();
    var lat = $(this).find('Latitude').text();
    var lon = $(this).find('Longitude').text();
    var form = $(this).find('d3p1:FormRowId').text();

    var formData = (form) ? `Record: ${form}` : `No data for this truck`;

    var popup = `
      <h1>${title}</h1>
      <p>${description}</p>
      <p>${formData}</p>
    `;
    trucks.push(
      L.marker([lat, lon], {
        title: title,
        icon: greenIcon
      }).bindPopup(popup)
    );
  });
  var truckLayer = L.layerGroup(trucks);

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
  var overlayMaps = {
    "Trucks": trucks
  };

  var map = L.map('mymap', {
    center: [44.79713969,-106.95568084],
    zoom: 14,
    layers: [mapbox, truckLayer]
  });

  L.control.layers(baseLayers, overlayMaps).addTo(map);
}
