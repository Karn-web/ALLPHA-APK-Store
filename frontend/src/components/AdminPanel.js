import React, { useState } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";

function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className="admin-panel">
      <h2>Welcome Admin</h2>
      <button onClick={handleLogout}>Logout</button>

      {/* Add your APK upload form here */}
      <div>
        <h3>Add New APK</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("APK Uploaded!");
          }}
        >
          <input type="text" placeholder="App Name" required />
          <br />
          <input type="text" placeholder="Category" required />
          <br />
          <input type="file" required />
          <br />
          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;

