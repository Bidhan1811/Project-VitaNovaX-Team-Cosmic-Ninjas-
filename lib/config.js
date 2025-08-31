export const METRICS = [
  { key: "ecg", label: "ECG", unit: "mV", colorVar: "var(--color-chart-1)", source: "health" },
  { key: "spo2", label: "SpO₂", unit: "%", colorVar: "var(--color-chart-2)", source: "bp" },
  { key: "heartRate", label: "Pulse", unit: "bpm", colorVar: "var(--color-chart-3)", source: "bp" },
  { key: "systolic", label: "Systolic BP", unit: "mmHg", colorVar: "var(--color-chart-4)", source: "bp" },
  { key: "diastolic", label: "Diastolic BP", unit: "mmHg", colorVar: "var(--color-chart-5)", source: "bp" },
  { key: "anaemiaCode", label: "Anaemia Possibility (0-Possible Anaemia, 1-No Anaemia", colorVar: "var(--color-chart-7)", source: "anaemia" },
  { key: "temperature", label: "Environment Temperature", unit: "°C", colorVar: "var(--color-chart-8)", source: "environment" },
  { key: "humidity", label: "Humidity", unit: "%", colorVar: "var(--color-chart-9)", source: "environment" },
  { key: "pressure", label: "Pressure", unit: "hPa", colorVar: "var(--color-chart-10)", source: "environment" },
  { key: "altitude", label: "Altitude", unit: "m", colorVar: "var(--color-chart-11)", source: "environment" },
  { key: "aqi", label: "AQI", colorVar: "var(--color-chart-12)", source: "environment" },
]
