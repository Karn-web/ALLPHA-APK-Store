import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/login', { code });
      if (res.data.success) {
        onLogin();
      } else {
        alert('Invalid security code');
      }
    } catch (err) {
      alert('Error logging in');
    }
  };

  return (
    <div className="admin-login">
      <h2>Enter Security Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Security Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default AdminLogin;

