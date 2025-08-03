import React, { useEffect, useState } from "react";
import axios from "axios";
import ApkCard from "../components/ApkCard";
import "./Home.css";

function Home() {
  const [apks, setApks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/apks");
      setApks(res.data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="home">
      {apks.length === 0 ? (
        <p>No apps available yet.</p>
      ) : (
        apks.map((apk) => <ApkCard key={apk.id} apk={apk} />)
      )}
    </div>
  );
}

export default Home;



