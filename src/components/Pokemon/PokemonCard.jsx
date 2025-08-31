export default function PokemonCard({ p, isFav, onToggleFav, onOpen }) {
    return (
      <div className={`card ${isFav ? "is-fav" : ""}`} onClick={() => onOpen(p)}>
        <button
          className={`heart ${isFav ? "active" : ""}`}
          aria-label="Toggle favorite"
          title="Favorite"
          onClick={(e) => { e.stopPropagation(); onToggleFav(p.name); }}
        >
          ♥
        </button>
        <div className="card-media">
          {p.image ? (
            <img src={p.image} alt={p.name} loading="lazy" />
          ) : (
            <div className="img-fallback">No Image</div>
          )}
        </div>
        <h3 className="card-title">{p.name}</h3>
      </div>
    );
  }
  