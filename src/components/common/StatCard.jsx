import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="stat-card"
    >
      <style>{`
        .stat-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: box-shadow 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .stat-info p {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
        }
        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        .stat-icon {
          padding: 0.75rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
    </motion.div>
  );
};

export default StatCard;