#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <ThingSpeak.h>

// ====== WiFi Credentials ======
const char* ssid = "Samsung galaxy a73s 5g";
const char* password = "1234567890";

// ====== ThingSpeak ======
WiFiClient client;
unsigned long myChannelNumber = 2910602;
const char * myWriteAPIKey = "M7RSJU5EI70HK611";

// ====== BMP280 ======
Adafruit_BMP280 bmp;  // I2C

// ====== DHT11 ======
#define DHTPIN D4       // change pin if needed
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// ====== MQ5 ======
int mq5_pin = A0;

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected");

  ThingSpeak.begin(client);

  // Initialize BMP280
  if (!bmp.begin(0x76)) {   // change to 0x77 if needed
    Serial.println("❌ Could not find BMP280 sensor, check wiring!");
    while (1);
  } else {
    Serial.println("✅ BMP280 detected!");
  }

  dht.begin();
}

void loop() {
  // ====== Read DHT11 ======
  float dht_temp = dht.readTemperature();   // °C
  float humidity = dht.readHumidity();

  if (isnan(dht_temp) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT11 sensor!");
    return;
  }

  // ====== Read BMP280 ======
  float pressure = bmp.readPressure() / 100.0F;     // hPa
  float altitude = bmp.readAltitude(750);        // Kolkata avg sea-level pressure ~1005 hPa

  // ====== Read MQ-5 ======
  int mq5_value = analogRead(mq5_pin);
  float air_quality = map(mq5_value, 0, 1023, 0, 100);

  // ====== Print to Serial ======
  Serial.println("---- Sensor Readings ----");
  Serial.print("🌡 Temp (DHT11): "); Serial.print(dht_temp); Serial.println(" °C");
  Serial.print("💧 Humidity: "); Serial.print(humidity); Serial.println(" %");
  Serial.print("⛰ Altitude: "); Serial.print(altitude); Serial.println(" m");
  Serial.print("🌬 Pressure: "); Serial.print(pressure); Serial.println(" hPa");
  Serial.print("🫁 Air Quality: "); Serial.print(air_quality); Serial.println(" %");
  Serial.println("--------------------------");

  // ====== Send to ThingSpeak ======
  ThingSpeak.setField(1, dht_temp);     // Temperature (DHT11)
  ThingSpeak.setField(2, humidity);     // Humidity
  ThingSpeak.setField(3, pressure);     // Pressure
  ThingSpeak.setField(4, altitude);     // Altitude
  ThingSpeak.setField(5, air_quality);  // Air Quality

  int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);

  if (x == 200) {
    Serial.println("✅ Data pushed to ThingSpeak successfully");
  } else {
    Serial.print("❌ Problem uploading data. HTTP error code ");
    Serial.println(x);
  }

  delay(20000);
}

