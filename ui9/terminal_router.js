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




/**
 * SOVEREIGN SUPREME AGGREGATOR
 * Mengumpulkan seluruh data tabel dari Shard tanpa terkecuali.
 */
async function getSupremeData(contractId) {
    try {
        // HANDSHAKE: Cari data dasar di FB4 (Mission Board)
        const snapMission = await getTerminal('FB4_BOARD').ref(`kontrak_mission/${contractId}`).once('value');
        if (!snapMission.exists()) return null;
        
        const m = snapMission.val();
        const masterDB = getTerminal('FB1_MASTER');
        const packet = { mission: m, adventurer: null, requester: null, timestamp: Date.now() };

        // --- DEEP MINING: ADVENTURER SIDE ---
        if (m.adventurer_nick) {
            const snapIdx = await masterDB.ref(`adventurer_index`).orderByChild('nickname').equalTo(m.adventurer_nick).once('value');
            if (snapIdx.exists()) {
                const meta = Object.values(snapIdx.val())[0];
                const shard = getTerminal(meta.shard_id);
                const id = meta.id_adv;

                // SEDOT SEMUA TABEL ADVENTURER (8 Tabel Utama)
                const [con, cox, dia, exp, inv, jdg, pro, rep] = await Promise.all([
                    shard.ref(`adventurer_contracts/${id}`).once('value'),
                    shard.ref(`adventurer_coxin/${id}`).once('value'),
                    shard.ref(`adventurer_diagram/${id}`).once('value'),
                    shard.ref(`adventurer_experience/${id}`).once('value'),
                    shard.ref(`adventurer_inventory/${id}`).once('value'),
                    shard.ref(`adventurer_judge/${id}`).once('value'),
                    shard.ref(`adventurer_profile/${id}`).once('value'),
                    shard.ref(`adventurer_reputation/${id}`).once('value')
                ]);

                packet.adventurer = {
                    meta: meta,
                    contracts: con.val(),
                    coxin: cox.val(),
                    diagram: dia.val(),
                    experience: exp.val(),
                    inventory: inv.val(),
                    judge: jdg.val(),
                    profile: pro.val(),
                    reputation: rep.val()
                };
            }
        }

        // --- DEEP MINING: REQUESTER SIDE ---
        if (m.requester_nick) {
            const snapRIdx = await masterDB.ref(`requester_index`).orderByChild('nickname').equalTo(m.requester_nick).once('value');
            if (snapRIdx.exists()) {
                const rMeta = Object.values(snapRIdx.val())[0];
                const rShard = getTerminal(rMeta.shard_id);
                const rid = rMeta.id_req;

                // SEDOT SEMUA TABEL REQUESTER (5 Tabel Utama)
                const [rPro, rRep, rCox, rInv, rDia] = await Promise.all([
                    rShard.ref(`requester_profile/${rid}`).once('value'),
                    rShard.ref(`requester_reputation/${rid}`).once('value'),
                    rShard.ref(`requester_coxin/${rid}`).once('value'),
                    rShard.ref(`requester_inventory/${rid}`).once('value'),
                    rShard.ref(`requester_diagram/${rid}`).once('value')
                ]);

                packet.requester = {
                    meta: rMeta,
                    profile: rPro.val(),
                    reputation: rRep.val(),
                    coxin: rCox.val(),
                    inventory: rInv.val(),
                    diagram: rDia.val()
                };
            }
        }

        return packet;
    } catch (err) {
        console.error("SUPREME_AGGREGATOR_ERROR:", err);
        return null;
    }
}
