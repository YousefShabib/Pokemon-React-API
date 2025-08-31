import { forwardRef } from "react";

const Topbar = forwardRef(function Topbar(
  { search, setSearch, showFavsOnly, setShowFavsOnly },
  ref
) {
  return (
    <div className="topbar" ref={ref}>
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        id="search"
        placeholder="Search Pokemon"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        aria-label="Search Pokemon by name"
      />
      <button
        id="favToggle"
        className="fav-toggle"
        aria-pressed={showFavsOnly}
        onClick={() => setShowFavsOnly(v => !v)}
      >
        {showFavsOnly ? "Show All" : "Show Favorites"}
      </button>
    </div>
  );
});

export default Topbar;
