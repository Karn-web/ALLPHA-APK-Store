import React, { useState, useEffect } from "react";
import axios from "axios";

function AdminPanel() {
  const [apks, setApks] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    downloadUrl: "",
    icon: null,
    apk: null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    const res = await axios.get("/apks");
    setApks(res.data);
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleUpload = async () => {
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        fd.append(key, formData[key]);
      }
    });

    try {
      await axios.post("/apks", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("APK uploaded!");
      setFormData({
        name: "",
        description: "",
        category: "",
        downloadUrl: "",
        icon: null,
        apk: null,
      });
      fetchApks();
    } catch (err) {
      alert("Upload failed: " + err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/apks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchApks();
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>

      <div className="upload-form">
        <input name="name" placeholder="APK Name" onChange={handleChange} />
        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <input name="category" placeholder="Category" onChange={handleChange} />
        <input
          name="downloadUrl"
          placeholder="Download URL (optional)"
          onChange={handleChange}
        />
        <input type="file" name="icon" onChange={handleChange} />
        <input type="file" name="apk" onChange={handleChange} />
        <button onClick={handleUpload}>Upload APK</button>
      </div>

      <div className="apk-list">
        <h3>Uploaded APKs</h3>
        {apks.length === 0 && <p>No APKs uploaded yet</p>}
        {apks.map((apk) => (
          <div key={apk.id} className="apk-card">
            {apk.icon && <img src={apk.icon} alt={apk.name} />}
            <h4>{apk.name}</h4>
            <p>{apk.description}</p>
            <p>Category: {apk.category}</p>
            <button onClick={() => handleDelete(apk.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;






