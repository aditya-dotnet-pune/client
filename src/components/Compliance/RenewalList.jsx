import React, { useState, useEffect } from 'react';
import { RenewalService } from '../../services/api';
import { Plus, Check, X, Clock, FileText, Loader2, Trash2, Lock } from 'lucide-react';

const RenewalList = ({ userRole }) => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState({ 
    softwareName: '', 
    dueDate: '', 
    quoteDetails: '', 
    cost: 0 
  });

  useEffect(() => {
    loadRenewals();
  }, []);

  const loadRenewals = async () => {
    try {
      const response = await RenewalService.getAll();
      setRenewals(response.data);
    } catch (err) {
      setError("Failed to fetch renewal tasks.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (userRole !== 'Finance') {
      alert("Only Finance Managers can approve or reject renewals.");
      return;
    }
    
    try {
      await RenewalService.updateStatus(id, newStatus);
      // Optimistic update or reload
      setRenewals(renewals.map(r => r.renewalId === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await RenewalService.create({
        ...newTask,
        status: 'Pending',
        cost: parseFloat(newTask.cost)
      });
      alert("Task created successfully!");
      setShowModal(false);
      setNewTask({ softwareName: '', dueDate: '', quoteDetails: '', cost: 0 });
      loadRenewals(); // Refresh list
    } catch (err) {
      alert("Failed to create renewal task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this renewal task?")) return;
    try {
      await RenewalService.delete(id);
      setRenewals(renewals.filter(r => r.renewalId !== id));
    } catch(err) {
      alert("Failed to delete task.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return { bg: '#f0fdf4', color: '#16a34a', icon: Check };
      case 'Rejected': return { bg: '#fef2f2', color: '#dc2626', icon: X };
      case 'Quote Req': return { bg: '#fff7ed', color: '#ea580c', icon: FileText };
      default: return { bg: '#eff6ff', color: '#2563EB', icon: Clock }; // Pending
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB'); 
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Renewals...</div>;

  return (
    <div className="renewal-container">
      <style>{`
        .renewal-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .btn-primary { background-color: #2563EB; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; border: none; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .btn-primary:hover { background-color: #1d4ed8; }

        .table-card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; overflow: hidden; }
        .renewal-table { width: 100%; border-collapse: collapse; text-align: left; }
        .renewal-table th { background-color: #f9fafb; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; padding: 1rem; }
        .renewal-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; font-size: 0.875rem; }
        .renewal-table tr:hover { background-color: #f9fafb; }

        .status-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        
        .action-btn { padding: 0.4rem 0.8rem; border-radius: 0.375rem; border: 1px solid; cursor: pointer; font-size: 0.75rem; font-weight: 500; margin-right: 0.5rem; transition: all 0.2s; }
        .btn-approve { background-color: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
        .btn-approve:hover { background-color: #dcfce7; }
        .btn-reject { background-color: #fef2f2; border-color: #fecaca; color: #dc2626; }
        .btn-reject:hover { background-color: #fee2e2; }
        .btn-delete { color: #dc2626; border: none; background: none; cursor: pointer; padding: 0.4rem; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

        /* Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .modal-content { background-color: white; padding: 2rem; border-radius: 0.75rem; width: 100%; max-width: 500px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
        .btn-cancel { background: none; border: 1px solid #e5e7eb; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="header">
        <div>
          <h1>Renewals Management</h1>
          <p>Track renewal tasks, quotes, and approvals.</p>
        </div>
        {/* Hide Create Button for Viewer */}
        {userRole !== 'Viewer' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Renewal Task
          </button>
        )}
      </div>

      <div className="table-card">
        <table className="renewal-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Software Product</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Quote / Notes</th>
              <th>Cost (₹)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renewals.map((item) => {
              const badge = getStatusBadge(item.status);
              const BadgeIcon = badge.icon;
              const isPending = ['Pending', 'Quote Req'].includes(item.status);

              return (
                <tr key={item.renewalId}>
                  <td style={{ fontFamily: 'monospace', color: '#6b7280' }}>
                    {item.renewalId.substring(0, 8)}...
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.softwareName}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: badge.bg, color: badge.color }}>
                      <BadgeIcon size={12} /> {item.status}
                    </span>
                  </td>
                  <td style={{ color: '#4b5563', maxWidth: '200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={item.quoteDetails}>
                    {item.quoteDetails || '-'}
                  </td>
                  <td style={{ fontWeight: 600 }}>₹ {item.cost.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {/* Viewers see Read-Only icon, others see actions */}
                    {userRole === 'Viewer' ? (
                      <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                        <Lock size={14} />
                      </span>
                    ) : (
                      <>
                        {isPending && (
                          <>
                            <button 
                              className={`action-btn btn-approve ${userRole !== 'Finance' ? 'btn-disabled' : ''}`}
                              onClick={() => handleStatusChange(item.renewalId, 'Approved')}
                              disabled={userRole !== 'Finance'}
                              title={userRole !== 'Finance' ? "Only Finance can approve" : "Approve"}
                            >
                              Approve
                            </button>
                            <button 
                              className={`action-btn btn-reject ${userRole !== 'Finance' ? 'btn-disabled' : ''}`}
                              onClick={() => handleStatusChange(item.renewalId, 'Rejected')}
                              disabled={userRole !== 'Finance'}
                              title={userRole !== 'Finance' ? "Only Finance can reject" : "Reject"}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(item.renewalId)} className="btn-delete" title="Delete Task">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {renewals.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>No renewal tasks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0 }}>New Renewal Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label className="form-label">Software Product</label>
                <input 
                  required 
                  className="form-input" 
                  placeholder="e.g. Adobe Creative Cloud"
                  value={newTask.softwareName}
                  onChange={e => setNewTask({...newTask, softwareName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  required 
                  type="date" 
                  className="form-input"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quote / Notes</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Standard renewal quote"
                  value={newTask.quoteDetails}
                  onChange={e => setNewTask({...newTask, quoteDetails: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Cost (₹)</label>
                <input 
                  required 
                  type="number" 
                  className="form-input" 
                  value={newTask.cost}
                  onChange={e => setNewTask({...newTask, cost: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={16} className="spin" /> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenewalList;