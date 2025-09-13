import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Settings, Zap } from 'lucide-react';

interface ShapingOutputProps {
  globalData: any;
  setGlobalData: (data: any) => void;
}

const ShapingOutput: React.FC<ShapingOutputProps> = ({ globalData, setGlobalData }) => {
  const [selectedIso, setSelectedIso] = useState('ERCOT');
  const [selectedYears, setSelectedYears] = useState([2023, 2024]);
  const [scale7x8, setScale7x8] = useState(1.0);
  const [scale2x16, setScale2x16] = useState(1.0);
  const [zoneScales, setZoneScales] = useState<{[key: string]: number}>({});
  const [combinedTable, setCombinedTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isoOptions = ['ERCOT', 'ISONE', 'MISO', 'NYISO', 'PJM'];
  const availableYears = [2020, 2021, 2022, 2023, 2024];

  // Mock zones data based on ISO
  const getZonesForIso = (iso: string) => {
    const zoneMap: {[key: string]: string[]} = {
      'ERCOT': ['NORTH ZONE', 'SOUTH ZONE', 'WEST ZONE', 'HOUSTON ZONE'],
      'ISONE': ['MAINE', 'NEW HAMPSHIRE', 'VERMONT', 'CONNECTICUT', 'RHODE ISLAND'],
      'MISO': ['AMIL.CILC.BOC', 'AMIL.CIPS', 'AMIL.IP'],
      'NYISO': ['ZONA', 'ZONB', 'ZONC', 'ZOND'],
      'PJM': ['AECO', 'AEP', 'BGE', 'COMED', 'PPL']
    };
    return zoneMap[iso] || [];
  };

  const zones = getZonesForIso(selectedIso);

  // Initialize zone scales when ISO changes
  useEffect(() => {
    const initialScales: {[key: string]: number} = {};
    zones.forEach(zone => {
      initialScales[zone] = 1.0;
    });
    setZoneScales(initialScales);
  }, [selectedIso]);

  const generateCombinedTable = () => {
    setLoading(true);
    
    // Mock data generation
    setTimeout(() => {
      const mockData = [];
      for (let month = 1; month <= 12; month++) {
        const row: any = { month };
        zones.forEach(zone => {
          // Generate mock percentages
          const base7x8 = Math.random() * 20 + 90; // 90-110%
          const base2x16 = Math.random() * 20 + 90; // 90-110%
          
          const scaled7x8 = base7x8 * scale7x8 * (zoneScales[zone] || 1.0);
          const scaled2x16 = base2x16 * scale2x16 * (zoneScales[zone] || 1.0);
          
          row[`${zone}_7x8`] = `${Math.round(scaled7x8)}%`;
          row[`${zone}_2x16`] = `${Math.round(scaled2x16)}%`;
        });
        mockData.push(row);
      }
      
      setCombinedTable(mockData);
      setGlobalData({
        ...globalData,
        combinedTable: mockData,
        selectedIso
      });
      setLoading(false);
    }, 1000);
  };

  const exportToCsv = () => {
    if (combinedTable.length === 0) return;
    
    const headers = ['Month', ...zones.flatMap(zone => [`${zone}_7x8`, `${zone}_2x16`])];
    const csvContent = [
      headers.join(','),
      ...combinedTable.map(row => 
        [row.month, ...zones.flatMap(zone => [row[`${zone}_7x8`], row[`${zone}_2x16`]])].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedIso}_Shaping_Output.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Shaping Output Analysis</h2>
            <p className="text-sm text-gray-600">Configure shaping factors for energy market analysis</p>
          </div>
        </div>

        {/* ISO Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ISO Region</label>
            <select
              value={selectedIso}
              onChange={(e) => setSelectedIso(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {isoOptions.map(iso => (
                <option key={iso} value={iso}>{iso}</option>
              ))}
            </select>
          </div>

          <div>
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
        </div>
      </div>

      {/* Global Scaling Factors */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Global Scaling Factors</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">7x8 Scale Factor</label>
            <input
              type="number"
              step="0.1"
              value={scale7x8}
              onChange={(e) => setScale7x8(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">2x16 Scale Factor</label>
            <input
              type="number"
              step="0.1"
              value={scale2x16}
              onChange={(e) => setScale2x16(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Zone-wise Scaling */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Zone-wise Scaling Factors</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {zones.map(zone => (
            <div key={zone}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {zone.replace('_', ' ')}
              </label>
              <input
                type="number"
                step="0.1"
                value={zoneScales[zone] || 1.0}
                onChange={(e) => setZoneScales({
                  ...zoneScales,
                  [zone]: parseFloat(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateCombinedTable}
          disabled={loading || selectedYears.length === 0}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Shaping Table'}
        </button>
      </div>

      {/* Results Table */}
      {combinedTable.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Combined Shaping Table</h3>
              <button
                onClick={exportToCsv}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  {zones.map(zone => (
                    <React.Fragment key={zone}>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {zone} 7x8
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {zone} 2x16
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {combinedTable.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(2024, row.month - 1).toLocaleString('default', { month: 'long' })}
                    </td>
                    {zones.map(zone => (
                      <React.Fragment key={zone}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {row[`${zone}_7x8`]}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                          {row[`${zone}_2x16`]}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShapingOutput;