import React from "react";
import "./SearchBar.css";

function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      placeholder="Search APKs..."
      className="search-bar"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}

export default SearchBar;
