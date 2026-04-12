// Konfigurasi Dasar (Tetap satu Project Firebase)
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "ojeklokal-42b84.firebaseapp.com",
  projectId: "ojeklokal-42b84",
  storageBucket: "ojeklokal-42b84.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Inisialisasi App
const app = firebase.initializeApp(firebaseConfig);

// --- MULTI-DATABASE SETUP ---

// 1. Database Utama (Untuk tabel users_registry & pendaftaran)
const db = firebase.database(); 

// 2. Database Shard A (Contoh: khusus wilayah Kuningan Utara)
// Ganti URL dengan URL database baru Anda nanti
const dbShardA = firebase.app().database("https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/");

// 3. Database Shard B (Contoh: khusus wilayah Kuningan Selatan)
const dbShardB = firebase.app().database("https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/");

// Helper untuk memilih database berdasarkan Shard ID user
function getDatabaseByShard(shardId) {
    if (shardId.includes("kuningan")) return dbShardA;
    if (shardId.includes("jalaksana")) return dbShardB;
    return dbShardA; // Default
}
