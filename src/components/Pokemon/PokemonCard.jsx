import React, { useEffect, useState } from "react";
import { getPokemonDetails } from "./api";

export default function PokemonCard({ meta, isFav, onToggleFav, onOpen }) {
  const [p, setP] = useState(null);

  useEffect(() => {
    let live = true;
    getPokemonDetails(meta.url)
      .then((d) => live && setP(d))
      .catch(() => live && setP({ name: meta.name, image: "", images: [], height: "-", weight: "-", types: "" }));
    return () => { live = false; };
  }, [meta.url, meta.name]);

  const onHeartClick = (e) => { e.stopPropagation(); onToggleFav(meta.name); };

  return (
    <div className={`card ${isFav ? "is-fav" : ""}`} onClick={() => p && onOpen(p)}>
      <button
        className={`heart ${isFav ? "active" : ""}`}
        aria-label="Toggle favorite"
        title="Favorite"
        onClick={onHeartClick}
      >♥</button>

      <div className="card-media">
        {p?.image ? <img src={p.image} alt={meta.name} loading="lazy" /> : <div className="img-fallback">No Image</div>}
      </div>

      <h3 className="card-title">{meta.name}</h3>
    </div>
  );
}
