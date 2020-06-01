module.exports = parseTruckData;

function parseTruckData(data) {
  var parsedData = [];
  for (var p = 0; p < data.length; p++) {
    //Truck Details
    var lat = data[p].Latitude;
    var lon = data[p].Longitude;
    var title = data[p].Title;
    var slug = title.trim().replace(/\s/g,'-').toLowerCase();
    var description = data[p].Description.replace(/<\/*p>/g,'');

    var elements = (description.includes('<br />')) ? description.split('<br />') : description.split('\n');
    var object = {'name':title}, label = `<h2>${title}</h2>`;
    for (var i = 0; i < elements.length; i++) {
      var item = elements[i].split("&gt;");
      var key = item[0].trim().charAt(0).toUpperCase() + item[0].trim().slice(1);

      switch (key) {
        case 'Days':
          if (item[1] == '&nbsp;' || item[1] == ' ') {
            var val = [];
            label += '';
            break;
          } else {
            var daySet = [];
            var dayArray = (item[1]) ? item[1].split(',') : [' '];

            for (var d = 0; d < dayArray.length; d++) {
              var day = (dayArray[d] == ' ') ? 'No day data' : dayArray[d].trim();
              daySet.push(day);
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
    parsedData.push({'lat': lat, 'lon': lon, 'object': object,'label': label});
  }
  return parsedData;
}
