import React from "react";

export default function Topbar({ search, setSearch, showFavsOnly, setShowFavsOnly }) {
  return (
    <div className="topbar">
      <input
        id="search"
        type="search"
        placeholder="Search Pokemon"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search Pokemon"
        autoComplete="off"
      />
      <button
        id="favToggle"
        className="fav-toggle"
        aria-pressed={showFavsOnly}
        onClick={() => setShowFavsOnly(!showFavsOnly)}
      >
        {showFavsOnly ? "Show All" : "Show Favorites"}
      </button>
    </div>
  );
}
