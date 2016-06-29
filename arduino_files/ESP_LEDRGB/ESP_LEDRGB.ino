/*
 * Copyright (c) 2015, Majenko Technologies
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice, this
 *   list of conditions and the following disclaimer in the documentation and/or
 *   other materials provided with the distribution.
 *
 * * Neither the name of Majenko Technologies nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include "RGBdriver.h"
#define CLK 12//pins definitions for the driver        
#define DIO 14
RGBdriver Driver(CLK,DIO);

const char *ssid = "XXXXXX";
const char *password = "XXXXXX";

ESP8266WebServer server ( 80 );

int r,g,b = 0;
void uptime() {
  char temp[400];
  int sec = millis() / 1000;
  int min = sec / 60;
  int hr = min / 60;

  snprintf ( temp, 400,

"<html>\
  <head>\
    <meta http-equiv='refresh' content='5'/>\
    <title>ESP8266 Demo</title>\
    <style>\
      body { background-color: #cccccc; font-family: Arial, Helvetica, Sans-Serif; Color: #000088; }\
    </style>\
  </head>\
  <body>\
    <h1>Hello from ESP8266!</h1>\
    <p>Uptime: %02d:%02d:%02d</p>\
  </body>\
</html>",

    hr, min % 60, sec % 60
  );
  server.send ( 200, "text/html", temp );
}
void handleRoot() {
  for ( uint8_t i = 0; i < server.args(); i++ ) {
    if(server.argName(i) == "r")
    {
      r = server.arg(i).toInt();
    }
    else if(server.argName(i) == "g")
    {
      g = server.arg(i).toInt();
    }
    else if(server.argName(i) == "b")
    {
      b = server.arg(i).toInt();
    }
    if(server.argName(i) == "color")
    {
    Serial.println(server.arg(i));
     
    }
  }
  //const unsigned red = r, green = g, blue = b;
  char hexcol[16];
  snprintf(hexcol, sizeof hexcol, "%02x%02x%02x", r, g, b);
  Serial.println(hexcol);
  Serial.print("Red: ");
    Serial.println(r);
    Serial.print("Green: ");
    Serial.println(g);
    Serial.print("Blue: ");
    Serial.println(b);

char site[2500];
snprintf ( site, 2500, 
"<!doctype html>\n\
<html>\n\
<head>\n\
<title>RGB Light 1</title>\n\
<style>\
a {\
 float:left;\
  margin-top:20px;\
  margin-right:10px;\
  padding:20px;\
  width: 20%;\
  height:30%;\
  border:solid medium grey;\
}\
</style>\
<script>\
</script>\
</head>\
<body>\
<h1>RGB Light Control</h1>\
<a style=\"color:white;background-color:red;\" href=\"?r=255&g=0&b=0\">\
Red\
</a>\
<a style=\"color:white;background-color:blue;\" href=\"?r=0&g=0&b=255\">\
Blue\
</a>\
<a style=\"color:white;background-color:green;\" href=\"?r=0&g=255&b=0\">\
Green\
</a>\
<a style=\"color:black;background-color:yellow;\" href=\"?r=255&g=255&b=0\">\
Yellow\
</a>\
<a style=\"color:black;background-color:orange;\" href=\"?r=255&g=145&b=0\">\
Orange\
</a>\
<a style=\"color:white;background-color:purple;\" href=\"?r=255&g=0&b=255\">\
Purple\
</a>\
<a style=\"color:black;background-color:white;\" href=\"?r=255&g=255&b=255\">\
White\
</a>\
<a style=\"color:white;background-color:black;\" href=\"?r=0&g=0&b=0\">\
OFF\
</a>\
</body>\
</html>",
hexcol);

	Driver.begin();
  delay(10);
  Driver.SetColor(r, g, b);//set color
  delay(10);
  Driver.end();
  delay(10);
	server.send ( 200, "text/html", site );
}

void handleNotFound() {
	String message = "File Not Found\n\n";
	message += "URI: ";
	message += server.uri();
	message += "\nMethod: ";
	message += ( server.method() == HTTP_GET ) ? "GET" : "POST";
	message += "\nArguments: ";
	message += server.args();
	message += "\n";

	for ( uint8_t i = 0; i < server.args(); i++ ) {
		message += " " + server.argName ( i ) + ": " + server.arg ( i ) + "\n";
	}
 
	server.send ( 404, "text/plain", message );
}

void setup ( void ) {
	Serial.begin ( 115200 );
	WiFi.begin ( ssid, password );
	Serial.println ( "" );

	// Wait for connection
	while ( WiFi.status() != WL_CONNECTED ) {
		delay ( 500 );
		Serial.print ( "." );
	}

	Serial.println ( "" );
	Serial.print ( "Connected to " );
	Serial.println ( ssid );
	Serial.print ( "IP address: " );
	Serial.println ( WiFi.localIP() );

	if ( MDNS.begin ( "esp8266" ) ) {
		Serial.println ( "MDNS responder started" );
	}

	server.on ( "/", handleRoot );
	server.on ( "/uptime", uptime );
  server.on ( "/color", []() {
  String reportColor = String(r) + "\n" + String(g) + "\n" + String(b);
    server.send ( 200, "text/plain", reportColor );
  } );
	server.onNotFound ( handleNotFound );
	server.begin();
	Serial.println ( "HTTP server started" );
}

void loop ( void ) {
	server.handleClient();
}

void Wheel(byte WheelPos) {
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
     Driver.begin();
     Driver.SetColor(255 - WheelPos * 3, 0, WheelPos * 3); //set rgb
     Driver.end();
     return;
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
     Driver.begin();
     Driver.SetColor(0, WheelPos * 3,  255 - WheelPos * 3); //set rgb
     Driver.end();
     return;
  }
  WheelPos -= 170;
     Driver.begin();
     Driver.SetColor(WheelPos * 3, 255 - WheelPos * 3, 0); //set rgb
     Driver.end();
return;
}
