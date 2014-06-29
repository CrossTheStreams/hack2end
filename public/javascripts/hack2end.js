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
  radius_property : "unsheltered_per_1000_pop",
  current_year : "2007",
  set_layer_colors: function() {
    this.layer.setStyle({color: this.color, fillColor: 'blue', weight:5, fillOpacity: this.fill_value})
  },
  highlight_circle : function () {

    var layer = this.layer,
    coordinates = [layer._latlng.lat,layer._latlng.lng]; 
    map_handler.map.setView(coordinates, 5, {                                                                                                             
      pan: { animate: true },
      zoom: { animate: true }
    });  
    layer.bringToFront();
    layer.setStyle({color: 'white', fillColor: 'yellow'})
  },
  update_radius : function () {
    // average total homeless across years is a little over 10 per 1000 
        value = this.data[this.current_year][this.radius_property];
    //console.log(value);
    // TODO: calculations for other variables
    this.radius = value * 30000.00; 
    //console.log(this.radius);
    return this.radius;
  },
  update_fill_opacity: function() { 
    var value = parseFloat(this.data[this.current_year][map_handler.fill_property]/this.data[this.current_year][this.radius_property]);
    this.fill_value = value; 
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

  $("#logo").on("click",function(){
    window.open("http://www.cehkc.org/", '_blank'); 
  });

  $("#years a").on("click", function(){
    var year = $(this).attr("data-year");
    map_handler.animate_to_year(year);
    $("#selected-year .text").text(year);
    $(this).attr("data-year");
    $(".dropdown").removeClass("open");
    return false;
  });

  $("#comparisons a").on("click", function(){
    var year = map_handler.current_year;
    var comparison = $(this).attr("data-comparison");
    map_handler.fill_property = comparison;
    map_handler.animate_to_year(year);
    $("#selected-comparison .text").text($(this).text());
    $(".dropdown").removeClass("open");
    return false;
  });

  $( "#slider" ).slider({
    value: 2007,
    min: 2007,
    max: 2013,
    step: 1,
    slide: function( event, ui ) {
      console.log(ui.value);
    }
  }).slider("pips");

  //map_handler.slider = $("#slider").slider({ max: 20 , value: 10 });



});

map_handler = {
  fill_property : "total_beds_per_1000_pop",
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
      metro.color = '#f27037';
      //metro.color = randoColorHex();
      var circleLayer = L.circle(template.geometry.coordinates,0).setStyle({color: metro.color, fillColor: 'blue',weight:5}).addTo(map_handler.map); 
      metro.layer = circleLayer;
      circleLayer.metro = metro;

      metro.layer.on('click',function(){
        for (var i = 0; i < map_handler.metro_collection.length; i ++) {
          var metro =  map_handler.metro_collection[i];
          metro.set_layer_colors();
        }
        this.metro.highlight_circle();
      })

      //metro.layer.on('mouseout',function(){
        //this.metro.set_layer_colors();
      //})

      map_handler.metro_dictionary[cocnum] = metro;
      map_handler.metro_collection = map_handler.metro_collection.concat(metro);
    }

    d3.csv("data/Per1000DataNew.csv")
      .row(function(d) { return d; })
      .get(function(error, rows) { 
        for(var i = 0; i < rows.length; i++) {
          var row = rows[i];

            if (!map_handler.metro_dictionary[row.coc_number].data) {
              map_handler.metro_dictionary[row.coc_number].data = {};
            }
            
            map_handler.metro_dictionary[row.coc_number].data[row.year] = {city: row.city, coc_number: row.coc_number, 
                esp_per_1000_pop: parseFloat(row.esp_per_1000_pop), 
                population: parseInt(row.population), 
                unsheltered_per_1000_pop :  parseFloat(row.unsheltered_per_1000_pop),
                psh_per_1000_pop: parseFloat(row.psh_per_1000_pop), 
                rrh_per_1000_pop: parseFloat(row.rrh_per_1000_pop), 
                thp_per_1000_pop: parseFloat(row.thp_per_1000_pop), 
                total_beds_per_1000_pop: parseFloat(row.total_beds_per_1000_pop), 
                total_homeless_per_1000_pop: parseFloat(row.total_homeless_per_1000_pop), 
                year: parseInt(row.year)};
        } 
        
        map_handler.animate_to_year("2007");

      });
  },
  animate_to_year : function (year) {
    map_handler.current_year = year;
    var arr = map_handler.metro_collection;
    for (var i=0; i < arr.length; i++) {
      arr[i].current_year = year;
      arr[i].animate_to_style();
    }
    map_handler.load_chart();
  },
  load_chart: function (timeout) {
    function generateColumns () {
      var other = ['Housing Units Per Capita'],
      unsheltered = ['Unsheltered Per Capita'],
      xarr = ["x"],
      idarr = ["id"];

      for (var i=0; i < map_handler.metro_collection.length; i++) {
        var metro = map_handler.metro_collection[i],
        xarr = xarr.concat(metro.data[metro.current_year].coc_number);
        idarr = xarr.concat(metro.data[metro.current_year].coc_number);
        unsheltered = unsheltered.concat(metro.data[metro.current_year].unsheltered_per_1000_pop);
        other = other.concat(metro.data[metro.current_year][map_handler.fill_property]);
      }
      map_handler.chart_id_collection = idarr;
      return ([xarr, unsheltered, other]);
    }
    if (!map_handler.chart) {
      var chart = c3.generate({
          bindto: "#chart",
          data: {
              x : 'x',
              id : 'id',
              columns: generateColumns(),
              type: 'bar'
          },
          color: {
            pattern: ['#f27037','#1b9bff']
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
      d3.selectAll('rect').on('click',function(d){  
        //console.log(map_handler.chart_id_collection[d.x]);
        for (var i = 0; i < map_handler.metro_collection.length; i ++) {
          var metro =  map_handler.metro_collection[i];
          metro.set_layer_colors();
        }
        map_handler.metro_collection[d.x].highlight_circle()
      })


    } else {

      setTimeout(function () {
        map_handler.chart.load({
          columns: generateColumns()
        });
        $(".c3-legend-item-Housing-Units-Per-Capita").find('text').text($("#selected-comparison").text().trim())
      }, timeout);

    }

  },
  init_map : function() { 
    this.fetch_data(function(){
      var map = L.mapbox.map('map-canvas','balasubr.i5dk1j3f').setView([39.50, -98.35], 4);
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

