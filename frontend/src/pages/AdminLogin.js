import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const [securityCode, setSecurityCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/admin-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securityCode }),
            });

            const data = await res.json();
            if (data.success) {
                localStorage.setItem('admin', true);
                navigate('/admin/dashboard');
            } else {
                setError(data.message || 'Unauthorized');
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div className="admin-login-container">
            <h2>Enter Security Code</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Security Code"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    required
                />
                <button type="submit">Enter</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AdminLogin;


