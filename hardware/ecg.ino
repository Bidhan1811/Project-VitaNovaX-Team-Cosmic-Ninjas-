#include <ESP8266WiFi.h>
#include "ThingSpeak.h"

// ---- WiFi Credentials ----
const char* ssid = "Samsung galaxy a73s 5g";   
const char* password = "1234567890";           

// ---- ThingSpeak ----
WiFiClient client;
unsigned long myChannelNumber = 2851466;        
const char* myWriteAPIKey = "93Y8WOMVF7615MP7"; 

#define ECG_PIN A0    // ECG output from AD8232
#define LO_PLUS 14    // D5 pin → LO+ pin of AD8232
#define LO_MINUS 12   // D6 pin → LO- pin of AD8232

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ Connected to WiFi");

  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);

  ThingSpeak.begin(client);
}

void loop() {
  int ecgValue = analogRead(ECG_PIN);
  int loPlusState = digitalRead(LO_PLUS);
  int loMinusState = digitalRead(LO_MINUS);

  String contactStatus;
  int alertCode;

  if (loPlusState == 1 || loMinusState == 1) {
    // No proper contact
    contactStatus = "❌ No Contact";
    alertCode = -2; // Just for Serial monitor (not uploaded)

    // Show in Serial only
    Serial.print("ECG Value: -- | Status: ");
    Serial.println(contactStatus);

  } else {
    // Contact detected → process ECG
    contactStatus = "✅ Contact";

    if (ecgValue < 300) {
      alertCode = -1; // Low
      contactStatus += " | ⚠️ Low ECG!";
    } else if (ecgValue > 700) {
      alertCode = 1; // High
      contactStatus += " | ⚠️ High ECG!";
    } else {
      alertCode = 0; // Normal
      contactStatus += " | Normal ECG";
    }

    Serial.print("ECG Value: ");
    Serial.print(ecgValue);
    Serial.print(" | Status: ");
    Serial.println(contactStatus);

    // ✅ Upload only when contact detected
    ThingSpeak.setField(1, ecgValue);   // Raw ECG Value
    ThingSpeak.setField(2, alertCode);  // -1 = Low, 0 = Normal, 1 = High
    ThingSpeak.setField(3, 1);          // 1 = Contact

    int code = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

    if (code == 200) {
      Serial.println("📡 Data uploaded to ThingSpeak");
    } else {
      Serial.print("❌ Upload failed, code: ");
      Serial.println(code);
    }
  }

  delay(15000); // ThingSpeak rate limit
}
