// ==========================================
// TERMINAL ROUTER & MULTI-FIREBASE MANAGER
// ==========================================

// 1. Konfigurasi 5 Terminal Firebase (Ganti URL dengan Firebase asli kamu)
const TERMINAL_URLS = {
    FB1_MASTER: "https://data1-fe8b7-default-rtdb.asia-southeast1.firebasedatabase.app/",     // Data Akun & Buku Induk
    FB2_RUNNER: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",    // Status Adventurer Online
    FB3_DIRECTORY: "https://requester-2c6d9-default-rtdb.asia-southeast1.firebasedatabase.app/",    // Data Requester Zone
    FB4_BOARD: "https://biding-c8f01-default-rtdb.asia-southeast1.firebasedatabase.app/",      // Misi Open & Bids
    FB5_DEAL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/"         // Chat & Kontrak Privat
};

// 2. Tempat menyimpan instance koneksi agar tidak dobel (Hemat Kuota)
window.FirebaseInstances = {};

// 3. Fungsi Pemanggil Terminal (On-Demand Connection)
function getTerminal(terminalName) {
    const url = TERMINAL_URLS[terminalName];
    if (!url) {
        console.error("TERMINAL ROUTER ERROR: Terminal " + terminalName + " tidak ditemukan!");
        return null;
    }

    // Jika belum konek, buat koneksi baru
    if (!window.FirebaseInstances[terminalName]) {
        console.log(`[ROUTER] Membuka jalur ke: ${terminalName}`);
        const app = firebase.initializeApp({ databaseURL: url }, "APP_" + terminalName);
        window.FirebaseInstances[terminalName] = app.database();
    }
    
    // Jika sudah konek, pakai yang ada (Tidak makan limit)
    return window.FirebaseInstances[terminalName];
}

// 4. Fungsi Buku Induk: Tanya Firebase 1 untuk cari lokasi Misi
async function cariLokasiMisi(idMisi) {
    const masterDB = getTerminal('FB1_MASTER');
    try {
        const snap = await masterDB.ref(`buku_induk/misi/${idMisi}`).once('value');
        if (snap.exists()) {
            return snap.val().lokasi_terminal; // Mengembalikan string 'FB4_BOARD' dll
        } else {
            throw new Error("Misi tidak terdaftar di Buku Induk.");
        }
    } catch (e) {
        console.error("Gagal melacak misi:", e);
        return null;
    }
}
