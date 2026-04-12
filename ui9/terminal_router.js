// ==========================================
// TERMINAL ROUTER & MULTI-FIREBASE MANAGER
// ==========================================

// 1. Konfigurasi 5 Terminal Firebase (Ganti URL dengan Firebase asli kamu)
const TERMINAL_URLS = {
    FB1_MASTER: "https://app-master-auth-default-rtdb.firebaseio.com/",     // Data Akun & Buku Induk
    FB2_RUNNER: "https://app-kng-runner-default-rtdb.firebaseio.com/",    // Status Adventurer Online
    FB3_DIRECTORY: "https://app-kng-dir-default-rtdb.firebaseio.com/",    // Data Requester Zone
    FB4_BOARD: "https://app-kng-board-default-rtdb.firebaseio.com/",      // Misi Open & Bids
    FB5_DEAL: "https://app-kng-deal-default-rtdb.firebaseio.com/"         // Chat & Kontrak Privat
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
