import React, { useState, useEffect, useMemo } from 'react';
import {
  FaStore,
  FaShoppingCart,
  FaUsers,
  FaBox,
  FaChartLine,
  FaCrown,
  FaMoneyBillWave,
  FaFileInvoice,
  FaCube,
  FaShoppingBag,
  FaDatabase,
  FaSync,
  FaReceipt
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from "../../Components/Sidebar/Navbar";
import './SuperAdminDashboard.scss';
import 'react-toastify/dist/ReactToastify.css';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user to check if superadmin
  const currentUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("user") || "{}");
  }, []);

  const isSuperAdmin = useMemo(() => {
    return currentUser.permissions?.includes('superadmin') || false;
  }, [currentUser]);

  // Fetch combined dashboard data
  const fetchDashboardData = async () => {
    if (!isSuperAdmin) {
      setError('Access denied. Super Admin privileges required.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/superadmin/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isSuperAdmin]);

  // Process data for charts
  const chartData = useMemo(() => {
    if (!dashboardData) return null;

    // Store performance data for bar chart
    const storePerformance = Object.entries(dashboardData.stores).map(([storeId, store]) => ({
      name: `Store ${storeId.slice(-4)}`,
      sales: store.totalSales,
      invoices: store.totalInvoices,
      customers: store.totalCustomers,
      itemsSold: store.totalItemsSold
    }));

    // Sales distribution for pie chart
    const salesDistribution = Object.entries(dashboardData.stores).map(([storeId, store]) => ({
      name: `Store ${storeId.slice(-4)}`,
      value: store.totalSales,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }));

    // NEW: Sales vs Purchases comparison by store
    const salesVsPurchases = Object.entries(dashboardData.stores).map(([storeId, store]) => ({
      name: `Store ${storeId.slice(-4)}`,
      sales: store.totalSales,
      purchases: store.totalPurchaseValue,
      profit: store.totalSales - store.totalPurchaseValue
    }));

    // Trending products data
    const trendingProductsQty = dashboardData.trendingProducts.slice(0, 5).map(product => ({
      name: product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name,
      quantity: product.totalQuantity
    }));

    const trendingProductsRevenue = dashboardData.trendingProducts.slice(0, 5).map(product => ({
      name: product.name.length > 12 ? product.name.substring(0, 12) + '...' : product.name,
      revenue: product.totalRevenue
    }));

    return {
      storePerformance,
      salesDistribution,
      salesVsPurchases,
      trendingProductsQty,
      trendingProductsRevenue
    };
  }, [dashboardData]);

  // Main metrics cards data - ADDED: Total Purchases card
  const metrics = useMemo(() => {
    if (!dashboardData) return [];

    return [
      {
        title: 'Total Sales',
        value: `₹${dashboardData.totalSales.toLocaleString()}`,
        icon: FaMoneyBillWave,
        color: 'sales',
        description: 'Across all stores'
      },
      {
        title: 'Total Purchases',
        value: `₹${dashboardData.totalPurchaseValue.toLocaleString()}`,
        icon: FaReceipt,
        color: 'purchases',
        description: 'Inventory investment'
      },
      {
        title: 'Total Invoices',
        value: dashboardData.totalInvoices.toLocaleString(),
        icon: FaFileInvoice,
        color: 'invoices',
        description: 'Processed invoices'
      },
      {
        title: 'Total Customers',
        value: dashboardData.totalCustomers.toLocaleString(),
        icon: FaUsers,
        color: 'customers',
        description: 'Registered customers'
      },
      {
        title: 'Items Sold',
        value: dashboardData.totalItemsSold.toLocaleString(),
        icon: FaShoppingBag,
        color: 'items',
        description: 'Total products sold'
      },
      {
        title: 'Active Stores',
        value: Object.keys(dashboardData.stores || {}).length.toString(),
        icon: FaStore,
        color: 'stores',
        description: 'Managed stores'
      }
    ];
  }, [dashboardData]);

  // Store performance metrics
  const storeMetrics = useMemo(() => {
    if (!dashboardData?.stores) return [];

    return Object.entries(dashboardData.stores).map(([storeId, store]) => ({
      id: storeId,
      name: `Store ${storeId.slice(-4)}`,
      sales: store.totalSales,
      invoices: store.totalInvoices,
      customers: store.totalCustomers,
      itemsSold: store.totalItemsSold,
      purchaseValue: store.totalPurchaseValue,
      efficiency: store.totalInvoices > 0 ? (store.totalSales / store.totalInvoices).toFixed(2) : 0,
      profitMargin: store.totalSales > 0 ? (((store.totalSales - store.totalPurchaseValue) / store.totalSales) * 100).toFixed(1) : 0
    }));
  }, [dashboardData]);

  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

  if (!isSuperAdmin) {
    return (
      <Navbar>
        <div className="superadmin-dashboard">
          <div className="access-denied">
            <FaCrown className="crown-icon" />
            <h2>Super Admin Access Required</h2>
            <p>You need Super Admin privileges to access this dashboard.</p>
          </div>
        </div>
      </Navbar>
    );
  }

  if (loading) {
    return (
      <Navbar>
        <div className="superadmin-dashboard">
          <div className="loading-container">
            <div className="loading-spinner large"></div>
            <p>Loading Super Admin Dashboard...</p>
          </div>
        </div>
      </Navbar>
    );
  }

  if (error) {
    return (
      <Navbar>
        <div className="superadmin-dashboard">
          <div className="error-container">
            <h2>Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="retry-btn">
              <FaSync /> Retry
            </button>
          </div>
        </div>
      </Navbar>
    );
  }

  return (
    <Navbar>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="superadmin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <FaCrown className="crown-icon" />
              <h1>Super Admin Dashboard</h1>
              <span className="superadmin-badge">Super Admin</span>
            </div>
            <p>Complete overview of all stores and business performance</p>
          </div>
          <div className="header-controls">
            <button onClick={fetchDashboardData} className="refresh-btn">
              <FaSync /> Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics Grid - ADDED: Total Purchases card */}
        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <div key={index} className={`metric-card ${metric.color}`}>
              <div className="metric-icon">
                <metric.icon />
              </div>
              <div className="metric-content">
                <h3>{metric.title}</h3>
                <p>{metric.value}</p>
                <small>{metric.description}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section - ADDED: Sales vs Purchases chart */}
        <div className="charts-section">
          {/* Store Performance Chart */}
          <div className="chart-container large">
            <div className="chart-header">
              <h3>Store Performance Comparison</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color sales"></span>
                  Total Sales (₹)
                </div>
                <div className="legend-item">
                  <span className="legend-color invoices"></span>
                  Invoices Count
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.storePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sales' ? `₹${value.toLocaleString()}` : value.toLocaleString(),
                    name === 'sales' ? 'Total Sales' : 'Invoices'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="sales" name="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="invoices" name="invoices" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* NEW: Sales vs Purchases Comparison */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Sales vs Purchases</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color sales-comp"></span>
                  Sales (₹)
                </div>
                <div className="legend-item">
                  <span className="legend-color purchases-comp"></span>
                  Purchases (₹)
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.salesVsPurchases}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Legend />
                <Bar dataKey="sales" name="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="purchases" fill="#ff8042" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sales Distribution */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Sales Distribution by Store</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.salesDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.salesDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products by Quantity */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Top Products by Quantity</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.trendingProductsQty} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Quantity Sold']} />
                <Bar dataKey="quantity" name="quantity" fill="#ffc658" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products by Revenue */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Top Products by Revenue</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.trendingProductsRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" name="revenue" fill="#ff8042" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Store Details Table - ADDED: Profit Margin column */}
        <div className="stores-section">
          <div className="section-header">
            <h3>Store Performance Details</h3>
            <span className="store-count">{storeMetrics.length} Stores</span>
          </div>
          <div className="stores-table-container">
            <table className="stores-table">
              <thead>
                <tr>
                  <th>Store ID</th>
                  <th>Total Sales</th>
                  <th>Total Purchases</th>
                  <th>Invoices</th>
                  <th>Customers</th>
                  <th>Items Sold</th>
                  {/* <th>Profit Margin</th> */}
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {storeMetrics.map((store, index) => (
                  <tr key={store.id} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td className="store-name">
                      <FaStore className="store-icon" />
                      {store.name}
                    </td>
                    <td className="sales-amount">₹{store.sales.toLocaleString()}</td>
                    <td className="purchase-amount">₹{store.purchaseValue.toLocaleString()}</td>
                    <td>{store.invoices.toLocaleString()}</td>
                    <td>{store.customers.toLocaleString()}</td>
                    <td>{store.itemsSold.toLocaleString()}</td>
                    {/* <td className="profit-margin">
                      <span className={`margin-badge ${store.profitMargin > 30 ? 'high' : store.profitMargin > 15 ? 'medium' : 'low'}`}>
                        {store.profitMargin}%
                      </span>
                    </td> */}
                    <td className="efficiency">
                      <span className={`eff-badge ${store.efficiency > 1000 ? 'high' : store.efficiency > 500 ? 'medium' : 'low'}`}>
                        ₹{store.efficiency}/invoice
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="quick-stats">
          <div className="stat-item">
            <FaChartLine className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{dashboardData?.totalInvoices || 0}</span>
              <span className="stat-label">Total Invoices</span>
            </div>
          </div>
          <div className="stat-item">
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{dashboardData?.totalCustomers || 0}</span>
              <span className="stat-label">Total Customers</span>
            </div>
          </div>
          <div className="stat-item">
            <FaBox className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{dashboardData?.totalItemsSold || 0}</span>
              <span className="stat-label">Items Sold</span>
            </div>
          </div>
          <div className="stat-item">
            <FaDatabase className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{Object.keys(dashboardData?.stores || {}).length}</span>
              <span className="stat-label">Active Stores</span>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default SuperAdminDashboard;