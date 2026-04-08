// --- GUILD CORE MASTER (FIREBASE EDITION) ---

const firebaseConfig = {
    apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
    authDomain: "ojeklokal-42b84.firebaseapp.com",
    databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ojeklokal-42b84",
    storageBucket: "ojeklokal-42b84.appspot.com", // Otomatis dari Project ID
    messagingSenderId: "...", // Bisa dibiarkan jika tidak pakai Notif
    appId: "..." 
};

// Inisialisasi Firebase (Mencegah inisialisasi ganda)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const Guild = {
    // --- AUTH & SESSION ---
    getUser() {
        // Menggunakan 'user_nickname' sesuai dengan kode HTML Anda
        const nick = localStorage.getItem('user_nickname');
        return nick ? { id: nick, name: nick } : null;
    },

    // --- REQUESTER LOGIC (Central Board) ---
    createMission(missionData) {
        const mId = "MSN-" + Date.now();
        const server = "SRV-JAKARTA"; // Contoh shard/server default

        // 1. Simpan di Central Board agar muncul di Radar
        const centralRef = db.ref('board_central/active_quests/' + mId).set({
            id: mId,
            server: server,
            price: missionData.bounty,
            is_urgent: missionData.isUrgent || false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // 2. Simpan detail lengkap di Database Regional
        const regionalRef = db.ref(`database_regional/${server}/missions/${mId}`).set({
            ...missionData,
            status: "OPEN",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        return Promise.all([centralRef, regionalRef]).then(() => mId);
    },

    // --- ADVENTURER LOGIC (Sesuai fungsi applyForMission di HTML) ---
    applyToMission(mId, srv, negoPrice, note = "") {
        const user = this.getUser();
        if (!user) return Promise.reject("No Session");

        // Menggunakan struktur database_regional sesuai kode HTML Anda
        return db.ref(`database_regional/${srv}/missions/${mId}/applicants/${user.id}`).set({
            nickname: user.name,
            price: negoPrice,
            note: note,
            rank: localStorage.getItem('user_rank') || "F",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // --- REALTIME WATCHERS ---
    
    // Watcher untuk Adventurer: Menunggu dipilih oleh Client
    watchMySelection(mId, srv, callback) {
        const user = this.getUser();
        const missionRef = db.ref(`database_regional/${srv}/missions/${mId}`);
        
        missionRef.on('value', (snap) => {
            const data = snap.val();
            if (!data) return;

            const status = (data.rpgSystem?.status || data.status || "").toUpperCase();
            const worker = data.rpgSystem?.executor || data.executor;

            // Jika status berubah menjadi diambil dan pelakunya adalah saya
            if ((status === "PICKED" || status === "TAKEN") && worker === user.id) {
                callback(data);
            }
        });
    },

    // Watcher untuk Requester: Melihat pelamar yang masuk secara Real-time
    watchApplicants(mId, srv, callback) {
        db.ref(`database_regional/${srv}/missions/${mId}/applicants`).on('value', (snap) => {
            callback(snap.val());
        });
    }
};
