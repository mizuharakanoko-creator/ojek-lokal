// MODUL 14: STATE RECOVERY SYSTEM (THE LIFESAVER)
const DriverRecovery = {
    storageKey: "last_active_state",

    // Simpan status terakhir ke memori HP
    saveState(orderId, status, region) {
        const stateData = {
            orderId: orderId,
            status: status, // misal: 'picked_up' atau 'bidding'
            region: region,
            timestamp: Date.now()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(stateData));
        console.log("State terselamatkan ke memori lokal.");
    },

    // Bersihkan state (saat orderan selesai secara normal)
    clearState() {
        localStorage.removeItem(this.storageKey);
    },

    // Cek apakah ada data yang perlu dipulihkan saat aplikasi dibuka
    getSavedState() {
        const saved = localStorage.getItem(this.storageKey);
        if (!saved) return null;

        const data = JSON.parse(saved);
        const now = Date.now();

        // Jika data sudah lebih dari 12 jam, anggap basi/expired
        if (now - data.timestamp > 12 * 60 * 60 * 1000) {
            this.clearState();
            return null;
        }
        return data;
    },

    // Logika Pemulihan Otomatis
    async runRecovery(callback) {
        const state = this.getSavedState();
        if (state) {
            console.log("Mencoba memulihkan perjalanan terakhir...");
            // Verifikasi ke server apakah orderan tersebut masih aktif atau sudah dibatalkan
            const orderRef = ref(db, `orders_active/${state.region}/${state.orderId}`);
            const snapshot = await get(orderRef);
            
            if (snapshot.exists()) {
                callback(true, state); // Pulihkan ke layar perjalanan
            } else {
                this.clearState();
                callback(false, null); // Order sudah tidak ada di server
            }
        }
    }
};
