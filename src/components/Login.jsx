import React, { useState } from 'react';
import { AuthService } from '../services/api';
import { ShieldCheck, User, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await AuthService.login(credentials);
      // Handle both casing possibilities from API
      const userRole = response.data.Role || response.data.role;
      
      if (userRole) {
        onLogin(userRole);
      } else {
        setError("Login successful but role missing. Check backend.");
      }
    } catch (err) {
      console.error(err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          background-color: white;
          width: 100%;
          max-width: 400px;
          padding: 2.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
        }
        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2rem;
        }
        .logo-icon {
          background-color: #eff6ff;
          padding: 1rem;
          border-radius: 50%;
          color: #2563EB;
          margin-bottom: 1rem;
        }
        .title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #334155;
          margin-bottom: 0.5rem;
        }
        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .btn-submit {
          width: 100%;
          padding: 0.75rem;
          background-color: #2563EB;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 1.5rem;
        }
        .btn-submit:hover {
          background-color: #1d4ed8;
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .error-msg {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #fee2e2;
        }
        .demo-credentials {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
          font-size: 0.8rem;
          color: #64748b;
        }
        .cred-row {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
        }
        .cred-role { font-weight: 600; color: #334155; }
        .cred-user { font-family: monospace; background: #f1f5f9; padding: 2px 6px; borderRadius: 4px; }
      `}</style>

      <div className="login-card">
        <div className="logo-section">
          <div className="logo-icon">
            <ShieldCheck size={40} />
          </div>
          <h1 className="title">SLMS Login</h1>
          <p className="subtitle">Secure License Management System</p>
        </div>

        {error && (
          <div className="error-msg">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default Login;