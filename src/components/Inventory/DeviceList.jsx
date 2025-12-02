import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeviceService } from '../../services/api';
import { Plus, Laptop, User, Trash2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const DeviceList = ({ userRole }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await DeviceService.getAll();
      setDevices(response.data);
    } catch (error) {
      console.error("Failed to load devices", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, hostname) => {
    if (window.confirm(`Are you sure you want to delete device "${hostname}"?`)) {
      try {
        await DeviceService.delete(id);
        setDevices(devices.filter(d => d.deviceId !== id));
      } catch (error) {
        alert("Failed to delete device.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB'); 
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading Devices...</div>;

  return (
    <div className="device-list-container">
      <style>{`
        .device-list-container { padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .header h1 { font-size: 1.875rem; font-weight: 700; color: #1f2937; margin: 0; }
        .header p { color: #6b7280; margin-top: 0.25rem; }
        
        .add-btn { background-color: #2563EB; color: white; padding: 0.5rem 1rem; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem; text-decoration: none; transition: background-color 0.2s; }
        .add-btn:hover { background-color: #1d4ed8; }
        
        .device-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
        @media (min-width: 768px) { .device-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .device-grid { grid-template-columns: repeat(3, 1fr); } }
        
        .device-card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6; padding: 1.5rem; transition: box-shadow 0.2s; position: relative; }
        .device-card:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .icon-box { padding: 0.75rem; background-color: #eff6ff; color: #2563EB; border-radius: 0.5rem; }
       
        
        .device-name { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem 0; }
        .device-user { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem; }
        
        .software-section { border-top: 1px solid #f3f4f6; padding-top: 1rem; }
        .software-title { font-size: 0.75rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem 0; }
        .software-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .software-item { display: flex; justify-content: space-between; font-size: 0.875rem; }
        .sw-name { color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%; }
        .sw-version { color: #9ca3af; font-size: 0.75rem; }
        .more-text { font-size: 0.75rem; color: #2563EB; font-weight: 500; }
        .empty-text { font-size: 0.75rem; color: #9ca3af; font-style: italic; }
        
        .card-actions { display: flex; gap: 0.5rem; margin-top: 1.5rem; }
        .manage-link { flex: 1; text-align: center; padding: 0.5rem; font-size: 0.875rem; font-weight: 500; color: #2563EB; background-color: #eff6ff; border-radius: 0.5rem; text-decoration: none; transition: background-color 0.2s; }
        .manage-link:hover { background-color: #dbeafe; }
        .delete-btn { padding: 0.5rem; color: #ef4444; background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .delete-btn:hover { background-color: #fee2e2; }
      `}</style>

      <div className="header">
        <div>
          <h1>Device Inventory</h1>
          <p>Manage hardware assets and installed software.</p>
        </div>
        {/* Hide Add Button for Viewer */}
        {userRole !== 'Viewer' && (
          <Link to="/inventory/devices/new" className="add-btn">
            <Plus size={20} /> Onboard Device
          </Link>
        )}
      </div>

      <div className="device-grid">
        {devices.map((device, index) => (
          <motion.div
            key={device.deviceId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="device-card"
          >
            <div className="card-header">
              <div className="icon-box">
                <Laptop size={24} />
              </div>
             
            </div>
            
            <h3 className="device-name">{device.hostname}</h3>
            <div className="device-user">
              <User size={14} />
              {device.ownerUserId || "Unassigned"}
            </div>

            <div className="software-section">
              <p className="software-title">
                Installed Software ({device.installedSoftware?.length || 0})
              </p>
              <div className="software-list">
                {device.installedSoftware && device.installedSoftware.slice(0, 3).map((sw, i) => (
                  <div key={i} className="software-item">
                    <span className="sw-name">{sw.productName}</span>
                    <span className="sw-version">{sw.version}</span>
                  </div>
                ))}
                {(device.installedSoftware?.length || 0) > 3 && (
                  <p className="more-text">
                    + {device.installedSoftware.length - 3} more apps...
                  </p>
                )}
                {(device.installedSoftware?.length || 0) === 0 && (
                  <p className="empty-text">No software detected</p>
                )}
              </div>
            </div>

            <div className="card-actions">
              <Link to={`/inventory/devices/edit/${device.deviceId}`} className="manage-link">
                {userRole === 'Viewer' ? <span style={{display: 'flex', alignItems: 'center', justifyContent:'center', gap:'0.5rem'}}><Lock size={12}/> View Details</span> : 'Manage / Install Software'}
              </Link>
              
              {/* Hide Delete for Viewer */}
              {userRole !== 'Viewer' && (
                <button 
                  onClick={() => handleDelete(device.deviceId, device.hostname)} 
                  className="delete-btn"
                  title="Delete Device"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;