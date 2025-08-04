import AdBanner from "../components/AdBanner";
import React, { useState, useEffect } from "react";
import ApkCard from "../components/ApkCard";
import SearchBar from "../components/SearchBar";
import "./Home.css";

function Home() {
  const [apks, setApks] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchApks = async () => {
      try {
        const res = await fetch("/apks");
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        setApks(data);
      } catch (err) {
        console.error("Error fetching APKs:", err);
      }
    };
    fetchApks();
  }, []);
  
<AdBanner />

  const filteredApks = apks.filter(apk =>
    apk.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-container">
      <SearchBar value={search} onChange={setSearch} />
      <div className="apk-grid">
        {filteredApks.length > 0 ? (
          filteredApks.map(apk => <ApkCard key={apk.id} apk={apk} />)
        ) : (
          <p className="no-results">No APKs found.</p>
        )}
      </div>
    </div>
  );
}

export default Home;






