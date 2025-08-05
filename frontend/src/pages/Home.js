import React, { useEffect, useState } from 'react';
import './Home.css';

const Home = () => {
  const [apks, setApks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/apks')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setApks(data);
        setError(null);
      })
      .catch(err => {
        console.error('Error fetching APKs:', err);
        setError('Failed to load APKs. Please try again later.');
      });
  }, []);

  return (
    <div className="home-container">
      <h1>Allpha APK Store</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="apk-list">
        {apks.length === 0 && !error && <p>No APKs available.</p>}

        {apks.map(apk => (
          <div key={apk.id || apk.name} className="apk-card">
            <img
              src={apk.imageUrl || apk.image}
              alt={apk.name}
              className="apk-image"
            />
            <h3>{apk.name}</h3>
            <p>{apk.description}</p>
            <p><strong>Category:</strong> {apk.category}</p>
            <a href={apk.apkUrl || apk.apk} download className="download-btn">
              Download APK
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;







