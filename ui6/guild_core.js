// --- JANTUNG SISTEM GUILD ---
const firebaseConfig = {
    // TEMPEL KODE DARI FIREBASE CONSOLE ANDA DI SINI
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "...",
    appId: "..."
};

// Inisialisasi (Cek agar tidak double init)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const Guild = {
    // 1. Ambil Sesi User dari LocalStorage
    getUser() {
        return JSON.parse(localStorage.getItem('pickme_user'));
    },

    // 2. Simpan Sesi User (Login)
    setUser(userData) {
        localStorage.setItem('pickme_user', JSON.stringify(userData));
        // Sekaligus lapor ke Cloud bahwa user ini Online
        return db.ref('users/' + userData.id).set({
            ...userData,
            status: "online",
            last_seen: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 3. Post Misi ke Cloud (Requester)
    postMission(missionData) {
        const mId = "MSN-" + Date.now();
        return db.ref('missions/' + mId).set({
            id: mId,
            ...missionData,
            status: "OPEN",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    },

    // 4. Pantau Misi Secara Live (Adventurer)
    watchMissions(shard, callback) {
        db.ref('missions').orderByChild('shard').equalTo(shard).on('value', (snap) => {
            callback(snap.val());
        });
    }
};
