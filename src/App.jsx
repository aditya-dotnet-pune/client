import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, ShieldCheck, FileBarChart, Monitor, ClipboardList, LogOut, Bell, CalendarClock } from 'lucide-react';

// Import Feature Components
import Dashboard from './components/Reports/Dashboard';
import LicenseList from './components/Inventory/LicenseList';
import LicenseForm from './components/Inventory/LicenseForm';
import DeviceList from './components/Inventory/DeviceList';
import DeviceForm from './components/Inventory/DeviceForm';
import ComplianceDashboard from './components/Compliance/ComplianceDashboard'; 
import ComplianceReport from './components/Compliance/ComplianceReport';
import CostDashboard from './components/Reports/CostDashboard';
import AuditLogViewer from './components/Reports/AuditLogViewer';
import RenewalList from './components/Compliance/RenewalList';
import Login from './components/Login';

// Navigation Sidebar Component
const Sidebar = ({ role, onLogout }) => {
  const location = useLocation();
  
  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Finance', 'Auditor', 'Viewer'] },
    { path: '/inventory', label: 'Software Catalog', icon: <Server size={20} />, roles: ['Admin', 'Viewer'] },
    { path: '/inventory/devices', label: 'Devices', icon: <Monitor size={20} />, roles: ['Admin', 'Viewer'] },
    { path: '/compliance', label: 'Compliance', icon: <ShieldCheck size={20} />, roles: ['Admin', 'Auditor', 'Viewer'] },
    { path: '/alerts', label: 'Alerts', icon: <Bell size={20} />, roles: ['Admin', 'Auditor', 'Viewer'] },
    { path: '/renewals', label: 'Renewals', icon: <CalendarClock size={20} />, roles: ['Admin', 'Finance', 'Viewer'] },
    { path: '/reports', label: 'Finance', icon: <FileBarChart size={20} />, roles: ['Admin', 'Finance', 'Viewer'] },
    { path: '/audit', label: 'Audit Logs', icon: <ClipboardList size={20} />, roles: ['Admin', 'Auditor', 'Viewer'] },
  ];

  const allowedItems = allNavItems.filter(item => item.roles.includes(role));

  return (
    <div className="sidebar">
      <style>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background-color: white;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 10;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .sidebar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2563EB;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
        }
        .role-badge {
          font-size: 0.75rem;
          background-color: #f3f4f6;
          color: #4b5563;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          margin-top: 0.5rem;
          display: inline-block;
          font-weight: 600;
        }
        .nav-menu {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          color: #4b5563;
        }
        .nav-item:hover {
          background-color: #f9fafb;
          color: #111827;
        }
        .nav-item.active {
          background-color: #eff6ff;
          color: #2563EB;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #fef2f2;
          color: #dc2626;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .logout-btn:hover {
          background-color: #fee2e2;
        }
      `}</style>
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <ShieldCheck color="#2563EB" fill="#dbeafe" />
          SLMS
        </h1>
        <span className="role-badge">Role: {role}</span>
      </div>
      <nav className="nav-menu">
        {allowedItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (location.pathname.startsWith(item.path) && item.path !== '/' && !['/inventory', '/inventory/devices'].includes(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ role, allowedRoles, children }) => {
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Main Content Wrapper to allow using hooks
const AppContent = () => {
  const [userRole, setUserRole] = useState(null); 
  const navigate = useNavigate();

  const handleLogin = (role) => {
    setUserRole(role);
    // Redirect based on role
    if (role === 'Finance') navigate('/reports');
    else if (role === 'Admin') navigate('/inventory');
    else if (role === 'Auditor') navigate('/audit');
    else navigate('/');
  };

  const handleLogout = () => {
    setUserRole(null);
    navigate('/');
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <style>{`
        .app-container {
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', sans-serif;
        }
        .main-content {
          margin-left: 250px;
          min-height: 100vh;
        }
      `}</style>
      <Sidebar role={userRole} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard userRole={userRole} />} />
          
          <Route path="/inventory" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Viewer']}>
              <LicenseList userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/inventory/new" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
              <LicenseForm userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/inventory/edit/:id" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Viewer']}>
              <LicenseForm userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/inventory/devices" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Viewer']}>
              <DeviceList userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/inventory/devices/new" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
              <DeviceForm userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/inventory/devices/edit/:id" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Viewer']}>
              <DeviceForm userRole={userRole} />
            </ProtectedRoute>
          } />
          
          <Route path="/compliance" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor', 'Viewer']}>
              <ComplianceReport userRole={userRole} />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor', 'Viewer']}>
              <ComplianceDashboard userRole={userRole} />
            </ProtectedRoute>
          } />

          <Route path="/renewals" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Finance', 'Viewer']}>
              <RenewalList userRole={userRole} />
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Finance', 'Viewer']}>
              <CostDashboard userRole={userRole} />
            </ProtectedRoute>
          } />
          
          <Route path="/audit" element={
            <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor', 'Viewer']}>
              <AuditLogViewer userRole={userRole} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;