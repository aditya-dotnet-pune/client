import React, { useEffect, useState } from 'react';
import { ReportService } from '../../services/api';
import { ClipboardList, Clock, User, Download, Lock } from 'lucide-react';

const AuditLogViewer = ({ userRole }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await ReportService.getLogs();
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (userRole === 'Viewer') return; // Double check protection
    if (logs.length === 0) {
      alert("No logs to export.");
      return;
    }

    const headers = ["Log ID", "Action", "Entity Name", "Entity ID", "Performed By", "Timestamp", "Details"];
    
    const rows = logs.map(log => {
      const details = log.changes ? log.changes.replace(/"/g, '""') : "";
      
      return [
        `"${log.logId}"`,
        `"${log.action}"`,
        `"${log.entityName}"`,
        `"${log.entityId}"`,
        `"${log.performedByUserId}"`,
        `"${new Date(log.timestamp).toLocaleString('en-GB')}"`, 
        `"${details}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action) => {
    if (action.includes('Create')) return '#16a34a'; // Green
    if (action.includes('Delete')) return '#dc2626'; // Red
    if (action.includes('Renew')) return '#2563EB'; // Blue
    return '#4b5563'; // Gray
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GB'); // dd/mm/yyyy, hh:mm:ss
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Audit Trail...</div>;

  return (
    <div className="audit-container">
      <style>{`
        .audit-container { padding: 2rem; }
        .header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .header-content h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 0.75rem; }
        .header-content p { color: #6b7280; margin-top: 0.25rem; margin-left: 2.75rem; }
        
        .btn-export { background-color: white; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .btn-export:hover { background-color: #f9fafb; }

        .timeline { border-left: 2px solid #e5e7eb; margin-left: 1rem; padding-left: 2rem; }
        .log-item { position: relative; margin-bottom: 2rem; }
        .log-dot { position: absolute; left: -2.6rem; top: 0.25rem; width: 1rem; height: 1rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #e5e7eb; }
        .log-card { background-color: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #f3f4f6; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .log-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .action-badge { font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .log-time { color: #9ca3af; font-size: 0.875rem; display: flex; align-items: center; gap: 0.25rem; }
        .log-details { color: #374151; margin: 0.5rem 0; }
        .log-meta { font-size: 0.75rem; color: #9ca3af; display: flex; gap: 1rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f9fafb; }
        .meta-item { display: flex; align-items: center; gap: 0.25rem; }
      `}</style>

      <div className="header">
        <div className="header-content">
          <h1><ClipboardList size={32} color="#2563EB" /> System Audit Log</h1>
          <p>Immutable record of all system activities and changes.</p>
        </div>
        
        {/* Only show Export if NOT Viewer */}
        {userRole !== 'Viewer' ? (
          <button className="btn-export" onClick={handleExportCSV}>
            <Download size={18} /> Export Log
          </button>
        ) : (
          <span style={{ fontSize: '0.875rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> Export Disabled
          </span>
        )}
      </div>

      <div className="timeline">
        {logs.map((log) => (
          <div key={log.logId} className="log-item">
            <div className="log-dot" style={{ backgroundColor: getActionColor(log.action) }}></div>
            <div className="log-card">
              <div className="log-header">
                <span className="action-badge" style={{ color: getActionColor(log.action) }}>{log.action}</span>
                <span className="log-time">
                  <Clock size={14} />
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
              
              <p className="log-details">{log.changes || "No details provided"}</p>
              
              <div className="log-meta">
                <div className="meta-item">
                  <User size={14} /> Performed by: {log.performedByUserId}
                </div>
                <div className="meta-item">
                  Target: {log.entityName} ({log.entityId.substring(0, 8)}...)
                </div>
              </div>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>No activity recorded yet. Create or update licenses to generate logs.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;