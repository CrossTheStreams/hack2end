// Object.create polyfill
if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) { throw Error('Second argument not supported');}
            if (o === null) { throw Error('Cannot set a null [[Prototype]]');}
            if (typeof o != 'object') { throw TypeError('Argument must be an object');}
            F.prototype = o;
            return new F();
        };
    })();
}

$(document).ready(function() { 
  map_handler.init_map();
});


map_handler = {
  init_geojson_points: function() {
    var dictionary = JSON.parse('{"FL-600":[25.773382876628542,-80.19500255584717],"FL-507":[28.51576275598021,-81.37092590332031],"FL-501":[27.95680404117228,-82.45033264160155],"LA-503":[29.952554831950987,-90.08960723876953],"TX-700":[29.761695072417023,-95.36733627319336],"GA-500":[33.747751389895576,-84.3918228149414],"DC-500":[38.896377071814506,-77.03690528869629],"MD-501":[39.290335634075305,-76.61478996276855],"PA-500":[39.95251688800991,-75.16369342803955],"NY-600":[40.7342506899291,-73.99394989013672],"MA-500":[42.360192919586375,-71.05862617492676],"MI-501":[42.34408158403525,-83.05990219116211],"IL-510":[41.87537684702812,-87.62622356414795],"CO-503":[39.73834635103298,-104.98912811279295],"AZ-501":[31.87755764334002,-111.81884765624999],"AZ-502":[33.24787594792436,-112.60986328125],"CA-601":[32.95336814579932,-116.47705078125],"CA-600":[34.27083595165,-118.01513671875],"CA-514":[37.020098201368114,-119.77294921874999],"CA-501":[37.76854362092148,-122.43850708007811],"NV-500":[36.4566360115962,-115.07080078125],"CA-608":[33.87041555094183,-116.38916015624999],"OR-501":[45.51867686272777,-122.67587184906004],"WA-500":[47.60407971765813,-122.33319282531737],"HI-501":[21.48118513100344,-158.02597045898438]}'),
    cocnums = Object.keys(dictionary),
    json_template = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": undefined
      }
    }
     
    for (var i = 0; i < cocnums.length; i += 1) {
      var template = Object.create(json_template);
      template.geometry.coordinates = dictionary[cocnums[i]];
      map_handler.feature_collection.features = map_handler.feature_collection.features.concat(template);
    }

  },
  init_map : function() { 
    this.fetch_data(function(){
      var map = L.mapbox.map('map-canvas','bubblr.i563kp0b')
      map_handler.map = map; 
      var features = map_handler.data.features;

      for (var i = 0; i < features.length; i ++) {
        var layer = L.geoJson(features[i]).addTo(map_handler.map),
        cocnum = features[i].properties.COCNUM;

        layer.cocnum = cocnum;
        map_handler.layer_dictionary[cocnum] = layer;
        map_handler.layer_collection = map_handler.layer_collection.concat(layer);
         
        layer.on('click',function(e){
          console.log(JSON.stringify({'coordinates': [e.latlng.lat,e.latlng.lng], 'cocnum': e.target.cocnum}));
          dictionary[e.target.cocnum] = [e.latlng.lat,e.latlng.lng];
          console.log(Object.keys(dictionary).length);
        });
      } 

    });

  },
  fetch_data : function(callback) {
    $.ajax({
      url: '/javascripts/simple.geojson',
      complete: function(data) {
        map_handler.data = JSON.parse(data.responseText);
        if (typeof(callback) == 'function') {
          callback.call();
        }
      }
    });
  },
  layer_dictionary : {},
  layer_collection : [],
  feature_collection: {
    "type": "FeatureCollection",
    "features": []
  }
  
  //,feature_from_geom : function (data) {
    //return data.geometries.map(function(geom) {
      //return {
        //type: "Feature",
        //id: geom.id,
        //properties: geom.properties || {},
        //geometry: {
          //type: geom.type,
          //coordinates: topojson.object(topology, geom).coordinates
        //}
      //};
    //});
//}
  
}

