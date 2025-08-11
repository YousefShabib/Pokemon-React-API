import { useEffect } from "react";
import "./Pokemon.css";

export default function Pokemon() {
    useEffect(() => {
        const FAV_KEY = "favorites";
        const SPECIAL_KEY = "dailySpecial";

        const readFavs = () => {
            try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
            catch { return []; }
        };
        const writeFavs = (arr) => localStorage.setItem(FAV_KEY, JSON.stringify(arr));

        let favs = readFavs();
        let showFavsOnly = false;

        function getPokemons() {
            return fetch("https://pokeapi.co/api/v2/pokemon?limit=500&offset=0")
                .then(r => r.json())
                .then(d => d.results);
        }

        function getPokemonDetails(url) {
            return fetch(url)
                .then(r => r.json())
                .then(data => ({
                    name: data.name,
                    image: data.sprites.front_default,
                    images: [
                        data.sprites.front_default,
                        data.sprites.back_default,
                        data.sprites.front_shiny,
                        data.sprites.back_shiny
                    ].filter(Boolean),
                    height: data.height,
                    weight: data.weight,
                    types: data.types.map(t => t.type.name).join(", ")
                }));
        }

        const todayKey = () => new Date().toISOString().slice(0, 10);
        const hash = (s) => {
            let h = 2166136261;
            for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
            return (h >>> 0);
        };
        function pickDailySpecial(list) {
            const today = todayKey();
            try {
                const cached = JSON.parse(localStorage.getItem(SPECIAL_KEY));
                if (cached?.date === today && cached?.name) {
                    return list.find(p => p.name === cached.name) || null;
                }
            } catch { }
            const idx = hash(today) % list.length;
            const chosen = list[idx];
            try { localStorage.setItem(SPECIAL_KEY, JSON.stringify({ date: today, name: chosen.name })); } catch { }
            return chosen;
        }

        function applyFilters() {
            const searchValue = (document.getElementById("search")?.value || "").toLowerCase();
            const cards = document.querySelectorAll(".grid .card");
            cards.forEach(card => {
                const name = card.querySelector(".card-title").innerText.toLowerCase();
                const isFav = card.classList.contains("is-fav");
                const visible = name.includes(searchValue) && (!showFavsOnly || isFav);
                card.style.display = visible ? "block" : "none";
            });
        }

        function syncFavoriteUI(name, isFav) {
            document.querySelectorAll(".card").forEach(el => {
                const t = el.querySelector(".card-title");
                if (t && t.textContent === name) {
                    el.classList.toggle("is-fav", isFav);
                    const heart = el.querySelector(".heart");
                    if (heart) heart.classList.toggle("active", isFav);
                }
            });
        }

        function toggleFavorite(name, cardEl, heartEl) {
            const idx = favs.indexOf(name);
            if (idx === -1) {
                favs.push(name);
                writeFavs(favs);
                cardEl.classList.add("is-fav");
                heartEl.classList.add("active");
                syncFavoriteUI(name, true);
            } else {
                favs.splice(idx, 1);
                writeFavs(favs);
                cardEl.classList.remove("is-fav");
                heartEl.classList.remove("active");
                syncFavoriteUI(name, false);
            }
            applyFilters();
        }

        function generatePokemonCard(details) {
            const card = document.createElement("div");
            card.className = "card";
            if (favs.includes(details.name)) card.classList.add("is-fav");

            card.innerHTML = `
        <button class="heart" aria-label="Toggle favorite" title="Favorite">♥</button>
        <div class="card-media">
          <img src="${details.image}" alt="${details.name}" loading="lazy"/>
        </div>
        <h3 class="card-title">${details.name}</h3>
      `;

            const heartBtn = card.querySelector(".heart");
            heartBtn.classList.toggle("active", favs.includes(details.name));
            heartBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(details.name, card, heartBtn);
            });

            card.addEventListener("click", function () {
                let index = 0;
                const dialog = document.getElementById("pokemonDialog");
                const imgEl = document.getElementById("dialogImage");
                imgEl.src = details.images.length ? details.images[0] : details.image;
                document.getElementById("dialogName").innerText = details.name;
                document.getElementById("dialogHeight").innerText = details.height ?? "-";
                document.getElementById("dialogWeight").innerText = details.weight ?? "-";
                document.getElementById("dialogTypes").innerText = details.types ?? "-";
                const prevBtn = document.querySelector(".prev");
                const nextBtn = document.querySelector(".next");
                const imgs = details.images.length ? details.images : [details.image];
                prevBtn.onclick = function () {
                    index = (index - 1 + imgs.length) % imgs.length;
                    imgEl.src = imgs[index];
                };
                nextBtn.onclick = function () {
                    index = (index + 1) % imgs.length;
                    imgEl.src = imgs[index];
                };
                dialog.showModal();
            });

            return card;
        }

        function renderPokemonCard(details, grid) {
            const card = generatePokemonCard(details);
            grid.appendChild(card);
        }

        function handlePokemonError(error) {
            console.error("Failed to load Pokemon details:", error);
        }

        // topbar offset
        const topbar = document.querySelector(".topbar");
        const setOffset = () => {
            if (!topbar) return;
            const h = Math.ceil(topbar.getBoundingClientRect().height);
            document.documentElement.style.setProperty("--topbar-offset", `${h + 8}px`);
        };
        setOffset();
        const ro = new ResizeObserver(setOffset);
        if (topbar) ro.observe(topbar);
        window.addEventListener("resize", setOffset);

        // Load and render
        function displayPokemons() {
            const grid = document.getElementById("pokemonGrid");
            const specialHolder = document.getElementById("specialContainer");

            getPokemons()
                .then(async (pokemons) => {
                    // render daily special
                    const specialMeta = pickDailySpecial(pokemons);
                    if (specialMeta && specialHolder) {
                        try {
                            const details = await getPokemonDetails(specialMeta.url);
                            const specialCard = generatePokemonCard(details);
                            specialCard.classList.add("special-card");
                            specialHolder.appendChild(specialCard);
                        } catch (e) { console.error("Failed to load special:", e); }
                    }

                    // render grid
                    pokemons.forEach(poke => {
                        getPokemonDetails(poke.url)
                            .then(details => renderPokemonCard(details, grid))
                            .catch(handlePokemonError);
                    });
                })
                .catch(error => console.error("Error fetching Pokemon list:", error));
        }

        displayPokemons();

        // events & cleanup
        const onEsc = (e) => {
            if (e.key === "Escape") {
                const dialog = document.getElementById("pokemonDialog");
                if (dialog.open) dialog.close();
            }
        };
        document.addEventListener("keydown", onEsc);

        const dialog = document.getElementById("pokemonDialog");
        const onClickOutside = function (e) {
            const content = document.querySelector(".dialog-content");
            if (!content.contains(e.target)) this.close();
        };
        dialog.addEventListener("click", onClickOutside);

        const searchInput = document.getElementById("search");
        const onInput = () => applyFilters();
        searchInput.addEventListener("input", onInput);

        const favToggleBtn = document.getElementById("favToggle");
        const onFavToggle = () => {
            showFavsOnly = !showFavsOnly;
            favToggleBtn.setAttribute("aria-pressed", String(showFavsOnly));
            favToggleBtn.textContent = showFavsOnly ? "Show All" : "Show Favorites";
            applyFilters();
        };
        favToggleBtn.addEventListener("click", onFavToggle);

        return () => {
            document.removeEventListener("keydown", onEsc);
            dialog?.removeEventListener("click", onClickOutside);
            searchInput?.removeEventListener("input", onInput);
            favToggleBtn?.removeEventListener("click", onFavToggle);
            try { ro.disconnect(); } catch { }
            window.removeEventListener("resize", setOffset);
        };
    }, []);

    return (
        <>
            <div className="topbar">
                <input type="text" id="search" placeholder="Search Pokemon" />
                <button id="favToggle" className="fav-toggle" aria-pressed="false">Show Favorites</button>
            </div>

            {/* Today’s Special */}
            <section className="special" aria-labelledby="specialTitle">
                <div className="special-inner">
                    <h2 id="specialTitle" className="special-title">Today’s Special Pokémon</h2>
                    <div id="specialContainer" className="special-container"></div>
                </div>
            </section>

            <div id="pokemonGrid" className="grid"></div>

            <dialog id="pokemonDialog" className="dialog">
                <div className="dialog-content">
                    <div className="dialog-left">
                        <div className="carousel">
                            <button className="prev" aria-label="Previous">&#10094;</button>
                            <img id="dialogImage" alt="pokemon image" />
                            <button className="next" aria-label="Next">&#10095;</button>
                        </div>
                    </div>
                    <div className="dialog-info">
                        <h2 id="dialogName"></h2>
                        <p><strong>Height:</strong> <span id="dialogHeight"></span></p>
                        <p><strong>Weight:</strong> <span id="dialogWeight"></span></p>
                        <p><strong>Types:</strong> <span id="dialogTypes"></span></p>
                    </div>
                </div>
            </dialog>
        </>
    );
}
