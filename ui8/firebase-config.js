// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
    databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Inisialisasi Firebase (Hanya jika belum diinisialisasi)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Konstanta Sistem
const APP_VERSION = "1.0.0";
