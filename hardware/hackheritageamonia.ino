#include <Wire.h>
#include "Adafruit_TCS34725.h"
#include <ESP8266WiFi.h>
#include <ThingSpeak.h>

// ===== WiFi =====
const char* ssid = "Samsung galaxy a73s 5g";
const char* password = "1234567890";

// ===== ThingSpeak =====
unsigned long channelID = 3044993;
const char* writeAPIKey = "0R5KCN6BNZACSMTD";

WiFiClient client;

// ===== TCS34725 =====
Adafruit_TCS34725 tcs(TCS34725_INTEGRATIONTIME_154MS, TCS34725_GAIN_1X);

// ===== IR Sensor =====
const int irPin = D5;  // Connect IR OUT to D5

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi connected");

  ThingSpeak.begin(client);

  if (!tcs.begin()) {
    Serial.println("❌ No TCS34725 sensor detected!");
    while (1);
  }
}

void loop() {
  int irValue = digitalRead(irPin);

  // IR LOW = finger present, HIGH = no finger (adjust based on your sensor)
  if (irValue == HIGH) {
    Serial.println("❌ No finger detected. Skipping upload.");
    ThingSpeak.setField(1, 0);  // Finger not detected
    ThingSpeak.writeFields(channelID, writeAPIKey);
    delay(500);
    return;
  }

  Serial.println("👍 Finger detected");

  // Read TCS34725
  uint16_t r, g, b, c;
  tcs.getRawData(&r, &g, &b, &c);

  int anemiaStatus = 0;  // 0 = No Anemia, 1 = Possible Anemia
  int hbStatus = 0;      // 0 = Normal Hb, 1 = Low Hb
  float hbLevel = 13.5;  // Default normal Hb (g/dL)

  if ((r + g + b) > 0) {
    float redRatio = (float)r / (r + g + b);

    // Approximate Hb estimation (simple linear mapping)
    // Hb range assumed: 8 g/dL (low) → 16 g/dL (normal-high)
    hbLevel = 9 + (redRatio * 8.0);  

    if (hbLevel < 11.5) {  
      anemiaStatus = 1;
      hbStatus = 1;
    }
  }

  Serial.print("Hb Level (g/dL): "); Serial.println(hbLevel, 2);
  Serial.print("Anemia Status: "); Serial.println(anemiaStatus);
  Serial.print("Hemoglobin Status: "); Serial.println(hbStatus);

  // Send data to ThingSpeak
  ThingSpeak.setField(1, 1);              // Finger detected
  ThingSpeak.setField(2, anemiaStatus);
  ThingSpeak.setField(3, hbStatus);
  ThingSpeak.setField(4, hbLevel);        // Approx Hb value

  int response = ThingSpeak.writeFields(channelID, writeAPIKey);
  if (response == 200) {
    Serial.println("✅ Data sent successfully");
  } else {
    Serial.println("❌ Upload failed, HTTP code: " + String(response));
  }

  delay(20000);  // ThingSpeak minimum update interval
}

