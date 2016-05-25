int buttonState = 0;
int buttonStateLast = 0;
int lightState = 0;
int finalState = 0;
char serialIn = 'D';
long lastDebounceTime = 0;
long debounceDelay = 50;

int tempSwitch = LOW;

#include <Wire.h>
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"

RF24 radio(9,10);
const uint64_t pipe = 0xABCDABCD71LL;
 
int statusInt = 0;
int statusInt2 = 0;

long timing = 0;

const int relayPin1 = 4;
const int relayPin2 = 5;
const int relayPin3 = 6;
const int relayPin4 = 7;
const int soundPin = 3;
//Stuff for Clap

// Variables will change:
int ledState = HIGH;         // the current state of the output pin
// the following variables are long's because the time, measured in miliseconds,
// will quickly become a bigger number than can be stored in an int.
long lastChangeClap = 0;  // the last time the output pin was toggled
long clapTime = 0;
long waitTime = 100;    // the debounce time; increase if the output flickers
boolean firstClap = false;
boolean firstSpace = false;


void setup()
{
  Wire.begin(4);                // join i2c bus with address #4
  Wire.onReceive(receiveEvent); // register event
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  pinMode(relayPin1, OUTPUT);
  pinMode(relayPin2, OUTPUT);
  pinMode(relayPin3, OUTPUT);
  pinMode(relayPin4, OUTPUT);
  pinMode(soundPin, INPUT);
  
   //Default light on
  digitalWrite(relayPin1, HIGH);
  digitalWrite(relayPin2, HIGH);
  digitalWrite(relayPin3, HIGH);
  digitalWrite(relayPin4, HIGH);
 
 
  radio.begin();
  radio.enableAckPayload();
  //radio.setRetries(15,15);
  //radio.setPayloadSize(8);
  radio.openReadingPipe(1,pipe);
  radio.startListening();
}

void loop()
{
 
  if(Serial.available())
  {
    serialIn = Serial.read();
    if(serialIn == 'C')
    {
      digitalWrite(relayPin1, HIGH);
    }
    else if(serialIn == 'D')
    {
      digitalWrite(relayPin1, LOW);
    }
    if(serialIn == 'E')
    {
      digitalWrite(relayPin2, HIGH);
    }
    else if(serialIn == 'F')
    {
      digitalWrite(relayPin2, LOW);
    }
    if(serialIn == 'G')
    {
      digitalWrite(relayPin3, HIGH);
    }
    else if(serialIn == 'H')
    {
      digitalWrite(relayPin3, LOW);
    }
    if(serialIn == 'I')
    {
      digitalWrite(relayPin4, HIGH);
    }
    else if(serialIn == 'J')
    {
      digitalWrite(relayPin4, LOW);
    }
  }
  if ( radio.available() )
  {
    //timing = millis();
    // Dump the payloads until we've gotten everything
    bool done = false;
    while (!done)
    {
      // Fetch the payload, and see if this was the last one.
      done = radio.read( &statusInt, sizeof(statusInt) );
      if(statusInt == 10)
      {
        Serial.print('a');
      }
      if(statusInt == 11) // long press on button
      {
        Serial.print('j');
      }
      if(statusInt == 12) // long press on button
      {
        Serial.print('k');
      }
      if(statusInt == 13) // long press on button
      {
        Serial.print('l');
      }
      if(statusInt == 14) // long press on button
      {
        Serial.print('m');
      }
      
    }
  }
  
  
  
  
 //CLAP STUFF
  int reading = digitalRead(soundPin);
  if(reading)
  {
    if(millis() - lastChangeClap > waitTime)
    {
      if(firstSpace && !firstClap && lastChangeClap < (millis() - 250))
      {
        //Serial.println("Change Led");
        Serial.print('i');
      }
      lastChangeClap = millis();
      if(!firstClap && !firstSpace)
      {
        firstClap = true;
      }
    firstSpace = false;  
    }
    
  }
  if(firstClap && lastChangeClap > (millis() - 400) && lastChangeClap < (millis() - 200))
  {
    if(!reading)
    {
      firstClap = false;
      firstSpace = true;
      //Serial.println("Space Activated");
    }

  }
  if(millis() - 800 > lastChangeClap)
  {
    if(firstClap)
    {
      firstClap = false;
      //Serial.println("Reset Clap. Too long.");
    }
    if(firstSpace)
    {
      firstSpace = false;
      //Serial.println("Reset Space. Too long.");
    }
  }
  
}
void receiveEvent(int howMany)
{
  while(Wire.available()) // loop through all but the last
  {
    char c = Wire.read();
    Serial.print(c);
  }  
}
