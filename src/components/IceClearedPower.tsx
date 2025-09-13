import React, { useState, useEffect } from 'react';
import { Download, Database, Calendar, Filter } from 'lucide-react';

const IceClearedPower: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [iceData, setIceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  // Mock date range
  const minDate = '2023-01-01';
  const maxDate = new Date().toISOString().split('T')[0];

  // Mock data generation
  const generateMockIceData = () => {
    setLoading(true);
    
    setTimeout(() => {
      const contracts = ['NZD', 'SZD', 'WZD', 'HZD', 'IED', 'IHD', 'ICO'];
      const products = ['7x8', '2x16', '5x16'];
      const mockData = [];
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= Math.min(diffDays, 30); i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        
        contracts.forEach(contract => {
          products.forEach(product => {
            mockData.push({
              trade_date: currentDate.toISOString().split('T')[0],
              contract,
              product,
              strip: currentDate.toISOString().split('T')[0],
              settlement_price: (Math.random() * 50 + 25).toFixed(2),
              volume: Math.floor(Math.random() * 1000 + 100),
              open_interest: Math.floor(Math.random() * 500 + 50)
            });
          });
        });
      }
      
      setIceData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    generateMockIceData();
  }, []);

  const handleFilter = () => {
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date');
      return;
    }
    generateMockIceData();
  };

  const exportToCsv = () => {
    if (filteredData.length === 0) return;
    
    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `ICE_Cleared_Power_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <Database className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">ICE Cleared Power Data</h2>
            <p className="text-sm text-gray-600">View and download power market settlement data</p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Trade Date
            </label>
            <input
              type="date"
              value={startDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Trade Date
            </label>
            <input
              type="date"
              value={endDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      {filteredData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">ICE Power Settlement Data</h3>
                <p className="text-sm text-gray-600">{filteredData.length} records found</p>
              </div>
              <button
                onClick={exportToCsv}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trade Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Strip
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Settlement Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Interest
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 100).map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.trade_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.contract}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.strip).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${row.settlement_price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {row.volume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {row.open_interest.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length > 100 && (
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
              Showing first 100 of {filteredData.length} records. Download CSV for complete data.
            </div>
          )}
        </div>
      )}

      {filteredData.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data found for selected date range</p>
        </div>
      )}
    </div>
  );
};

export default IceClearedPower;