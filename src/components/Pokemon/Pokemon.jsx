import React, { useEffect, useState } from "react";
import Topbar from "./Topbar";
import SimpleModal from "./SimpleModal";
import SpecialSection from "./SpecialSection";
import PokemonGrid from "./PokemonGrid";
import ModalContent from "./ModalContent";
import Status from "./Status";
import { getPokemons } from "./api";
import { readFavs, writeFavs } from "./helpers";
import "./Pokemon.css";

export default function Pokemon() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [favorites, setFavorites] = useState(() => readFavs());
  const [search, setSearch] = useState("");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const [specialMeta, setSpecialMeta] = useState(null); 
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const names = await getPokemons(120);
        if (!live) return;
        setList(names);
        setSpecialMeta(names[0] || null); 
      } catch {
        setErr("Failed to load Pokémons");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => { writeFavs(favorites); }, [favorites]);

  const toggleFavorite = (name) =>
    setFavorites(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const openDetails = (pFull) => { setSelected(pFull); setOpen(true); };
  const closeDetails = () => { setOpen(false); };

  const q = search.trim().toLowerCase();
  const filtered = list.filter(m =>
    m.name.toLowerCase().includes(q) && (!showFavsOnly || favorites.includes(m.name))
  );

  if (err) return <Status type="error">{err}</Status>;
  if (loading) return <Status>Loading…</Status>;

  return (
    <>
      <Topbar
        search={search}
        setSearch={setSearch}
        showFavsOnly={showFavsOnly}
        setShowFavsOnly={setShowFavsOnly}
      />

      <SpecialSection
        specialMeta={specialMeta}
        favorites={favorites}
        onToggleFav={toggleFavorite}
        onOpen={openDetails}
      />

      <PokemonGrid
        list={filtered}
        favorites={favorites}
        onToggleFav={toggleFavorite}
        onOpen={openDetails}
      />

      <SimpleModal open={open} onClose={closeDetails}>
        <ModalContent p={selected} />
      </SimpleModal>
    </>
  );
}
