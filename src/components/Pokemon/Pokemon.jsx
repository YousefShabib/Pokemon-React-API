import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Topbar from "./Topbar";
import PokemonCard from "./PokemonCard";
import DetailsModal from "./DetailsModal";
import { getPokemons, getPokemonDetails } from "./api";
import { FAV_KEY, SPECIAL_KEY, readFavs, writeFavs, todayKey, hash } from "./helpers";
import "./Pokemon.css";

export default function Pokemon() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [favorites, setFavorites] = useState(() => readFavs());
  const [search, setSearch] = useState("");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const [special, setSpecial] = useState(null);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // حساب إزاحة الـ Topbar كـ CSS var
  const topbarRef = useRef(null);
  useEffect(() => {
    const setOffset = () => {
      const h = Math.ceil(topbarRef.current?.getBoundingClientRect().height || 72);
      document.documentElement.style.setProperty("--topbar-offset", `${h + 8}px`);
    };
    setOffset();
    const ro = new ResizeObserver(setOffset);
    if (topbarRef.current) ro.observe(topbarRef.current);
    window.addEventListener("resize", setOffset);
    return () => { try { ro.disconnect(); } catch {}; window.removeEventListener("resize", setOffset); };
  }, []);

  // جلب البيانات + اختيار Today’s Special مع كاش
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getPokemons();
        const details = await Promise.all(list.map(p => getPokemonDetails(p.url).catch(() => null)));
        const clean = details.filter(Boolean);
        if (!alive) return;
        setAll(clean);

        const today = todayKey();
        let chosen = null;
        try {
          const cached = JSON.parse(localStorage.getItem(SPECIAL_KEY));
          if (cached?.date === today && cached?.name) {
            chosen = clean.find(x => x.name === cached.name) || null;
          }
        } catch {}
        if (!chosen && clean.length) {
          const idx = hash(today) % clean.length;
          chosen = clean[idx];
          try { localStorage.setItem(SPECIAL_KEY, JSON.stringify({ date: today, name: chosen.name })); } catch {}
        }
        setSpecial(chosen || null);
      } catch (e) {
        setErr("Failed to load Pokémons");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // مزامنة favorite
  useEffect(() => { writeFavs(favorites); }, [favorites]);

  const toggleFavorite = useCallback((name) => {
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(p => {
      const byName = p.name.toLowerCase().includes(q);
      const byFav = !showFavsOnly || favorites.includes(p.name);
      return byName && byFav;
    });
  }, [all, search, showFavsOnly, favorites]);

  const openDetails = useCallback((p) => { setSelected(p); setOpen(true); }, []);
  const closeDetails = useCallback(() => setOpen(false), []);

  if (err) return <div className="status error">{err}</div>;
  if (loading) return <div className="status">Loading…</div>;

  return (
    <>
      <Topbar
        ref={topbarRef}
        search={search}
        setSearch={setSearch}
        showFavsOnly={showFavsOnly}
        setShowFavsOnly={setShowFavsOnly}
      />

      {/* Today’s Special */}
      <section className="special" aria-labelledby="specialTitle">
        <div className="special-inner">
          <h2 id="specialTitle" className="special-title">Today’s Special Pokémon</h2>
          <div className="special-container">
            {special && (
              <PokemonCard
                p={special}
                isFav={favorites.includes(special.name)}
                onToggleFav={toggleFavorite}
                onOpen={openDetails}
              />
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid">
        {filtered.map(p => (
          <PokemonCard
            key={p.name}
            p={p}
            isFav={favorites.includes(p.name)}
            onToggleFav={toggleFavorite}
            onOpen={openDetails}
          />
        ))}
      </div>

      {/* Modal */}
      <DetailsModal open={open} onClose={closeDetails} p={selected} />
    </>
  );
}
