#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include "ThingSpeak.h"

// ---- WiFi credentials ----
const char* ssid = "Samsung galaxy a73s 5g";     
const char* password = "1234567890";

// ---- ThingSpeak ----
WiFiClient client;
unsigned long myChannelNumber = 3044993;     // e.g., 1234567
const char* myWriteAPIKey = "0R5KCN6BNZACSMTD";    // get from ThingSpeak

#define ONE_WIRE_BUS 4   // DS18B20 data pin

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");

  ThingSpeak.begin(client);

  pinMode(ONE_WIRE_BUS, INPUT_PULLUP);  // internal pull-up
  sensors.begin();
  sensors.setResolution(12);
}

void loop() {
  sensors.requestTemperatures();
  float tempC = sensors.getTempCByIndex(0);

  if (tempC != DEVICE_DISCONNECTED_C) {
    float tempF = sensors.toFahrenheit(tempC);

    Serial.print("Body Temperature: ");
    Serial.print(tempF, 2);
    Serial.println(" °F");

    // ---- Upload to ThingSpeak ----
    int status = ThingSpeak.writeField(myChannelNumber, 5, tempF, myWriteAPIKey);

    if (status == 200) {
      Serial.println("Update successful to ThingSpeak (Field 5).");
    } else {
      Serial.print("Error updating ThingSpeak. HTTP error code: ");
      Serial.println(status);
    }

  } else {
    Serial.println("Error: DS18B20 not detected!");
  }

  delay(20000); // ThingSpeak minimum delay = 15 seconds
}
