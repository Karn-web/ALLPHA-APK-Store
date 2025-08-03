import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/admin/panel");
    } catch (err) {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      /><br/>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br/>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;
