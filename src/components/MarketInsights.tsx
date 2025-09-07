import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  MapPin,
  DollarSign,
  BarChart3,
  LineChart,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Store,
  Calendar,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import Footer from './Footer';

interface MarketData {
  id: string;
  crop: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercent: number;
  demand: 'low' | 'medium' | 'high';
  market: string;
  region: string;
  lastUpdated: string;
  volume: number;
  season: string;
}

interface PriceTrend {
  month: string;
  price: number;
  volume: number;
}

interface TopCrop {
  id: string;
  name: string;
  demand: 'low' | 'medium' | 'high';
  price: number;
  priceChange: number;
  market: string;
  profitPotential: 'low' | 'medium' | 'high';
  season: string;
}

const MarketInsights: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [topCrops, setTopCrops] = useState<TopCrop[]>([]);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockMarketData: MarketData[] = [
    {
      id: '1',
      crop: 'Rice',
      currentPrice: 2800,
      previousPrice: 2650,
      priceChange: 150,
      priceChangePercent: 5.66,
      demand: 'high',
      market: 'Delhi Mandi',
      region: 'North India',
      lastUpdated: '2024-01-15',
      volume: 1250,
      season: 'kharif'
    },
    {
      id: '2',
      crop: 'Wheat',
      currentPrice: 2200,
      previousPrice: 2300,
      priceChange: -100,
      priceChangePercent: -4.35,
      demand: 'high',
      market: 'Punjab Mandi',
      region: 'North India',
      lastUpdated: '2024-01-15',
      volume: 980,
      season: 'rabi'
    },
    {
      id: '3',
      crop: 'Maize',
      currentPrice: 1950,
      previousPrice: 1800,
      priceChange: 150,
      priceChangePercent: 8.33,
      demand: 'medium',
      market: 'Karnataka Mandi',
      region: 'South India',
      lastUpdated: '2024-01-15',
      volume: 750,
      season: 'kharif'
    },
    {
      id: '4',
      crop: 'Cotton',
      currentPrice: 6500,
      previousPrice: 6200,
      priceChange: 300,
      priceChangePercent: 4.84,
      demand: 'high',
      market: 'Gujarat Mandi',
      region: 'West India',
      lastUpdated: '2024-01-15',
      volume: 450,
      season: 'kharif'
    },
    {
      id: '5',
      crop: 'Sugarcane',
      currentPrice: 320,
      previousPrice: 315,
      priceChange: 5,
      priceChangePercent: 1.59,
      demand: 'medium',
      market: 'Maharashtra Mandi',
      region: 'West India',
      lastUpdated: '2024-01-15',
      volume: 2100,
      season: 'year-round'
    },
    {
      id: '6',
      crop: 'Tomato',
      currentPrice: 45,
      previousPrice: 35,
      priceChange: 10,
      priceChangePercent: 28.57,
      demand: 'high',
      market: 'Bangalore Mandi',
      region: 'South India',
      lastUpdated: '2024-01-15',
      volume: 320,
      season: 'rabi'
    }
  ];

  const mockTopCrops: TopCrop[] = [
    {
      id: '1',
      name: 'Tomato',
      demand: 'high',
      price: 45,
      priceChange: 28.57,
      market: 'Bangalore Mandi',
      profitPotential: 'high',
      season: 'rabi'
    },
    {
      id: '2',
      name: 'Maize',
      demand: 'medium',
      price: 1950,
      priceChange: 8.33,
      market: 'Karnataka Mandi',
      profitPotential: 'high',
      season: 'kharif'
    },
    {
      id: '3',
      name: 'Cotton',
      demand: 'high',
      price: 6500,
      priceChange: 4.84,
      market: 'Gujarat Mandi',
      profitPotential: 'high',
      season: 'kharif'
    },
    {
      id: '4',
      name: 'Rice',
      demand: 'high',
      price: 2800,
      priceChange: 5.66,
      market: 'Delhi Mandi',
      profitPotential: 'medium',
      season: 'kharif'
    },
    {
      id: '5',
      name: 'Sugarcane',
      demand: 'medium',
      price: 320,
      priceChange: 1.59,
      market: 'Maharashtra Mandi',
      profitPotential: 'medium',
      season: 'year-round'
    }
  ];

  const mockPriceTrends: PriceTrend[] = [
    { month: 'Jul', price: 2500, volume: 1200 },
    { month: 'Aug', price: 2600, volume: 1350 },
    { month: 'Sep', price: 2700, volume: 1100 },
    { month: 'Oct', price: 2750, volume: 1400 },
    { month: 'Nov', price: 2650, volume: 1300 },
    { month: 'Dec', price: 2800, volume: 1250 }
  ];

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMarketData(mockMarketData);
      setTopCrops(mockTopCrops);
      setPriceTrends(mockPriceTrends);
      setLoading(false);
    }, 1000);
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProfitPotentialColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredMarketData = marketData.filter(item => {
    if (selectedCrop !== 'all' && item.crop.toLowerCase() !== selectedCrop.toLowerCase()) return false;
    if (selectedMarket !== 'all' && item.market !== selectedMarket) return false;
    return true;
  });

  const uniqueMarkets = [...new Set(marketData.map(item => item.market))];
  const uniqueCrops = [...new Set(marketData.map(item => item.crop))];

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
                <h1 className="text-xl font-bold text-gray-900">Market Insights</h1>
                <p className="text-sm text-gray-600">Current prices and market trends</p>
              </div>
            </div>
            
            <button
              onClick={fetchMarketData}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Market Filters</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Crops</option>
                    {uniqueCrops.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Market</label>
                  <select
                    value={selectedMarket}
                    onChange={(e) => setSelectedMarket(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Markets</option>
                    {uniqueMarkets.map(market => (
                      <option key={market} value={market}>{market}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setChartType('bar')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        chartType === 'bar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Bar</span>
                    </button>
                    <button
                      onClick={() => setChartType('line')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        chartType === 'line' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <LineChart className="h-4 w-4" />
                      <span>Line</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price Trends Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Price Trends</h3>
                <p className="text-green-100 text-sm">Last 6 months market performance</p>
              </div>
              <div className="flex items-center space-x-2 text-green-100">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {chartType === 'bar' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Price per quintal (₹)</span>
                  <span>Volume (tonnes)</span>
                </div>
                <div className="space-y-3">
                  {priceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-600">{trend.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(trend.price / 3000) * 100}%` }}
                            >
                              <span className="text-white text-xs font-medium">₹{trend.price}</span>
                            </div>
                          </div>
                          <div className="w-16 text-xs text-gray-500 text-right">{trend.volume}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Price per quintal (₹)</span>
                  <span>Volume (tonnes)</span>
                </div>
                <div className="space-y-3">
                  {priceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-600">{trend.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${(trend.price / 3000) * 100}%` }}
                            >
                              <span className="text-white text-xs font-medium">₹{trend.price}</span>
                            </div>
                          </div>
                          <div className="w-16 text-xs text-gray-500 text-right">{trend.volume}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Crops with Highest Demand */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Top Crops by Demand</h3>
                <p className="text-purple-100 text-sm">Most profitable crops in current market</p>
              </div>
              <div className="flex items-center space-x-2 text-purple-100">
                <Target className="h-4 w-4" />
                <span className="text-sm">High Profit Potential</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {topCrops.map((crop, index) => (
                <div key={crop.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{crop.market}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 capitalize">{crop.season}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-gray-900">₹{crop.price}/q</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {crop.priceChange > 0 ? (
                          <ArrowUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${crop.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crop.priceChange > 0 ? '+' : ''}{crop.priceChange}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(crop.demand)}`}>
                        {crop.demand} demand
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProfitPotentialColor(crop.profitPotential)}`}>
                        {crop.profitPotential} profit
                      </div>
                    </div>
                    
                    {crop.profitPotential === 'high' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">Profitable</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Data Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Current Market Prices</h3>
                <p className="text-blue-100 text-sm">Live prices from major markets across India</p>
              </div>
              <div className="flex items-center space-x-2 text-blue-100">
                <Store className="h-4 w-4" />
                <span className="text-sm">{filteredMarketData.length} Markets</span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMarketData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">{item.crop.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.crop}</div>
                          <div className="text-sm text-gray-500 capitalize">{item.season}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{item.market}</div>
                          <div className="text-sm text-gray-500">{item.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">₹{item.currentPrice}/q</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {item.priceChange > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${item.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.priceChange > 0 ? '+' : ''}₹{item.priceChange}
                        </span>
                        <span className={`text-xs ${item.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({item.priceChangePercent > 0 ? '+' : ''}{item.priceChangePercent}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDemandColor(item.demand)}`}>
                        {item.demand}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.volume} tonnes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading market data...</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MarketInsights;
