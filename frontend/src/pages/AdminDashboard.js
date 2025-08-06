import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [apkName, setApkName] = useState("");
  const [apkDescription, setApkDescription] = useState("");
  const [apkCategory, setApkCategory] = useState("");
  const [apkFile, setApkFile] = useState(null);
  const [apkImage, setApkImage] = useState(null);
  const [apks, setApks] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch APKs from backend
  const fetchApks = async () => {
    try {
      const res = await axios.get("/api/apks");
      setApks(res.data);
    } catch (error) {
      console.error("Error fetching APKs:", error);
      setMessage("Failed to fetch APKs");
    }
  };

  useEffect(() => {
    fetchApks();
  }, []);

  // Handle APK upload form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apkName || !apkDescription || !apkCategory || !apkFile || !apkImage) {
      setMessage("Please fill all fields and select files");
      return;
    }

    const formData = new FormData();
    formData.append("apkName", apkName);
    formData.append("apkDescription", apkDescription);
    formData.append("apkCategory", apkCategory);
    formData.append("apkFile", apkFile);
    formData.append("apkImage", apkImage);

    try {
      const res = await axios.post("/api/upload-apk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "APK uploaded successfully!");
      setApkName("");
      setApkDescription("");
      setApkCategory("");
      setApkFile(null);
      setApkImage(null);
      fetchApks();
    } catch (error) {
      console.error("Error uploading APK:", error);
      setMessage("Error uploading APK");
    }
  };

  // Handle APK delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this APK?")) return;
    try {
      await axios.delete(`/api/delete-apk/${id}`);
      setMessage("APK deleted successfully");
      fetchApks();
    } catch (error) {
      console.error("Error deleting APK:", error);
      setMessage("Failed to delete APK");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {message && <div className="message">{message}</div>}

      <form className="apk-upload-form" onSubmit={handleSubmit}>
        <h3>Upload New APK</h3>
        <div className="form-group">
          <label>APK Name</label>
          <input
            type="text"
            value={apkName}
            onChange={(e) => setApkName(e.target.value)}
            placeholder="Enter APK name"
            required
          />
        </div>
        <div className="form-group">
          <label>APK Description</label>
          <textarea
            value={apkDescription}
            onChange={(e) => setApkDescription(e.target.value)}
            placeholder="Enter APK description"
            required
          />
        </div>
        <div className="form-group">
          <label>APK Category</label>
          <input
            type="text"
            value={apkCategory}
            onChange={(e) => setApkCategory(e.target.value)}
            placeholder="Enter APK category"
            required
          />
        </div>
        <div className="form-group">
          <label>APK File (.apk)</label>
          <input
            type="file"
            accept=".apk"
            onChange={(e) => setApkFile(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label>APK Image (Icon)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setApkImage(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="upload-btn">Upload APK</button>
      </form>

      <hr />

      <h3>Uploaded APKs</h3>
      {apks.length === 0 ? (
        <p>No APKs uploaded yet.</p>
      ) : (
        <div className="apk-list">
          {apks.map((apk) => (
            <div className="apk-item" key={apk._id}>
              <img
                src={apk.imageUrl}
                alt={apk.name}
                className="apk-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-icon.png"; // fallback icon
                }}
              />
              <div className="apk-info">
                <h4>{apk.name}</h4>
                <p>{apk.description}</p>
                <p><b>Category:</b> {apk.category}</p>
              </div>
              <div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(apk._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

