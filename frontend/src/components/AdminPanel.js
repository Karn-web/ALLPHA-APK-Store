import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminPanel.css";

function AdminPanel() {
  const [apks, setApks] = useState([]);
  const [newApk, setNewApk] = useState({
    name: "",
    category: "",
    description: "",
    icon: null,
    file: null,
  });

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    try {
      const res = await axios.get("/api/apks");
      setApks(res.data);
    } catch (err) {
      console.error("Error fetching APKs:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setNewApk({ ...newApk, [name]: files[0] });
    } else {
      setNewApk({ ...newApk, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newApk.name);
    formData.append("category", newApk.category);
    formData.append("description", newApk.description);
    formData.append("icon", newApk.icon);
    formData.append("file", newApk.file);

    try {
      await axios.post("/api/apks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewApk({ name: "", category: "", description: "", icon: null, file: null });
      fetchApks();
    } catch (err) {
      console.error("Error uploading APK:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/apks/${id}`);
      fetchApks();
    } catch (err) {
      console.error("Error deleting APK:", err);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          name="name"
          placeholder="APK Name"
          value={newApk.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={newApk.category}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={newApk.description}
          onChange={handleChange}
          required
        />
        <input type="file" name="icon" accept="image/*" onChange={handleChange} required />
        <input type="file" name="file" accept=".apk" onChange={handleChange} required />
        <button type="submit">Upload APK</button>
      </form>

      <div className="apk-list">
        {apks.map((apk) => (
          <div key={apk._id} className="apk-card">
            <img src={apk.iconUrl} alt={apk.name} className="apk-icon" />
            <div>
              <h4>{apk.name}</h4>
              <p>{apk.category}</p>
              <p>{apk.description}</p>
              <a href={apk.fileUrl} target="_blank" rel="noreferrer">
                Download
              </a>
            </div>
            <button onClick={() => handleDelete(apk._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;


