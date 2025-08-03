import React, { useEffect, useState } from "react";
import axios from "axios";
import ApkCard from "../components/ApkCard";
import SearchBar from "../components/SearchBar";
import "./Home.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

function Home() {
  const [apks, setApks] = useState([]);
  const [filteredApks, setFilteredApks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/apks`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setApks(res.data);
          setFilteredApks(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching APKs:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredApks(apks);
    } else {
      setFilteredApks(
        apks.filter((apk) =>
          apk.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      <h1 className="home-title">Allpha APK Store</h1>
      <SearchBar onSearch={handleSearch} />
      <div className="apk-list">
        {filteredApks.length === 0 ? (
          <p>No APKs found.</p>
        ) : (
          filteredApks.map((apk, index) => (
            <ApkCard
              key={index}
              name={apk.name}
              description={apk.description}
              category={apk.category}
              icon={`${API_BASE_URL}/${apk.icon}`}
              downloadUrl={`${API_BASE_URL}/${apk.downloadUrl}`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Home;




