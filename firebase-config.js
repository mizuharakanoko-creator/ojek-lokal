// CONFIGURASI DATABASE PUSAT
// Ini adalah "Kunci Kontak" untuk menghubungkan ke server Google Firebase

const firebaseConfig = {
    apiKey: "AIzaSyA-XXXX-XXXX-XXXX", // Dapatkan dari Firebase Console
    authDomain: "ojek-lokal-anda.firebaseapp.com",
    databaseURL: "https://ojek-lokal-anda-default-rtdb.firebaseio.com",
    projectId: "ojek-lokal-anda",
    storageBucket: "ojek-lokal-anda.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef12345"
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(); // Database Real-time aktif!

// Export agar bisa dibaca mesin lain (jika menggunakan module)
// Untuk penggunaan HTML biasa, variabel 'db' sudah bisa langsung dipakai di file lain
