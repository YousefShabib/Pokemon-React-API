import { useEffect } from "react";
import "./Pokemon.css";

export default function Pokemon() {
    useEffect(() => {
        const FAV_KEY = "favorites";
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

        function applyFilters() {
            const searchValue = (document.getElementById("search")?.value || "").toLowerCase();
            const cards = document.querySelectorAll(".card");
            cards.forEach(card => {
                const name = card.querySelector(".card-title").innerText.toLowerCase();
                const isFav = card.classList.contains("is-fav");
                const visible = name.includes(searchValue) && (!showFavsOnly || isFav);
                card.style.display = visible ? "block" : "none";
            });
        }

        function toggleFavorite(name, cardEl, heartEl) {
            const idx = favs.indexOf(name);
            if (idx === -1) {
                favs.push(name);
                writeFavs(favs);
                cardEl.classList.add("is-fav");
                heartEl.classList.add("active");
            } else {
                favs.splice(idx, 1);
                writeFavs(favs);
                cardEl.classList.remove("is-fav");
                heartEl.classList.remove("active");
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

        function displayPokemons() {
            const grid = document.getElementById("pokemonGrid");
            getPokemons()
                .then(pokemons => {
                    pokemons.forEach(poke => {
                        getPokemonDetails(poke.url)
                            .then(details => renderPokemonCard(details, grid))
                            .catch(handlePokemonError);
                    });
                })
                .catch(error => console.error("Error fetching Pokemon list:", error));
        }

        displayPokemons();

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
