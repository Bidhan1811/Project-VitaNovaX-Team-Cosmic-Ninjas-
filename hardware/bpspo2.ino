#include <Wire.h>
#include "MAX30105.h"          // MAX30102/MAX30105 library
#include "spo2_algorithm.h"
#include <ESP8266WiFi.h>
#include "ThingSpeak.h"

MAX30105 particleSensor;

// WiFi credentials
const char* ssid = "Samsung galaxy a73s 5g";
const char* password = "1234567890";

// ThingSpeak
WiFiClient client;
unsigned long myChannelNumber = 2913017;   // replace with your ThingSpeak Channel ID
const char * myWriteAPIKey = "AU8284CA19QFLYZH"; // replace with your Write API Key

// Variables
int32_t bufferLength;
uint32_t irBuffer[100]; // IR LED sensor data
uint32_t redBuffer[100]; // Red LED sensor data
int32_t spo2; // SPO2 value
int8_t validSPO2; // indicator to show if the SPO2 calculation is valid
int32_t heartRate; // heart rate value
int8_t validHeartRate; // indicator to show if the heart rate calculation is valid

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi Connected!");
  ThingSpeak.begin(client);

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("MAX30102 was not found. Please check wiring/power.");
    while (1);
  }
  Serial.println("Place your finger on the sensor...");

  particleSensor.setup(); // configure with default settings
  particleSensor.setPulseAmplitudeRed(0x0A); // Turn Red LED low to indicate sensor is running
  particleSensor.setPulseAmplitudeGreen(0); // Turn off Green LED
}

void loop() {
  bufferLength = 100; // sample 100 samples (4 seconds)
  for (int i = 0; i < bufferLength; i++) {
    while (!particleSensor.available())
      particleSensor.check(); // Check sensor for new data

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample(); // move to next sample
  }

  // Calculate Heart Rate and SpO2
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer,
                                         &spo2, &validSPO2, &heartRate, &validHeartRate);

  if (validHeartRate && validSPO2) {
    Serial.print("BPM: ");
    Serial.println(heartRate);

    Serial.print("SpO2: ");
    Serial.print(spo2);
    Serial.println("%");

    // Approximate Blood Pressure (not medical accurate!)
    int systolic = 90 + (heartRate / 2);
    int diastolic = 60 + (heartRate / 3);

    Serial.print("Estimated BP: ");
    Serial.print(systolic);
    Serial.print("/");
    Serial.println(diastolic);

    // Upload to ThingSpeak
    ThingSpeak.setField(1, heartRate);  // BPM
    ThingSpeak.setField(2, spo2);       // SpO2
    ThingSpeak.setField(3, systolic);   // Systolic BP
    ThingSpeak.setField(4, diastolic);  // Diastolic BP

    int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
    if (x == 200) {
      Serial.println("Data pushed to ThingSpeak successfully");
    } else {
      Serial.println("Problem pushing data. HTTP error code " + String(x));
    }
  } else {
    Serial.println("Place finger properly on the sensor...");
  }

  delay(20000); // ThingSpeak requires 15+ sec delay
}

