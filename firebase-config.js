// CONFIGURASI PUSAT FIREBASE OJEK LOKAL
const firebaseConfig = {
    // Silakan isi kode di bawah ini dari Firebase Console (Project Settings)
    apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk", 
    authDomain: "ojeklokal-42b84.firebaseapp.com",
    
    // URL Database Anda
    databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    
    projectId: "ojeklokal-42b84",
    storageBucket: "ojeklokal-42b84.appspot.com",
    
    // Silakan isi kode di bawah ini dari Firebase Console
    messagingSenderId: "320198748498",
    appId: "1:320198748498:web:3e6038249edc6af20b328b"
};

// Inisialisasi Firebase (Versi Compatibility agar cocok dengan script di HTML)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Variabel database global yang akan digunakan oleh 15 mesin Anda
const db = firebase.database();

console.log("Firebase terhubung ke: " + firebaseConfig.databaseURL);
