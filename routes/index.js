var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Food Truck Tracker'});
});

router.post('/mif', (req,res) => {
  console.log('Request made');
  var project = 'https://mapitfast.agterra.com/api/Points/?projectId=2572';
  var trucks = [];
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.setRequestHeader('authorization', 'Basic dGhlc2hlcmlkYW5wcmVzczoxNDRlZ3Jpbm5lbGw=');
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var xmlDoc = this.responseXML;
      var x = xmlDoc.getElementsByTagName('Point');
      trucks = getItems(x);
    }
  };
  xmlhttp.open("GET", project, true);
  xmlhttp.send();
  res.status(200).json(trucks);
});

function getItems(items) {
  var store = [];
  for (i = 0; i < items.length; i++) {
    var title = items[i].getElementsByTagName('Title')[0].childNodes[0].nodeValue;
    var description = items[i].getElementsByTagName('Description')[0].childNodes[0].nodeValue;;
    var lat = items[i].getElementsByTagName('Latitude')[0].childNodes[0].nodeValue;;
    var lon = items[i].getElementsByTagName('Longitude')[0].childNodes[0].nodeValue;;
    store.push({"title": title, "description": description, "lat": lat, "lon": lon});
  }
  return store;
}

module.exports = router;
