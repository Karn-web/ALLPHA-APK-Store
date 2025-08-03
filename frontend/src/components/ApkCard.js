import React from "react";
import "./ApkCard.css";

function ApkCard({ apk, onDelete }) {
  return (
    <div className="apk-card">
      <img src={`/uploads/${apk.image}`} alt={apk.name} />
      <h3>{apk.name}</h3>
      <p><strong>Category:</strong> {apk.category}</p>
      <p>{apk.description}</p>
      <a href={`/uploads/${apk.file}`} download>
        Download APK
      </a>
      {onDelete && <button onClick={() => onDelete(apk.file)}>Delete</button>}
    </div>
  );
}

export default ApkCard;
