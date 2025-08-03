import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import Banner from "../components/Banner";
import SearchBar from "../components/SearchBar";
import ApkCard from "../components/ApkCard";
import bannerImage from "./banner.jpg"; // Import banner image inside pages folder

function Home() {
  const [apks, setApks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/apks")
      .then((res) => setApks(res.data))
      .catch((err) => console.error(err));
  }, []);

  const filteredApks = apks.filter((apk) =>
    apk.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home">
      {/* Banner */}
      <div className="banner-section">
        <img src={bannerImage} alt="banner" className="banner" />
      </div>

      {/* Search bar */}
      <SearchBar setSearchQuery={setSearchQuery} />

      {/* APK cards */}
      <div className="apk-grid">
        {filteredApks.length > 0 ? (
          filteredApks.map((apk, index) => (
            <ApkCard
              key={index}
              name={apk.name}
              description={apk.description}
              category={apk.category}
              image={apk.image}
              file={apk.file}
            />
          ))
        ) : (
          <p>No APKs found.</p>
        )}
      </div>
    </div>
  );
}

export default Home;

