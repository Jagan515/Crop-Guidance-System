from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import pandas as pd
import requests

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Model paths
MODEL_PATH = "models/model.pkl"
SCALER_PATH = "models/standscaler.pkl"
MINMAX_PATH = "models/minmaxscaler.pkl"

# Check if required files exist
USE_MOCK = not all(os.path.exists(f) for f in [MODEL_PATH, SCALER_PATH, MINMAX_PATH])

# Load model and scalers if available
model, sc, ms, df = None, None, None, None
if not USE_MOCK:
    model = pickle.load(open(MODEL_PATH, "rb"))
    sc = pickle.load(open(SCALER_PATH, "rb"))
    ms = pickle.load(open(MINMAX_PATH, "rb"))
    df_path = "Crop_recommendation.csv"
    if os.path.exists(df_path):
        df = pd.read_csv(df_path)
    else:
        USE_MOCK = True

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "crop-prediction-api"})

@app.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        data = request.get_json(force=True)

        N = float(data.get("nitrogen"))
        P = float(data.get("phosphorus"))
        K = float(data.get("potassium"))
        temp = float(data.get("temperature"))
        humidity = float(data.get("humidity"))
        ph = float(data.get("ph"))
        rainfall = float(data.get("rainfall"))

        features = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)

        if not USE_MOCK and model and sc and ms and df is not None:
            scaled = ms.transform(features)
            final = sc.transform(scaled)
            prediction_idx = model.predict(final)[0]
            unique_crops = df["label"].unique()
            if prediction_idx < len(unique_crops):
                predicted_crop = unique_crops[prediction_idx]
            else:
                predicted_crop = "Unknown"
        else:
            # Simple fallback rules
            if rainfall >= 150 and humidity >= 70:
                predicted_crop = "Rice"
            elif 18 <= temp <= 26 and 6.0 <= ph <= 7.5:
                predicted_crop = "Chickpea"
            elif temp >= 24 and rainfall >= 100:
                predicted_crop = "Maize"
            else:
                predicted_crop = "Mungbean"

        return jsonify({"prediction": predicted_crop})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/get_weather", methods=["POST"])
def get_weather():
    try:
        lat = request.json.get("lat")
        lon = request.json.get("lon")
        api_key = "YOUR_OPENWEATHERMAP_API_KEY"  # Replace with env var in production

        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        return jsonify(response.json())

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
