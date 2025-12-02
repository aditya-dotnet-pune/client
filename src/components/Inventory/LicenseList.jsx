import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LicenseService } from '../../services/api';
import { Edit, Trash2, Plus, Search, Filter, Upload, Loader2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LicenseList = ({ userRole }) => {
  const [licenses, setLicenses] = useState([]);
  const [filteredLicenses, setFilteredLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    loadLicenses();
  }, []);

  useEffect(() => {
    let result = licenses;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.productName.toLowerCase().includes(lowerTerm) || 
        l.vendor.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterType !== 'All') {
      const typeMap = { 'PerUser': 0, 'PerDevice': 1, 'Concurrent': 2, 'Subscription': 3 };
      if (typeMap[filterType] !== undefined) {
         result = result.filter(l => l.licenseType === typeMap[filterType]);
      }
    }

    setFilteredLicenses(result);
  }, [searchTerm, filterType, licenses]);

  const loadLicenses = async () => {
    try {
      const response = await LicenseService.getAll();
      setLicenses(response.data);
      setFilteredLicenses(response.data);
    } catch (err) {
      setError("Failed to fetch licenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this software?")) {
      try {
        await LicenseService.delete(id);
        const updatedList = licenses.filter(l => l.licenseId !== id);
        setLicenses(updatedList);
        setFilteredLicenses(updatedList); 
      } catch (err) {
        alert("Failed to delete license.");
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await LicenseService.import(formData);
      alert(response.data.message);
      await loadLicenses();
    } catch (err) {
      console.error(err);
      alert("Failed to import CSV.");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB'); 
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Catalog...</div>;
  if (error) return <div style={{ padding: '2rem', color: '#dc2626' }}>{error}</div>;

  return (
    <div className="license-list-container">
      <style>{`
        .license-list-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .header-actions { display: flex; gap: 0.75rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        .btn-base { padding: 0.5rem 1rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; font-weight: 500; cursor: pointer; transition: background-color 0.2s; border: none; font-size: 0.875rem; }
        .add-btn { background-color: #2563EB; color: white; }
        .add-btn:hover { background-color: #1d4ed8; }
        .csv-btn { background-color: white; color: #374151; border: 1px solid #d1d5db; }
        .csv-btn:hover { background-color: #f9fafb; }
        .csv-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .toolbar { display: flex; gap: 1rem; margin-bottom: 1.5rem; background-color: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid #f3f4f6; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
        .search-box { flex: 1; position: relative; }
        .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .search-input { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; font-size: 0.875rem; box-sizing: border-box; }
        .search-input:focus { border-color: #2563EB; box-shadow: 0 0 0 1px #2563EB; }
        .filter-box { position: relative; min-width: 200px; }
        .filter-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .filter-select { width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.25rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; font-size: 0.875rem; background-color: white; cursor: pointer; box-sizing: border-box; }
        .table-container { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; overflow: hidden; }
        .license-table { width: 100%; border-collapse: collapse; text-align: left; }
        .license-table th { background-color: #f9fafb; color: #6b7280; font-size: 0.875rem; font-weight: 500; padding: 1rem 1.5rem; }
        .license-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f3f4f6; color: #1f2937; }
        .license-table tr:hover { background-color: #f9fafb; }
        .badge { padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 500; border-radius: 9999px; background-color: #eff6ff; color: #2563EB; }
        .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .action-btn { padding: 0.5rem; color: #9ca3af; border-radius: 0.5rem; background: none; border: none; cursor: pointer; display: flex; align-items: center; }
        .action-btn:hover { background-color: #f3f4f6; color: #2563EB; }
        .action-btn.delete:hover { color: #dc2626; background-color: #fef2f2; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div className="header">
        <div>
          <h1>Software Catalog</h1>
          <p>Manage your software assets, costs, and entitlements.</p>
        </div>
        
        {/* Hide Actions for Viewer */}
        {userRole !== 'Viewer' && (
          <div className="header-actions">
            <label className="btn-base csv-btn">
              {uploading ? <Loader2 size={18} className="spin" /> : <Upload size={18} />}
              {uploading ? " Importing..." : " Import CSV"}
              <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
            </label>
            <Link to="/inventory/new" className="btn-base add-btn">
              <Plus size={18} /> Add Software
            </Link>
          </div>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Product or Vendor..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="filter-icon" />
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All License Types</option>
            <option value="PerUser">Per User</option>
            <option value="PerDevice">Per Device</option>
            <option value="Concurrent">Concurrent</option>
            <option value="Subscription">Subscription</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="license-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Vendor</th>
              <th>Type</th>
              <th>Entitlements</th>
              <th>Cost</th>
              <th>Purchase Date</th>
              <th>Expiry</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLicenses.map((license, index) => (
              <motion.tr 
                key={license.licenseId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <td style={{ fontWeight: 500 }}>{license.productName}</td>
                <td style={{ color: '#4b5563' }}>{license.vendor}</td>
                <td>
                  <span className="badge">
                    {['PerUser', 'PerDevice', 'Concurrent', 'Subscription'][license.licenseType]}
                  </span>
                </td>
                <td style={{ color: '#4b5563' }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{license.assignedLicenses}</span> 
                  <span style={{ color: '#9ca3af', margin: '0 0.25rem' }}>/</span> 
                  {license.totalEntitlements}
                </td>
                <td style={{ fontWeight: 600 }}>
                  ₹ {license.cost?.toLocaleString('en-IN') || 0}
                </td>
                <td style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {formatDate(license.purchaseDate)}
                </td>
                <td style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  {formatDate(license.expiryDate)}
                </td>
                <td>
                  <div className="actions">
                    {userRole !== 'Viewer' ? (
                      <>
                        <Link to={`/inventory/edit/${license.licenseId}`} className="action-btn">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => handleDelete(license.licenseId)} className="action-btn delete">
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      // Read-only link to view details
                      <Link to={`/inventory/edit/${license.licenseId}`} className="action-btn" title="View Details">
                        <Lock size={16} />
                      </Link>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {filteredLicenses.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  {searchTerm || filterType !== 'All' ? 'No matching software found.' : 'No software found. Add one to get started.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicenseList;