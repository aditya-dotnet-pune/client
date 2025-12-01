import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Server, ShieldCheck, FileBarChart, Monitor, ClipboardList, LogOut, Bell } from 'lucide-react';

// Import Feature Components
import Dashboard from './components/Reports/Dashboard';
import LicenseList from './components/Inventory/LicenseList';
import LicenseForm from './components/Inventory/LicenseForm';
import DeviceList from './components/Inventory/DeviceList';
import DeviceForm from './components/Inventory/DeviceForm';
import ComplianceDashboard from './components/Compliance/ComplianceDashboard'; // Now acts as Alerts
import ComplianceReport from './components/Compliance/ComplianceReport'; // NEW
import CostDashboard from './components/Reports/CostDashboard';
import AuditLogViewer from './components/Reports/AuditLogViewer';
import Login from './components/Login';

// Role Definitions (RBAC Configuration)
const ROLE_PERMISSIONS = {
  Admin: ['/', '/inventory', '/inventory/devices', '/compliance', '/alerts', '/reports', '/audit'],
  Finance: ['/', '/reports'], 
  Auditor: ['/', '/compliance', '/alerts', '/audit'], 
};

// Navigation Sidebar Component
const Sidebar = ({ role, onLogout }) => {
  const location = useLocation();
  
  // Define all possible menu items
  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Finance', 'Auditor'] },
    { path: '/inventory', label: 'Software Catalog', icon: <Server size={20} />, roles: ['Admin'] },
    { path: '/inventory/devices', label: 'Devices', icon: <Monitor size={20} />, roles: ['Admin'] },
    // NEW: Compliance Table Page
    { path: '/compliance', label: 'Compliance', icon: <ShieldCheck size={20} />, roles: ['Admin', 'Auditor'] },
    // RENAMED: Old Compliance Dashboard is now Alerts
    { path: '/alerts', label: 'Alerts', icon: <Bell size={20} />, roles: ['Admin', 'Auditor'] },
    { path: '/reports', label: 'Finance', icon: <FileBarChart size={20} />, roles: ['Admin', 'Finance'] },
    { path: '/audit', label: 'Audit Logs', icon: <ClipboardList size={20} />, roles: ['Admin', 'Auditor'] },
  ];

  // Filter items based on current user role
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

// Protected Route Wrapper
const ProtectedRoute = ({ role, allowedRoles, children }) => {
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [userRole, setUserRole] = useState(null); 

  if (!userRole) {
    return <Login onLogin={(role) => setUserRole(role)} />;
  }

  return (
    <Router>
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
        <Sidebar role={userRole} onLogout={() => setUserRole(null)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Admin Only Routes */}
            <Route path="/inventory" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <LicenseList />
              </ProtectedRoute>
            } />
            <Route path="/inventory/new" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <LicenseForm />
              </ProtectedRoute>
            } />
            <Route path="/inventory/edit/:id" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <LicenseForm />
              </ProtectedRoute>
            } />
            <Route path="/inventory/devices" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <DeviceList />
              </ProtectedRoute>
            } />
            <Route path="/inventory/devices/new" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <DeviceForm />
              </ProtectedRoute>
            } />
            <Route path="/inventory/devices/edit/:id" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin']}>
                <DeviceForm />
              </ProtectedRoute>
            } />
            
            {/* NEW: Compliance Table */}
            <Route path="/compliance" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor']}>
                <ComplianceReport />
              </ProtectedRoute>
            } />

            {/* RENAMED: Alerts Dashboard */}
            <Route path="/alerts" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor']}>
                <ComplianceDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Finance']}>
                <CostDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/audit" element={
              <ProtectedRoute role={userRole} allowedRoles={['Admin', 'Auditor']}>
                <AuditLogViewer />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;