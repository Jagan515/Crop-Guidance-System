from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
import pandas as pd
import json
import requests
from datetime import datetime

# Flask app initialization
app = Flask(__name__)
CORS(app)

# Model file paths
MODEL_PATH = "models/model.pkl"
SCALER_PATH = "models/standscaler.pkl"
MINMAX_PATH = "models/minmaxscaler.pkl"
CLUSTERING_PATH = "models/clustering_model.pkl"

# Try graceful mock mode if files are missing
USE_MOCK = False
required_files = [MODEL_PATH, SCALER_PATH, MINMAX_PATH, CLUSTERING_PATH]
if not all(os.path.exists(f) for f in required_files):
    # also try legacy paths inside backend/
    MODEL_PATH = os.path.join('backend', 'model.pkl') if os.path.exists(os.path.join('backend', 'model.pkl')) else MODEL_PATH
    SCALER_PATH = os.path.join('backend', 'standscaler.pkl') if os.path.exists(os.path.join('backend', 'standscaler.pkl')) else SCALER_PATH
    MINMAX_PATH = os.path.join('backend', 'minmaxscaler.pkl') if os.path.exists(os.path.join('backend', 'minmaxscaler.pkl')) else MINMAX_PATH
    CLUSTERING_PATH = os.path.join('backend', 'clustering_model.pkl') if os.path.exists(os.path.join('backend', 'clustering_model.pkl')) else CLUSTERING_PATH

if not all(os.path.exists(f) for f in [MODEL_PATH, SCALER_PATH, MINMAX_PATH, CLUSTERING_PATH]):
    USE_MOCK = True

# Load the machine learning model and scalers if available
model = None
sc = None
ms = None
clustering_model = None
df = None

if not USE_MOCK:
    model = pickle.load(open(MODEL_PATH, 'rb'))
    sc = pickle.load(open(SCALER_PATH, 'rb'))
    ms = pickle.load(open(MINMAX_PATH, 'rb'))
    clustering_model = pickle.load(open(CLUSTERING_PATH, 'rb'))
    # Load dataset for finding similar crops
    df_path = 'backend/Crop_recommendation.csv' if os.path.exists('backend/Crop_recommendation.csv') else 'Crop_recommendation.csv'
    if os.path.exists(df_path):
        df = pd.read_csv(df_path)
    else:
        USE_MOCK = True

# Crop dictionary with detailed information - maps lowercase names to details
crop_dict = {
    "rice": {
        "name": "Rice",
        "growing_season": "Kharif",
        "water_req": "High",
        "growing_time": "120-150 days",
        "tips": "Maintain standing water of 2.5cm during tillering",
        "soil_type": "Clay or clay loam",
        "market_price": "₹1,800-2,200/quintal",
        "diseases": ["Blast", "Brown Spot", "Bacterial Leaf Blight"],
        "nutrients": "High nitrogen requirement during vegetative growth"
    },
    "maize": {
        "name": "Maize",
        "growing_season": "Kharif/Rabi",
        "water_req": "Medium",
        "growing_time": "95-105 days",
        "tips": "Ensure proper drainage and regular weeding",
        "soil_type": "Well-drained loamy soil",
        "market_price": "₹1,600-1,900/quintal",
        "diseases": ["Leaf Blight", "Stalk Rot", "Ear Rot"],
        "nutrients": "Requires balanced NPK fertilization"
    },
    "chickpea": {
        "name": "Chickpea",
        "growing_season": "Rabi",
        "water_req": "Low",
        "growing_time": "90-120 days",
        "tips": "Drought tolerant, good for dry areas",
        "soil_type": "Well-drained sandy loam",
        "market_price": "₹4,000-5,000/quintal",
        "diseases": ["Ascochyta Blight", "Fusarium Wilt", "Root Rot"],
        "nutrients": "Nitrogen-fixing legume"
    },
    "kidneybeans": {
        "name": "Kidney Beans",
        "growing_season": "Kharif",
        "water_req": "Medium",
        "growing_time": "80-100 days",
        "tips": "Requires support for climbing varieties",
        "soil_type": "Well-drained loamy soil",
        "market_price": "₹6,000-8,000/quintal",
        "diseases": ["Anthracnose", "Bacterial Blight", "Rust"],
        "nutrients": "High protein content"
    },
    "pigeonpeas": {
        "name": "Pigeon Peas",
        "growing_season": "Kharif",
        "water_req": "Low",
        "growing_time": "120-180 days",
        "tips": "Drought resistant, good intercrop",
        "soil_type": "Well-drained soil",
        "market_price": "₹4,500-6,000/quintal",
        "diseases": ["Wilt", "Sterility Mosaic", "Pod Borer"],
        "nutrients": "Nitrogen-fixing, high protein"
    },
    "mothbeans": {
        "name": "Moth Beans",
        "growing_season": "Kharif",
        "water_req": "Low",
        "growing_time": "60-90 days",
        "tips": "Drought tolerant, good for arid regions",
        "soil_type": "Sandy to loamy soil",
        "market_price": "₹5,000-7,000/quintal",
        "diseases": ["Yellow Mosaic", "Powdery Mildew", "Root Rot"],
        "nutrients": "High protein and fiber"
    },
    "mungbean": {
        "name": "Mung Bean",
        "growing_season": "Kharif/Rabi",
        "water_req": "Low",
        "growing_time": "60-90 days",
        "tips": "Quick growing, good for short season",
        "soil_type": "Well-drained soil",
        "market_price": "₹6,000-8,000/quintal",
        "diseases": ["Yellow Mosaic", "Cercospora Leaf Spot", "Powdery Mildew"],
        "nutrients": "High protein, easy to digest"
    },
    "blackgram": {
        "name": "Black Gram",
        "growing_season": "Kharif",
        "water_req": "Low",
        "growing_time": "80-120 days",
        "tips": "Drought tolerant, good soil conditioner",
        "soil_type": "Well-drained soil",
        "market_price": "₹5,500-7,500/quintal",
        "diseases": ["Yellow Mosaic", "Leaf Spot", "Root Rot"],
        "nutrients": "High protein and iron"
    },
    "lentil": {
        "name": "Lentil",
        "growing_season": "Rabi",
        "water_req": "Low",
        "growing_time": "80-110 days",
        "tips": "Cold tolerant, good for winter",
        "soil_type": "Well-drained loamy soil",
        "market_price": "₹4,000-6,000/quintal",
        "diseases": ["Ascochyta Blight", "Rust", "Wilt"],
        "nutrients": "High protein and fiber"
    },
    "pomegranate": {
        "name": "Pomegranate",
        "growing_season": "Year-round",
        "water_req": "Medium",
        "growing_time": "3-4 years to fruit",
        "tips": "Requires pruning and pest management",
        "soil_type": "Well-drained sandy loam",
        "market_price": "₹40-80/kg",
        "diseases": ["Fruit Rot", "Bacterial Blight", "Aphids"],
        "nutrients": "Rich in antioxidants"
    }
}

def get_soil_health_status(n, p, k, ph):
    """Determine soil health based on NPK values and pH"""
    health = {
        'status': 'Good',
        'messages': [],
        'improvements': []
    }
    
    # Check NPK levels
    if n < 50:
        health['messages'].append("Low Nitrogen")
        health['improvements'].append("Add nitrogen-rich fertilizers or organic matter")
    elif n > 140:
        health['messages'].append("High Nitrogen")
        health['improvements'].append("Reduce nitrogen fertilization")

    if p < 30:
        health['messages'].append("Low Phosphorus")
        health['improvements'].append("Add phosphate fertilizers or bone meal")
    elif p > 100:
        health['messages'].append("High Phosphorus")
        health['improvements'].append("Avoid phosphorus fertilization")

    if k < 30:
        health['messages'].append("Low Potassium")
        health['improvements'].append("Add potash fertilizers or wood ash")
    elif k > 100:
        health['messages'].append("High Potassium")
        health['improvements'].append("Reduce potassium fertilization")

    # Check pH levels
    if ph < 5.5:
        health['messages'].append("Acidic soil")
        health['improvements'].append("Add agricultural lime to raise pH")
    elif ph > 7.5:
        health['messages'].append("Alkaline soil")
        health['improvements'].append("Add sulfur or organic matter to lower pH")

    if len(health['messages']) > 2:
        health['status'] = 'Poor'
    elif len(health['messages']) > 0:
        health['status'] = 'Fair'

    return health

def get_similar_crops(features):
    """Find similar crops based on input features using clustering (or heuristic in mock mode)."""
    if not USE_MOCK and df is not None and sc is not None and ms is not None and clustering_model is not None:
        scaled_features = sc.transform(ms.transform(features))
        cluster = clustering_model.predict(scaled_features)[0]
        df_features = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        df_scaled = sc.transform(ms.transform(df_features))
        cluster_mask = clustering_model.predict(df_scaled) == cluster
        similar_crops = df[cluster_mask]['label'].unique().tolist()
        return similar_crops[:5]
    # Heuristic fallback
    N, P, K, temperature, humidity, ph, rainfall = features.reshape(-1).tolist()
    candidates = []
    if rainfall >= 150:
        candidates += ["Rice", "Jute", "Coconut"]
    if 18 <= temperature <= 28:
        candidates += ["Wheat", "Maize", "Papaya"]
    if 6.0 <= ph <= 7.5:
        candidates += ["Cotton", "Maize"]
    dedup = []
    seen = set()
    for c in candidates:
        if c not in seen:
            dedup.append(c)
            seen.add(c)
    return dedup[:5]

def get_market_trends():
    """Simulate market trend data"""
    return {
        "Rice": {"trend": "Stable", "forecast": "Slight increase expected", "demand": "High"},
        "Maize": {"trend": "Rising", "forecast": "Strong demand in coming months", "demand": "Medium"},
        "Jute": {"trend": "Fluctuating", "forecast": "Price stability expected", "demand": "Medium"},
        "Cotton": {"trend": "Rising", "forecast": "High demand in textile sector", "demand": "High"},
        "Coconut": {"trend": "Stable", "forecast": "Consistent demand", "demand": "Medium"},
        "Papaya": {"trend": "Rising", "forecast": "Growing export demand", "demand": "High"}
    }

@app.route("/", methods=['GET'])
def home():
    return jsonify({"status": "ok", "service": "crop-recommendation-api"})

@app.route("/form", methods=['GET'])
def form():
    return jsonify({"message": "This service is API-only. Use POST /api/predict."})

@app.route("/predict", methods=['POST'])
def predict():
    try:
        # Accept JSON or form payloads; normalize fields then reuse /api/predict logic
        payload = request.get_json(silent=True) or {}
        if not payload:
            # fallback to form names
            payload = {
                'nitrogen': request.form.get('Nitrogen'),
                'phosphorus': request.form.get('Phosporus'),
                'potassium': request.form.get('Potassium'),
                'temperature': request.form.get('Temperature'),
                'humidity': request.form.get('Humidity'),
                'ph': request.form.get('Ph'),
                'rainfall': request.form.get('Rainfall')
            }
        # Proxy to api_predict computation by calling the same core
        N = float(payload.get('nitrogen'))
        P = float(payload.get('phosphorus'))
        K = float(payload.get('potassium'))
        temp = float(payload.get('temperature'))
        humidity = float(payload.get('humidity'))
        ph = float(payload.get('ph'))
        rainfall = float(payload.get('rainfall'))

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        if 'ms' in globals() and ms is not None and 'sc' in globals() and sc is not None and 'model' in globals() and model is not None:
            scaled_features = ms.transform(single_pred)
            final_features = sc.transform(scaled_features)
            prediction_idx = model.predict(final_features)[0]
            
            # Get unique crop names from CSV and map index to crop name
            unique_crops = df['label'].unique()
            if prediction_idx < len(unique_crops):
                predicted_crop = unique_crops[prediction_idx]
                crop_info = crop_dict.get(predicted_crop, {"name": predicted_crop.title()})
            else:
                crop_info = {"name": "Unknown Crop"}
        else:
            # rule-based fallback
            if rainfall >= 150 and humidity >= 70:
                crop_name = "rice"
            elif 18 <= temp <= 26 and 6.0 <= ph <= 7.5:
                crop_name = "chickpea"
            elif temp >= 24 and rainfall >= 100:
                crop_name = "maize"
            else:
                crop_name = "mungbean"
            crop_info = crop_dict.get(crop_name, {"name": crop_name.title()})

        soil_health = get_soil_health_status(N, P, K, ph)
        similar = get_similar_crops(single_pred)
        market_trends = get_market_trends()
        crop_market_trend = market_trends.get(crop_info["name"], {})

        return jsonify({
            "prediction": crop_info["name"],
            "crop": crop_info,
            "similar_crops": similar,
            "soil_health": soil_health,
            "market_trend": crop_market_trend,
            "conditions": {
                "nitrogen": N,
                "phosphorus": P,
                "potassium": K,
                "temperature": temp,
                "humidity": humidity,
                "ph": ph,
                "rainfall": rainfall
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/predict", methods=['POST'])
def api_predict():
    try:
        data = request.get_json(force=True)
        # Accept both camelCase and snake/form keys
        N = float(data.get('nitrogen') or data.get('Nitrogen') or data.get('N'))
        P = float(data.get('phosphorus') or data.get('Phosporus') or data.get('P'))
        K = float(data.get('potassium') or data.get('Potassium') or data.get('K'))
        temp = float(data.get('temperature') or data.get('Temperature'))
        humidity = float(data.get('humidity') or data.get('Humidity'))
        ph = float(data.get('ph') or data.get('Ph'))
        rainfall = float(data.get('rainfall') or data.get('Rainfall'))

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        if not USE_MOCK and model is not None and sc is not None and ms is not None and df is not None:
            scaled_features = ms.transform(single_pred)
            final_features = sc.transform(scaled_features)
            prediction_idx = model.predict(final_features)[0]
            
            # Get unique crop names from CSV and map index to crop name
            unique_crops = df['label'].unique()
            if prediction_idx < len(unique_crops):
                predicted_crop = unique_crops[prediction_idx]
                crop_info = crop_dict.get(predicted_crop, {"name": predicted_crop.title()})
            else:
                crop_info = {"name": "Unknown Crop"}
        else:
            # Simple rule-based fallback
            if rainfall >= 150 and humidity >= 70:
                crop_name = "rice"
            elif 18 <= temp <= 26 and 6.0 <= ph <= 7.5:
                crop_name = "chickpea"
            elif temp >= 24 and rainfall >= 100:
                crop_name = "maize"
            else:
                crop_name = "mungbean"
            crop_info = crop_dict.get(crop_name, {"name": crop_name.title()})
        soil_health = get_soil_health_status(N, P, K, ph)
        similar_crops = get_similar_crops(single_pred)
        market_trends = get_market_trends()
        crop_market_trend = market_trends.get(crop_info["name"], {})

        return jsonify({
            "prediction": crop_info["name"],
            "crop": crop_info,
            "similar_crops": similar_crops,
            "soil_health": soil_health,
            "market_trend": crop_market_trend,
            "conditions": {
                "nitrogen": N,
                "phosphorus": P,
                "potassium": K,
                "temperature": temp,
                "humidity": humidity,
                "ph": ph,
                "rainfall": rainfall
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/get_weather", methods=['POST'])
def get_weather():
    try:
        lat = request.json.get('lat')
        lon = request.json.get('lon')
        api_key = "YOUR_OPENWEATHERMAP_API_KEY"  # In production, use environment variables
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        
        response = requests.get(url)
        weather_data = response.json()
        
        return jsonify(weather_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
