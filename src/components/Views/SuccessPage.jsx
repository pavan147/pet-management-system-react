import React from 'react';

const SuccessPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)',
      color: '#fff',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px',
        padding: '40px 60px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🎉 Login Successful!</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          Welcome back! You have successfully logged in.
        </p>
        <button
          style={{
            background: '#fff',
            color: '#3B82F6',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 30px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(31, 38, 135, 0.2)'
          }}
          onClick={() => window.location.href = '/dashboard'}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;