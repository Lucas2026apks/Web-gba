// 1. Importar Firebase desde los servidores de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

// 3. Obtener elementos del HTML
const authSection = document.getElementById("auth-section");
const gameSection = document.getElementById("game-section");
const storeSection = document.getElementById("store-section");
const rankingSection = document.getElementById("ranking-section");
const emulatorWrapper = document.getElementById("emulator-wrapper");
const userEmailDisplay = document.getElementById("user-email-display");
const authError = document.getElementById("auth-error");

const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");

const btnGotoStore = document.getElementById("btn-goto-store");
const btnGotoImport = document.getElementById("btn-goto-import");
const btnBackStore = document.getElementById("btn-back-store");
const romInput = document.getElementById("rom-input");

const btnSaveCloud = document.getElementById("btn-save-cloud");
const btnLoadCloud = document.getElementById("btn-load-cloud");

let intervaloTiempo = null;

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
    rankingSection.classList.remove("hidden");
    
    storeSection.classList.add("hidden");
    emulatorWrapper.classList.add("hidden");
    
    userEmailDisplay.innerText = user.email;
    cargarTopGlobal();
  } else {
    authSection.classList.remove("hidden");
    gameSection.classList.add("hidden");
    storeSection.classList.add("hidden");
    rankingSection.classList.add("hidden");
    emulatorWrapper.classList.add("hidden");
    emailInput.value = "";
    passwordInput.value = "";
    
    if (intervaloTiempo) clearInterval(intervaloTiempo);
  }
});

// ==========================================
// NAVEGACIÓN DE BOTONES PRINCIPALES
// ==========================================

btnGotoStore.addEventListener("click", () => {
  gameSection.classList.add("hidden");
  storeSection.classList.remove("hidden");
  cargarJuegosAutomaticos();
});

btnBackStore.addEventListener("click", () => {
  storeSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
});

btnGotoImport.addEventListener("click", () => {
  romInput.click();
});

// ==========================================
// SECCIÓN DEL EMULADOR GBA (EmulatorJS)
// ==========================================

romInput.addEventListener("change", (evento) => {
  const archivo = evento.target.files[0];
  if (archivo) {
    const romUrl = URL.createObjectURL(archivo);
    iniciarEmulador(romUrl);
  }
});

function iniciarEmulador(urlJuego) {
  emulatorWrapper.classList.remove("hidden");
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
// TIENDA DE JUEGOS (GITHUB) CON IMÁGENES AUTOMÁTICAS
// ==========================================

function cargarJuegosAutomaticos() {
  const repoOwner = "Lucas2026apks"; 
  const repoName = "Room-gba";     
  
  // Cambia a ".jpg" si tus imágenes guardadas en GitHub usan esa extensión
  const extensionImagen = ".png"; 
  
  const misJuegos = [
    "Tekken Advance (Europe).gba",
    "Geometry_Dash.gba"
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
    
    // Genera automáticamente la URL de la imagen en tu GitHub usando el nombre exacto del ROM
    const nombreImagen = nombreArchivo.replace(".gba", extensionImagen);
    const imagenUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${encodeURIComponent(nombreImagen)}`;

    const itemDiv = document.createElement("div");
    itemDiv.className = "game-item";
    itemDiv.innerHTML = `
      <img src="${imagenUrl}" alt="Cover" class="game-cover" onerror="this.src='https://via.placeholder.com/60?text=GBA'">
      <div class="game-info">
        <span style="font-size: 13px; font-weight: bold; color: #fff; word-break: break-all;">🎮 ${nombreBonito}</span>
        <div class="game-actions">
          <button class="btn-test" data-rom-url="${romUrl}">Probar</button>
          <button class="btn-download" data-download-url="${romUrl}" data-file-name="${nombreArchivo}">⬇️ Descargar</button>
        </div>
      </div>
    `;

    contenedorLista.appendChild(itemDiv);
  });

  activarBotonesDeJuego();
}

function activarBotonesDeJuego() {
  // Botón "Probar" (Inicia el juego en el emulador web)
  document.querySelectorAll(".btn-test").forEach(button => {
    button.addEventListener("click", (e) => {
      const romUrl = e.target.getAttribute("data-rom-url");
      if (romUrl) {
        storeSection.classList.add("hidden");
        iniciarEmulador(romUrl);
      }
    });
  });

  // Botón "⬇️ Descargar" (Descarga la ROM directamente para jugar offline)
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
// CONTROL DE TIEMPO Y TOP GLOBAL (FIRESTORE)
// ==========================================

function iniciarContadorTiempo(userId) {
  if (intervaloTiempo) clearInterval(intervaloTiempo);

  intervaloTiempo = setInterval(async () => {
    await guardarTiempoEnFirestore(userId, 1);
  }, 1000);
}

async function guardarTiempoEnFirestore(userId, segundosNuevos) {
  try {
    const userRef = doc(db, "usuarios", userId);
    const userDoc = await getDoc(userRef);

    let tiempoTotal = segundosNuevos;
    let emailUser = auth.currentUser ? auth.currentUser.email : "Anónimo";

    if (userDoc.exists()) {
      const data = userDoc.data();
      tiempoTotal = (data.tiempoJugado || 0) + segundosNuevos;
    }

    await setDoc(userRef, {
      email: emailUser,
      tiempoJugado: tiempoTotal
    }, { merge: true });

    cargarTopGlobal();
  } catch (error) {
    console.error("Error al actualizar el tiempo:", error);
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
      rankingList.innerHTML = "<p style='text-align:center; font-size:12px; color:#9ca3af;'>Aún no hay registros de tiempo.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const emailOculto = data.email ? data.email.split("@")[0] + "@..." : "Usuario";
      
      const horas = Math.floor(data.tiempoJugado / 3600);
      const minutos = Math.floor((data.tiempoJugado % 3600) / 60);
      const segundos = data.tiempoJugado % 60;

      const itemDiv = document.createElement("div");
      itemDiv.className = "game-item";
      itemDiv.innerHTML = `
        <span style="font-size: 13px; color: #cbd5e1;">👤 ${emailOculto}</span>
        <span style="font-size: 13px; font-weight: bold; color: #4ade80;">⏱️ ${horas}h ${minutos}m ${segundos}s</span>
      `;
      rankingList.appendChild(itemDiv);
    });

  } catch (error) {
    console.error("Error al cargar el top global:", error);
  }
}

// ==========================================
// GUARDADO Y CARGA EN LA NUBE (.sav)
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
