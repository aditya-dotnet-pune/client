import React, { useState, useEffect } from 'react';
import { ComplianceService, LicenseService } from '../../services/api'; 
import { ShieldAlert, RefreshCw, CheckCircle, AlertTriangle, XCircle, CalendarClock, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplianceDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); 

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await ComplianceService.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to load alerts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (licenseId) => {
    if(!window.confirm("Renew this license for 1 Year? This will resolve the alert.")) return;
    
    setProcessingId(licenseId);
    try {
      await LicenseService.renew(licenseId);
      setAlerts(prev => prev.filter(a => a.licenseId !== licenseId));
      alert("License renewed successfully!");
    } catch (error) {
      alert("Failed to renew license.");
    } finally {
      setProcessingId(null);
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 2: return { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }; // High
      case 1: return { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }; // Medium
      case 0: return { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #dbeafe' }; // Low
      default: return { backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb' };
    }
  };

  const getSeverityLabel = (severity) => {
    return ['Low', 'Medium', 'High'][severity] || 'Unknown';
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Alerts...</div>;

  return (
    <div className="compliance-container">
      <style>{`
        .compliance-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .btn-renew { background-color: #ffffff; color: #ea580c; border: 1px solid #fed7aa; padding: 0.4rem 0.8rem; border-radius: 0.375rem; cursor: pointer; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; }
        .btn-renew:hover { background-color: #fff7ed; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } }

        .summary-card { background-color: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #f3f4f6; display: flex; align-items: center; gap: 1rem; }
        .icon-wrapper { padding: 0.75rem; border-radius: 9999px; }
        .bg-red { background-color: #fef2f2; color: #dc2626; }
        .bg-orange { background-color: #fff7ed; color: #ea580c; }
        .bg-green { background-color: #ecfdf5; color: #059669; }

        .alerts-card { background-color: white; border-radius: 0.75rem; border: 1px solid #f3f4f6; overflow: hidden; }
        .alerts-header { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #1f2937; }
        
        .alert-item { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-start; }
        .alert-content { display: flex; gap: 1rem; }
        .dot { margin-top: 0.35rem; width: 0.5rem; height: 0.5rem; border-radius: 50%; flex-shrink: 0; }
        .dot-red { background-color: #ef4444; }
        .dot-orange { background-color: #f97316; }
        
        .alert-details h4 { margin: 0 0 0.25rem 0; font-weight: 600; color: #1f2937; }
        .alert-desc { color: #4b5563; font-size: 0.875rem; margin: 0 0 0.5rem 0; }
        .severity-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        
        .action-area { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
      `}</style>

      <div className="header">
        <div>
          {/* RENAMED to Alerts */}
          <h1>Alerts</h1>
          <p>Actionable notifications for compliance violations.</p>
        </div>
        {/* BUTTON REMOVED as per request */}
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="icon-wrapper bg-red"><XCircle size={24} /></div>
          <div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Critical Issues</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{alerts.filter(a => a.severity === 2).length}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-wrapper bg-orange"><AlertTriangle size={24} /></div>
          <div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Warnings</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{alerts.filter(a => a.severity === 1).length}</h3>
          </div>
        </div>
        <div className="summary-card">
          <div className="icon-wrapper bg-green"><CheckCircle size={24} /></div>
          <div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>System Status</p>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{alerts.length > 0 ? "Attention Needed" : "All Clear"}</h3>
          </div>
        </div>
      </div>

      <div className="alerts-card">
        <div className="alerts-header">
          <Bell size={20} color="#2563EB" />
          <h2>Active Alerts</h2>
        </div>
        
        <div className="alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.eventId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="alert-item"
              >
                <div className="alert-content">
                  <div className={`dot ${alert.severity === 2 ? 'dot-red' : 'dot-orange'}`} />
                  <div className="alert-details">
                    <h4>
                       {alert.license ? alert.license.productName : 'Unknown Product'} 
                    </h4>
                    <p className="alert-desc">{alert.details}</p>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      Detected: {new Date(alert.detectedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="action-area">
                  <span className="severity-badge" style={getSeverityStyle(alert.severity)}>
                    {getSeverityLabel(alert.severity)}
                  </span>
                  
                  {alert.type === 0 && (
                    <button 
                      onClick={() => handleRenew(alert.licenseId)} 
                      disabled={processingId === alert.licenseId}
                      className="btn-renew"
                    >
                      {processingId === alert.licenseId ? (
                        <RefreshCw size={14} className="spin" />
                      ) : (
                        <CalendarClock size={14} />
                      )}
                      Renew (+1 Yr)
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ecfdf5', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle size={32} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>All Clear!</h3>
              <p style={{ color: '#6b7280' }}>No active alerts at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;