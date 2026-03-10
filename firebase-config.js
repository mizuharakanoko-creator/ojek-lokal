// CONFIGURASI PUSAT FIREBASE OJEK LOKAL
const firebaseConfig = {
    // Silakan isi kode di bawah ini dari Firebase Console (Project Settings)
    apiKey: "AIzaSyAXXXXXXXXXXXXXXXXXXXXXXXXXXXX", 
    authDomain: "ojeklokal-42b84.firebaseapp.com",
    
    // URL Database Anda
    databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    
    projectId: "ojeklokal-42b84",
    storageBucket: "ojeklokal-42b84.appspot.com",
    
    // Silakan isi kode di bawah ini dari Firebase Console
    messagingSenderId: "XXXXXXXXXXXX",
    appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXXXXXX"
};

// Inisialisasi Firebase (Versi Compatibility agar cocok dengan script di HTML)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Variabel database global yang akan digunakan oleh 15 mesin Anda
const db = firebase.database();

console.log("Firebase terhubung ke: " + firebaseConfig.databaseURL);
