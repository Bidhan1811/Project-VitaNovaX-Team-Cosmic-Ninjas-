import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import requests
import io
from scipy.spatial.distance import euclidean
import time

# -----------------------------
# ThingSpeak configuration
# -----------------------------
CHANNEL_ID = "2851466"
READ_API_KEY = "JN77FF4HM4O0FHYB"
NUM_RESULTS = 100
URL = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.csv?api_key={READ_API_KEY}&results={NUM_RESULTS}"

# -----------------------------
# Load Arrhythmia reference ECG
# -----------------------------
arrhythmia_file = r"C:\Users\Arnab\OneDrive\Desktop\code\pythonprojects\Heartdiseaseprediction\dataHeart\mitbih_test.csv\mitbih_test.csv"  # replace with your path
arr_data = pd.read_csv(arrhythmia_file)
print(arr_data.columns)

# Use the first row as the reference ECG (all 188 columns)
arr_ecg = arr_data.iloc[0].values.astype(float)

# -----------------------------
# Normalize function
# -----------------------------
def normalize(signal):
    return (signal - np.min(signal)) / (np.max(signal) - np.min(signal))

# -----------------------------
# Fetch live ECG from ThingSpeak
# -----------------------------
def get_live_ecg():
    try:
        response = requests.get(URL)
        response.raise_for_status()
        data = pd.read_csv(io.StringIO(response.text))
        if 'field1' in data.columns:
            values = data['field1'].dropna().values.astype(float)
            return values if len(values) > 0 else None
        return None
    except:
        return None

# -----------------------------
# Extract last N points and normalize
# -----------------------------
def prepare_signals(live_ecg, ref_ecg, n_points=50):
    live_last = live_ecg[-n_points:] if len(live_ecg) >= n_points else live_ecg
    ref_last = ref_ecg[:len(live_last)]  # trim to same length
    return normalize(live_last), normalize(ref_last)

# -----------------------------
# Compute similarity
# -----------------------------
def compute_similarity(live_norm, ref_norm):
    distance = euclidean(live_norm, ref_norm)
    similarity = 1 / (1 + distance)
    return similarity

# -----------------------------
# Live monitoring loop
# -----------------------------
while True:
    live_ecg = get_live_ecg()
    
    if live_ecg is None or len(live_ecg) < 10:
        print("NodeMCU offline — cannot make prediction")
    else:
        live_norm, ref_norm = prepare_signals(live_ecg, arr_ecg, n_points=50)
        similarity = compute_similarity(live_norm, ref_norm)
        
        status = "Arrhythmia ⚠️" if similarity > 0.7 else "Normal ✅"
        
        # ----- Plot signals -----
        plt.figure(figsize=(10, 4))
        plt.plot(live_norm, label="Live ECG", color='blue')
        plt.plot(ref_norm, label="Arrhythmia ECG", color='red', alpha=0.7)
        plt.title(f"Live ECG vs Arrhythmia ECG | Status: {status} | Similarity: {similarity:.2f}")
        plt.xlabel("Sample Number")
        plt.ylabel("Normalized ECG Value")
        plt.legend()
        plt.grid(True)
        plt.show(block=False)
        plt.pause(0.1)
        plt.clf()
        
        # ----- Print status -----
        print(f"Similarity: {similarity:.2f} | Prediction: {status}")

    time.sleep(5)  # update every 5 seconds
