import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  Droplets, 
  Sun, 
  Leaf, 
  TrendingUp,
  Award,
  MapPin,
  RefreshCw,
  Search,
  ChevronDown,
  DollarSign,
  BarChart3,
  Sprout,
  AlertCircle
} from 'lucide-react';

interface CropData {
  id: string;
  name: string;
  image: string;
  yieldForecast: number;
  profitMargin: number;
  sustainabilityScore: number;
  season: string;
  waterRequirement: 'low' | 'medium' | 'high';
  soilType: string[];
  description: string;
  growthPeriod: string;
  marketDemand: 'low' | 'medium' | 'high';
}

interface EnvironmentalData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

interface ApiResponse {
  prediction: string;
  confidence: number;
  recommendations: CropData[];
}

const CropRecommendation: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [crops, setCrops] = useState<CropData[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Environmental input form
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData>({
    nitrogen: 40,
    phosphorus: 67,
    potassium: 60,
    temperature: 25,
    humidity: 82,
    ph: 6.5,
    rainfall: 200
  });

  // Filters
  const [filters, setFilters] = useState({
    season: 'all',
    waterAvailability: 'all',
    soilType: 'all',
    searchQuery: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Mock crop data (fallback when API is not available)
  const mockCrops: CropData[] = [
    {
      id: '1',
      name: 'Rice',
      image: 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 2500,
      profitMargin: 35,
      sustainabilityScore: 85,
      season: 'kharif',
      waterRequirement: 'high',
      soilType: ['clay', 'loamy'],
      description: 'High-yielding variety suitable for monsoon season',
      growthPeriod: '120-150 days',
      marketDemand: 'high'
    },
    {
      id: '2',
      name: 'Wheat',
      image: 'https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 1800,
      profitMargin: 42,
      sustainabilityScore: 78,
      season: 'rabi',
      waterRequirement: 'medium',
      soilType: ['loamy', 'sandy'],
      description: 'Winter crop with excellent market demand',
      growthPeriod: '100-130 days',
      marketDemand: 'high'
    },
    {
      id: '3',
      name: 'Maize',
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 3200,
      profitMargin: 38,
      sustainabilityScore: 82,
      season: 'kharif',
      waterRequirement: 'medium',
      soilType: ['loamy', 'sandy', 'clay'],
      description: 'Versatile crop with multiple uses and good yield',
      growthPeriod: '90-120 days',
      marketDemand: 'medium'
    },
    {
      id: '4',
      name: 'Cotton',
      image: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 450,
      profitMargin: 55,
      sustainabilityScore: 65,
      season: 'kharif',
      waterRequirement: 'high',
      soilType: ['clay', 'loamy'],
      description: 'Cash crop with high profit potential',
      growthPeriod: '180-200 days',
      marketDemand: 'high'
    },
    {
      id: '5',
      name: 'Sugarcane',
      image: 'https://images.pexels.com/photos/8142977/pexels-photo-8142977.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 65000,
      profitMargin: 28,
      sustainabilityScore: 70,
      season: 'year-round',
      waterRequirement: 'high',
      soilType: ['clay', 'loamy'],
      description: 'Long-duration crop with steady income',
      growthPeriod: '12-18 months',
      marketDemand: 'medium'
    },
    {
      id: '6',
      name: 'Tomato',
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400',
      yieldForecast: 25000,
      profitMargin: 65,
      sustainabilityScore: 75,
      season: 'rabi',
      waterRequirement: 'medium',
      soilType: ['loamy', 'sandy'],
      description: 'High-value vegetable crop with good returns',
      growthPeriod: '90-120 days',
      marketDemand: 'high'
    }
  ];

  // Fetch crop recommendations from API
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(environmentalData)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: ApiResponse = await response.json();
      
      // Use API recommendations if available, otherwise use mock data
      if (data.recommendations && data.recommendations.length > 0) {
        setCrops(data.recommendations);
      } else {
        // Filter mock crops based on environmental conditions
        const suitableCrops = mockCrops.filter(crop => {
          // Simple logic to filter based on conditions
          if (environmentalData.rainfall > 150 && crop.waterRequirement === 'high') return true;
          if (environmentalData.rainfall < 100 && crop.waterRequirement === 'low') return true;
          if (environmentalData.rainfall >= 100 && environmentalData.rainfall <= 150 && crop.waterRequirement === 'medium') return true;
          return Math.random() > 0.3; // Random selection for demo
        });
        setCrops(suitableCrops.length > 0 ? suitableCrops : mockCrops);
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Unable to connect to recommendation service. Showing default recommendations.');
      setCrops(mockCrops);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = crops;

    if (filters.season !== 'all') {
      filtered = filtered.filter(crop => crop.season === filters.season || crop.season === 'year-round');
    }

    if (filters.waterAvailability !== 'all') {
      filtered = filtered.filter(crop => crop.waterRequirement === filters.waterAvailability);
    }

    if (filters.soilType !== 'all') {
      filtered = filtered.filter(crop => crop.soilType.includes(filters.soilType));
    }

    if (filters.searchQuery) {
      filtered = filtered.filter(crop => 
        crop.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    setFilteredCrops(filtered);
  }, [crops, filters]);

  // Initial load
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMarketDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getWaterRequirementIcon = (requirement: string) => {
    switch (requirement) {
      case 'high': return <Droplets className="h-4 w-4 text-blue-600" />;
      case 'medium': return <Droplets className="h-4 w-4 text-blue-400" />;
      case 'low': return <Droplets className="h-4 w-4 text-blue-300" />;
      default: return <Droplets className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
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
                <h1 className="text-xl font-bold text-gray-900">Crop Recommendations</h1>
                <p className="text-sm text-gray-600">Personalized suggestions for your farm</p>
              </div>
            </div>
            
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Environmental Data Input Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <h3 className="text-lg font-semibold text-white">Environmental Conditions</h3>
            <p className="text-green-100 text-sm">Adjust values to get personalized recommendations</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(environmentalData).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key === 'ph' ? 'pH' : key}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setEnvironmentalData(prev => ({
                      ...prev,
                      [key]: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    step={key === 'ph' ? '0.1' : '1'}
                  />
                  <p className="text-xs text-gray-500">
                    {key === 'temperature' ? '°C' : 
                     key === 'humidity' ? '%' : 
                     key === 'rainfall' ? 'mm' : 
                     key === 'ph' ? 'pH' : 'ppm'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchRecommendations}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Get Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700"
              >
                <Filter className="h-4 w-4" />
                <span>Filter Options</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
                  <select
                    value={filters.season}
                    onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Seasons</option>
                    <option value="kharif">Kharif (Monsoon)</option>
                    <option value="rabi">Rabi (Winter)</option>
                    <option value="zaid">Zaid (Summer)</option>
                    <option value="year-round">Year Round</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Water Availability</label>
                  <select
                    value={filters.waterAvailability}
                    onChange={(e) => setFilters(prev => ({ ...prev, waterAvailability: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                  <select
                    value={filters.soilType}
                    onChange={(e) => setFilters(prev => ({ ...prev, soilType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Soil Types</option>
                    <option value="clay">Clay</option>
                    <option value="loamy">Loamy</option>
                    <option value="sandy">Sandy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Crops</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search crops..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Getting personalized recommendations...</p>
          </div>
        )}

        {/* Crop Cards Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
                {/* Crop Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getSustainabilityColor(crop.sustainabilityScore)}`}>
                      {crop.sustainabilityScore}% Sustainable
                    </div>
                  </div>
                </div>
                
                {/* Crop Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketDemandColor(crop.marketDemand)}`}>
                      {crop.marketDemand} demand
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{crop.description}</p>
                  
                  {/* Key Metrics */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Yield Forecast</span>
                      </div>
                      <span className="font-semibold text-gray-900">{crop.yieldForecast.toLocaleString()} kg/acre</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Profit Margin</span>
                      </div>
                      <span className="font-semibold text-green-600">{crop.profitMargin}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getWaterRequirementIcon(crop.waterRequirement)}
                        <span className="text-sm text-gray-600">Water Need</span>
                      </div>
                      <span className="font-medium text-gray-700 capitalize">{crop.waterRequirement}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">Growth Period</span>
                      </div>
                      <span className="font-medium text-gray-700">{crop.growthPeriod}</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105">
                    Select This Crop
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <Sprout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600">Try adjusting your filters or environmental conditions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;