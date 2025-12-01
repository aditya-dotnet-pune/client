import React, { useEffect, useState } from 'react';
import { LicenseService, ComplianceService } from '../../services/api';
import { ShieldCheck, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplianceReport = () => {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial Load
    refreshData();

    // Auto-update every 10 seconds
    const intervalId = setInterval(() => {
      refreshData(true); // silent refresh
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      // 1. Force Backend to Recalculate usage (Run Compliance Engine)
      await ComplianceService.runCheck();
      
      // 2. Fetch the updated license data
      const response = await LicenseService.getAll();
      setLicenses(response.data);
    } catch (err) {
      console.error("Failed to fetch compliance data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const calculateStatus = (license) => {
    const today = new Date();
    const expiry = license.expiryDate ? new Date(license.expiryDate) : null;
    const gap = license.totalEntitlements - license.assignedLicenses;

    if (expiry && expiry < today) {
      return { label: 'Expired', color: '#dc2626', bg: '#fef2f2', icon: Clock };
    }
    
    if (gap < 0) {
      return { label: 'Overused', color: '#ea580c', bg: '#fff7ed', icon: AlertCircle };
    }
    
    if (gap > 0) {
      return { label: 'Unused', color: '#ca8a04', bg: '#fefce8', icon: AlertCircle }; // Yellow/Gold for unused
    }

    return { label: 'Compliant', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle };
  };

  const getLicenseTypeName = (typeInt) => {
    return ['Per User', 'Per Device', 'Concurrent', 'Subscription'][typeInt] || 'Unknown';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Compliance Report...</div>;

  return (
    <div className="report-container">
      <style>{`
        .report-container { padding: 2rem; }
        .header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .refresh-indicator {
          font-size: 0.75rem;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .table-card {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          overflow: hidden;
        }
        
        .comp-table { width: 100%; border-collapse: collapse; text-align: left; }
        .comp-table th { background-color: #f9fafb; color: #6b7280; font-size: 0.875rem; font-weight: 500; padding: 1rem 1.5rem; }
        .comp-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
        .comp-table tr:hover { background-color: #f9fafb; }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .numeric-cell { font-family: 'Inter', sans-serif; font-variant-numeric: tabular-nums; }
        .gap-pos { color: #16a34a; }
        .gap-neg { color: #dc2626; font-weight: 700; }
        .gap-zero { color: #9ca3af; }
      `}</style>

      <div className="header">
        <div>
          <h1>Compliance Report</h1>
          <p>Detailed breakdown of license usage vs ownership.</p>
        </div>
        <div className="refresh-indicator">
          {isRefreshing ? (
            <>
              <RefreshCw size={14} className="spin" /> Updating...
            </>
          ) : (
            <>
               <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e'}}></span> Live
            </>
          )}
        </div>
      </div>

      <div className="table-card">
        <table className="comp-table">
          <thead>
            <tr>
              <th>Product List</th>
              <th>Type</th>
              <th>Owned (Entitlements)</th>
              <th>Used (Assigned)</th>
              <th>Gap</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l, index) => {
              const gap = l.totalEntitlements - l.assignedLicenses;
              const status = calculateStatus(l);
              const StatusIcon = status.icon;

              return (
                <motion.tr 
                  key={l.licenseId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td style={{ fontWeight: 500 }}>{l.productName}</td>
                  <td style={{ color: '#4b5563', fontSize: '0.875rem' }}>{getLicenseTypeName(l.licenseType)}</td>
                  <td className="numeric-cell" style={{ fontWeight: 600 }}>{l.totalEntitlements}</td>
                  <td className="numeric-cell">{l.assignedLicenses}</td>
                  <td className={`numeric-cell ${gap < 0 ? 'gap-neg' : (gap > 0 ? 'gap-pos' : 'gap-zero')}`}>
                    {gap > 0 ? `+${gap}` : gap}
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
            
            {licenses.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplianceReport;