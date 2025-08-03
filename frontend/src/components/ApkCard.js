import React from "react";
import "./ApkCard.css";

function ApkCard({ apk }) {
  if (!apk) {
    return null; // Prevent rendering if apk is undefined
  }

  return (
    <div className="apk-card">
      <img
        src={apk.icon ? `/${apk.icon}` : "/default-icon.png"}
        alt={apk.name || "App Icon"}
        className="apk-icon"
      />
      <div className="apk-details">
        <h3>{apk.name}</h3>
        <p>{apk.description}</p>
        <span className="apk-category">{apk.category}</span>
        <a
          href={apk.downloadUrl ? `/${apk.downloadUrl}` : "#"}
          className="apk-download-btn"
        >
          Download
        </a>
      </div>
    </div>
  );
}

export default ApkCard;


