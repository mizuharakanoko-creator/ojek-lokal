// ==========================================
// CLEARCHANCE MODULE (Nuclear & Session Reset)
// ==========================================

const Clearchance = {
    // 1. Reset Total (Digunakan di halaman Gateway)
    nuclearWipe: function() {
        console.log("[CLEARCHANCE] Menjalankan protokol Nuclear Wipe...");
        localStorage.clear();
        sessionStorage.clear();
        
        // Hapus sisa cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log("[CLEARCHANCE] Sistem steril.");
    },

    // 2. Bersihkan Misi Aktif (Digunakan saat misi Selesai / Batal)
    clearActiveMission: function() {
        console.log("[CLEARCHANCE] Membersihkan memori misi aktif...");
        sessionStorage.removeItem('active_mission_id');
        sessionStorage.removeItem('active_contract_id');
        sessionStorage.removeItem('active_mission_path');
        // Jangan hapus identitas user!
    },

    // 3. Validasi Keamanan: Tendang user jika tidak punya Identitas
    enforceIdentity: function() {
        const user = sessionStorage.getItem('pickme_user');
        if (!user) {
            alert("Identitas hilang atau kadaluarsa. Sistem akan di-reset.");
            window.location.href = "index.html"; // Lempar ke Gateway
        }
        return JSON.parse(user);
    }
};
