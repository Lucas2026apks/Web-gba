// 1. Importar Firebase desde los servidores de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 2. Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxH8yTuTFEbU9U8c7TjM7QVMuJueC9cpw",
  authDomain: "gameboyadvance-de-lucas.firebaseapp.com",
  projectId: "gameboyadvance-de-lucas",
  storageBucket: "gameboyadvance-de-lucas.firebasestorage.app",
  messagingSenderId: "787993004783",
  appId: "1:787993004783:web:aaa29a1242143f07d3691a",
  measurementId: "G-BTJ995LW31"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. Obtener elementos del HTML
const authSection = document.getElementById("auth-section");
const gameSection = document.getElementById("game-section");
const storeSection = document.getElementById("store-section");
const emulatorWrapper = document.getElementById("emulator-wrapper");
const userEmailDisplay = document.getElementById("user-email-display");
const authError = document.getElementById("auth-error");

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");
const romInput = document.getElementById("rom-input");

const btnSaveCloud = document.getElementById("btn-save-cloud");
const btnLoadCloud = document.getElementById("btn-load-cloud");

// ==========================================
// SECCIÓN DE AUTENTICACIÓN
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
    authError.innerText = "Error al iniciar sesión: Verifique sus datos.";
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
  document.getElementById("game").innerHTML = ""; 
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    gameSection.classList.remove("hidden");
    storeSection.classList.remove("hidden");
    emulatorWrapper.classList.remove("hidden");
    userEmailDisplay.innerText = user.email;
    
    // Cargar la tienda de juegos al iniciar sesión
    cargarJuegosAutomaticos();
    
  } else {
    authSection.classList.remove("hidden");
    gameSection.classList.add("hidden");
    storeSection.classList.add("hidden");
    emulatorWrapper.classList.add("hidden");
    emailInput.value = "";
    passwordInput.value = "";
  }
});

// ==========================================
// SECCIÓN DEL EMULADOR GBA
// ==========================================

romInput.addEventListener("change", (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
    const romUrl = URL.createObjectURL(archivo);
    iniciarEmulador(romUrl);
  }
});

// Función central para arrancar EmulatorJS con rutas CDN estables (sin errores CORS)
function iniciarEmulador(urlJuego) {
  document.getElementById("game").innerHTML = "";

  window.EJS_player = "#game";
  window.EJS_core = "gba";
  window.EJS_gameUrl = urlJuego;
  window.EJS_pathtodata = "https://cdn.jsdelivr.net/npm/emulatorjs@latest/data/";

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/emulatorjs@latest/data/loader.js";
  document.body.appendChild(script);
}

// ==========================================
// TIENDA DE JUEGOS (LISTA DIRECTA DESDE GITHUB)
// ==========================================

function cargarJuegosAutomaticos() {
  const repoOwner = "Lucas2026apks"; 
  const repoName = "Room-gba";     
  
  // Lista con Geometry Dash, Tekken y Pokémon
  const misJuegos = [
    "Geometry Dash.gba",
    "Tekken Advance (Europe).gba",
    "Pokemon - Edicion Rojo Fuego (Spain).gba"
  ];

  const contenedorLista = document.getElementById("game-list");
  if (!contenedorLista) return;
  contenedorLista.innerHTML = "";

  if (misJuegos.length === 0) {
    contenedorLista.innerHTML = "<p style='text-align:center; font-size:12px; color:#f87171;'>No hay juegos configurados.</p>";
    return;
  }

  misJuegos.forEach(nombreArchivo => {
    const nombreBonito = nombreArchivo.replace(".gba", "").replace(/[-_]/g, " ");
    const romUrl = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@main/${encodeURIComponent(nombreArchivo)}`;

    const itemDiv = document.createElement("div");
    itemDiv.className = "game-item";
    itemDiv.innerHTML = `
      <span style="font-size: 14px; word-break: break-all; max-width: 60%;">🎮 ${nombreBonito}</span>
      <button class="btn-play-rom" data-rom-url="${romUrl}">Jugar</button>
    `;

    contenedorLista.appendChild(itemDiv);
  });

  activarBotonesDeJuego();
}

function activarBotonesDeJuego() {
  document.querySelectorAll(".btn-play-rom").forEach(button => {
    button.addEventListener("click", (e) => {
      const romUrl = e.target.getAttribute("data-rom-url");
      if (romUrl) {
        iniciarEmulador(romUrl);
      }
    });
  });
}

// ==========================================
// SECCIÓN DE GUARDADO Y CARGA EN LA NUBE (.sav)
// ==========================================

btnSaveCloud.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión para guardar.");
    return;
  }

  try {
    if (typeof window.EJS_getSave === "function") {
      window.EJS_getSave(async (saveData) => {
        if (!saveData) {
          alert("No hay datos de guardado activos todavía.");
          return;
        }

        const storageRef = ref(storage, `saves/${user.uid}/partida.sav`);
        await uploadBytes(storageRef, saveData);
        alert("¡Partida guardada en la nube con éxito! 💾");
      });
    } else {
      alert("El emulador aún no está listo o corriendo un juego.");
    }
  } catch (error) {
    console.error(error);
    alert("Error al guardar: " + error.message);
  }
});

btnLoadCloud.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Debes iniciar sesión para cargar.");
    return;
  }

  try {
    const storageRef = ref(storage, `saves/${user.uid}/partida.sav`);
    const url = await getDownloadURL(storageRef);
    
    const response = await fetch(url);
    const blob = await response.blob();

    if (typeof window.EJS_setSave === "function") {
      window.EJS_setSave(blob);
      alert("¡Partida cargada desde la nube con éxito! ☁️");
    } else {
      alert("Inicia el emulador antes de cargar una partida.");
    }
  } catch (error) {
    console.error(error);
    alert("No se encontró ninguna partida guardada previa en la nube.");
  }
});
