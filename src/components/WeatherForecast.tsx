import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow,
  Zap,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  AlertTriangle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import Footer from './Footer';

interface WeatherData {
  current: {
    temp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainfall: number;
    humidity: number;
  }>;
  alerts: Array<{
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  location: string;
}

const WeatherIcon: React.FC<{ condition: string; size?: number }> = ({ condition, size = 24 }) => {
  const iconProps = { size, className: "text-current" };
  
  switch (condition.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <Sun {...iconProps} className="text-yellow-500" />;
    case 'cloudy':
    case 'overcast':
      return <Cloud {...iconProps} className="text-gray-500" />;
    case 'rainy':
    case 'rain':
      return <CloudRain {...iconProps} className="text-blue-500" />;
    case 'snow':
      return <CloudSnow {...iconProps} className="text-blue-300" />;
    case 'thunderstorm':
      return <Zap {...iconProps} className="text-purple-500" />;
    default:
      return <Sun {...iconProps} className="text-yellow-500" />;
  }
};

const WeatherForecast: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock weather data (in real app, this would fetch from OpenWeatherMap API)
  useEffect(() => {
    const fetchWeatherData = () => {
      // Simulate API call delay
      setTimeout(() => {
        const mockData: WeatherData = {
          current: {
            temp: 28,
            condition: 'Sunny',
            icon: 'sunny',
            humidity: 65,
            windSpeed: 12,
            visibility: 10,
            feelsLike: 32
          },
          forecast: [
            { date: '2025-01-27', day: 'Today', high: 28, low: 18, condition: 'Sunny', icon: 'sunny', rainfall: 0, humidity: 65 },
            { date: '2025-01-28', day: 'Tue', high: 30, low: 20, condition: 'Cloudy', icon: 'cloudy', rainfall: 0, humidity: 70 },
            { date: '2025-01-29', day: 'Wed', high: 26, low: 16, condition: 'Rainy', icon: 'rainy', rainfall: 15, humidity: 85 },
            { date: '2025-01-30', day: 'Thu', high: 24, low: 14, condition: 'Rainy', icon: 'rainy', rainfall: 25, humidity: 90 },
            { date: '2025-01-31', day: 'Fri', high: 27, low: 17, condition: 'Cloudy', icon: 'cloudy', rainfall: 5, humidity: 75 },
            { date: '2025-02-01', day: 'Sat', high: 29, low: 19, condition: 'Sunny', icon: 'sunny', rainfall: 0, humidity: 60 },
            { date: '2025-02-02', day: 'Sun', high: 31, low: 21, condition: 'Sunny', icon: 'sunny', rainfall: 0, humidity: 55 }
          ],
          alerts: [
            {
              type: 'warning',
              title: 'Heavy Rainfall Expected',
              description: 'Heavy rain expected Wednesday-Thursday. Consider postponing field activities and ensure proper drainage.',
              severity: 'medium'
            }
          ],
          location: 'Bangalore, Karnataka'
        };
        
        setWeatherData(mockData);
        setLoading(false);
        setLastUpdated(new Date());
      }, 1000);
    };

    fetchWeatherData();
    
    // Update every 10 minutes
    const interval = setInterval(fetchWeatherData, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Weather Forecast</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{weatherData.location}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Weather Alerts */}
        {weatherData.alerts.length > 0 && (
          <div className="mb-6">
            {weatherData.alerts.map((alert, index) => (
              <div key={index} className={`rounded-xl p-4 border-l-4 ${
                alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                alert.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.severity === 'high' ? 'text-red-600' :
                    alert.severity === 'medium' ? 'text-amber-600' :
                    'text-blue-600'
                  }`} />
                  <div>
                    <h3 className={`font-semibold ${
                      alert.severity === 'high' ? 'text-red-900' :
                      alert.severity === 'medium' ? 'text-amber-900' :
                      'text-blue-900'
                    }`}>
                      {alert.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      alert.severity === 'high' ? 'text-red-700' :
                      alert.severity === 'medium' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Today's Weather</h2>
              <p className="text-sky-100 mb-4">{weatherData.current.condition}</p>
              <div className="flex items-center space-x-8">
                <div>
                  <span className="text-5xl font-bold">{weatherData.current.temp}°</span>
                  <span className="text-xl text-sky-100 ml-2">C</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-sm">Feels like {weatherData.current.feelsLike}°C</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Droplets className="h-4 w-4" />
                    <span className="text-sm">Humidity {weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sky-100">
                    <Wind className="h-4 w-4" />
                    <span className="text-sm">Wind {weatherData.current.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <WeatherIcon condition={weatherData.current.condition} size={80} />
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  index === 0 ? 'bg-sky-50 border border-sky-200' : 'hover:bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 text-center">
                      <p className={`font-semibold ${index === 0 ? 'text-sky-700' : 'text-gray-900'}`}>
                        {day.day}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <WeatherIcon condition={day.condition} size={32} />
                      <span className="text-sm text-gray-600 capitalize">{day.condition}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {day.rainfall > 0 && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm font-medium">{day.rainfall}mm</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">{day.humidity}%</span>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <span className="text-lg font-semibold text-gray-900">{day.high}°</span>
                      <span className="text-sm text-gray-500 ml-1">/ {day.low}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Farming Tips Based on Weather */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Weather-Based Farming Tips</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <Sun className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Sunny Days Ahead</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Perfect for harvesting and field preparation. Ensure adequate irrigation for crops.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <CloudRain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Rain Expected</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Good for seed germination. Avoid heavy machinery use and ensure proper drainage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WeatherForecast;