import React, { useEffect, useState } from "react";
import axios from "axios";
import ApkCard from "../components/ApkCard";
import "./Home.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

function Home() {
  const [apks, setApks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      <h1 className="home-title">Allpha APK Store</h1>
      <div className="apk-list">
        {apks.length === 0 ? (
          <p>No APKs available right now.</p>
        ) : (
          apks.map((apk, index) => (
            <ApkCard
              key={index}
              name={apk.name}
              description={apk.description}
              category={apk.category}
              icon={apk.icon}
              downloadUrl={apk.downloadUrl}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Home;


