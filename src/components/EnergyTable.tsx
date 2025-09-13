import React, { useState, useEffect } from 'react';
import { Download, Zap, Calendar, AlertCircle } from 'lucide-react';

interface EnergyTableProps {
  globalData: any;
  setGlobalData: (data: any) => void;
}

const EnergyTable: React.FC<EnergyTableProps> = ({ globalData, setGlobalData }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [termMonths, setTermMonths] = useState(12);
  const [energyCurveData, setEnergyCurveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIso, setSelectedIso] = useState('ERCOT');

  const isoOptions = ['ERCOT', 'ISONE', 'MISO', 'NYISO', 'PJM'];

  // Enhanced hierarchy data for all ISOs
  const getHierarchyForIso = (iso: string) => {
    const hierarchyMap: {[key: string]: any[]} = {
      'ERCOT': [
        {
          lookup_id1: 'ERCOT_TX_NORTH_ZONE_NORTH_ALL_7x8_Energy_Energy_NZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'NORTH ZONE',
          capacity_zone: 'NORTH',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'NZD'
        },
        {
          lookup_id1: 'ERCOT_TX_NORTH_ZONE_NORTH_ALL_2x16_Energy_Energy_NZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'NORTH ZONE',
          capacity_zone: 'NORTH',
          utility: 'ALL',
          block_type: '2x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'NZD'
        },
        {
          lookup_id1: 'ERCOT_TX_NORTH_ZONE_NORTH_ALL_5x16_Energy_Energy_NZB',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'NORTH ZONE',
          capacity_zone: 'NORTH',
          utility: 'ALL',
          block_type: '5x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'NZB'
        },
        {
          lookup_id1: 'ERCOT_TX_SOUTH_ZONE_SOUTH_ALL_7x8_Energy_Energy_SZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'SOUTH ZONE',
          capacity_zone: 'SOUTH',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'SZD'
        },
        {
          lookup_id1: 'ERCOT_TX_SOUTH_ZONE_SOUTH_ALL_2x16_Energy_Energy_SZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'SOUTH ZONE',
          capacity_zone: 'SOUTH',
          utility: 'ALL',
          block_type: '2x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'SZD'
        },
        {
          lookup_id1: 'ERCOT_TX_WEST_ZONE_WEST_ALL_7x8_Energy_Energy_WZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'WEST ZONE',
          capacity_zone: 'WEST',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'WZD'
        },
        {
          lookup_id1: 'ERCOT_TX_WEST_ZONE_WEST_ALL_2x16_Energy_Energy_WZD',
          control_area: 'ERCOT',
          state: 'TX',
          load_zone: 'WEST ZONE',
          capacity_zone: 'WEST',
          utility: 'ALL',
          block_type: '2x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'WZD'
        }
      ],
      'ISONE': [
        {
          lookup_id1: 'ISONE_MA_MAINE_MAINE_ALL_7x8_Energy_Energy_IED',
          control_area: 'ISONE',
          state: 'MA',
          load_zone: 'MAINE',
          capacity_zone: 'MAINE',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'IED'
        },
        {
          lookup_id1: 'ISONE_MA_MAINE_MAINE_ALL_2x16_Energy_Energy_IED',
          control_area: 'ISONE',
          state: 'MA',
          load_zone: 'MAINE',
          capacity_zone: 'MAINE',
          utility: 'ALL',
          block_type: '2x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'IED'
        },
        {
          lookup_id1: 'ISONE_MA_CONNECTICUT_CONNECTICUT_ALL_7x8_Energy_Energy_ICO',
          control_area: 'ISONE',
          state: 'MA',
          load_zone: 'CONNECTICUT',
          capacity_zone: 'CONNECTICUT',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'ICO'
        }
      ],
      'PJM': [
        {
          lookup_id1: 'PJM_PA_AECO_AECO_ALL_7x8_Energy_Energy_PTD',
          control_area: 'PJM',
          state: 'PA',
          load_zone: 'AECO',
          capacity_zone: 'AECO',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'PTD'
        },
        {
          lookup_id1: 'PJM_PA_AECO_AECO_ALL_2x16_Energy_Energy_PTD',
          control_area: 'PJM',
          state: 'PA',
          load_zone: 'AECO',
          capacity_zone: 'AECO',
          utility: 'ALL',
          block_type: '2x16',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'PTD'
        }
      ],
      'MISO': [
        {
          lookup_id1: 'MISO_IL_AMIL_CILC_BOC_AMIL_CILC_BOC_ALL_7x8_Energy_Energy_BGB',
          control_area: 'MISO',
          state: 'IL',
          load_zone: 'AMIL.CILC.BOC',
          capacity_zone: 'AMIL.CILC.BOC',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'BGB'
        }
      ],
      'NYISO': [
        {
          lookup_id1: 'NYISO_NY_ZONA_ZONA_ALL_7x8_Energy_Energy_NYA',
          control_area: 'NYISO',
          state: 'NY',
          load_zone: 'ZONA',
          capacity_zone: 'ZONA',
          utility: 'ALL',
          block_type: '7x8',
          cost_group: 'Energy',
          cost_component: 'Energy',
          contract: 'NYA'
        }
      ]
    };
    return hierarchyMap[iso] || [];
  };
  const generateEnergyData = () => {
    setLoading(true);

    setTimeout(() => {
      const startMonth = new Date(startDate + '-01');
      const hierarchy = getHierarchyForIso(selectedIso);
      const mockEnergyData = [];

      for (let i = 0; i < termMonths; i++) {
        const currentMonth = new Date(startMonth);
        currentMonth.setMonth(startMonth.getMonth() + i);
        
        hierarchy.forEach(item => {
          // Mock ICE settlement price
          const basePrice = Math.random() * 30 + 40; // $40-70
          
          // Apply shaping factor if available
          let finalPrice = basePrice;
          
          if (globalData.combinedTable && globalData.selectedIso === selectedIso) {
            const monthNum = currentMonth.getMonth() + 1;
            const shapingData = globalData.combinedTable?.find((row: any) => row.month === monthNum);
            
            if (shapingData && item.block_type !== '5x16') {
              const zoneName = item.load_zone.toUpperCase().replace(' ZONE', '').replace(' ', '_');
              const shapingKey = `${zoneName}_${item.block_type}`;
              const shapingValue = shapingData[shapingKey];
              if (shapingValue) {
                const factor = parseFloat(shapingValue.replace('%', '')) / 100;
                finalPrice = basePrice * factor;
              }
            }
          }
          
          mockEnergyData.push({
            month: currentMonth.toLocaleDateString(),
            month_dt: currentMonth,
            lookup_id1: item.lookup_id1,
            control_area: item.control_area,
            state: item.state,
            load_zone: item.load_zone,
            capacity_zone: item.capacity_zone,
            utility: item.utility,
            block_type: item.block_type,
            cost_group: item.cost_group,
            cost_component: item.cost_component,
            contract: item.contract,
            uom: '$/MWh',
            value: finalPrice.toFixed(2)
          });
        });
      }
      
      setEnergyCurveData(mockEnergyData);
      setGlobalData({
        ...globalData,
        energyCurveData: mockEnergyData
      });
      setLoading(false);
    }, 1200);
  };

  const exportToCsv = () => {
    if (energyCurveData.length === 0) return;
    
    // Group data by hierarchy columns to create the exact format from the image
    const hierarchy = getHierarchyForIso(selectedIso);
    const monthlyData = energyCurveData.reduce((acc, row) => {
      const monthKey = row.month_dt.toISOString().split('T')[0].slice(0, 7) + '-01';
      if (!acc[monthKey]) acc[monthKey] = {};
      const colKey = `${row.load_zone}_${row.block_type}_${row.contract}`;
      acc[monthKey][colKey] = row.value;
      return acc;
    }, {} as any);

    // Create CSV content in the exact format shown in the image
    const csvLines = [];
    
    // Create column headers (one column per hierarchy item)
    const columns = hierarchy.map(h => `${h.load_zone}_${h.block_type}_${h.contract}`);
    
    // Row 1: Lookup ID1
    csvLines.push(['Lookup ID1', ...hierarchy.map(h => h.lookup_id1)].join(','));
    
    // Row 2: Control Area
    csvLines.push(['Control Area', ...hierarchy.map(h => h.control_area)].join(','));
    
    // Row 3: State
    csvLines.push(['State', ...hierarchy.map(h => h.state)].join(','));
    
    // Row 4: Load Zone
    csvLines.push(['Load Zone', ...hierarchy.map(h => h.load_zone)].join(','));
    
    // Row 5: Capacity Zone
    csvLines.push(['Capacity Zone', ...hierarchy.map(h => h.capacity_zone)].join(','));
    
    // Row 6: Utility
    csvLines.push(['Utility', ...hierarchy.map(h => h.utility)].join(','));
    
    // Row 7: Block Type
    csvLines.push(['Block Type', ...hierarchy.map(h => h.block_type)].join(','));
    
    // Row 8: Cost Group
    csvLines.push(['Cost Group', ...hierarchy.map(h => h.cost_group)].join(','));
    
    // Row 9: Cost Component
    csvLines.push(['Cost Component', ...hierarchy.map(h => h.cost_component)].join(','));
    
    // Row 10: CONTRACT (highlighted in green in the image)
    csvLines.push(['CONTRACT', ...hierarchy.map(h => h.contract)].join(','));
    
    // Empty row
    csvLines.push(['', ...Array(hierarchy.length).fill('')].join(','));
    
    // Data rows starting with "Month"
    const sortedMonths = Object.keys(monthlyData).sort();
    sortedMonths.forEach(monthKey => {
      const monthDate = new Date(monthKey);
      const formattedMonth = monthDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const values = columns.map(col => {
        const value = monthlyData[monthKey][col];
        return value ? `$${value}` : '';
      });
      
      csvLines.push([formattedMonth, ...values].join(','));
    });
    
    // Add Month header row before data
    const monthHeaderIndex = csvLines.findIndex(line => line.includes('01-'));
    if (monthHeaderIndex > -1) {
      csvLines.splice(monthHeaderIndex, 0, ['Month', ...hierarchy.map(h => h.load_zone)].join(','));
    }
    
    const csvContent = csvLines.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${selectedIso}_Energy_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const endDate = new Date(startDate + '-01');
  endDate.setMonth(endDate.getMonth() + termMonths - 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Energy Curve Analysis</h2>
            <p className="text-sm text-gray-600">Generate forward energy curves for all ISOs using ICE data and shaping factors</p>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ISO Region
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term (Months)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={termMonths}
              onChange={(e) => setTermMonths(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateEnergyData}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Energy Curve'}
            </button>
          </div>
        </div>

        {!globalData.combinedTable && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <p className="text-blue-800">
                <strong>Note:</strong> Shaping factors will be applied if available from the Shaping Output tab for the selected ISO. 
                Otherwise, base ICE settlement prices will be used.
              </p>
            </div>
          </div>
        )}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Pricing Period:</strong> {new Date(startDate + '-01').toLocaleDateString()} → {endDate.toLocaleDateString()}
            <br />
            <strong>Selected ISO:</strong> {selectedIso}
          </p>
        </div>
      </div>

      {/* Results */}
      {energyCurveData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{selectedIso} Energy Curve Data</h3>
                <p className="text-sm text-gray-600">Forward curve with full hierarchy ({energyCurveData.length} records)</p>
              </div>
              <button
                onClick={exportToCsv}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Hierarchy CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lookup ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Control Area</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load Zone</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity Zone</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utility</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {energyCurveData.slice(0, 50).map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.month}</td>
                    <td className="px-3 py-3 text-xs text-gray-600 max-w-xs truncate" title={row.lookup_id1}>
                      {row.lookup_id1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.control_area}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.state}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.load_zone}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.capacity_zone}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.utility}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        row.block_type === '7x8' ? 'bg-green-100 text-green-800' :
                        row.block_type === '2x16' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {row.block_type}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-green-600">{row.contract}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{row.uom}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {energyCurveData.length > 50 && (
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
              Showing first 50 of {energyCurveData.length} records. Download CSV for complete data in hierarchy format.
            </div>
          )}
        </div>
      )}

      {energyCurveData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Click "Generate Energy Curve" to create forward curve data</p>
        </div>
      )}
    </div>
  );
};

export default EnergyTable;