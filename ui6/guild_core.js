// --- GUILD CORE MASTER (FIREBASE EDITION) ---

const firebaseConfig = {
    // PASTE CONFIG FIREBASE ANDA DI SINI
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const Guild = {
    // --- AUTH & SESSION ---
    getUser() {
        return JSON.parse(localStorage.getItem('pickme_user'));
    },

    setUser(userData) {
        localStorage.setItem('pickme_user', JSON.stringify(userData));
        return db.ref('users/' + userData.id).set({
            ...userData,
            status: "online",
            last_seen: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // --- REQUESTER LOGIC ---
    // 1. Membuat Misi Baru
    createMission(missionData) {
        const user = this.getUser();
        const mId = "MSN-" + Date.now();
        return db.ref('missions/' + mId).set({
            id: mId,
            requesterId: user.id,
            requesterName: user.name,
            shard: user.shard,
            ...missionData,
            status: "OPEN", // Status awal: Mencari Adventurer
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(() => mId);
    },

    // 2. Memilih Adventurer (Direct ke chosen_adventurer)
    selectAdventurer(mId, adventurer) {
        return db.ref(`missions/${mId}`).update({
            selectedAdv: adventurer.id,
            selectedAdvName: adventurer.name,
            finalPrice: adventurer.negoPrice, // Harga yang disepakati dari nego
            status: "WAITING_ACC" // Menunggu Adventurer ACC Kontrak
        });
    },

    // --- ADVENTURER LOGIC ---
    // 1. Mengajukan Lamaran + Nego
    applyToMission(mId, negoPrice, note) {
        const user = this.getUser();
        return db.ref(`missions/${mId}/applicants/${user.id}`).set({
            id: user.id,
            name: user.name,
            negoPrice: negoPrice,
            note: note,
            rank: user.rank || "F",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 2. Menandatangani Kontrak (ACC Kontrak)
    signContract(mId) {
        return db.ref(`missions/${mId}`).update({
            status: "CONTRACT_SIGNED",
            signedAt: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // --- REALTIME WATCHERS (PENGGERAK OTOMATIS) ---
    
    // Watcher: Dashboard Adventurer (Cek apakah saya dipilih?)
    watchMySelection(callback) {
        const user = this.getUser();
        db.ref('missions').on('value', (snap) => {
            const data = snap.val();
            if(!data) return;
            
            for(let id in data) {
                const m = data[id];
                if(m.selectedAdv === user.id && m.status === "WAITING_ACC") {
                    callback(m); // Kirim data misi untuk pindah ke kontrak_mission.html
                }
            }
        });
    },

    // Watcher: Choosen Adventurer (Cek apakah Adventurer sudah tanda tangan?)
    watchContractStatus(mId, callback) {
        db.ref(`missions/${mId}`).on('value', (snap) => {
            const m = snap.val();
            if(m && m.status === "CONTRACT_SIGNED") {
                callback(m); // Kirim data untuk pindah ke mission_active.html
            }
        });
    }
};
