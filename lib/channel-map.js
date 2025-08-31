// lib/channel-map.js

// Health channel fields (only ECG)
export const HEALTH_FIELD_MAP = {
  ecg: 1, // ECG is field1 in your health channel
}

// BP channel fields
export const BP_FIELD_MAP = {
  heartRate: 1,      // Heart Rate
  spo2: 2,           // SpO2
  systolic: 3,       // Systolic BP
  diastolic: 4,      // Diastolic BP
  diseaseCode: 5,    // Numeric code for predicted risks
}

// Anaemia channel fields
export const ANAEMIA_FIELD_MAP = {
  anaemiaCode: 1,    // Numeric code for anaemia detection
}

// Environment channel fields
export const ENV_FIELD_MAP = {
  temperature: 1,
  humidity: 2,
  pressure: 3,
  altitude: 4,
  aqi: 5,
}

// Helper to safely parse numbers from ThingSpeak fields
export function parseNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}
