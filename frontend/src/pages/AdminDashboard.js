import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [apkName, setApkName] = useState('');
  const [apkDescription, setApkDescription] = useState('');
  const [apkCategory, setApkCategory] = useState('');
  const [apkImage, setApkImage] = useState(null);
  const [apkFile, setApkFile] = useState(null);
  const [apks, setApks] = useState([]);

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    try {
      const res = await axios.get('/api/apks');
      setApks(res.data);
    } catch (err) {
      console.error('Error fetching APKs:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('apkName', apkName);
    formData.append('apkDescription', apkDescription);
    formData.append('apkCategory', apkCategory);
    formData.append('apkImage', apkImage);
    formData.append('apkFile', apkFile);

    try {
      await axios.post('/api/upload', formData);
      fetchApks();
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = async (apkName) => {
    try {
      await axios.delete(`/api/delete/${apkName}`);
      fetchApks();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="APK Name"
          value={apkName}
          onChange={(e) => setApkName(e.target.value)}
          required
        />
        <textarea
          placeholder="APK Description"
          value={apkDescription}
          onChange={(e) => setApkDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="APK Category"
          value={apkCategory}
          onChange={(e) => setApkCategory(e.target.value)}
          required
        />
        <input
          type="file"
          onChange={(e) => setApkImage(e.target.files[0])}
          required
        />
        <input
          type="file"
          onChange={(e) => setApkFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload APK</button>
      </form>

      <div className="apk-list">
        {apks.map((apk, index) => (
          <div key={index} className="apk-item">
            <h3>{apk.name}</h3>
            <p>{apk.description}</p>
            <p><strong>Category:</strong> {apk.category}</p>
            <img src={`/uploads/${apk.image}`} alt={apk.name} width="100" />
            <a href={`/uploads/${apk.file}`} download>Download APK</a>
            <button onClick={() => handleDelete(apk.name)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;


