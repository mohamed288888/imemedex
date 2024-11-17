import React from 'react';

function CustomAlert({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      textAlign: 'center', zIndex: 1000, width: '300px'
    }}>
      <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Transaction Successful!</h3>
      <p style={{ color: '#000' }}>{message}</p>
      <button 
        onClick={onClose} 
        style={{
          marginTop: '20px', backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px',
          borderRadius: '5px', cursor: 'pointer'
        }}>
        OK
      </button>
    </div>
  );
}

export default CustomAlert;
