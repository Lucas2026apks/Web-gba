let romActualNombre = "partida_gba";

// Elementos DOM de Inicio y App
const welcomeScreen = document.getElementById("welcome-screen");
const appContainer = document.getElementById("app-container");
const btnSelectGba = document.getElementById("btn-select-gba");
const btnChangeConsole = document.getElementById("btn-change-console");

// Elementos DOM de Secciones Principales
const storeSection = document.getElementById("store-section");
const emulatorModal = document.getElementById("emulatorModal");

// Elementos DOM de Navegación Lateral
const navBtnStore = document.getElementById("nav-btn-store");
const navBtnEmu = document.getElementById("nav-btn-emu");
const btnGotoImport = document.getElementById("btn-goto-import");
const romInput = document.getElementById("rom-input");

// Elementos DOM de Personalización de Tema
const btnToggleTheme = document.getElementById("btn-toggle-theme");
const themeMenu = document.getElementById("theme-menu");

// Elementos DOM de Guardado Local
const btnSaveLocal = document.getElementById("btn-save-local");
const btnLoadLocal = document.getElementById("btn-load-local");

// Elementos DOM de Explorador
const folderView = document.getElementById("folderView");
const folderContentView = document.getElementById("folderContentView");

// ==========================================
// PANTALLA DE INICIO Y NAVEGACIÓN DE CONSOLAS
// ==========================================
if (btnSelectGba) {
  btnSelectGba.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
    cargarJuegosAutomaticos();
  });
}

if (btnChangeConsole) {
  btnChangeConsole.addEventListener("click", () => {
    appContainer.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
  });
}

// ==========================================
// CONTROL DE TEMAS Y PERSONALIZACIÓN
// ==========================================
if (btnToggleTheme && themeMenu) {
  btnToggleTheme.addEventListener("click", () => {
    themeMenu.classList.toggle("hidden");
  });
}

function cambiarTema(nombreTema) {
  document.body.className = ""; // Limpiar temas previos
  if (nombreTema !== "default") {
    document.body.classList.add(`theme-${nombreTema}`);
  }
  localStorage.setItem("gba_theme", nombreTema);
}

// Cargar tema guardado si existe
const temaGuardado = localStorage.getItem("gba_theme");
if (temaGuardado) {
  cambiarTema(temaGuardado);
}

// ==========================================
// CONTROL DE NAVEGACIÓN Y PESTAÑAS
// ==========================================
function switchView(viewName) {
  if (viewName === "store") {
    storeSection.classList.remove("hidden");
    emulatorModal.classList.add("hidden");
    navBtnStore.classList.add("active");
    navBtnEmu.classList.remove("active");
  } else if (viewName === "emu") {
    storeSection.classList.add("hidden");
    emulatorModal.classList.remove("hidden");
    navBtnEmu.classList.add("active");
    navBtnStore.classList.remove("active");
  }
}

// Event Listeners de Navegación
if (navBtnStore) navBtnStore.addEventListener("click", () => switchView("store"));
if (navBtnEmu) navBtnEmu.addEventListener("click", () => switchView("emu"));

// Importar juego desde archivo local .GBA
if (btnGotoImport && romInput) {
  btnGotoImport.addEventListener("click", () => romInput.click());
  romInput.addEventListener("change", (evento) => {
    const archivo = evento.target.files[0];
    if (archivo) {
      romActualNombre = archivo.name;
      const romUrl = URL.createObjectURL(archivo);
      ejecutarJuego(romUrl, archivo.name);
    }
  });
}

// ==========================================
// EXPLORADOR DE CARPETAS Y ROMS
// ==========================================
function cargarJuegosAutomaticos() {
  const repoOwner = "Lucas2026apks";
  const repoName = "Room-gba";
  const extensionImagen = ".png";

  const categoriasJuegos = {
    "Pokémon": [
      "Pokemon - Esmeralda.gba",
      "Pokemon - Rojo fuego.gba",
      "Pokemon - Rubi.gba",
      "Pokemon - Verde hoja.gba",
      "Pokemon - Zafiro.gba",
      "Pokemon - Pinball RZ.gba",
      "Pokemon Mundo misterioso - Equipo de rescate rojo.gba"
    ],
    "Super Mario & Donkey Kong": [
      "Super Mario Advance 2.gba",
      "Super Mario Advance 3.gba",
      "Super Mario Advance 4.gba",
      "Mario vs. Donkey Kong.gba",
      "Mario Party Advance.gba",
      "Mario Golf - Advance Tour.gba",
      "Mario Tennis Power Tour.gba",
      "Donkey Kong Country 1.gba",
      "Donkey Kong Country 2.gba",
      "Donkey Kong Country 3.gba",
      "Wario-Land 4.gba"
    ],
    "Zelda & Metroid": [
      "The Legend of Zelda - A Link to the Past & Four Swords.gba",
      "The Legend of Zelda - The Minish Cap.gba",
      "Metroid - Fusion.gba",
      "Metroid - Zero Mission.gba"
    ],
    "Sonic & Rayman": [
      "Sonic Advance .gba",
      "Sonic Advance 2.gba",
      "Sonic Advance 3.gba",
      "Sonic Battle (E) (M6).gba",
      "Rayman Advance.gba",
      "Rayman 3.gba"
    ],
    "Megaman": [
      "Megaman Zero 1.gba",
      "Megaman_Zero 2.gba",
      "MegaMan Zero 3.gba",
      "MegaMan Zero 4.gba"
    ],
    "Castlevania & Crash": [
      "Castlevania - Aria of Sorrow.gba",
      "Castlevania - Circle Of The Moon.gba",
      "Castlevania - Harmony Of Dissonance.gba",
      "Crash Bandicoot XS.gba",
      "Crash Bandicoot 2 N-Tranced.gba",
      "Crash Bandicoot Fusion.gba",
      "Crash of the Titans.gba"
    ],
    "Dragon Ball & Anime": [
      "Dragon Ball - Advance adventure.gba",
      "Dragon Ball Z - Supersonic Warriors.gba",
      "Dragon Ball Z - The Legacy of Goku II.gba",
      "DragonBall Z Taiketsu.gba",
      "Naruto- Ninja council 2.gba",
      "Digimon - Battle Spirit (E) (M5).gba",
      "Digimon - Battle Spirit 2 (E) (M5).gba",
      "Astroboy - Omega Factor.gba"
    ],
    "RPG & Aventuras": [
      "Final Fantasy I y II.gba",
      "Final Fantasy IV.gba",
      "Final Fantasy V Advance.gba",
      "Final Fantasy VI Advance.gba",
      "Final Fantasy Tactics.gba",
      "Fire Emblem.gba",
      "Fire Emblem- Sword of Seals.gba",
      "Fire Emblem - The Sacred Stones.gba",
      "Kingdom Hearts - Chain of Memories.gba",
      "mother 3.gba"
    ],
    "Acción & Shooters": [
      "0155 - Doom (UE).gba",
      "1579 - Doom II (E).gba",
      "0606 - Duke Nukem Advance (E) (M4).gba",
      "0735 - Contra Hard Spirits (J)(Cezar).gba",
      "1840 - Metal Slug Advance (E).gba",
      "Alien Hominid.gba",
      "Star Wars Episode III - Revenge of the Sith.gba",
      "Batman Begins.gba",
      "Phalanx - The Enforce Fighter A-144.gba"
    ],
    "Carreras & Estrategia": [
      "0263 - Advance Wars (E)(Arrogance).gba",
      "1155 - Advance Wars 2 - Black Hole Rising (E)(Surplus).gba",
      "1742 - Grand Theft Auto Advance (E)(Rising Sun).gba",
      "2172 - Driv3r (E)(Rising Sun).gba",
      "Need for Speed Carbon - Own The City.gba",
      "Crazy Taxi Catch a Ride.gba",
      "Crash Nitro Kart.gba"
    ],
    "Kirby & Plataformas": [
      "Kirby - Nightmare in Dream Land.gba",
      "Kirby - The Amazing Mirror.gba",
      "Drill Dozer.gba",
      "El Laboratorio de Dexter.GBA",
      "Narnia - El leon la bruja y el armario.gba",
      "Piratas del Caribe - El cofre del hombre muerto.gba",
      "Planet Monsters.gba",
      "Planet of the Apes.gba"
    ],
    "Bob Esponja & Pinball": [
      "0177 - SpongeBob SquarePants - SuperSponge (U).gba",
      "0592 - SpongeBob SquarePants - Revenge of the Flying Dutchman (UE).gba",
      "2237 - SpongeBob SquarePants - Lights, Camera, Pants! (E) (M7) [b].gba",
      "2562 - SpongeBob SquarePants - Creature from the Krusty Krab (E) (M8).gba",
      "Pinball Advance.gba"
    ]
  };

  if (!folderView) return;
  folderView.classList.remove("hidden");
  if (folderContentView) folderContentView.classList.add("hidden");
  folderView.innerHTML = "";

  for (const [nombreCategoria, listaArchivos] of Object.entries(categoriasJuegos)) {
    const folderItem = document.createElement("div");
    folderItem.className = "folder-card";
    folderItem.innerHTML = `
      <div style="font-size: 28px;">📁</div>
      <div>
        <strong style="color: #fff; font-size: 14px; display:block;">${nombreCategoria}</strong>
        <span style="font-size: 12px; color: var(--neon-secondary);">${listaArchivos.length} ROMs</span>
      </div>
    `;
    folderItem.addEventListener("click", () => {
      abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen);
    });
    folderView.appendChild(folderItem);
  }
}

function abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen) {
  if (!folderView || !folderContentView) return;
  folderView.classList.add("hidden");
  folderContentView.classList.remove("hidden");
  folderContentView.innerHTML = "";

  const btnVolver = document.createElement("button");
  btnVolver.className = "btn-volver";
  btnVolver.innerHTML = "⬅️ Volver a Categorías";
  btnVolver.addEventListener("click", () => {
    cargarJuegosAutomaticos();
  });
  folderContentView.appendChild(btnVolver);

  const titulo = document.createElement("h2");
  titulo.style.color = "#fff";
  titulo.style.margin = "15px 0";
  titulo.textContent = nombreCategoria;
  folderContentView.appendChild(titulo);

  const gridJuegos = document.createElement("div");
  gridJuegos.className = "grid-juegos";

  listaArchivos.forEach((nombreArchivo) => {
    const nombreSinExt = nombreArchivo.replace(/\.(gba|GBA)$/, "");
    const urlRom = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@main/${encodeURIComponent(nombreArchivo)}`;
    const urlImagen = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${encodeURIComponent(nombreSinExt)}${extensionImagen}`;

    const cardJuego = document.createElement("div");
    cardJuego.className = "game-card";
    cardJuego.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${urlImagen}" alt="${nombreSinExt}" onerror="this.src='https://via.placeholder.com/150x150?text=GBA+Game';">
      </div>
      <div class="card-info">
        <h3>${nombreSinExt}</h3>
        <div class="card-actions">
          <button class="btn-action btn-play" title="Jugar">▶️</button>
          <a href="${urlRom}" download="${nombreArchivo}" class="btn-action btn-download" title="Descargar ROM">⬇️</a>
        </div>
      </div>
    `;

    cardJuego.querySelector(".btn-play").addEventListener("click", () => {
      ejecutarJuego(urlRom, nombreArchivo);
    });

    gridJuegos.appendChild(cardJuego);
  });

  folderContentView.appendChild(gridJuegos);
}

// ==========================================
// INICIALIZACIÓN DEL EMULADOR
// ==========================================
function ejecutarJuego(urlRom, tituloJuego) {
  romActualNombre = tituloJuego;
  switchView("emu");
  document.getElementById("game").innerHTML = "";

  window.EJS_player = "#game";
  window.EJS_core = "gba";
  window.EJS_gameUrl = urlRom;
  window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
  window.EJS_language = "es-ES";

  const script = document.createElement("script");
  script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
  document.body.appendChild(script);
}

// ==========================================
// GUARDADO Y CARGA LOCAL (.SAV)
// ==========================================
if (btnSaveLocal) {
  btnSaveLocal.addEventListener("click", () => {
    if (typeof window.EJS_getSave === "function") {
      window.EJS_getSave((saveData) => {
        if (!saveData) return alert("No hay datos de partida activa para guardar.");
        const blob = new Blob([saveData], { type: "application/octet-stream" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${romActualNombre}.sav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("💾 Partida guardada en tu dispositivo!");
      });
    } else {
      alert("Primero debes iniciar un juego en el emulador.");
    }
  });
}

if (btnLoadLocal) {
  btnLoadLocal.addEventListener("click", () => {
    if (typeof window.EJS_setSave === "function") {
      const inputSave = document.createElement("input");
      inputSave.type = "file";
      inputSave.accept = ".sav";
      inputSave.onchange = (e) => {
        const saveFile = e.target.files[0];
        if (saveFile) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const arrayBuffer = evt.target.result;
            window.EJS_setSave(new Uint8Array(arrayBuffer));
            alert("📂 Partida cargada exitosamente!");
          };
          reader.readAsArrayBuffer(saveFile);
        }
      };
      inputSave.click();
    } else {
      alert("Inicia el emulador antes de cargar la partida.");
    }
  });
}