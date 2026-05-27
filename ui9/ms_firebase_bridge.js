/* ===================================================================
   MS_FIREBASE_BRIDGE.JS
   Role: Firebase Initialization & Global Database Reference Hook
   =================================================================== */

// Konfigurasi Firebase bawaan dari kode asli Anda
const firebaseConfig = {
    databaseURL: "https://cyber-quest-ojek-default-rtdb.firebaseio.com"
};

// Pastikan Firebase tidak diinisialisasi ulang jika skrip termuat ganda
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Deklarasi Node Referensi Database Global sesuai kode asli
const db = firebase.database();
const FB4_BOARD = db.ref("B4_BOARD");

console.log("[SYS] Firebase Bridge Connected. FB4_BOARD Reference Locked.");
