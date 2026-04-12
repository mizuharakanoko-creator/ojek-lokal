// ==========================================
// CLEARCHANCE MODULE (Nuclear & Session Reset)
// ==========================================

const Clearchance = {
    // 1. Reset Total (Digunakan di halaman Gateway/Login)
    nuclearWipe: function() {
        console.log("[CLEARCHANCE] Menjalankan protokol Nuclear Wipe...");
        
        // Membersihkan memori lokal dan sesi
        localStorage.clear();
        sessionStorage.clear();
        
        // Hapus sisa cookies agar sistem benar-benar steril
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log("[CLEARCHANCE] Sistem steril.");
    },

    // 2. Bersihkan Misi Aktif (Digunakan saat misi Selesai atau Dibatalkan)
    clearActiveMission: function() {
        console.log("[CLEARCHANCE] Membersihkan memori misi aktif...");
        sessionStorage.removeItem('active_mission_id');
        sessionStorage.removeItem('active_mission_shard');
        sessionStorage.removeItem('active_mission_desa');
        sessionStorage.removeItem('active_contract_id');
        sessionStorage.removeItem('active_mission_path');
        // Catatan: Identitas user tetap dipertahankan agar tidak logout otomatis
    },

    // 3. Validasi Keamanan: Memastikan User memiliki Identitas sebelum masuk sistem
    enforceIdentity: function() {
        // Mendukung dua kunci data untuk transisi sistem yang mulus
        const userData = sessionStorage.getItem('user_identity') || sessionStorage.getItem('pickme_user');
        
        if (!userData) {
            console.error("[CLEARCHANCE] Akses ditolak: Identitas tidak ditemukan.");
            alert("Identitas hilang atau kadaluarsa. Sistem akan di-reset.");
            window.location.href = "index.html"; // Kembali ke halaman Login/Gateway
            return null;
        }
        
        // Mengembalikan data user dalam bentuk object JSON
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error("[CLEARCHANCE] Data identitas korup:", e);
            this.nuclearWipe();
            window.location.href = "index.html";
            return null;
        }
    }
};
