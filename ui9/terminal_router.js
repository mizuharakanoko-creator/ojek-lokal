// ==========================================
// TERMINAL ROUTER & MULTI-FIREBASE MANAGER
// ==========================================

// 1. Konfigurasi 5 Terminal Firebase (Ganti URL dengan Firebase asli kamu)
const TERMINAL_URLS = {
    FB1_MASTER: "https://data1-fe8b7-default-rtdb.asia-southeast1.firebasedatabase.app/",     // Data Akun & Buku Induk
    FB3_DIRECTORY: "https://requester-2c6d9-default-rtdb.asia-southeast1.firebasedatabase.app/",    // Data Requester Zone
    FB4_BOARD: "https://biding-c8f01-default-rtdb.asia-southeast1.firebasedatabase.app/",      // Misi Open & Bids
    FB5_DEAL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",         // Chat & Kontrak Privat


    // FB2_RUNNER = ADV KUNINGAN
    FB2_RUNNER: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",    // Status Adventurer Online
    FBKADUGEDE: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    FBCIGUGUR: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBJALAKSANA: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBKRAMATMULYA: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBCILIMUS: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBDARMA: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIBEUREUM: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIAWIGEBANG: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIBINGBIN: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBCIDAHU: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIGANDAMEKAR: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBLURAGUNG: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCILEBAK: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIMAHI: "https://adventurer-e9797-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBCINIRU: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIPICUNG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBCIWARU: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBGARAWANGI: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBHANTARA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBJAPARA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBKALIMANGGIS: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBKARANGKANCANA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBLEBAKWANGI: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBMALEBER: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBMANDIRANCAN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBNUSAHERANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBPANCALANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBPASAWAHAN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBSELAJAMBE: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    FBSINDANGAGUNG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    FBSUBANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    

    
    // --- TAMBAHAN SHARD REQUESTER PER KECAMATAN ---
    // Ganti URL di bawah dengan URL Firebase asli untuk masing-masing zona
    REQKUNINGAN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKADUGEDE: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    REQCIGUGUR: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQJALAKSANA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKRAMATMULYA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQKUNINGAN2: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKADUGEDE2: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    REQCIGUGUR2: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQJALAKSANA2: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKRAMATMULYA2: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQCILIMUS: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQDARMA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIBEUREUM: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIAWIGEBANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIBINGBIN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQCIDAHU: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIGANDAMEKAR: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQLURAGUNG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCILEBAK: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIMAHI: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQCINIRU: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIPICUNG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQCIWARU: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQGARAWANGI: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQHANTARA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQJAPARA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKALIMANGGIS: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQKARANGKANCANA: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQLEBAKWANGI: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQMALEBER: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQMANDIRANCAN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQNUSAHERANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQPANCALANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQPASAWAHAN: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQSELAJAMBE: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",

    REQSINDANGAGUNG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/",
    REQSUBANG: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app/"
    
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



/**
 * AUTO-SCALING ROUTER
 * Mencari Shard yang masih tersedia (dibawah 100 user)
 */
async function cariShardTersedia(kecamatan) {
    const masterDB = getTerminal('FB1_MASTER');
    const namaKec = kecamatan.toUpperCase().trim();
    let suffix = 1; // Mulai dari REQKUNINGAN (atau REQKUNINGAN1)
    let shardDitemukan = "";

    while (shardDitemukan === "") {
        // Jika suffix 1, nama terminal REQKUNINGAN, jika > 1 jadi REQKUNINGAN2, dst.
        let currentShard = suffix === 1 ? "REQ" + namaKec : "REQ" + namaKec + suffix;
        
        // Cek jumlah user di index master yang ada di shard ini
        const snap = await masterDB.ref('requester_index')
            .orderByChild('shard_id')
            .equalTo(currentShard)
            .once('value');
        
        const jumlahUser = snap.numChildren();

        if (jumlahUser < 100) {
            shardDitemukan = currentShard;
        } else {
            suffix++; // Jika penuh (100), naik ke angka berikutnya
            
            // Safety Break: Mencegah loop tak terhingga jika belum buat terminal di router
            if (suffix > 10) break; 
        }
    }
    return shardDitemukan;
}

