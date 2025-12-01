import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DeviceService } from '../../services/api';
import { Save, ArrowLeft, DownloadCloud, Monitor, Trash2, Edit2, X } from 'lucide-react';

const DeviceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Device State
  const [deviceData, setDeviceData] = useState({
    deviceId: '',
    hostname: '',
    ownerUserId: ''
  });

  // Installation Form State
  const [installData, setInstallData] = useState({
    installationId: null, // Track if editing specific row
    productName: '',
    version: '1.0'
  });
  const [isEditingInstall, setIsEditingInstall] = useState(false);

  const [loading, setLoading] = useState(false);
  const [existingInstallations, setExistingInstallations] = useState([]);

  useEffect(() => {
    if (isEditing) {
      loadDevice();
    }
  }, [id]);

  const loadDevice = async () => {
    try {
      const response = await DeviceService.getById(id);
      const device = response.data;
      if (device) {
        setDeviceData({ 
          deviceId: device.deviceId,
          hostname: device.hostname, 
          ownerUserId: device.ownerUserId 
        });
        setExistingInstallations(device.installedSoftware || []);
      }
    } catch (error) {
      console.error("Failed to load device", error);
    }
  };

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isEditing) {
        const res = await DeviceService.onboard(deviceData);
        navigate(`/inventory/devices/edit/${res.data.deviceId}`);
      } else {
        await DeviceService.update(id, deviceData);
        alert("Device details updated successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save device");
    } finally {
      setLoading(false);
    }
  };

  // --- Software Management Logic ---

  const handleInstallSubmit = async (e) => {
    e.preventDefault();
    if (!installData.productName) return;

    try {
      if (isEditingInstall) {
        // UPDATE existing installation
        await DeviceService.updateInstallation(installData.installationId, {
          installationId: installData.installationId,
          deviceId: id,
          productName: installData.productName,
          version: installData.version,
          installDate: new Date() // Updates timestamp, optional
        });
        alert("Software updated successfully!");
        setIsEditingInstall(false);
      } else {
        // CREATE new installation
        await DeviceService.installSoftware({
          deviceId: id,
          productName: installData.productName,
          version: installData.version
        });
        alert("Software installed successfully!");
      }

      // Reset form and reload list
      setInstallData({ installationId: null, productName: '', version: '1.0' });
      loadDevice(); // Refresh the list from backend
    } catch (error) {
      alert("Failed to save software record");
    }
  };

  const handleEditClick = (sw) => {
    setInstallData({
      installationId: sw.installationId,
      productName: sw.productName,
      version: sw.version
    });
    setIsEditingInstall(true);
  };

  const handleCancelEdit = () => {
    setInstallData({ installationId: null, productName: '', version: '1.0' });
    setIsEditingInstall(false);
  };

  const handleDeleteClick = async (installationId, productName) => {
    if(!window.confirm(`Are you sure you want to remove "${productName}" from this device?`)) return;

    try {
      await DeviceService.deleteInstallation(installationId);
      // Remove from local state immediately
      setExistingInstallations(prev => prev.filter(i => i.installationId !== installationId));
    } catch (error) {
      alert("Failed to delete software.");
    }
  };

  return (
    <div className="device-form-container">
      <style>{`
        .device-form-container {
          padding: 2rem;
          max-width: 64rem;
          margin: 0 auto;
          font-family: 'Inter', sans-serif;
        }

        .header-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .back-button {
          padding: 0.5rem;
          border-radius: 9999px;
          color: #4b5563;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .back-button:hover { background-color: #f3f4f6; }

        .title-group h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        .title-group p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0.25rem 0 0 0;
        }

        .grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 1024px) {
          .grid-layout { grid-template-columns: 1fr 1fr; }
        }

        .card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          margin-bottom: 1.5rem;
        }
        .card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group { margin-bottom: 1rem; }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .form-input {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
          box-sizing: border-box;
        }
        .form-input:focus { box-shadow: 0 0 0 2px #3b82f6; border-color: transparent; }

        .btn {
          width: 100%;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background-color 0.2s;
        }
        .btn-primary { background-color: #2563EB; color: white; }
        .btn-primary:hover { background-color: #1d4ed8; }

        .btn-outline { background-color: white; color: #2563EB; border: 1px solid #2563EB; }
        .btn-outline:hover { background-color: #eff6ff; }
        
        .btn-cancel { background-color: white; color: #4b5563; border: 1px solid #d1d5db; margin-top: 0.5rem; }
        .btn-cancel:hover { background-color: #f3f4f6; }

        .install-panel {
          background-color: #eff6ff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #dbeafe;
          height: fit-content;
        }
        .install-panel.editing {
           background-color: #fff7ed; /* Orange tint for edit mode */
           border-color: #fed7aa;
        }

        .install-list {
          max-height: 20rem;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .install-item {
          padding: 0.75rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          border: 1px solid transparent;
        }
        .install-item:hover { border-color: #e5e7eb; }
        
        .item-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .item-actions { display: flex; gap: 0.5rem; }
        
        .action-icon {
          padding: 0.4rem;
          border-radius: 0.375rem;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        .action-icon:hover { background-color: #e5e7eb; color: #111827; }
        .action-icon.delete:hover { background-color: #fef2f2; color: #dc2626; }

        .version-badge {
          background-color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px solid #e5e7eb;
          font-size: 0.75rem;
          color: #6b7280;
          width: fit-content;
        }
      `}</style>

      <div className="header-section">
        <Link to="/inventory/devices" className="back-button">
          <ArrowLeft size={24} />
        </Link>
        <div className="title-group">
          <h1>
            {isEditing ? `Manage Device: ${deviceData.hostname}` : 'Onboard New Device'}
          </h1>
          <p>Register hardware and manage installed software.</p>
        </div>
      </div>

      <div className="grid-layout">
        {/* Left Column: Device Details & List */}
        <div className="left-column">
          <div className="card">
            <h2 className="card-title">
              <Monitor size={20} color="#2563EB" /> Device Details
            </h2>
            <form onSubmit={handleDeviceSubmit}>
              <div className="form-group">
                <label className="form-label">Hostname</label>
                <input
                  required
                  value={deviceData.hostname}
                  onChange={(e) => setDeviceData({ ...deviceData, hostname: e.target.value })}
                  className="form-input"
                  placeholder="e.g. LAPTOP-FIN-01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned User</label>
                <input
                  required
                  value={deviceData.ownerUserId}
                  onChange={(e) => setDeviceData({ ...deviceData, ownerUserId: e.target.value })}
                  className="form-input"
                  placeholder="e.g. john.doe@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                {isEditing ? 'Update Device' : 'Onboard Device'}
              </button>
            </form>
          </div>

          {/* Installed Software List (Only visible when editing) */}
          {isEditing && (
            <div className="card">
               <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Currently Installed</h3>
               <div className="install-list">
                 {existingInstallations.length > 0 ? (
                   existingInstallations.map((sw) => (
                     <div key={sw.installationId} className="install-item">
                       <div className="item-info">
                         <span style={{ fontWeight: 500, color: '#374151' }}>{sw.productName}</span>
                         <span className="version-badge">v{sw.version}</span>
                       </div>
                       <div className="item-actions">
                         <button 
                            className="action-icon" 
                            title="Edit"
                            onClick={() => handleEditClick(sw)}
                         >
                           <Edit2 size={16} />
                         </button>
                         <button 
                            className="action-icon delete" 
                            title="Delete"
                            onClick={() => handleDeleteClick(sw.installationId, sw.productName)}
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   ))
                 ) : (
                   <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.875rem' }}>No software installed yet.</p>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Right Column: Software Installation Form (Create/Edit) */}
        {isEditing ? (
          <div className={`install-panel ${isEditingInstall ? 'editing' : ''}`}>
            <h2 className="card-title" style={{ color: isEditingInstall ? '#ea580c' : '#1f2937' }}>
              <DownloadCloud size={20} color={isEditingInstall ? '#ea580c' : '#2563EB'} /> 
              {isEditingInstall ? 'Update Software' : 'Install Software'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1.5rem' }}>
              {isEditingInstall 
                ? 'Modify the details of the selected software installation.' 
                : 'Simulate the discovery agent finding new software on this device.'}
            </p>

            <form onSubmit={handleInstallSubmit}>
              <div className="form-group">
                <label className="form-label">Software Name</label>
                <input
                  required
                  value={installData.productName}
                  onChange={(e) => setInstallData({ ...installData, productName: e.target.value })}
                  className="form-input"
                  placeholder="e.g. Adobe Photoshop"
                  style={{ backgroundColor: 'white' }}
                />
                <p className="helper-text">
                  * Must match a License Product Name exactly for compliance matching.
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Version</label>
                <input
                  required
                  value={installData.version}
                  onChange={(e) => setInstallData({ ...installData, version: e.target.value })}
                  className="form-input"
                  placeholder="e.g. 2024.1"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
              
              <button
                type="submit"
                className={`btn ${isEditingInstall ? 'btn-primary' : 'btn-outline'}`}
                style={{ marginTop: '1rem', backgroundColor: isEditingInstall ? '#ea580c' : '', borderColor: isEditingInstall ? '#ea580c' : '' }}
              >
                {isEditingInstall ? <Save size={18} /> : <DownloadCloud size={18} />}
                {isEditingInstall ? 'Save Changes' : 'Record Installation'}
              </button>

              {isEditingInstall && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="btn btn-cancel"
                >
                  <X size={18} /> Cancel
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="empty-state">
            Complete onboarding to add software.
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceForm;