import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxH8yTuTFEbU9U8c7TjM7QVMuJueC9cpw",
  authDomain: "gameboyadvance-de-lucas.firebaseapp.com",
  projectId: "gameboyadvance-de-lucas",
  storageBucket: "gameboyadvance-de-lucas.firebasestorage.app",
  messagingSenderId: "787993004783",
  appId: "1:787993004783:web:aaa29a1242143f07d3691a",
  measurementId: "G-BTJ995LW31"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Elementos DOM
const authSection = document.getElementById("auth-section");
const storeSection = document.getElementById("store-section");
const rankingSection = document.getElementById("ranking-section");
const emulatorWrapper = document.getElementById("emulator-wrapper");
const navMenu = document.getElementById("nav-menu");
const userBadge = document.getElementById("user-badge");
const userEmailDisplay = document.getElementById("user-email-display");
const authError = document.getElementById("auth-error");

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");

const navBtnEmu = document.getElementById("nav-btn-emu");
const navBtnStore = document.getElementById("nav-btn-store");
const navBtnRanking = document.getElementById("nav-btn-ranking");
const btnGotoImport = document.getElementById("btn-goto-import");
const romInput = document.getElementById("rom-input");

const btnSaveCloud = document.getElementById("btn-save-cloud");
const btnLoadCloud = document.getElementById("btn-load-cloud");

// Explorador DOM
const folderView = document.getElementById("folder-view");
const folderContentView = document.getElementById("folder-content-view");
const folderTitleDisplay = document.getElementById("folder-title-display");
const gamesInFolderList = document.getElementById("games-in-folder-list");
const btnBackFolders = document.getElementById("btn-back-folders");

let intervaloTiempo = null;

// ==========================================
// CONTROL DE VISTAS (NAVEGACIÓN DASHBOARD)
// ==========================================
function switchView(viewName) {
  storeSection.classList.add("hidden");
  rankingSection.classList.add("hidden");
  emulatorWrapper.classList.add("hidden");

  navBtnEmu.classList.remove("active");
  navBtnStore.classList.remove("active");
  navBtnRanking.classList.remove("active");

  if (viewName === "emu") {
    emulatorWrapper.classList.remove("hidden");
    navBtnEmu.classList.add("active");
  } else if (viewName === "store") {
    storeSection.classList.remove("hidden");
    navBtnStore.classList.add("active");
    cargarJuegosAutomaticos();
  } else if (viewName === "ranking") {
    rankingSection.classList.remove("hidden");
    navBtnRanking.classList.add("active");
    cargarTopGlobal();
  }
}

navBtnEmu.addEventListener("click", () => switchView("emu"));
navBtnStore.addEventListener("click", () => switchView("store"));
navBtnRanking.addEventListener("click", () => switchView("ranking"));

// ==========================================
// AUTENTICACIÓN
// ==========================================
btnRegister.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    authError.innerText = ""; 
  } catch (error) {
    authError.innerText = "Error al registrar: " + error.message;
  }
});

btnLogin.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    authError.innerText = "";
  } catch (error) {
    authError.innerText = "Error: Verifique sus credenciales.";
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  document.getElementById("game").innerHTML = ""; 
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    navMenu.classList.remove("hidden");
    userBadge.classList.remove("hidden");
    userEmailDisplay.innerText = user.email;
    
    switchView("store");
  } else {
    authSection.classList.remove("hidden");
    navMenu.classList.add("hidden");
    userBadge.classList.add("hidden");
    storeSection.classList.add("hidden");
    rankingSection.classList.add("hidden");
    emulatorWrapper.classList.add("hidden");
    
    emailInput.value = "";
    passwordInput.value = "";
    if (intervaloTiempo) clearInterval(intervaloTiempo);
  }
});

// ==========================================
// IMPORTACIÓN Y EMULADOR
// ==========================================
btnGotoImport.addEventListener("click", () => romInput.click());

romInput.addEventListener("change", (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
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

  const user = auth.currentUser;
  if (user) {
    iniciarContadorTiempo(user.uid);
  }
}

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
        <span style="font-size: 12px; color: var(--text-dim);">${listaArchivos.length} ROMs</span>
      </div>
    `;

    folderItem.addEventListener("click", () => {
       abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen);
    });

    folderView.appendChild(folderItem);
  }
}

btnBackFolders.addEventListener("click", () => {
  folderContentView.classList.add("hidden");
  folderView.classList.remove("hidden");
});

function abrirCarpeta(nombreCategoria, listaArchivos, repoOwner, repoName, extensionImagen) {
  folderView.classList.add("hidden");
  folderContentView.classList.remove("hidden");
  folderTitleDisplay.innerText = `Categoría: ${nombreCategoria} (${listaArchivos.length})`;
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
        <button class="btn btn-primary btn-test" data-rom-url="${romUrl}">▶ Jugar</button>
        <button class="btn btn-outline btn-download" data-download-url="${romUrl}" data-file-name="${nombreArchivo}">⬇️</button>
      </div>
    `;
    gamesInFolderList.appendChild(itemDiv);
  });

  activarBotonesDeJuego();
}

function activarBotonesDeJuego() {
  document.querySelectorAll(".btn-test").forEach(button => {
    button.addEventListener("click", (e) => {
      const romUrl = e.target.getAttribute("data-rom-url");
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
// REGISTRO DE TIEMPO FIRESTORE (OPTIMIZADO)
// ==========================================
function iniciarContadorTiempo(userId) {
  if (intervaloTiempo) clearInterval(intervaloTiempo);

  // Actualización diferida cada 10 segundos en lugar de 1 segundo para no saturar Firestore
  intervaloTiempo = setInterval(async () => {
    await guardarTiempoEnFirestore(userId, 10);
  }, 10000);
}

async function guardarTiempoEnFirestore(userId, segundosNuevos) {
  try {
    const userRef = doc(db, "usuarios", userId);
    const userDoc = await getDoc(userRef);

    let tiempoTotal = segundosNuevos;
    let emailUser = auth.currentUser ? auth.currentUser.email : "Anónimo";

    if (userDoc.exists()) {
      tiempoTotal = (userDoc.data().tiempoJugado || 0) + segundosNuevos;
    }

    await setDoc(userRef, { email: emailUser, tiempoJugado: tiempoTotal }, { merge: true });
  } catch (error) {
    console.error("Error tiempo:", error);
  }
}

async function cargarTopGlobal() {
  const rankingList = document.getElementById("ranking-list");
  if (!rankingList) return;

  try {
    const q = query(collection(db, "usuarios"), orderBy("tiempoJugado", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    rankingList.innerHTML = "";

    if (querySnapshot.empty) {
      rankingList.innerHTML = "<p style='text-align:center; font-size:12px; color:var(--text-dim);'>Sin registros de juego.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const emailOculto = data.email ? data.email.split("@")[0] + "@..." : "Usuario";
      
      const horas = Math.floor(data.tiempoJugado / 3600);
      const minutos = Math.floor((data.tiempoJugado % 3600) / 60);

      const itemDiv = document.createElement("div");
      itemDiv.className = "game-item";
      itemDiv.innerHTML = `
        <span style="font-size: 13px; color: #fff; flex:1;">👤 ${emailOculto}</span>
        <span style="font-size: 13px; font-weight: bold; color: #4ade80;">⏱️ ${horas}h ${minutos}m</span>
      `;
      rankingList.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Error ranking:", error);
  }
}

// ==========================================
// CLOUD SAVES (.SAV)
// ==========================================
btnSaveCloud.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Inicia sesión primero.");

  try {
    if (typeof window.EJS_getSave === "function") {
      window.EJS_getSave(async (saveData) => {
        if (!saveData) return alert("No hay datos de guardado activos.");
        const storageRef = ref(storage, `saves/${user.uid}/partida.sav`);
        await uploadBytes(storageRef, saveData);
        alert("¡Partida guardada en la nube con éxito! 💾");
      });
    } else {
      alert("Inicia una partida en el emulador primero.");
    }
  } catch (error) {
    alert("Error al guardar: " + error.message);
  }
});

btnLoadCloud.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Inicia sesión primero.");

  try {
    const storageRef = ref(storage, `saves/${user.uid}/partida.sav`);
    const url = await getDownloadURL(storageRef);
    const response = await fetch(url);
    const blob = await response.blob();

    if (typeof window.EJS_setSave === "function") {
      window.EJS_setSave(blob);
      alert("¡Partida cargada desde la nube! ☁️");
    } else {
      alert("Inicia el emulador antes de cargar la partida.");
    }
  } catch (error) {
    alert("No se encontró partida guardada en la nube.");
  }
});
