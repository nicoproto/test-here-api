import { Controller } from "stimulus"

export default class extends Controller {
  static targets = ["map"]

  connect() {
    var platform = new H.service.Platform({
      'apikey': 'I6l1zdv4Ck06BI-C1DqlK6m1q6j37YK3nl5pqYQa4v8'
    });

    // Retrieve the target element for the map:
    var mapElement = document.getElementById('mapContainer');

    // Get the default map types from the platform object:
    var defaultLayers = platform.createDefaultLayers();

    // Instantiate the map:
    var map = new H.Map(
      mapElement,
      defaultLayers.vector.normal.map, {
        zoom: 10,
        center: {
          lat: 52.51,
          lng: 13.4
        }
      });

    var ui = H.ui.UI.createDefault(map, defaultLayers, 'en-US');
    var mapEvents = new H.mapevents.MapEvents(map);
    var behavior = new H.mapevents.Behavior(mapEvents);

    // Create the parameters for the routing request:
    var routingParameters = {
      'routingMode': 'fast',
      'transportMode': 'car',
      // The start point of the route:
      'origin': '52.5160,13.3779',
      // The end point of the route:
      'destination': '52.5185,13.4283',
      // Include the route shape in the response
      'return': 'polyline',
      // Avoid specific areas
      'avoid': '52.54226,13.39165;52.54135,13.39457!52.523,13.41447;52.52041,13.42069'
    };

    // Define a callback function to process the routing response:
    var onResult = function (result) {
      // ensure that at least one route was found
      if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
          // Create a linestring to use as a point source for the route line
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: {
              strokeColor: 'blue',
              lineWidth: 3
            }
          });

          // Create a marker for the start point:
          let startMarker = new H.map.Marker(section.departure.place.location);

          // Create a marker for the end point:
          let endMarker = new H.map.Marker(section.arrival.place.location);

          // Add the route polyline and the two markers to the map:
          map.addObjects([routeLine, startMarker, endMarker]);

          // Set the map's viewport to make the whole route visible:
          map.getViewModel().setLookAtData({
            bounds: routeLine.getBoundingBox()
          });
        });

      }
    };

    // Get an instance of the routing service version 8:
    var router = platform.getRoutingService(null, 8);

    // Call calculateRoute() with the routing parameters,
    // the callback and an error callback function (called if a
    // communication error occurs):
    router.calculateRoute(routingParameters, onResult,
      function (error) {
        alert(error.message);
      });
  }
}




