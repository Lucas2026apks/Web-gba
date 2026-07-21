import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const storage = getStorage(app);