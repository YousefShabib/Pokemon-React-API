import React from "react";
import PokemonCard from "./PokemonCard";

export default function SpecialSection({ specialMeta, favorites, onToggleFav, onOpen }) {
  if (!specialMeta) return null;

  return (
    <section className="special" aria-labelledby="specialTitle">
      <div className="special-inner">
        <h2 id="specialTitle" className="special-title">Today's Special Pokémon</h2>
        <div className="special-container">
          <PokemonCard
            meta={specialMeta}
            isFav={favorites.includes(specialMeta.name)}
            onToggleFav={onToggleFav}
            onOpen={onOpen}
          />
        </div>
      </div>
    </section>
  );
}
