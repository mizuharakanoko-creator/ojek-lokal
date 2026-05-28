/* ===================================================================
   CORE_GATEWAY.JS (BRAIN 1)
   Fungsi: Jembatan Data Utama, State Manager, & Sinkronisasi Shard
   =================================================================== */

// 1. Objek State Global Aplikasi
const CoreState = {
    driverId: localStorage.getItem('ms_driver_id') || "D001", // Default jika kosong
    currentMissionId: localStorage.getItem('ms_active_mission_id') || null,
    missionData: null,
    networkStatus: "OFFLINE"
};

// 2. Inisialisasi Aliran Jaringan Data
function initCoreGateway() {
    console.log("[BRAIN 1] Menghubungkan sirkuit data untuk Driver:", CoreState.driverId);
    updateNetworkStatus("CONNECTING", "Mengubungkan ke Shard Jaringan...");

    // Pastikan terminal router tersedia
    if (typeof getTerminal !== 'function') {
        console.error("[BRAIN 1] TERMINAL ROUTER TIDAK DETEKSI!");
        updateNetworkStatus("ERROR", "Terminal Router Hilang");
        return;
    }

    // Ambil koneksi Shard Driver dari FB1_MASTER untuk profil, atau FB4_BOARD untuk papan misi
    // Berdasarkan berkas Anda, data papan misi aktif ditarik dari FB4_BOARD node kontrak_mission
    const boardDB = getTerminal('FB4_BOARD'); 
    const masterDB = getTerminal('FB1_MASTER');

    if (!boardDB || !masterDB) {
        updateNetworkStatus("ERROR", "Gagal Membuka Jalur Shard");
        return;
    }

    // A. STREAM 1: Dengarkan data Profil Driver dari FB4 / FB1 (Menyesuaikan dengan layout)
    boardDB.ref(`drivers/${CoreState.driverId}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && typeof renderDriverProfile === 'function') {
            renderDriverProfile(data);
        } else {
            // Fallback profil jika node di FB4 kosong, set nama default dari ID
            if (typeof renderDriverProfile === 'function') {
                renderDriverProfile({ name: "AGENT " + CoreState.driverId, rank: "A", role: "FIELD OPERATIVE" });
            }
        }
    }, (err) => {
        console.error("[BRAIN 1] Driver Stream Error:", err);
    });

    // B. STREAM 2: Mendengarkan Papan Kontrak Misi secara Real-Time
    boardDB.ref("kontrak_mission").on('value', (snapshot) => {
        let activeMissionFound = false;

        snapshot.forEach((childSnapshot) => {
            const mission = childSnapshot.val();
            
            // Logika COCOK: Driver ID sama DAN status operasional BUKAN "done"
            if (mission.driver_id === CoreState.driverId && mission.status_operational !== "done") {
                activeMissionFound = true;
                CoreState.currentMissionId = childSnapshot.key;
                CoreState.missionData = mission;

                // Kunci ID Misi ke Storage agar jika di-refresh tidak hilang
                localStorage.setItem('ms_active_mission_id', childSnapshot.key);
                
                updateNetworkStatus("ONLINE", "[SYS] KONTRAK AKTIF TERDETEKSI");
                
                // Distribusikan data ke Brain 2 (Viewer) & Brain 3 (Settlement jika ada)
                if (typeof updateHQViewer === 'function') updateHQViewer(mission);
                if (typeof syncEmergencyState === 'function') syncEmergencyState(mission);
            }
        });

        // Jika setelah diperiksa tidak ada misi aktif untuk driver ini
        if (!activeMissionFound) {
            clearCoreMissionState();
        }
    }, (err) => {
        console.error("[BRAIN 1] Mission Stream Error:", err);
        updateNetworkStatus("ERROR", "Data Misi Terputus");
    });
}

// 3. Pembersihan State saat Misi Kosong / Selesai
function clearCoreMissionState() {
    CoreState.currentMissionId = null;
    CoreState.missionData = null;
    localStorage.removeItem('ms_active_mission_id');

    updateNetworkStatus("STANDBY", "[SYS] STANDBY - MENUNGGU DATA MASUK");
    
    if (typeof resetHQViewerToStandby === 'function') resetHQViewerToStandby();
    if (typeof resetEmergencyState === 'function') resetEmergencyState();
}

// 4. Update Status Bar di UI
function updateNetworkStatus(status, message) {
    CoreState.networkStatus = status;
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('live-status-text');

    if (statusText) statusText.innerText = message;
    if (indicator) {
        indicator.className = "status-dot"; // Reset class
        if (status === "ONLINE") indicator.style.background = "var(--neon-green, #00ff88)";
        else if (status === "STANDBY") indicator.style.background = "var(--neon-blue, #00f3ff)";
        else if (status === "CONNECTING") indicator.style.background = "var(--neon-yellow, #ffcc00)";
        else indicator.style.background = "var(--neon-red, #ff3362)";
    }
}

// 5. Fungsi Tombol Paksa Refresh Gateway
function forceRefreshGateway() {
    playCoreSFX('click-sfx');
    initCoreGateway();
}

// Helper Audio
function playCoreSFX(id) {
    const audio = document.getElementById(id);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
}

// Booting awal saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
    initCoreGateway();
});
