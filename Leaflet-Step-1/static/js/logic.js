// Pulling all earthquakes in past day 
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
// console.log(queryUrl)

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(earthquakeData, points){
            return L.circle(points,{
            radius: earthquakeData.properties.mag*20000,
            color: getColor(earthquakeData.properties.mag),
            fillOpacity: 0.6,
            weight: 1.5
        })
        },
      });

      // Function to change color based on magnitude 
      function getColor(magnitude) {
        let color = 'black'
        if (magnitude>5){
            color = "red"
        }
        else if (magnitude>4){
            color = "#FF6347"
        }
        else if (magnitude>3){
            color = "orange"
        }
        else if (magnitude>2){
            color = "yellow"
        }
        else if (magnitude>1){
            color = "#ADFF2F"
        }
        else {
            color = "green"
        }
        return color
    }
        

    // Give each feature a popup describing the place, magnitude and time of the earthquake
    function onEachFeature(feature, layer) {
        console.log('on each feature')
        layer.bindPopup("<h3>" + feature.properties.place + "<p> Magnitude- " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
  }
  
  function createMap(earthquakes) {
  
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/streets-v11",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [streetmap, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: true
    }).addTo(myMap);

    
    // color for legend 
    function getColor(d) {
        return d>5 ? "red" :
            d>4 ? "#FF6347":
            d>3 ? "orange":
            d>2 ? "yellow":
            d>1 ? "#ADFF2F":
                "green";
    }

    let legend = L.control({
        position: "bottomright"
    })

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend')
        let grades = [0,1, 2, 3, 4, 5]
        labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

legend.addTo(myMap);

}