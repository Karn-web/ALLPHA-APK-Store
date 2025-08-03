import React, { useState, useEffect } from "react";
import axios from "axios";

function Home() {
  const [apks, setApks] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApks();
  }, []);

  const fetchApks = async () => {
    const res = await axios.get("/apks");
    setApks(res.data);
  };

  const handleSearch = async () => {
    if (search.trim() === "") {
      fetchApks();
    } else {
      const res = await axios.get(`/apks/search/${search}`);
      setApks(res.data);
    }
  };

  return (
    <div className="home">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search APKs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="apk-grid">
        {apks.length === 0 && <p>No APKs found</p>}
        {apks.map((apk) => (
          <div key={apk.id} className="apk-card">
            {apk.icon && <img src={apk.icon} alt={apk.name} />}
            <h3>{apk.name}</h3>
            <p>{apk.description}</p>
            {apk.apkFile && (
              <a href={apk.apkFile} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;





