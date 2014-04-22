// handle inbound message from the device
device.on("getNearestStation", function(username) {
   server.log("### I've been asked for a station for " + username);
   
   // get a number from http
   local url = "http://bikecompass.tomarmitage.com/user_locations/" + username + "/nearest_station";
   local request = http.get(url);
   local response = request.sendsync();
   local data = http.jsondecode(response.body);
   
   server.log("### Sending data to the imp: " + data);
   device.send("station", data);
});
