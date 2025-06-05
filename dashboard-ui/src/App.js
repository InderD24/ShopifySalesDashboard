import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function App() {
  // 1) React state: stats (orders), customerMetric, start/end dates, loading flag
  const [stats, setStats]                 = useState(null);
  const [customerMetric, setCustomerMetric] = useState(null);
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [loading, setLoading]             = useState(false);

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
        console.log('Orders stats:', ordersData);
        console.log('Customer metric:', customersData);
        setStats(ordersData);
        setCustomerMetric(customersData);
      })
      .catch((err) => console.error('Error fetching data:', err))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  // 5) Show a loading message while fetching
  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Shopify Sales Dashboard</h1>
        <p>Loading…</p>
      </div>
    );
  }

  // 6) If we haven’t received stats yet or orders_by_day is missing, show date pickers + a “no data” notice
  if (!stats || !stats.orders_by_day) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Shopify Sales Dashboard</h1>

        {/* Date pickers */}
        <div style={{ marginTop: 20, marginBottom: 40 }}>
          <label style={{ marginRight: 10 }}>
            Start Date:{' '}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label style={{ marginLeft: 20 }}>
            End Date:{' '}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>

        <p>No data to display. Please pick a valid date range.</p>
      </div>
    );
  }

  // 7) Transform orders_by_day into an array for Recharts
  const chartData = Object.entries(stats.orders_by_day).map(
    ([date, count]) => ({ date, count })
  );

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1 className="text-5xl text-green-600 font-bold">
        Tailwind Is Working!
      </h1>

      {/* Date pickers */}
      <div style={{ marginTop: 20, marginBottom: 40 }}>
        <label style={{ marginRight: 10 }}>
          Start Date:{' '}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: 20 }}>
          End Date:{' '}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 20,
            minWidth: 200,
            textAlign: 'center',
          }}
        >
          <h2>Total Revenue</h2>
          <p style={{ fontSize: 24, margin: 0 }}>
            ${stats.total_revenue.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 20,
            minWidth: 200,
            textAlign: 'center',
          }}
        >
          <h2>Average Order Value</h2>
          <p style={{ fontSize: 24, margin: 0 }}>
            ${stats.average_order_value.toFixed(2)}
          </p>
        </div>

        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 20,
            minWidth: 200,
            textAlign: 'center',
          }}
        >
          <h2>New vs Returning</h2>
          {customerMetric ? (
            <>
              <p style={{ margin: 0 }}>
                New: {customerMetric.new_customers}
              </p>
              <p style={{ margin: 0 }}>
                Returning: {customerMetric.returning_customers}
              </p>
            </>
          ) : (
            <p>–</p>
          )}
        </div>
      </div>

      {/* Bar Chart: Orders Per Day */}
      <div>
        <h2>Orders by Day</h2>
        <BarChart width={700} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" name="Order Count" />
        </BarChart>
      </div>
    </div>
  );
}

export default App;
