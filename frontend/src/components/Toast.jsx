import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`toast toast-${type} fade-in`} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '12px 20px',
      borderRadius: '8px',
      color: '#fff',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      minWidth: '280px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {getIcon()}
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      </div>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '2px'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
