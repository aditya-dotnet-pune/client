import React, { useEffect, useState } from 'react';
import { ReportService } from '../../services/api';
import StatCard from '../common/StatCard';
import { DollarSign, Server, ShieldAlert, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await ReportService.getDashboard();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      setError("Failed to load dashboard data. Is the API running?");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#9ca3af' }}>
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', margin: '2rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
        {error}
      </div>
    );
  }

  // Helper for Currency Formatting
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { padding: 2rem; }
        .dashboard-header { margin-bottom: 2rem; }
        .dashboard-header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .dashboard-header p { color: #6b7280; margin-top: 0.5rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .stats-grid { grid-template-columns: repeat(4, 1fr); } }
        
        .table-card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; overflow: hidden; }
        .table-header { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; }
        .table-header h2 { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 0; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { background-color: #f9fafb; color: #6b7280; font-size: 0.875rem; font-weight: 500; padding: 1rem 1.5rem; }
        .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
        .data-table tr:hover { background-color: #f9fafb; }
      `}</style>
      
      <header className="dashboard-header">
        <h1>Executive Overview</h1>
       
      </header>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Spend"
          value={formatCurrency(stats.totalSpend)}
          icon={DollarSign}
          color="#10b981"
          delay={0.1}
        />
        <StatCard
          title="Total Licenses"
          value={stats.totalLicenses}
          icon={Package}
          color="#3b82f6" 
          delay={0.2}
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={ShieldAlert}
          color="#ef4444" 
          delay={0.3}
        />
        <StatCard
          title="Tracked Devices"
          value={stats.totalDevices}
          icon={Server}
          color="#a855f7" 
          delay={0.4}
        />
      </div>

      {/* Top Vendors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="table-card"
      >
        <div className="table-header">
          <h2>Top Vendors by Spend</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>License Count</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {stats.topVendors?.length > 0 ? (
                stats.topVendors.map((vendor, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 500 }}>{vendor.vendor}</td>
                    <td style={{ color: '#4b5563' }}>{vendor.count}</td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(vendor.totalCost)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;