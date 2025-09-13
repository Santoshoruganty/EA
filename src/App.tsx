import React, { useState } from 'react';
import { Zap, TrendingUp, Database, Settings, Download, Calendar, Filter } from 'lucide-react';
import ShapingOutput from './components/ShapingOutput';
import IceClearedPower from './components/IceClearedPower';
import EnergyTable from './components/EnergyTable';
import ScalingData from './components/ScalingData';

function App() {
  const [activeTab, setActiveTab] = useState('shaping');
  const [globalData, setGlobalData] = useState({
    combinedTable: null,
    selectedIso: null,
    energyCurveData: null
  });

  const tabs = [
    { id: 'shaping', label: 'Shaping Output', icon: TrendingUp },
    { id: 'ice', label: 'ICE Cleared Power', icon: Database },
    { id: 'energy', label: 'Energy Curve', icon: Zap },
    { id: 'scaling', label: 'Scaling Data', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Energy Curve Dashboard</h1>
                <p className="text-sm text-gray-600">Power market analysis & trading tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'shaping' && (
          <ShapingOutput globalData={globalData} setGlobalData={setGlobalData} />
        )}
        {activeTab === 'ice' && (
          <IceClearedPower />
        )}
        {activeTab === 'energy' && (
          <EnergyTable globalData={globalData} setGlobalData={setGlobalData} />
        )}
        {activeTab === 'scaling' && (
          <ScalingData globalData={globalData} setGlobalData={setGlobalData} />
        )}
      </div>
    </div>
  );
}

export default App;