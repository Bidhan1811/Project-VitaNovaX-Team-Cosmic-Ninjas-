#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>

// ----- WiFi Credentials -----
const char* ssid = "Samsung galaxy a73s 5g";
const char* password = "1234567890";

// ----- Telegram Bot Details -----
const String BOT_TOKEN = "8003303436:AAF730t2qt_pvXapS01Cvg1rzRMjsE2JYVk";
const String CHAT_ID = "5421703975";

WiFiClientSecure client;
UniversalTelegramBot bot(BOT_TOKEN, client);

// SW-420 vibration sensor pin
#define VIBRATION_PIN D2
bool accidentSent = false;

void setup() {
  Serial.begin(115200);
  pinMode(VIBRATION_PIN, INPUT);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");

  client.setInsecure(); // Disable SSL certificate verification
}

void loop() {
  int sensorValue = digitalRead(VIBRATION_PIN);

  if (sensorValue == HIGH && !accidentSent) {
    Serial.println("⚠️ Accident Detected!");
    bot.sendMessage(CHAT_ID, "⚠️ Accident Detected!", "");
    accidentSent = true; // Prevent repeated messages
  } 
  else if (sensorValue == LOW) {
    accidentSent = false; // Reset when vibration stops
  }

  delay(200); // Small delay to avoid spamming messages
}

