import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

function AdminPanel() {
  const [apks, setApks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState(null);
  const [apkFile, setApkFile] = useState(null);

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    const res = await axios.get("/apks");
    setApks(res.data || []);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !apkFile) return alert("Name and APK file required!");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    if (icon) formData.append("icon", icon);
    formData.append("apkFile", apkFile);

    await axios.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    fetchApks();
    setName("");
    setDescription("");
    setCategory("");
    setIcon(null);
    setApkFile(null);
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <form onSubmit={handleUpload}>
        <input placeholder="App Name" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <label>App Icon:</label>
        <input type="file" onChange={(e) => setIcon(e.target.files[0])} />
        <label>APK File:</label>
        <input type="file" onChange={(e) => setApkFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>

      <h3>Uploaded Apps</h3>
      <div className="apk-list">
        {apks.map((apk) => (
          <div key={apk.id} className="apk-item">
            <img src={apk.icon ? `/${apk.icon}` : "/default-icon.png"} alt={apk.name} />
            <h4>{apk.name}</h4>
            <p>{apk.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;




