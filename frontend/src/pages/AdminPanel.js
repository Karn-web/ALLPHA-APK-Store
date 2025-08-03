import React, { useState, useEffect } from "react";
import "./AdminPanel.css";

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [apks, setApks] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    downloadUrl: "",
    icon: null
  });

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setLoggedIn(true);
    } catch {
      alert("Invalid credentials");
    }
  };

  // Fetch APKs
  const loadApks = async () => {
    const res = await fetch("/apks");
    const data = await res.json();
    setApks(data);
  };

  useEffect(() => {
    if (token) {
      setLoggedIn(true);
      loadApks();
    }
  }, [token]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.icon) return alert("Please select an icon");

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));

    try {
      const res = await fetch("/apks", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      await loadApks();
      alert("APK uploaded successfully");
    } catch {
      alert("Error uploading APK");
    }
  };

  // Delete APK
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`/apks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadApks();
  };

  return (
    <div className="admin-container">
      {!loggedIn ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <input name="username" placeholder="Username" required />
          <input name="password" placeholder="Password" type="password" required />
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <h2>Upload New APK</h2>
          <form className="apk-form" onSubmit={handleSubmit}>
            <input placeholder="Name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Description" required onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input placeholder="Category" required onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input placeholder="Download URL" required onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} />
            <input type="file" accept="image/*" required onChange={(e) => setForm({ ...form, icon: e.target.files[0] })} />
            <button type="submit">Upload</button>
          </form>

          <h3>Manage APKs</h3>
          <ul className="apk-list">
            {apks.map(apk => (
              <li key={apk.id}>
                <img src={apk.image} alt={apk.name} />
                <span>{apk.name}</span>
                <button onClick={() => handleDelete(apk.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
