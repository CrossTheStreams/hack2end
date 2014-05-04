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

// rando color
randoColorHex = function () {
 return (function(m,s,c){return (c ? arguments.callee(m,s,c-1) : '#') +
  s[m.floor(m.random() * s.length)]})(Math,'0123456789ABCDEF',5)
}

Metro = {
  layer : undefined,
  radius : 300000,
  fill_value : 0.5,
  radius_property : "total_homeless_per_1000_pop",
  fill_property : "total_beds_per_1000_pop",
  current_year : "2007",
  update_radius : function () {
    // average total homeless across years is a little over 10 per 1000 
        value = this.data[this.current_year][this.radius_property];
    console.log(value);
    // TODO: calculations for other variables
    this.radius = value * 30000.00; 
    console.log(this.radius);
    return this.radius;
  },
  update_fill_opacity: function() { 
    var sum = 0,
    collection = map_handler.metro_collection;

    for (var i=0; i < collection.length; i ++) {
      sum += parseFloat(collection[i].data[this.current_year][this.fill_property]);
    }
    var avg = sum/collection.length;

    var fill_value = this.data[this.current_year][this.fill_property]/avg * 0.35;

    this.fill_value = fill_value

    return this.fill_value
    
  },
  animate_to_style : function () {
    var metro = this,
    oldSize = metro.layer._mRadius,
    newSize = metro.update_radius();

    oldFill = metro.fill_value;
    newFill = metro.update_fill_opacity();

    var abs_diff = parseInt(Math.abs(newSize - oldSize)/500),
    abs_fill_diff = parseInt(Math.abs(newFill - oldFill));
    
    function anim(i,radius,fillValue) {
      setTimeout(function() {
        metro.layer.setRadius(radius);
        // fillOpacity
        metro.layer.setStyle({fillOpacity: fillValue})
        //console.log(radius);
      }, 5 * i);
    };

    for (var i = 1; i <= 200; ++i) {
      var setSize,
      setFill;
      if (oldSize < newSize) {
        setSize = oldSize + ((i * abs_diff/200) * 500);
      } else {
        setSize = oldSize - ((i * abs_diff/200)* 500); 
      }

      if (oldFill < newFill) {
        setFill = oldFill + ((i * abs_fill_diff/200));
      } else {
        setFill = oldFill - ((i * abs_fill_diff/200)); 
      }

      anim(i,setSize,setFill);
    };

  }
}

$(document).ready(function() { 
  map_handler.init_map();
});


map_handler = {
  init_metros: function() {
    var dictionary = JSON.parse('{"FL-600":[25.773382876628542,-80.19500255584717],"FL-507":[28.51576275598021,-81.37092590332031],"FL-501":[27.95680404117228,-82.45033264160155],"LA-503":[29.952554831950987,-90.08960723876953],"TX-700":[29.761695072417023,-95.36733627319336],"GA-500":[33.747751389895576,-84.3918228149414],"DC-500":[38.896377071814506,-77.03690528869629],"MD-501":[39.290335634075305,-76.61478996276855],"PA-500":[39.95251688800991,-75.16369342803955],"NY-600":[40.7342506899291,-73.99394989013672],"MA-500":[42.360192919586375,-71.05862617492676],"MI-501":[42.34408158403525,-83.05990219116211],"IL-510":[41.87537684702812,-87.62622356414795],"CO-503":[39.73834635103298,-104.98912811279295],"AZ-501":[31.87755764334002,-111.81884765624999],"AZ-502":[33.24787594792436,-112.60986328125],"CA-601":[32.95336814579932,-116.47705078125],"CA-600":[34.27083595165,-118.01513671875],"CA-514":[37.020098201368114,-119.77294921874999],"CA-501":[37.76854362092148,-122.43850708007811],"NV-500":[36.4566360115962,-115.07080078125],"CA-608":[33.87041555094183,-116.38916015624999],"OR-501":[45.51867686272777,-122.67587184906004],"WA-500":[47.834707,-122.033386],"HI-501":[21.48118513100344,-158.02597045898438]}'),
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
      var template = Object.create(json_template),
      cocnum = cocnums[i];
      template.geometry.coordinates = dictionary[cocnum];
      map_handler.feature_collection.features = map_handler.feature_collection.features.concat(template);
      var metro = Object.create(Metro);
      metro.color = randoColorHex();
      var circleLayer = L.circle(template.geometry.coordinates,0).setStyle({color: metro.color, fillColor: 'blue',weight:15}).addTo(map_handler.map); 
      metro.layer = circleLayer;

      metro.layer.on('click',function(){
        console.log(metro.layer._mRadius);
      })

      map_handler.metro_dictionary[cocnum] = metro;
      map_handler.metro_collection = map_handler.metro_collection.concat(metro);
    }

    d3.csv("data/Per1000Data.csv")
      .row(function(d) { return d; })
      .get(function(error, rows) { 
        for(var i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (row.year != "2013") {

            if (!map_handler.metro_dictionary[row.coc_number].data) {
              map_handler.metro_dictionary[row.coc_number].data = {};
            }
            
            map_handler.metro_dictionary[row.coc_number].data[row.year] = {city: row.city, coc_number: row.coc_number, 
                esp_per_1000_pop: parseFloat(row.esp_per_1000_pop), 
                population: parseInt(row.population), 
                psh_per_1000_pop: parseFloat(row.psh_per_1000_pop), 
                rrh_per_1000_pop: parseFloat(row.rrh_per_1000_pop), 
                thp_per_1000_pop: parseFloat(row.thp_per_1000_pop), 
                total_beds_per_1000_pop: parseFloat(row.total_beds_per_1000_pop), 
                total_homeless_per_1000_pop: parseFloat(row.total_homeless_per_1000_pop), 
                year: parseInt(row.year)};
          }
        } 
        
        map_handler.animate_to_year("2007");
        map_handler.load_chart();

      });
  },
  animate_to_year : function (year){
    var arr = map_handler.metro_collection;
    for (var i=0; i < arr.length; i++) {
      arr[i].current_year = year;
      arr[i].animate_to_style();
    }
  },
  load_chart: function (metro_data,timeout) {
    if (!map_handler.chart) {
      var chart = c3.generate({
          bindto: "#chart",
          data: {
              x : 'x',
              columns: [
                  ['x', '2010-01-01', '2011-01-01', '2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01'],
                  ['Unsheltered Per Capita', 30, 200, 100, 400, 150, 250],
                  ['Housing Units Per Capita', 130, 100, 140, 200, 150, 50]
              ],
              type: 'bar'
          },
          axis: {
            x: {
                type: 'categorized' // this needed to load string x value
            }
          },
          bar: {
              width: {
                  ratio: 0.5 // this makes bar width 50% of length between ticks
              }
              // or
              //width: 100 // this makes bar width 100px
          }
      });
      map_handler.chart = chart;
    } else {

      setTimeout(function () {
        map_handler.chart.load({
            columns: [
                 ['x', '2010-01-01', '2011-01-01', '2012-01-01', '2013-01-01', '2014-01-01', '2015-01-01'],
                ['Unsheltered Per Capita', 30, 20, 50, 40, 60, 50],
                ['Housing Units Per Capita', 200, 130, 90, 240, 130, 220],
            ]
        });
      }, timeout);

    }

  },
  init_map : function() { 
    this.fetch_data(function(){
      var map = L.mapbox.map('map-canvas','bubblr.i563kp0b').setView([39.50, -98.35], 4);
      map_handler.map = map; 

      map.whenReady(function(){
        var features = map_handler.data.features;
        map_handler.init_metros(); 
      });

      //for (var i = 0; i < features.length; i ++) {
        //var layer = L.geoJson(features[i]).addTo(map_handler.map),
        //cocnum = features[i].properties.COCNUM;

        //layer.cocnum = cocnum;
        //map_handler.layer_dictionary[cocnum] = layer;
        //map_handler.layer_collection = map_handler.layer_collection.concat(layer);
         
        //layer.on('click',function(e){
          //console.log(JSON.stringify({'coordinates': [e.latlng.lat,e.latlng.lng], 'cocnum': e.target.cocnum}));
          //dictionary[e.target.cocnum] = [e.latlng.lat,e.latlng.lng];
          //console.log(Object.keys(dictionary).length);
        //});
      //} 


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
  feature_collection: {
    "type": "FeatureCollection",
    "features": []
  },
  metro_dictionary: {},
  metro_collection: []
  
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

