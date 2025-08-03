import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [apks, setApks] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [apkData, setApkData] = useState({ name: '', description: '', apk: null });

  const fetchApks = () => {
    fetch('/apks')
      .then(res => res.json())
      .then(data => setApks(data));
  };

  useEffect(() => {
    fetchApks();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => {
        if (res.ok) {
          setLoggedIn(true);
        } else {
          alert('Invalid credentials!');
        }
      });
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!loggedIn) return alert('Login first!');

    const data = new FormData();
    data.append('name', apkData.name);
    data.append('description', apkData.description);
    data.append('apk', apkData.apk);

    fetch('/upload', {
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(() => {
        alert('APK uploaded!');
        fetchApks();
      });
  };

  const handleDelete = (filename) => {
    if (!loggedIn) return alert('Login first!');

    fetch(`/apks/${filename}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        alert('APK deleted!');
        fetchApks();
      });
  };

  return (
    <div className="container">
      <h2>Admin Panel</h2>
      {!loggedIn && (
        <form onSubmit={handleLogin} className="login-form">
          <input type="text" placeholder="Username" onChange={e => setFormData({ ...formData, username: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setFormData({ ...formData, password: e.target.value })} />
          <button type="submit">Login</button>
        </form>
      )}

      {loggedIn && (
        <>
          <form onSubmit={handleUpload} className="upload-form">
            <input type="text" placeholder="APK Name" required onChange={e => setApkData({ ...apkData, name: e.target.value })} />
            <input type="text" placeholder="Description" required onChange={e => setApkData({ ...apkData, description: e.target.value })} />
            <input type="file" accept=".apk" required onChange={e => setApkData({ ...apkData, apk: e.target.files[0] })} />
            <button type="submit">Upload APK</button>
          </form>

          <div className="apk-list">
            {apks.map((apk, index) => (
              <div key={index} className="apk-card">
                <h3>{apk.name}</h3>
                <p>{apk.description}</p>
                <button onClick={() => handleDelete(apk.filename)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
