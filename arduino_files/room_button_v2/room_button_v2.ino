/*
This sketch transmits 2 analog values through an nRF24L01 wireless module.
*/
 
#include <SPI.h>
#include "nRF24L01.h"
#include "RF24.h"
 
int reading = 0; 
 
long lastDebounceTime = 0;  // the last time the output pin was toggled
long debounceDelay = 50;    // the debounce time; increase if the output flickers 
long debounceDelay2 = 1500;    // the debounce time; increase if the output flickers 

int buttonPin = 4;
int ledPin = 5;

// Variables will change:
int ledState = HIGH;         // the current state of the output pin
int buttonState;             // the current reading from the input pin
int lastButtonState = LOW;

int statusInt = 10;
int statusInt2 = 11;

boolean sendIt = false;
boolean sendItLong = false;
boolean longDone = false;

long timeoutDelay = 1000;
long timeoutCounter = 0;

long noDoubleClick = 500;
long noDoubleCounter = 0;

RF24 radio(9,10);
 
const uint64_t pipe = 0xABCDABCD71LL;
 
 
int tempSendCounter = 0;
void setup(void)
{
  pinMode(buttonPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(57600);

  radio.begin();
  radio.enableAckPayload();
  radio.setRetries(15,15);
  //radio.setPayloadSize(8);
  radio.openWritingPipe(pipe);
  
  noDoubleCounter = millis();
}
 
void loop(void)
{
  
  // read the state of the switch into a local variable:
  
  reading = digitalRead(buttonPin);

  // check to see if you just pressed the button 
  // (i.e. the input went from LOW to HIGH),  and you've waited 
  // long enough since the last press to ignore any noise:  

  // If the switch changed, due to noise or pressing:
  if (reading != lastButtonState) {
    // reset the debouncing timer
    lastDebounceTime = millis();
  } 
  
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // whatever the reading is at, it's been there for longer
    // than the debounce delay, so take it as the actual current state:

    // if the button state has changed:
    if (reading != buttonState) {
      buttonState = reading;

      // only toggle the LED if the new button state is HIGH
      if (buttonState == HIGH) {
        //ledState = !ledState;
        sendIt = true;
      }
    }
  }
  
  if((millis() - lastDebounceTime) > debounceDelay2)
  {
    if(reading == HIGH && !longDone)
    {
      longDone = true;
      sendItLong = true;
    }
  }
  if(reading == LOW)
  {
    longDone = false;
  }
 
  
  // set the LED:
  //digitalWrite(ledPin, ledState);
  if(sendIt)
  {
    Serial.println("Send It worked");
    tempSendCounter++;
    Serial.println(tempSendCounter);
    boolean done = false;
    while(!done)
    {
      done = radio.write( &statusInt, sizeof(statusInt) );
    }
    sendIt = false;
  }
  if(sendItLong)
  {
    boolean done = false;
    while(!done)
    {
      done = radio.write( &statusInt2, sizeof(statusInt2) );
    }
    sendItLong = false;
  }
  // save the reading.  Next time through the loop,
  // it'll be the lastButtonState:
  lastButtonState = reading;
  
}
