from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Model paths
RF_MODEL_PATH = "models/rf_model.pkl"
XGB_MODEL_PATH = "models/xgb_model.pkl"
SCALER_PATH = "models/scaler.pkl"
ENCODER_PATH = "models/label_encoder.pkl"

# Check if required files exist
USE_MOCK = not all(os.path.exists(f) for f in [RF_MODEL_PATH, XGB_MODEL_PATH, SCALER_PATH, ENCODER_PATH])

# Load models, scaler, and encoder if available
rf_model, xgb_model, scaler, encoder = None, None, None, None
if not USE_MOCK:
    try:
        rf_model = pickle.load(open(RF_MODEL_PATH, "rb"))
        xgb_model = pickle.load(open(XGB_MODEL_PATH, "rb"))
        scaler = pickle.load(open(SCALER_PATH, "rb"))
        encoder = pickle.load(open(ENCODER_PATH, "rb"))
    except Exception as e:
        print(f"Error loading model/scaler/encoder: {e}")
        USE_MOCK = True


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "ok", "service": "crop-prediction-api"})


@app.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        if USE_MOCK:
            return jsonify({"error": "Models not found. Please train and save models first."}), 500

        data = request.get_json(force=True)

        # Required fields
        required_fields = ["nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Extract features
        N = float(data["nitrogen"])
        P = float(data["phosphorus"])
        K = float(data["potassium"])
        temp = float(data["temperature"])
        humidity = float(data["humidity"])
        ph = float(data["ph"])
        rainfall = float(data["rainfall"])

        features = np.array([N, P, K, temp, humidity, ph, rainfall]).reshape(1, -1)

        # Scale input
        final = scaler.transform(features)

        # Choose model (default = RF)
        model_choice = data.get("model", "rf").lower()
        if model_choice == "xgb":
            prediction_idx = xgb_model.predict(final)[0]
        else:
            prediction_idx = rf_model.predict(final)[0]

        predicted_crop = encoder.inverse_transform([prediction_idx])[0]

        return jsonify({"prediction": predicted_crop})

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
