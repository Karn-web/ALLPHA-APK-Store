import React from "react";
import "./Home.css";

function Home({ bannerImage, children }) {
  return (
    <div className="home">
      <div className="banner-section">
        <img src={bannerImage} alt="banner" className="banner" />
      </div>
      <div className="content">{children}</div>
    </div>
  );
}

export default Home;


