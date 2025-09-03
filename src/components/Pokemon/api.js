export async function getPokemons() {
  const r = await fetch("https://pokeapi.co/api/v2/pokemon?limit=500&offset=0");
  const d = await r.json();
  return d.results;
}

export async function getPokemonDetails(url) {
  const r = await fetch(url);
  const data = await r.json();
  const images = [
    data.sprites.front_default,
    data.sprites.back_default,
    data.sprites.front_shiny,
    data.sprites.back_shiny,
  ].filter(Boolean);

  return {
    name: data.name,
    image: data.sprites.front_default || images[0] || "",
    images: images.length ? images : (data.sprites.front_default ? [data.sprites.front_default] : []),
    height: data.height,
    weight: data.weight,
    types: (data.types || []).map(t => t.type.name).join(", "),
  };
}
