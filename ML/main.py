import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io
import tensorflow as tf
from tensorflow.keras import layers, models
from sklearn.model_selection import train_test_split

# =========================================================
# STEP 1: FETCH NORMAL ECG DATA FROM THINGSPEAK
# =========================================================
CHANNEL_ID = "2851466"
READ_API_KEY = "JN77FF4HM4O0FHYB"
NUM_RESULTS = 500   # how many normal ECG samples to fetch

url = f"https://api.thingspeak.com/channels/{CHANNEL_ID}/feeds.csv?api_key={READ_API_KEY}&results={NUM_RESULTS}"
response = requests.get(url)
response.raise_for_status()

df_normal = pd.read_csv(io.StringIO(response.text))
normal_ecg = df_normal['field1'].dropna().astype(float).values

# Each ECG sequence must be same length (e.g., 300 samples)
signal_length = 300
normal_segments = []
for i in range(0, len(normal_ecg) - signal_length, signal_length):
    normal_segments.append(normal_ecg[i:i+signal_length])
normal_segments = np.array(normal_segments)

# Label: 0 = Normal
labels_normal = np.zeros(len(normal_segments))

# =========================================================
# STEP 2: LOAD ARRHYTHMIA DATASET (from your file)
# =========================================================
# Example: Suppose you have a CSV with column "ecg_values"
df_arr = pd.read_csv(r"C:\Users\Arnab\OneDrive\Desktop\code\pythonprojects\Heartdiseaseprediction\dataHeart\mitbih_test.csv\mitbih_test.csv")

# Each row is already a segment; convert all values to float and use as segments
arr_segments = df_arr.astype(float).values

# If you want to use only segments of length 300:
if arr_segments.shape[1] > signal_length:
    arr_segments = arr_segments[:, :signal_length]
elif arr_segments.shape[1] < signal_length:
    # Optionally, skip or pad short segments
    print("Warning: arrhythmia segments shorter than signal_length, consider padding or skipping.")

# Pad arrhythmia segments to match signal_length if needed
if arr_segments.shape[1] < signal_length:
    pad_width = signal_length - arr_segments.shape[1]
    arr_segments = np.pad(arr_segments, ((0, 0), (0, pad_width)), mode='constant')
elif arr_segments.shape[1] > signal_length:
    arr_segments = arr_segments[:, :signal_length]

# Label: 1 = Arrhythmia
labels_arr = np.ones(len(arr_segments))

# =========================================================
# STEP 3: COMBINE DATA
# =========================================================
X = np.vstack([normal_segments, arr_segments])
Y = np.hstack([labels_normal, labels_arr])

# Normalize signals
X = X / np.max(X)

# Reshape for CNN (samples, timesteps, channels)
X = X.reshape((X.shape[0], signal_length, 1))

print("Dataset Shape:", X.shape, Y.shape)

# =========================================================
# STEP 4: SPLIT TRAIN/TEST
# =========================================================
X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

# =========================================================
# STEP 5: BUILD CNN MODEL
# =========================================================
model = models.Sequential([
    layers.Conv1D(32, kernel_size=5, activation='relu', input_shape=(signal_length, 1)),
    layers.MaxPooling1D(pool_size=2),
    layers.Conv1D(64, kernel_size=5, activation='relu'),
    layers.MaxPooling1D(pool_size=2),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(1, activation='sigmoid')   # Binary classification
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.summary()

# =========================================================
# STEP 6: TRAIN MODEL
# =========================================================
history = model.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)
# Save trained model
model.save(r"ecg_model.h5")
print("✅ Model saved as ecg_model.h5")


# =========================================================
# STEP 7: EVALUATE MODEL
# =========================================================
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\n✅ Test Accuracy: {acc:.2f}")

# =========================================================
# STEP 8: LIVE PREDICTION (new ThingSpeak data)
# =========================================================
response = requests.get(url)
df_live = pd.read_csv(io.StringIO(response.text))
live_ecg = df_live['field1'].dropna().astype(float).values[-signal_length:]  # last 300 samples
live_ecg = live_ecg.reshape(1, signal_length, 1) / np.max(live_ecg)

pred = model.predict(live_ecg)
if pred[0][0] > 0.5:
    print("📌 Live ECG → Arrhythmia Detected ❌")
else:
    print("📌 Live ECG → Normal ✅")

# =========================================================
# STEP 9: PLOT
# =========================================================
plt.figure(figsize=(10,4))
plt.plot(live_ecg[0], label="Live ECG")
plt.title("Live ECG Signal")
plt.xlabel("Sample Index")
plt.ylabel("Amplitude")
plt.legend()
plt.grid(True)
plt.savefig("ecg_plot.png", dpi=300, bbox_inches="tight")
plt.show()


