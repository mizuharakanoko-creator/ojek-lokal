// =========================================================
// 1. KONFIGURASI DASAR FIREBASE
// =========================================================
// Ganti bagian ini dengan data dari Project Settings Firebase Anda
const firebaseConfig = {
  apiKey: "AIza...", 
  authDomain: "ojeklokal-42b84.firebaseapp.com",
  projectId: "ojeklokal-42b84",
  databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "ojeklokal-42b84.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Inisialisasi Firebase App (Cegah inisialisasi ganda)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// =========================================================
// 2. DAFTAR INSTANCE DATABASE (SHARDING)
// =========================================================

// DATABASE UTAMA (Registry & Login)
// Gunakan instance ini untuk tabel 'users_registry' dan 'pendaftaran_pending'
const db = firebase.database(); 

// DATABASE SHARD 1 (Contoh: Area Kuningan Utara)
// Kegunaan: Menangani radar misi & kontrak untuk wilayah Utara agar limit 100 koneksi tidak penuh
const dbKuninganUtara = firebase.app().database("https://ojeklokal-kuningan-utara.firebaseio.com/");

// DATABASE SHARD 2 (Contoh: Area Kuningan Selatan)
// Kegunaan: Menangani transaksi khusus wilayah Selatan
const dbKuninganSelatan = firebase.app().database("https://ojeklokal-kuningan-selatan.firebaseio.com/");


// =========================================================
// 3. LOGIKA PEMILIHAN DATABASE (ROUTING)
// =========================================================

/**
 * Fungsi ini otomatis memilih "langit" (database) mana yang harus dibuka 
 * berdasarkan kode Shard ID user.
 */
function getDatabaseByShard(shardId) {
    // Jika data kosong, kembalikan ke database utama
    if (!shardId) return db;

    // Paksa jadi huruf kecil agar pengecekan tidak error (case-insensitive)
    const id = shardId.toLowerCase();

    // CONTOH LOGIKA:
    // Jika shard_id mengandung kata 'cilimus' atau 'jalaksana', arahkan ke database Utara
    if (id.includes("cilimus") || id.includes("jalaksana")) {
        console.log("Routing to: Shard Kuningan Utara");
        return dbKuninganUtara;
    }

    // Jika shard_id mengandung kata 'kadugede' atau 'darma', arahkan ke database Selatan
    if (id.includes("kadugede") || id.includes("darma")) {
        console.log("Routing to: Shard Kuningan Selatan");
        return dbKuninganSelatan;
    }

    // Jika wilayah tidak terdaftar di atas, gunakan database default (Utama)
    return db;
}
