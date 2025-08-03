import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

function AdminPanel() {
  const [apks, setApks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [apkFile, setApkFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // fetch apk list
  const fetchApks = () => {
    axios
      .get(`${API_BASE_URL}/apks`)
      .then((res) => {
        if (Array.isArray(res.data)) setApks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching APKs:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchApks();
    }
  }, [isLoggedIn]);

  // handle login
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${API_BASE_URL}/admin/login`, { username, password })
      .then((res) => {
        if (res.data.success) {
          setIsLoggedIn(true);
        } else {
          alert("Invalid username or password");
        }
      })
      .catch(() => alert("Login failed"));
  };

  // add new apk
  const handleAddApk = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("apk", apkFile);
    formData.append("icon", iconFile);

    axios
      .post(`${API_BASE_URL}/apks`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        fetchApks();
        setName("");
        setDescription("");
        setCategory("");
        setApkFile(null);
        setIconFile(null);
      })
      .catch((err) => console.error("Error uploading APK:", err));
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading Admin Panel...</div>;

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <form className="apk-form" onSubmit={handleAddApk}>
        <input
          type="text"
          placeholder="App Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="file"
          accept=".apk"
          onChange={(e) => setApkFile(e.target.files[0])}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setIconFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload APK</button>
      </form>

      <div className="apk-list">
        {apks.length === 0 ? (
          <p>No APKs available.</p>
        ) : (
          apks.map((apk, index) => (
            <div className="apk-item" key={index}>
              <img
                src={`${API_BASE_URL}/${apk.icon}`}
                alt={apk.name}
                className="apk-icon"
              />
              <div>
                <h3>{apk.name}</h3>
                <p>{apk.description}</p>
                <small>{apk.category}</small>
                <br />
                <a
                  href={`${API_BASE_URL}/${apk.downloadUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPanel;




