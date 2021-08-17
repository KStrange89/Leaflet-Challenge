// url
var weekURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var plateURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

//get request for weekurl
d3.json(weekURL, function(response){
  console.log(response)
  console.log(response.features[0].geometry.coordinates[2])
  //get request for plateurl
  d3.json(plateURL, function(plateShapes){
    console.log(plateShapes)
  
    //get data from each feature
    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p><strong>Magnitude: </strong>" + 
        feature.properties.mag + "<br><strong>Depth: </strong>" +
        feature.geometry.coordinates[2] + " m <br> <strong>Time: </strong>" + 
        new Date(feature.properties.time) + "</p>")
    }

    //define colors
    function getColor(d) {
      return d > 90 ? 'Red':
        d >= 70 ? 'OrangeRed':
        d >= 50 ? 'Orange':
        d >= 30 ? 'Yellow':
        d >= 10 ? 'LawnGreen':
        "Green"
    }  

    //create circle markers
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

    //add popups and markers based
    var quakes = L.geoJSON(response.features, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
    });

    //add tectonic plate lines
    var tectPlates = L.geoJSON(plateShapes.features);

    // add darkmap tile layer
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/dark-v10",
      accessToken: API_KEY
    });

    //add satellitemap tile layer
    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",
      accessToken: API_KEY
    });

    //add outdoors tile layer
    var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/outdoors-v11",
      accessToken: API_KEY
    });

    //create baseMaps
    var baseMaps = {
      "Dark": darkmap,
      "Outdoor": outdoormap,
      "Satellite": satellitemap
    };

    //create overlayMaps
    var overlayMaps = {
      "Earthquakes": quakes,
      "Plates": tectPlates
    };
  
    //create inital map object with default layers
    var myMap = L.map("map", {
      center: [20, 0],
      zoom: 3,
      layers: [outdoormap, quakes, tectPlates]
    });

    //add layer control
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    //legend
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
  });
});
