import React, { useState, useEffect } from "react";
import axios from "axios";
import ApkCard from "./ApkCard";
import "./AdminPanel.css";

function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [apks, setApks] = useState([]);
  const [apkData, setApkData] = useState({
    name: "",
    category: "",
    description: "",
    apk: null,
    image: null,
  });

  const fetchApks = async () => {
    const res = await axios.get("/apks");
    setApks(res.data);
  };

  useEffect(() => {
    fetchApks();
  }, []);

  const handleLogin = async () => {
    const res = await axios.post("/login", loginData);
    if (res.data.success) setLoggedIn(true);
    else alert("Invalid credentials");
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("name", apkData.name);
    formData.append("category", apkData.category);
    formData.append("description", apkData.description);
    formData.append("apk", apkData.apk);
    formData.append("image", apkData.image);

    await axios.post("/upload", formData);
    fetchApks();
  };

  const handleDelete = async (filename) => {
    await axios.delete(`/delete/${filename}`);
    fetchApks();
  };

  return (
    <div className="admin-panel">
      {!loggedIn ? (
        <div className="login">
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) =>
              setLoginData({ ...loginData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <h2>Upload New APK</h2>
          <input
            type="text"
            placeholder="APK Name"
            onChange={(e) => setApkData({ ...apkData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category"
            onChange={(e) => setApkData({ ...apkData, category: e.target.value })}
          />
          <textarea
            placeholder="Description"
            onChange={(e) => setApkData({ ...apkData, description: e.target.value })}
          />
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setApkData({ ...apkData, apk: e.target.files[0] })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setApkData({ ...apkData, image: e.target.files[0] })}
          />
          <button onClick={handleUpload}>Upload</button>

          <h2>Manage APKs</h2>
          <div className="apk-grid">
            {apks.map((apk, index) => (
              <ApkCard key={index} apk={apk} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminPanel;
