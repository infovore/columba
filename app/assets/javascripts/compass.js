// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

$(document).ready(function() {
  if(navigator.geolocation) {
    // send latlong to backend
      // receive json representation of the nearest station and for now, paste
      // it into the window
      
      // store the heading of the nearest station in the window
      // update markup as appropriate
      // store direction on window

      window.addEventListener('deviceorientation', function(e) {
        // get the arc value from north we computed and stored earlier
        if(e.webkitCompassHeading) {
          compassHeading = e.webkitCompassHeading;
          $('#rose').css('-webkit-transform','rotate(-' + compassHeading + 'deg)');		
          // if there's a window.stationDirection, now rotate #arrow in that
          // direction
            
        }
      });
  }
});
