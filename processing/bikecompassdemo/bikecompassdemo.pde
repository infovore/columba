/**
 * Simple Write. 
 * 
 * Check if the mouse is over a rectangle and writes the status to the serial port. 
 * This example works with the Wiring / Arduino program that follows below.
 */


import processing.serial.*;

Serial myPort;  // Create object from Serial class
int wait = 2000;


void setup() 
{
  size(200, 200);
  // I know that the first port in the serial list on my mac
  // is always my  FTDI adaptor, so I open Serial.list()[0].
  // On Windows machines, this generally opens COM1.
  // Open whatever port is the one you're using.
  println(Serial.list());
  String portName = Serial.list()[10];
  myPort = new Serial(this, portName, 9600);
  noLoop();
}

void draw() {
  myPort.write("D 270 550 1\r");
  delay(wait);
  myPort.write("D 290 500 1\r");
  delay(wait);
  myPort.write("D 310 450 1\r");
  delay(wait);
  myPort.write("D 124 420 2\r");
  delay(wait);
  myPort.write("D 134 220 2\r");
  delay(wait);
  myPort.write("D 144 75 2\r");
  delay(wait);
  myPort.write("D 154 45 2\r");
}