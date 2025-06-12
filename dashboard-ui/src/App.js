import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function App() {
  // 1) React state: stats (orders), customerMetric, start/end dates, loading flag
  const [stats, setStats] = useState(null);
  const [customerMetric, setCustomerMetric] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  // 2) Build URL for /orders with optional start/end
  const buildOrdersUrl = () => {
    let url = '/orders';
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }
    return url;
  };

  // 3) Build URL for /customers_metric with same params
  const buildCustomersUrl = () => {
    let url = '/customers_metric';
    if (startDate && endDate) {
      url += `?start=${startDate}&end=${endDate}`;
    }
    return url;
  };

  // 4) Fetch both endpoints any time startDate or endDate changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(buildOrdersUrl()).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      fetch(buildCustomersUrl()).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
    ])
      .then(([ordersData, customersData]) => {
        setStats(ordersData);
        setCustomerMetric(customersData);
      })
      .catch((err) => console.error('Error fetching data:', err))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // 5) Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Shopify Sales Dashboard
              </h1>
            </div>
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              <p className="ml-4 text-slate-600 text-lg">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6) No-data state
  if (!stats || !stats.orders_by_day) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Shopify Sales Dashboard
              </h1>
            </div>
            
            {/* Date pickers */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Select Date Range</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Start Date
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    End Date
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">No data to display</p>
              <p className="text-slate-400">Please select a valid date range to view your sales analytics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7) Chart data
  const chartData = Object.entries(stats.orders_by_day).map(
    ([date, count]) => ({ date, count })
  );

  // 8) Pie data
  const pieData = [
    { name: 'New Customers', value: customerMetric.new_customers },
    { name: 'Returning Customers', value: customerMetric.returning_customers },
  ];
  const COLORS = ['#10b981', '#3b82f6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                Shopify Sales Dashboard
              </h1>
            </div>
          </div>

          <div className="p-8">
            {/* Date pickers */}
            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Date Range Filter</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Start Date
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    End Date
                  </label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">Total Revenue</h3>
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  ${stats.total_revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className="text-sm text-slate-500 mt-1">Total sales revenue</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Avg Order Value</h3>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  ${stats.average_order_value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className="text-sm text-slate-500 mt-1">Per order average</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wide">Customer Split</h3>
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                {customerMetric ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">New</span>
                      <span className="text-lg font-semibold text-slate-900">{customerMetric.new_customers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Returning</span>
                      <span className="text-lg font-semibold text-slate-900">{customerMetric.returning_customers}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-slate-400">–</p>
                )}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bar Chart: Orders Per Day */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Orders by Day</h2>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="url(#colorGradient)" 
                          name="Orders"
                          radius={[4, 4, 0, 0]}
                        />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pie Chart: Customer Breakdown */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-full">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Breakdown</h2>
                  <div className="flex justify-center items-center h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">New</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">Returning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;