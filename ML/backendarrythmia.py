import requests
import pandas as pd
import matplotlib.pyplot as plt
import io  
import random
from flask import Flask, send_file, jsonify

# Flask app
app = Flask(__name__)

# ThingSpeak details
CHANNEL_ID = "2851466"
READ_API_KEY = "JN77FF4HM4O0FHYB"
NUM_RESULTS = 100

@app.route("/plot")
def plot():
    # Fetch live ECG data
    url = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.csv?api_key={READ_API_KEY}&results={NUM_RESULTS}"
    response = requests.get(url)
    df = pd.read_csv(io.StringIO(response.text))

    if "field1" not in df.columns:
        return "No ECG data found", 404

    ecg_values = df["field1"].astype(float).values

    # Create plot in memory
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(ecg_values, color="blue")
    ax.set_title("Live ECG Waveform from IoT")
    ax.set_xlabel("Sample Number")
    ax.set_ylabel("ECG Value")
    ax.grid(True)

    # Save plot to memory instead of file
    img_bytes = io.BytesIO()
    plt.savefig(img_bytes, format="png")
    plt.close(fig)
    img_bytes.seek(0)

    return send_file(img_bytes, mimetype="image/png")

@app.route("/predict")
def predict():
    # 🔹 Here we simulate arrhythmia prediction
    # Later, replace this with your ML model prediction
    probability = random.uniform(0, 1)  # random value between 0 and 1
    percentage = round(probability * 100, 2)

    return jsonify({
        "arrhythmia_probability": f"{percentage}%",
        # "message": "This is a simulated probability. Replace with ML model output."
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

