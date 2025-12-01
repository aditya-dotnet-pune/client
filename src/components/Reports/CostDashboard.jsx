import React, { useEffect, useState } from 'react';
import { ReportService, LicenseService } from '../../services/api';
import { DollarSign, PieChart, Plus } from 'lucide-react';

const CostDashboard = () => {
  const [deptStats, setDeptStats] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [newAlloc, setNewAlloc] = useState({
    licenseId: '',
    departmentId: '',
    allocatedAmount: 0,
    allocationMethod: 0, // Fixed
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, allocRes, licRes] = await Promise.all([
        ReportService.getByDepartment(),
        ReportService.getAllocations(),
        LicenseService.getAll()
      ]);
      setDeptStats(statsRes.data);
      setAllocations(allocRes.data);
      setLicenses(licRes.data);
    } catch (error) {
      console.error("Failed to load cost data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ReportService.createAllocation(newAlloc);
      setShowForm(false);
      loadData(); // Refresh
      alert("Cost allocated successfully!");
    } catch (error) {
      alert("Failed to allocate cost.");
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Finance Data...</div>;

  // Calculate max value for bar chart scaling
  const maxCost = Math.max(...deptStats.map(d => d.totalAllocated), 1);

  return (
    <div className="cost-container">
      <style>{`
        .cost-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .btn-primary {
          background-color: #2563EB;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .btn-primary:hover { background-color: #1d4ed8; }

        .grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .grid-layout { grid-template-columns: 2fr 1fr; }
        }

        .card {
          background-color: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .card-title { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }

        /* Simple CSS Bar Chart */
        .chart-row { display: flex; align-items: center; margin-bottom: 1rem; }
        .chart-label { width: 120px; font-size: 0.875rem; font-weight: 500; color: #374151; }
        .chart-bar-bg { flex: 1; height: 24px; background-color: #f3f4f6; border-radius: 4px; margin: 0 1rem; position: relative; }
        .chart-bar-fill { height: 100%; background-color: #2563EB; border-radius: 4px; transition: width 0.5s ease; }
        .chart-value { width: 80px; text-align: right; font-weight: 600; color: #1f2937; font-size: 0.875rem; }

        .form-modal {
          background-color: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 2rem;
        }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; }
        .form-input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }
        
        .alloc-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .alloc-table th { text-align: left; padding: 0.75rem; background-color: #f9fafb; color: #6b7280; font-weight: 500; }
        .alloc-table td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
      `}</style>

      <div className="header">
        <div>
          <h1>Cost Allocation</h1>
          <p>Finance view: Cost breakdown by Department.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} /> New Allocation
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <h3 style={{ marginTop: 0 }}>Allocate License Cost</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Select License</label>
              <select 
                required 
                className="form-input"
                value={newAlloc.licenseId}
                onChange={e => setNewAlloc({...newAlloc, licenseId: e.target.value})}
              >
                <option value="">-- Choose License --</option>
                {licenses.map(l => (
                  <option key={l.licenseId} value={l.licenseId}>{l.productName} (${l.cost})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Department Name</label>
              <input 
                required
                placeholder="e.g. Engineering, HR, Sales"
                className="form-input"
                value={newAlloc.departmentId}
                onChange={e => setNewAlloc({...newAlloc, departmentId: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Amount to Allocate ($)</label>
              <input 
                required type="number"
                className="form-input"
                value={newAlloc.allocatedAmount}
                onChange={e => setNewAlloc({...newAlloc, allocatedAmount: parseFloat(e.target.value)})}
              />
            </div>
            <button type="submit" className="btn-primary">Save Allocation</button>
          </form>
        </div>
      )}

      <div className="grid-layout">
        <div className="card">
          <h2 className="card-title"><PieChart size={20} color="#2563EB" /> Cost by Department</h2>
          
          {deptStats.length > 0 ? (
            deptStats.map((stat, i) => (
              <div key={i} className="chart-row">
                <div className="chart-label">{stat.department}</div>
                <div className="chart-bar-bg">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stat.totalAllocated / maxCost) * 100}%` }}
                  />
                </div>
                <div className="chart-value">${stat.totalAllocated.toLocaleString()}</div>
              </div>
            ))
          ) : (
            <p style={{ color: '#9ca3af', textAlign: 'center' }}>No allocations recorded yet.</p>
          )}
        </div>

        <div className="card">
          <h2 className="card-title"><DollarSign size={20} color="#2563EB" /> Recent Allocations</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="alloc-table">
              <thead>
                <tr>
                  <th>Dept</th>
                  <th>License</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map(a => (
                  <tr key={a.allocationId}>
                    <td>{a.departmentId}</td>
                    <td>{a.license ? a.license.productName : 'Unknown'}</td>
                    <td style={{ fontWeight: 600 }}>${a.allocatedAmount}</td>
                  </tr>
                ))}
                {allocations.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#9ca3af' }}>Empty</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;