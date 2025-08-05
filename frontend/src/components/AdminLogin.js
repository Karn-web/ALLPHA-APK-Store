// frontend/src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid security code");
      }
    } catch {
      setError("Server error");
    }
  };

  return (
    <div>
      <h2>Enter Security Code</h2>
      <input
        type="password"
        placeholder="Security Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleLogin}>Enter</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AdminLogin;
