//Quake URL
var weekURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//Get request on baseURL
d3.json(weekURL, function(response){
  console.log(response)
  createFeatures(response.features);
  console.log(response.features[0].geometry.coordinates[2])
});

//Function to grab data from each feature for pop up and map
function createFeatures(data) {
  
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p><strong>Magnitude: </strong>" + 
      feature.properties.mag + "<br><strong>Depth: </strong>" +
      feature.geometry.coordinates[2] + " m <br> <strong>Time: </strong>" + 
      new Date(feature.properties.time) + "</p>")
  }

  function getColor(d) {
    return d > 90 ? 'Red':
      d >= 70 ? 'OrangeRed':
      d >= 50 ? 'Orange':
      d >= 30 ? 'Yellow':
      d >= 10 ? 'LawnGreen':
      "Green"
  }  

  function pointToLayer(feature, latlng) {
    var geojsonMarkerOptions = {
      fillColor: getColor(feature.geometry.coordinates[2]),
      radius: feature.properties.mag * 3,
      fillOpacity: 0.8,
      color: "white",
      weight: 2
    }
    return L.circleMarker(latlng, geojsonMarkerOptions);
  };

  var quakes = L.geoJSON(data, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  createMap(quakes);
};

function createMap(quakes) {
  // Adding a tile layer (the background map image) to our map
  // We use the addTo method to add objects to our map

  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
  });
  
  // Creating our initial map object
  // We set the longitude, latitude, and the starting zoom level
  // This gets inserted into the div with an id of 'map'
  var myMap = L.map("map", {
    center: [40, -90],
    zoom: 3,
    layers: [outdoormap, quakes]
  });

  function getColor(d) {
    return d > 90 ? 'Red':
      d >= 70 ? 'OrangeRed':
      d >= 50 ? 'Orange':
      d >= 30 ? 'Yellow':
      d >= 10 ? 'LawnGreen':
      "Green"
  }  
  //Set-up Legend
  var legend = L.control({ position: "bottomright"});
    legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend");
      var grades = [-10, 10, 30, 50, 70, 90];
      var labels = [];

      div.innerHTML += '<strong>Depth</strong><br>'

      for (var i= 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
      }; 
  legend.addTo(myMap);
};
