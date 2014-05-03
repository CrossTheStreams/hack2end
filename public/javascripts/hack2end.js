$(document).ready(function() { 
  map_handler.init_map();
});

map_handler = {
  init_map : function() {
    var map = L.mapbox.map('map-canvas','bubblr.i51lfm61').setView([47.600335,-122.331210], 15);    
  }
}

