import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminPanel.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

function AdminPanel() {
  const [apks, setApks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [icon, setIcon] = useState("");

  // Fetch APKs
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/apks`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setApks(res.data);
        } else {
          setApks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching APKs:", err);
        setApks([]);
        setLoading(false);
      });
  }, []);

  // Add new APK
  const handleAddApk = (e) => {
    e.preventDefault();
    const newApk = { name, description, category, downloadUrl, icon };

    axios
      .post(`${API_BASE_URL}/apks`, newApk)
      .then((res) => {
        setApks([...apks, res.data]);
        setName("");
        setDescription("");
        setCategory("");
        setDownloadUrl("");
        setIcon("");
      })
      .catch((err) => console.error("Error adding APK:", err));
  };

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
          type="text"
          placeholder="Download URL"
          value={downloadUrl}
          onChange={(e) => setDownloadUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Icon URL"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
        />
        <button type="submit">Add APK</button>
      </form>

      <div className="apk-list">
        {apks.length === 0 ? (
          <p>No APKs available.</p>
        ) : (
          apks.map((apk, index) => (
            <div className="apk-item" key={index}>
              <img src={apk.icon} alt={apk.name} className="apk-icon" />
              <div>
                <h3>{apk.name}</h3>
                <p>{apk.description}</p>
                <small>{apk.category}</small>
                <br />
                <a href={apk.downloadUrl} target="_blank" rel="noreferrer">
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



