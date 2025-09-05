import React, { useState } from 'react';
import SoilAnalysis from './components/SoilAnalysis';
import WeatherForecast from './components/WeatherForecast';
import CropRecommendation from './components/CropRecommendation';
import MarketInsights from './components/MarketInsights';
import { 
  Search, 
  Sprout, 
  Cloud, 
  TrendingUp, 
  TestTube,
  Globe,
  ChevronDown,
  Leaf,
  Sun
} from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'soil-analysis' | 'weather' | 'recommendations' | 'market-insights'>('home');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'mr', name: 'मराठी' }
  ];

  const quickActions = [
    {
      title: 'Soil Analysis',
      description: 'Test your soil health and get recommendations',
      icon: TestTube,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Weather',
      description: 'Get local weather forecasts and alerts',
      icon: Cloud,
      color: 'from-blue-500 to-sky-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Recommendations',
      description: 'Personalized crop suggestions for your farm',
      icon: Sprout,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Market Insights',
      description: 'Current prices and market trends',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  if (currentPage === 'soil-analysis') {
    return <SoilAnalysis onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'weather') {
    return <WeatherForecast onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'recommendations') {
    return <CropRecommendation onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'market-insights') {
    return <MarketInsights onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-xl">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CropWise</h1>
                <p className="text-sm text-gray-600">Smart Farming Solutions</p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg border border-green-200 transition-colors"
              >
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{selectedLanguage}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.name);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sun className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Welcome, Farmer!</h2>
            <Sprout className="h-8 w-8 text-green-500 ml-3" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized crop recommendations, soil insights, and market data to make informed farming decisions
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for crops, diseases, or farming tips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-green-200 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all text-gray-900 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-200"
              onClick={() => {
                if (action.title === 'Soil Analysis') {
                  setCurrentPage('soil-analysis');
                } else if (action.title === 'Weather') {
                  setCurrentPage('weather');
                } else if (action.title === 'Recommendations') {
                  setCurrentPage('recommendations');
                } else if (action.title === 'Market Insights') {
                  setCurrentPage('market-insights');
                }
              }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className={`${action.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {action.description}
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${action.color} text-white rounded-lg text-sm font-medium group-hover:shadow-lg transition-shadow`}>
                      Get Started
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sprout className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Crop Calendar</h4>
              <p className="text-sm text-gray-600">Track sowing, harvesting, and seasonal activities</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TestTube className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Expert Advice</h4>
              <p className="text-sm text-gray-600">Connect with agricultural specialists and experts</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Yield Tracking</h4>
              <p className="text-sm text-gray-600">Monitor and analyze your harvest performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;