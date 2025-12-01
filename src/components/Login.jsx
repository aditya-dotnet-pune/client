import React from 'react';
import { User, DollarSign, ShieldCheck, Eye } from 'lucide-react';

const Login = ({ onLogin }) => {
  const roles = [
    {
      id: 'Admin',
      title: 'IT Administrator',
      desc: 'Full access to Inventory, Compliance, and Renewals.',
      icon: <User size={32} color="#2563EB" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'Finance',
      title: 'Finance Manager',
      desc: 'Access to Cost Allocation and Spend Reports.',
      icon: <DollarSign size={32} color="#16a34a" />,
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 'Auditor',
      title: 'Compliance Auditor',
      desc: 'Read-only access to Audit Logs and Reports.',
      icon: <ShieldCheck size={32} color="#ea580c" />,
      color: 'bg-orange-50 border-orange-200'
    }
  ];

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
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 90%;
          text-align: center;
        }
        .login-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        .login-header p {
          color: #6b7280;
          margin-bottom: 3rem;
        }
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .role-card {
          padding: 2rem;
          border-radius: 0.75rem;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: white;
        }
        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .icon-box {
          margin-bottom: 1rem;
          padding: 1rem;
          background-color: white;
          border-radius: 50%;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .role-title {
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        .role-desc {
          font-size: 0.875rem;
          color: #6b7280;
          line-height: 1.4;
        }
      `}</style>
      
      <div className="login-card">
        <div className="login-header">
          <h1>SLMS Login Simulator</h1>
          <p>Select a persona to enter the application flow.</p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className={`role-card ${role.color}`} 
              onClick={() => onLogin(role.id)}
            >
              <div className="icon-box">
                {role.icon}
              </div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-desc">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;