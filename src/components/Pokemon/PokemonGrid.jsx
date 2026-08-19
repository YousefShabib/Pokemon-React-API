import React from "react";
import PokemonCard from "./PokemonCard";
import EmptyState from "./EmptyState";

export default function PokemonGrid({ list, favorites, onToggleFav, onOpen }) {
  if (!list.length) {
    return (
      <div className="grid">
        <EmptyState
          title="No Pokémon found"
          note="Try another name or disable Favorites-only."
          actionLabel="Clear search"
          onAction={() => {
            const el = document.getElementById("search");
            if (el) el.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid">
      {list.map(meta => (
        <PokemonCard
          key={meta.name}
          meta={meta}
          isFav={favorites.includes(meta.name)}
          onToggleFav={onToggleFav}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
