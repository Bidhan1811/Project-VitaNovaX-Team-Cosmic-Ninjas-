import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import time

# Load saved models
model_ecg = load_model("arrhythmia_model.h5")
model_smoker = load_model("smoker_model.h5")

# Initialize scaler (use same scaling method as during training)
scaler_ecg = StandardScaler()
scaler_smoker = StandardScaler()

# ThingSpeak config
CHANNEL_ID = "2851466"
READ_API_KEY = "JN77FF4HM4O0FHYB"
URL = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.csv?api_key={READ_API_KEY}&results=50"

def get_live_values():
    try:
        data = pd.read_csv(URL)
        if 'field1' in data.columns:
            values = data['field1'].dropna().values
            return values if len(values) > 0 else None
        return None
    except:
        return None

def extract_features(values):
    last_values = values[-50:] if len(values) >= 50 else values
    mean_val = np.mean(last_values)
    std_val = np.std(last_values)
    max_val = np.max(last_values)
    min_val = np.min(last_values)
    return np.array([mean_val, std_val, max_val, min_val]).reshape(1, -1)

def extract_features_from_live_data(values):
    # This is a placeholder. You must implement extraction for all 32 features.
    # For example, if you can compute them, do so here:
    # features = [
    #     compute_0_pre_RR(values),
    #     compute_0_post_RR(values),
    #     ...
    #     compute_1_qrs_morph4(values)
    # ]
    # return np.array(features).reshape(1, -1)
    raise NotImplementedError("You must implement extraction for all 32 features here.")

while True:
    ecg_values = get_live_values()
    
    if ecg_values is None or len(ecg_values) < 10:
        print("NodeMCU offline — cannot make prediction")
    else:
        features = extract_features_from_live_data(ecg_values)
        # Scale features if needed (use the same scaler as training)
        # features = scaler_ecg.transform(features)

        # Predict Arrhythmia
        prediction_probs = model_ecg.predict(features)
        predicted_class = np.argmax(prediction_probs, axis=1)[0]

        print(f"Arrhythmia Prediction Class: {predicted_class} | Probabilities: {prediction_probs[0]}")

    time.sleep(5)  # Update every 5 seconds
