import React, { useEffect, useState } from 'react';
import { ReportService, LicenseService } from '../../services/api';
import { DollarSign, PieChart, Zap, CheckCircle, RefreshCcw, Lock, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const CostDashboard = ({ userRole }) => {
  const [deptStats, setDeptStats] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter State
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Allocated', 'Unallocated'

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  const [splitData, setSplitData] = useState({ hr: 0, sales: 0, engineering: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOpenModal = (licenseId = '') => {
    setSelectedLicenseId(licenseId);
    setSplitData({ hr: 0, sales: 0, engineering: 0 }); // Reset splits
    setShowModal(true);
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    const total = parseInt(splitData.hr) + parseInt(splitData.sales) + parseInt(splitData.engineering);
    
    if (total !== 100) {
      alert(`Percentages must equal 100%. Current total: ${total}%`);
      return;
    }
    if (!selectedLicenseId) {
      alert("Please select a license.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ReportService.allocateByRule({
        licenseId: selectedLicenseId,
        hr: parseInt(splitData.hr),
        sales: parseInt(splitData.sales),
        engineering: parseInt(splitData.engineering)
      });
      alert("Cost mapped successfully!");
      setShowModal(false);
      loadData();
    } catch (error) {
      alert("Failed to allocate cost. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (allocations.length === 0) {
      alert("No allocation data to export.");
      return;
    }

    const headers = ["License Product", "Department", "Allocated Cost", "Currency", "Allocation Date"];
    
    const rows = allocations.map(alloc => {
      const licenseName = alloc.license ? alloc.license.productName : "Unknown";
      const date = new Date(alloc.periodStart).toLocaleDateString('en-GB');
      
      // Escape strings to prevent CSV breakage
      return [
        `"${licenseName}"`,
        `"${alloc.departmentId}"`,
        alloc.allocatedAmount,
        `"${alloc.currency || 'INR'}"`,
        date
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Cost_Allocation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const isAllocated = (licenseId) => {
    return allocations.some(a => a.licenseId === licenseId);
  };

  const totalAllocated = deptStats.reduce((sum, d) => sum + d.totalAllocated, 0);

  // Filter Logic
  const filteredLicenses = licenses.filter(license => {
    const allocated = isAllocated(license.licenseId);
    if (filterStatus === 'Allocated') return allocated;
    if (filterStatus === 'Unallocated') return !allocated;
    return true;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Finance Workbench...</div>;

  return (
    <div className="cost-container">
      <style>{`
        .cost-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .grid-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        @media (min-width: 1024px) { .grid-layout { grid-template-columns: 3fr 2fr; } }

        .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; padding: 1.5rem; margin-bottom: 1.5rem; overflow: hidden; }
        
        .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .card-title { font-size: 1.125rem; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 0.5rem; margin: 0; }

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
          appearance: none;
          min-width: 140px;
        }
        .filter-select:focus { border-color: #2563EB; }

        /* Chart Styles */
        .chart-container { display: flex; flex-direction: column; gap: 1rem; }
        .dept-bar { display: flex; align-items: center; gap: 1rem; }
        .dept-label { width: 100px; font-weight: 500; color: #4b5563; font-size: 0.875rem; }
        .bar-bg { flex: 1; height: 32px; background-color: #f3f4f6; border-radius: 6px; overflow: hidden; position: relative; }
        .bar-fill { height: 100%; transition: width 0.8s ease-out; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem; font-size: 0.75rem; color: white; font-weight: 600; }
        .dept-value { width: 120px; text-align: right; font-weight: 700; color: #1f2937; }

        /* Table Styles */
        .license-table { width: 100%; border-collapse: collapse; text-align: left; }
        .license-table th { background-color: #f9fafb; color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; padding: 1rem; }
        .license-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
        .license-table tr:hover { background-color: #f9fafb; }
        
        .btn-primary {
          background-color: #2563EB;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-primary:hover { background-color: #1d4ed8; }

        .btn-auto {
          background-color: #eff6ff;
          color: #2563EB;
          border: 1px solid #dbeafe;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-auto:hover { background-color: #dbeafe; }

        .status-done {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #16a34a;
          font-size: 0.875rem;
          font-weight: 500;
          background-color: #f0fdf4;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          width: fit-content;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 50;
        }
        .modal-content {
          background-color: white; padding: 2rem; border-radius: 0.75rem;
          width: 100%; max-width: 500px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .form-group { margin-bottom: 1rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
        .form-input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
        .slider-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .slider-label { width: 100px; font-size: 0.875rem; font-weight: 500; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="header">
        <div>
          <h1>Cost Mapping</h1>
          
        </div>
        
        {/* Export Button - Visible for Finance */}
        {userRole === 'Finance' && (
          <button className="btn-auto" onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginTop: 0, fontSize: '1.25rem' }}>Map License Cost</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Define the percentage split for the selected license.
            </p>
            
            <form onSubmit={handleSubmitRule}>
              <div className="form-group">
                <label className="form-label">Software License</label>
                <select 
                  className="form-input"
                  value={selectedLicenseId}
                  onChange={(e) => setSelectedLicenseId(e.target.value)}
                  required
                  disabled={true} 
                >
                  <option value="">-- Select License --</option>
                  {licenses.map(l => (
                    <option key={l.licenseId} value={l.licenseId}>{l.productName} (₹{l.cost})</option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <div className="slider-row">
                  <span className="slider-label">Engineering</span>
                  <input 
                    type="number" min="0" max="100" className="form-input" 
                    value={splitData.engineering}
                    onChange={(e) => setSplitData({...splitData, engineering: e.target.value})}
                  />
                  <span>%</span>
                </div>
                <div className="slider-row">
                  <span className="slider-label">Sales</span>
                  <input 
                    type="number" min="0" max="100" className="form-input" 
                    value={splitData.sales}
                    onChange={(e) => setSplitData({...splitData, sales: e.target.value})}
                  />
                  <span>%</span>
                </div>
                <div className="slider-row">
                  <span className="slider-label">HR</span>
                  <input 
                    type="number" min="0" max="100" className="form-input" 
                    value={splitData.hr}
                    onChange={(e) => setSplitData({...splitData, hr: e.target.value})}
                  />
                  <span>%</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: (parseInt(splitData.hr||0) + parseInt(splitData.sales||0) + parseInt(splitData.engineering||0)) === 100 ? '#16a34a' : '#dc2626' }}>
                  Total: {parseInt(splitData.hr||0) + parseInt(splitData.sales||0) + parseInt(splitData.engineering||0)}%
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-auto" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Apply Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid-layout">
        {/* Left: License List & Actions */}
        <div className="card">
          <div className="card-header-flex">
            <h2 className="card-title">Allocated Costs</h2>
            
            {/* Filter Dropdown */}
            <div className="filter-wrapper">
              <Filter size={16} className="filter-icon" />
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Allocated">Allocated</option>
                <option value="Unallocated">Unallocated</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="license-table">
              <thead>
                <tr>
                  <th>Software Product</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.length > 0 ? (
                  filteredLicenses.map((license) => {
                    const allocated = isAllocated(license.licenseId);
                    return (
                      <tr key={license.licenseId}>
                        <td style={{ fontWeight: 500 }}>{license.productName}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(license.cost)}</td>
                        <td>
                          {allocated ? (
                            <span className="status-done">
                              <CheckCircle size={14} /> Allocated
                            </span>
                          ) : (
                            <span style={{ color: '#ea580c', fontSize: '0.875rem', backgroundColor:'#fff7ed', padding:'0.25rem 0.75rem', borderRadius:'9999px' }}>
                              Unallocated
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {userRole === 'Finance' ? (
                            <button 
                              className="btn-auto" 
                              style={{ marginLeft: 'auto', backgroundColor: 'transparent', border: '1px solid #e5e7eb', color: '#6b7280' }}
                              onClick={() => handleOpenModal(license.licenseId)}
                            >
                              <RefreshCcw size={14} /> {allocated ? 'Re-Map' : 'Map Cost'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                              <Lock size={12} /> Read-only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No {filterStatus.toLowerCase()} items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.5rem' }}><PieChart size={20} color="#2563EB" /> Departmental Spend</h2>
          
          {deptStats.length > 0 ? (
            <div className="chart-container">
              {deptStats.map((stat, i) => {
                const percentage = totalAllocated > 0 ? (stat.totalAllocated / totalAllocated) * 100 : 0;
                // Assign colors based on department
                let color = '#2563EB'; // Default Blue
                if (stat.department === 'HR') color = '#ec4899'; // Pink
                if (stat.department === 'Sales') color = '#f59e0b'; // Amber
                if (stat.department === 'Engineering') color = '#10b981'; // Green

                return (
                  <div key={i} className="dept-bar">
                    <div className="dept-label">{stat.department}</div>
                    <div className="bar-bg">
                      <motion.div 
                        className="bar-fill" 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        style={{ backgroundColor: color }}
                      >
                        {percentage > 15 && `${Math.round(percentage)}%`}
                      </motion.div>
                    </div>
                    <div className="dept-value">{formatCurrency(stat.totalAllocated)}</div>
                  </div>
                );
              })}
              
              <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#374151' }}>
                <span>Total Mapped Spend</span>
                <span>{formatCurrency(totalAllocated)}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p>No costs mapped yet.</p>
              <p style={{ fontSize: '0.875rem' }}>
                {userRole === 'Finance' 
                  ? 'Use the "Map Cost" buttons to map software costs.' 
                  : 'Waiting for Finance to map costs.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;