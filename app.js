// Elementos DOM
const storeSection = document.getElementById("store-section");
const multiplayerSection = document.getElementById("multiplayer-section");
const emulatorWrapper = document.getElementById("emulator-wrapper");

const navBtnEmu = document.getElementById("nav-btn-emu");
const navBtnStore = document.getElementById("nav-btn-store");
const navBtnMulti = document.getElementById("nav-btn-multi");

const btnGotoImport = document.getElementById("btn-goto-import");
const romInput = document.getElementById("rom-input");
const btnSaveLocal = document.getElementById("btn-save-local");
const btnLoadLocal = document.getElementById("btn-load-local");

// Explorador DOM
const folderView = document.getElementById("folder-view");
const folderContentView = document.getElementById("folder-content-view");
const folderTitleDisplay = document.getElementById("folder-title-display");
const gamesInFolderList = document.getElementById("games-in-folder-list");
const btnBackFolders = document.getElementById("btn-back-folders");

// Multijugador DOM
const btnCreateRoom = document.getElementById("btn-create-room");
const btnJoinRoom = document.getElementById("btn-join-room");
const hostInfo = document.getElementById("host-info");
const myRoomCode = document.getElementById("my-room-code");
const inputRoomCode = document.getElementById("input-room-code");
const multiStatus = document.getElementById("multi-status");

let romActualNombre = "partida_gba";
let peer = null;
let connection = null;

// ==========================================
// CONTROL DE VISTAS (NAVEGACIÓN)
// ==========================================
function switchView(viewName) {
  storeSection.classList.add("hidden");
  multiplayerSection.classList.add("hidden");
  emulatorWrapper.classList.add("hidden");

  navBtnEmu.classList.remove("active");
  navBtnStore.classList.remove("active");
  navBtnMulti.classList.remove("active");

  if (viewName === "emu") {
    emulatorWrapper.classList.remove("hidden");
    navBtnEmu.classList.add("active");
  } else if (viewName === "store") {
    storeSection.classList.remove("hidden");
    navBtnStore.classList.add("active");
  } else if (viewName === "multi") {
    multiplayerSection.classList.remove("hidden");
    navBtnMulti.classList.add("active");
  }
}

navBtnEmu.addEventListener("click", () => switchView("emu"));
navBtnStore.addEventListener("click", () => switchView("store"));
navBtnMulti.addEventListener("click", () => switchView("multi"));

// ==========================================
// IMPORTACIÓN Y EMULADOR
// ==========================================
btnGotoImport.addEventListener("click", () => romInput.click());

romInput.addEventListener("change", (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
    romActualNombre = archivo.name;
    const romUrl = URL.createObjectURL(archivo);
    iniciarEmulador(romUrl);
  }
});

function iniciarEmulador(urlJuego) {
  switchView("emu");
  document.getElementById("game").innerHTML = "";

  window.EJS_player = "#game";
  window.EJS_core = "gba";
  window.EJS_gameUrl = urlJuego;
  window.EJS_pathtodata = "https://raw.githack.com/EmulatorJS/EmulatorJS/main/data/";

  const script = document.createElement("script");
  script.src = "https://raw.githack.com/EmulatorJS/EmulatorJS/main/data/loader.js";
  document.body.appendChild(script);
}

// ==========================================
// SISTEMA MULTIJUGADOR P2P (PeerJS)
// ==========================================
btnCreateRoom.addEventListener("click", () => {
  multiStatus.textContent = "ESTADO: Creando sala...";
  
  peer = new Peer();

  peer.on("open", (id) => {
    hostInfo.classList.remove("hidden");
    myRoomCode.textContent = id;
    multiStatus.textContent = "ESTADO: Esperando que el Jugador 2 se conecte...";
  });

  peer.on("connection", (conn) => {
    connection = conn;
    multiStatus.textContent = "ESTADO: ¡Jugador 2 Conectado exitosamente!";
    alert("¡Un jugador se ha unido a tu sala! Selecciona una ROM en el explorador para empezar.");
    switchView("store");
  });
});

btnJoinRoom.addEventListener("click", () => {
  const code = inputRoomCode.value.trim();
  if (!code) return alert("Por favor ingresa un código de sala válido.");

  multiStatus.textContent = "ESTADO: Conectando con la sala...";
  peer = new Peer();

  peer.on("open", () => {
    connection = peer.connect(code);

    connection.on("open", () => {
      multiStatus.textContent = "ESTADO: ¡Conectado al Anfitrión!";
      alert("¡Conexión establecida! El Anfitrión seleccionará el juego.");
      switchView("store");
    });
  });
});

// ==========================================
// CARPETAS Y ARCHIVOS GITHUB
// ==========================================
function cargarJuegosAutomaticos() {
  const repoOwner = "Lucas2026apks";
  const repoName = "Room-gba";
  const extensionImagen = ".png";

  const categoriasJuegos = {
    "Super Mario": [
      "Super Mario Bros. 3.gba",
      "Mario vs Donkey Kong .gba",
      "Classic NES Series - Super Mario Bros.gba",
      "Dr. Mario.gba",
      "Mario & Luigi - Superstar Saga.gba",
      "Mario Kart - Super Circuit.gba",
      "Super Mario Advance 2 - Super Mario World.gba",
      "Super Mario Advance 3 - Yoshi's Island .gba"
    ],
    "Sonic": [
      "Sonic Advance (Europe).gba"
    ],
    "Mega Man": [
      "Mega Man & Bass.gba"
    ],
    "Acción y Clásicos": [
      "Tekken Advance (Europe).gba",
      "Geometry_Dash.gba",
      "Metroid Fusion.gba",
      "Pac-Man.gba",
      "Gradius Galaxies.gba",
      "Crazy Taxi.gba",
      "Doom.gba",
      "Metal Slug Advance.gba"
    ]
  };

  folderView.classList.remove("hidden");
  folderContentView.classList.add("hidden");
  folderView.innerHTML = "";

  for (const [nombreCategoria, listaArchivos] of Object.entries(categoriasJuegos)) {
    const folderItem = document.createElement("div");
    folderItem.className = "folder-card";
    folderItem.innerHTML = `
      <div style="font-size: 28px;">📁</div>
      <div>
        <strong style="color: #fff; font-size: 14px; display:block;">${nombreCategoria}</strong>
        <span style="font-size: 12px; color: var(--neon-purple);">${listaArchivos.length} ROMs</span>
      </div>
    `;

    folderItem.addEventListener("click", () => {
      abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen);
    });

    folderView.appendChild(folderItem);
  }
}

function abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen) {
  folderView.classList.add("hidden");
  folderContentView.classList.remove("hidden");
  folderTitleDisplay.innerText = `CATEGORÍA: ${nombreCategoria.toUpperCase()} (${listaArchivos.length})`;

  gamesInFolderList.innerHTML = "";

  listaArchivos.forEach(nombreArchivo => {
    const nombreBonito = nombreArchivo.replace(".gba", "").replace(/[-_]/g, " ");
    const romUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@main/${encodeURIComponent(nombreArchivo)}`;
    const nombreImagen = nombreArchivo.replace(".gba", extensionImagen);
    const imagenUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${encodeURIComponent(nombreImagen)}`;

    const itemDiv = document.createElement("div");
    itemDiv.className = "game-item";
    itemDiv.innerHTML = `
      <img src="${imagenUrl}" alt="Cover" class="game-cover" onerror="this.src='https://via.placeholder.com/60?text=GBA'">
      <div class="game-info">
        <span style="font-size: 14px; font-weight: bold; color: #fff;">${nombreBonito}</span>
      </div>
      <div class="game-actions">
        <button class="btn btn-green btn-test" data-rom-url="${romUrl}" data-name="${nombreArchivo}">🎮 JUGAR</button>
        <button class="btn btn-outline btn-download" data-download-url="${romUrl}" data-file-name="${nombreArchivo}">⬇️</button>
      </div>
    `;

    gamesInFolderList.appendChild(itemDiv);
  });

  activarBotonesDeJuego();
}

btnBackFolders.addEventListener("click", () => {
  folderContentView.classList.add("hidden");
  folderView.classList.remove("hidden");
});

function activarBotonesDeJuego() {
  document.querySelectorAll(".btn-test").forEach(button => {
    button.addEventListener("click", (e) => {
      const romUrl = e.target.getAttribute("data-rom-url");
      romActualNombre = e.target.getAttribute("data-name") || "partida_gba";
      if (romUrl) iniciarEmulador(romUrl);
    });
  });

  document.querySelectorAll(".btn-download").forEach(button => {
    button.addEventListener("click", (e) => {
      const downloadUrl = e.target.getAttribute("data-download-url");
      const fileName = e.target.getAttribute("data-file-name");

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
}

// ==========================================
// GUARDADO Y CARGA LOCAL (.SAV)
// ==========================================
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

// Inicializar la app
document.addEventListener("DOMContentLoaded", () => {
  cargarJuegosAutomaticos();
});
