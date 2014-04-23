#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <SerialCommand.h>
#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h> // have to include this for sCmd to compile correctly

SoftwareSerial impSerial(8,7); // RX on 8, TX on 7 (we're going to ignore TX for now);

SerialCommand sCmd(impSerial);     // The demo SerialCommand object

// If using software SPI (the default case):
#define OLED_MOSI   9
#define OLED_CLK   10
#define OLED_DC    11
#define OLED_CS    12
#define OLED_RESET 13
Adafruit_SSD1306 display(OLED_MOSI, OLED_CLK, OLED_DC, OLED_RESET, OLED_CS);

#define PIN 6
Adafruit_NeoPixel strip = Adafruit_NeoPixel(16, PIN, NEO_GRB + NEO_KHZ800);


#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

int currentLedIndex = 0;
int currentStationId = 0;

void setup()   {                
  Serial.begin(9600);
  impSerial.begin(9600);
  
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  
  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC);
  display.clearDisplay();
 

  // Setup callbacks for SerialCommand commands
  sCmd.addCommand("D", handleDirection);  // D [direction] [distance] [stationID]
  sCmd.addDefaultHandler(unrecognized);   // Handler for command that isn't matched  (says "What?")
  Serial.println("Ready");
  
  // text display tests
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("Ready");
  display.display();
}

void loop() {
  sCmd.readSerial();
}

void unrecognized() {
  Serial.println("What?");
}

void handleDirection() {
  char *arg;
  int heading;
  int distance;
  int id;
  
  arg = sCmd.next();    // Get the next argument from the SerialCommand object buffer
  if (arg != NULL)      // As long as it existed, take it
  {
    heading = atoi(arg);
  } 
  
  arg = sCmd.next();
  if (arg != NULL)
  { 

    distance = atoi(arg);
  } else {
    distance = 2000;
  }
  
  arg = sCmd.next();
  if (arg != NULL) 
  {
    id = atoi(arg);
  } else {
    id = currentStationId;
  }
   
  if(id != currentStationId) { 
    pulse(); // TODO: only pulse if it's a different station ident.
    currentStationId = id;
  }
  lightHeading(heading, distance);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);
  display.println("Heading");
  display.setCursor(64,0);
  display.println("Distance");
  display.setTextSize(2);
  display.setCursor(0,16);
  display.println(heading);
  display.setCursor(64,16);
  display.println(distance);
  display.display();
}

int degToIndex(int deg) {
  return normalizeLedIndex(deg / 22.5);
}

void pulse() {
  for(int q = 0; q < 16; q++) {
   int brightness;
   if(q < 8) {
     brightness = (q+1) * 8;
   } else {
     brightness = (15-q) * 8;
   }
    for(int j = 0; j < 16; j ++) {
      strip.setPixelColor(j,0,brightness,0);
    }
    strip.show();
    delay(20);
  }
}

int normalizeLedIndex(int i) {
  if(i < 0) {
    i = 16 + i;
  } else if (i > 15) {
    i = i - 16;
  }
  return i;
}

int nearMiddleFar(int distance) {
  // distance in m
  if(distance <= 100) {
    return 2;
  } else if(distance <= 500) {
    return 1;
  } else {
    return 0;
  }
}

void lightHeading(int heading, int distance) {
  int index = degToIndex(heading);
  int surround = nearMiddleFar(distance);
  currentLedIndex = index;
  Serial.print("light heading ");
  Serial.println(index);
  for(int j = 0; j < 16; j ++) {
    int p = 15-j;
    strip.setPixelColor(p,0);
    if(index == j) {
      int p = 15-j;
      strip.setPixelColor(p,0,0,64);
    }
  }
  
  for(int j = 0; j < 16; j ++) {
    if(index == j) {
      if(surround > 0) {
        for(int q= 0; q < surround; q++) {
          int nextLed = normalizeLedIndex(j+q+1);
          int p = 15-nextLed;
          strip.setPixelColor(p,0,0,64);
          Serial.println(p);
          
          int prevLed = normalizeLedIndex(j-q-1);
          p = 15-prevLed;
          strip.setPixelColor(p,0,0,64);
        }
      }
    }
  }
  strip.show();
}
