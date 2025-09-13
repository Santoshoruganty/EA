import React, { useState } from 'react';
import { Settings, Download, AlertCircle, TrendingUp } from 'lucide-react';

interface ScalingDataProps {
  globalData: any;
  setGlobalData: (data: any) => void;
}

const ScalingData: React.FC<ScalingDataProps> = ({ globalData, setGlobalData }) => {
  const [selectedIso, setSelectedIso] = useState('ERCOT');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedBlockType, setSelectedBlockType] = useState('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [rangeMode, setRangeMode] = useState<'one' | 'some' | 'all'>('one');
  const [selectedYear, setSelectedYear] = useState(2024);

  if (!globalData.energyCurveData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Energy Curve Data Required</h3>
          <p className="text-gray-600">Please generate energy curve data in the Energy Curve tab first</p>
        </div>
      </div>
    );
  }

  // Extract unique values from energy curve data
  const availableZones = [...new Set(globalData.energyCurveData.map((item: any) => item.load_zone))];
  const availableBlockTypes = [...new Set(globalData.energyCurveData.map((item: any) => item.block_type))];
  const availableYears = [...new Set(globalData.energyCurveData.map((item: any) => 
    new Date(item.month_dt).getFullYear()
  ))].sort();

  const handleApplyScaling = () => {
    if (!selectedZone || !selectedBlockType) {
      alert('Please select both zone and block type');
      return;
    }

    let yearsToScale: number[] = [];
    
    switch (rangeMode) {
      case 'one':
        yearsToScale = [selectedYear];
        break;
      case 'some':
        yearsToScale = selectedYears;
        break;
      case 'all':
        yearsToScale = availableYears;
        break;
    }

    if (rangeMode === 'some' && selectedYears.length === 0) {
      alert('Please select at least one year');
      return;
    }

    // Create scaled data
    const scaledData = globalData.energyCurveData.map((item: any) => {
      const itemYear = new Date(item.month_dt).getFullYear();
      
      if (item.load_zone === selectedZone && 
          item.block_type === selectedBlockType && 
          yearsToScale.includes(itemYear)) {
        return {
          ...item,
          value: (parseFloat(item.value) * scaleFactor).toFixed(2)
        };
      }
      return item;
    });

    setGlobalData({
      ...globalData,
      energyCurveData: scaledData
    });

    alert(`Scaling applied successfully to ${selectedZone} ${selectedBlockType} for ${yearsToScale.join(', ')}`);
  };

  const exportScaledData = () => {
    const headers = [
      'Month', 'Lookup ID1', 'Control Area', 'State', 'Load Zone', 'Capacity Zone',
      'Utility', 'Block Type', 'Cost Group', 'Cost Component', 'Contract', 'UOM', 'Value'
    ];
    
    const csvContent = [
      headers.join(','),
      ...globalData.energyCurveData.map((row: any) => [
        `"${row.month}"`,
        `"${row.lookup_id1 || ''}"`,
        `"${row.control_area}"`,
        `"${row.state}"`,
        `"${row.load_zone}"`,
        `"${row.capacity_zone}"`,
        `"${row.utility}"`,
        `"${row.block_type}"`,
        `"${row.cost_group}"`,
        `"${row.cost_component}"`,
        `"${row.contract}"`,
        `"${row.uom || '$/MWh'}"`,
        `"${row.value}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedIso}_Energy_Scaled_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Scaling Data</h2>
            <p className="text-sm text-gray-600">Apply scaling factors to energy curve data</p>
          </div>
        </div>

        {/* Scaling Form */}
        <div className="space-y-6">
          {/* ISO Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ISO</label>
              <select
                value={selectedIso}
                onChange={(e) => setSelectedIso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ERCOT">ERCOT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Load Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Zone</option>
                {availableZones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
              <select
                value={selectedBlockType}
                onChange={(e) => setSelectedBlockType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Block Type</option>
                {availableBlockTypes.map(blockType => (
                  <option key={blockType} value={blockType}>{blockType}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Range Filter</label>
            <div className="flex space-x-4 mb-4">
              {(['one', 'some', 'all'] as const).map(mode => (
                <label key={mode} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="rangeMode"
                    value={mode}
                    checked={rangeMode === mode}
                    onChange={(e) => setRangeMode(e.target.value as 'one' | 'some' | 'all')}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{mode}</span>
                </label>
              ))}
            </div>

            {rangeMode === 'one' && (
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {rangeMode === 'some' && (
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Years</label>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map(year => (
                    <label key={year} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedYears([...selectedYears, year]);
                          } else {
                            setSelectedYears(selectedYears.filter(y => y !== year));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-1 text-sm text-gray-700">{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scale Factor */}
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Scale Factor</label>
            <input
              type="number"
              step="0.1"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Apply Button */}
          <div className="flex space-x-4">
            <button
              onClick={handleApplyScaling}
              disabled={!selectedZone || !selectedBlockType}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              Apply Scaling
            </button>
          </div>
        </div>
      </div>

      {/* Preview Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Current Energy Curve Data</h3>
                <p className="text-sm text-gray-600">Preview of latest scaled data</p>
              </div>
            </div>
            <button
              onClick={exportScaledData}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Full Scaled CSV
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value ($)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {globalData.energyCurveData.slice(-20).map((row: any, index: number) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.month}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.load_zone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">{row.contract}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      row.block_type === '7x8' ? 'bg-green-100 text-green-800' :
                      row.block_type === '2x16' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {row.block_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{row.uom || '$/MWh'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
          Showing last 20 of {globalData.energyCurveData.length} records
        </div>
      </div>
    </div>
  );
};

export default ScalingData;