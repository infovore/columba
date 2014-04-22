// set up arduino on hardware UART
arduino <- hardware.uart57;
arduino.configure(9600, 8, PARITY_NONE, 1, NO_CTSRTS);

function getNearestStation() {
  server.log("*** Asking for the nearest station");
  agent.send("getNearestStation", "tom");

  // schedule imp to wakeup in 1 second and do it again. 
  imp.wakeup(1, getNearestStation);
}
 
// start that looping
getNearestStation();

// handle a packet of JSON when it comes in
function handleStationData(data) {
  // send the station as a uart message to our Arduino
  server.log("*** Sending arduino the station " + data);
  local distance = data.racks.distance_rounded
  local name = data.racks.name
  local arc = data.racks.arc_rounded

  if (data.racks.offset_bearing)
    arc = arc + data.racks.offset_bearing;
  if (arc > 359)
    arc = arc - 360;
      
  local string = "D " + arc + " " + distance + " " + name + "\r"; // SerialCommand expects carriage-return termination
  arduino.write(string);
}

// handle messages from the server
agent.on("station", handleStationData);
