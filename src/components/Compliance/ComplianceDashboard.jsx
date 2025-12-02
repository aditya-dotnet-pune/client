import React, { useState, useEffect } from 'react';
import { ComplianceService, LicenseService, RenewalService } from '../../services/api'; 
import { ShieldAlert, RefreshCw, AlertTriangle, XCircle, CalendarClock, Bell, UserMinus, Info, Filter, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ComplianceDashboard = ({ userRole }) => {
  const [alerts, setAlerts] = useState([]);
  const [activeRenewals, setActiveRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); 
  
  // Filter State
  const [filterSeverity, setFilterSeverity] = useState('All');

  useEffect(() => {
    loadData();

    // Poll every 5 seconds to check for Finance decisions (Approved/Rejected)
    const intervalId = setInterval(() => {
      loadData(true); // Silent refresh
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [alertsRes, renewalsRes] = await Promise.all([
        ComplianceService.getAlerts(),
        RenewalService.getAll()
      ]);
      setAlerts(alertsRes.data);
      setActiveRenewals(renewalsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleRenewRequest = async (alertItem) => {
    if(!window.confirm(`Submit renewal request for ${alertItem.license?.productName}?`)) return;
    
    setProcessingId(alertItem.licenseId);
    try {
      // Create a Renewal Task linked to License
      const newRenewal = {
        licenseId: alertItem.licenseId, 
        softwareName: alertItem.license?.productName || 'Unknown Software',
        dueDate: alertItem.license?.expiryDate || new Date().toISOString(),
        quoteDetails: "Initiated from Compliance Alert",
        cost: alertItem.license?.cost || 0,
        status: "Pending"
      };

      await RenewalService.create(newRenewal);

      // Update local state to show "Pending" immediately
      setActiveRenewals(prev => [...prev, newRenewal]);
      
      alert("Renewal request sent to Finance successfully!");
      // Force immediate reload to ensure sync
      loadData(true);
    } catch (error) {
      console.error(error);
      alert("Failed to send renewal request.");
    } finally {
      setProcessingId(null);
    }
  };

  const getRenewalStatus = (licenseId) => {
    // Filter renewals for this license
    const relevantRenewals = activeRenewals.filter(r => r.licenseId === licenseId);
    
    // If no renewals, show button
    if (relevantRenewals.length === 0) return 'NONE';

    // Check if ANY active/pending renewal exists
    const hasPending = relevantRenewals.some(r => r.status === 'Pending' || r.status === 'Quote Req');
    
    if (hasPending) return 'PENDING';
    
    // If all existing renewals are Rejected (and none pending), we allow a new request
    const allRejected = relevantRenewals.every(r => r.status === 'Rejected');
    if (allRejected) return 'REJECTED'; 

    return 'NONE';
  };

  // Logic for Severity/Type Display
  const getSeverityLabel = (alert) => {
    // 0 = Expiry, 1 = OverUse, 2 = Unused
    if (alert.type === 1) return 'Over Usage';
    if (alert.type === 2) return 'Unused';
    
    switch (alert.severity) {
      case 2: return 'High (Critical)';
      case 1: return 'Medium (Warning)';
      case 0: return 'Low (Notice)';
      default: return 'Expiry';
    }
  };

  const getSeverityStyle = (alert) => {
    if (alert.severity === 2) return { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }; // High
    if (alert.severity === 1) return { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }; // Medium
    return { backgroundColor: '#eff6ff', color: '#2563EB', border: '1px solid #dbeafe' }; // Low/Default
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB'); 
  };

  const getAlertIcon = (type, severity) => {
    if (type === 2) return <UserMinus size={20} className="text-blue-500" />; // Unused
    if (type === 1) return <ShieldAlert size={20} className="text-red-600" />; // Overuse
    
    if (severity === 2) return <XCircle size={20} className="text-red-600" />;
    if (severity === 1) return <AlertTriangle size={20} className="text-orange-500" />;
    return <Info size={20} className="text-blue-500" />;
  };

  // Filter Logic
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'All') return true;
    if (filterSeverity === 'High') return alert.severity === 2;
    if (filterSeverity === 'Medium') return alert.severity === 1;
    if (filterSeverity === 'Low') return alert.severity === 0;
    return true;
  });

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
        
        .status-sent { color: #ea580c; font-size: 0.75rem; font-weight: 600; font-style: italic; background-color: #fff7ed; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid #fed7aa; display: flex; align-items: center; gap: 0.25rem; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Grid columns to 2 */
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } }

        .summary-card { background-color: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #f3f4f6; display: flex; align-items: center; gap: 1rem; }
        .icon-wrapper { padding: 0.75rem; border-radius: 9999px; }
        .bg-red { background-color: #fef2f2; color: #dc2626; }
        .bg-orange { background-color: #fff7ed; color: #ea580c; }

        .alerts-card { background-color: white; border-radius: 0.75rem; border: 1px solid #f3f4f6; overflow: hidden; }
        .alerts-header { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
        .header-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #1f2937; }
        
        .alert-item { padding: 1.5rem; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; align-items: flex-start; }
        .alert-content { display: flex; gap: 1rem; }
        
        .alert-details h4 { margin: 0 0 0.25rem 0; font-weight: 600; color: #1f2937; }
        .alert-desc { color: #4b5563; font-size: 0.875rem; margin: 0 0 0.5rem 0; }
        .severity-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        
        .action-area { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }

        /* Filter Styles */
        .filter-wrapper { position: relative; }
        .filter-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #6b7280; pointer-events: none; }
        .filter-select {
          padding: 0.5rem 1rem 0.5rem 2.25rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          outline: none;
          background-color: white;
          cursor: pointer;
          min-width: 160px;
        }
        .filter-select:focus { border-color: #2563EB; }
      `}</style>

      <div className="header">
        <div>
          <h1>Alerts</h1>
          <p>Actionable notifications for compliance violations and optimizations.</p>
        </div>
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
      </div>

      <div className="alerts-card">
        <div className="alerts-header">
          <div className="header-title">
            <Bell size={20} color="#2563EB" />
            <h2>Active Alerts</h2>
          </div>
          
          {/* Filter Dropdown */}
          <div className="filter-wrapper">
            <Filter size={16} className="filter-icon" />
            <select 
              className="filter-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="High">High (Critical)</option>
              <option value="Medium">Medium (Warning)</option>
              <option value="Low">Low (Notice)</option>
            </select>
          </div>
        </div>
        
        <div className="alerts-list">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert, index) => {
              const renewalStatus = getRenewalStatus(alert.licenseId);
              
              return (
                <motion.div
                  key={alert.eventId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="alert-item"
                >
                  <div className="alert-content">
                    <div className="alert-icon">
                      {getAlertIcon(alert.type, alert.severity)}
                    </div>
                    <div className="alert-details">
                      <h4>
                         {alert.license ? alert.license.productName : 'Unknown Product'} 
                         {alert.type === 2 && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color:'#2563EB', backgroundColor:'#eff6ff', padding:'2px 6px', borderRadius:'4px' }}>Reclaimable</span>}
                      </h4>
                      <p className="alert-desc">{alert.details}</p>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Detected: {formatDate(alert.detectedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="action-area">
                    <span className="severity-badge" style={getSeverityStyle(alert)}>
                      {getSeverityLabel(alert)}
                    </span>
                    
                    {/* Expiry Alert Actions - Show Lock for Viewer */}
                    {alert.type === 0 && (
                      userRole === 'Viewer' ? (
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                          <Lock size={12} /> Read-only
                        </span>
                      ) : (
                        renewalStatus === 'PENDING' ? (
                          <span className="status-sent">
                            <RefreshCw size={12} className="spin" /> Pending Approval
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleRenewRequest(alert)} 
                            disabled={processingId === alert.licenseId}
                            className="btn-renew"
                          >
                            {processingId === alert.licenseId ? (
                              <RefreshCw size={14} className="spin" />
                            ) : (
                              <CalendarClock size={14} />
                            )}
                            {renewalStatus === 'REJECTED' ? 'Retry Renewal' : 'Request Renewal'}
                          </button>
                        )
                      )
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#ecfdf5', width: '4rem', height: '4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <ShieldAlert size={32} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500 }}>All Clear!</h3>
              <p style={{ color: '#6b7280' }}>
                {filterSeverity === 'All' ? 'No active alerts.' : `No ${filterSeverity} priority alerts.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;