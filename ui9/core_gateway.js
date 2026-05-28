/* ===================================================================
   CORE_GATEWAY.JS (BRAIN 1) - OPTIMIZED FOR REAL-TIME SESSION PARITY
   Fungsi: Jembatan Data Utama, State Manager, & Sinkronisasi Shard
   =================================================================== */

// 1. Objek State Global Aplikasi (Diselaraskan dengan window.CoreState dari HTML)
window.CoreState = window.CoreState || {
    currentMissionId: null,
    driverData: null,
    activeMission: null,
    networkStatus: "OFFLINE"
};

// Fungsi helper ekstrak data awal dari session storage
function bootstrapSessionData() {
    try {
        // Mengambil ID kontrak aktif dari data session yang terbukti ada
        const activeContractId = sessionStorage.getItem('active_contract_id') || sessionStorage.getItem('processing_contract');
        const rawUser = sessionStorage.getItem('user_identity');
        const rawMission = sessionStorage.getItem('current_mission_full');

        if (activeContractId) {
            window.CoreState.currentMissionId = activeContractId;
        }

        if (rawUser) {
            window.CoreState.driverData = JSON.parse(rawUser);
        }

        if (rawMission) {
            const parsed = JSON.parse(rawMission);
            // Standarisasi paritas mapping: Mengubah struktur inggris session ke struktur lokal viewer
            window.CoreState.activeMission = {
                ...parsed,
                id_misi: parsed.id_misi || activeContractId,
                status_operational: parsed.status_operational || parsed.status || "open",
                kategori: parsed.kategori || parsed.category || "MOTOR RIDE",
                judul: parsed.judul || `KONTRAK ${parsed.category || 'DELIVERY'}`,
                nama_pemesan: parsed.nama_pemesan || parsed.client_name || "Stranger",
                jarak: parsed.jarak || (parsed.reward ? "Calculated" : "0"),
                titik_jemput: parsed.titik_jemput || parsed.origin_name || parsed.origin_desa || "--",
                titik_tujuan: parsed.titik_tujuan || parsed.dest_name || parsed.dest_desa || "--",
                deskripsi_barang: parsed.deskripsi_barang || parsed.catatan || parsed.dest_details || "--"
            };
        }
    } catch (e) {
        console.error("[GATEWAY BOOTSTRAP ERROR]", e);
    }
}

// 2. Inisialisasi Aliran Jaringan Data
function initCoreGateway() {
    // Jalankan bootstrap cadangan internal terlebih dahulu
    bootstrapSessionData();

    const driverUID = window.CoreState.driverData ? window.CoreState.driverData.uid : "ANONYMOUS";
    console.log("[BRAIN 1] Menghubungkan sirkuit data untuk Agent UID:", driverUID);
    updateNetworkStatus("CONNECTING", "[SYS] CONNECTING TO SHARD MATRIX...");

    // Cek ketersediaan fungsi router eksternal terminal_router.js
    if (typeof getTerminal !== 'function') {
        console.warn("[BRAIN 1] TERMINAL ROUTER BELUM SIAP / TIDAK TERDETEKSI. Mengaktifkan Mode Fallback Session.");
        activateSessionFallback();
        return;
    }

    try {
        // Ambil koneksi database melalui terminal router sesuai biding app-compat
        const boardDB = getTerminal('FB4_BOARD') || getTerminal('ojeklokal-42b84-default-rtdb'); 
        
        if (!boardDB) {
            throw new Error("Gagal alokasi nama instans database");
        }

        // A. STREAM 1: Sinkronisasi Status & Profil Driver
        boardDB.ref(`drivers/${driverUID}`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.CoreState.driverData = { ...window.CoreState.driverData, ...data };
            }
            // Trigger rendering profil ke UI Viewer (core_hq_viewer.js)
            if (typeof updateDriverProfileUI === 'function') {
                updateDriverProfileUI(window.CoreState.driverData);
            }
        });

        // B. STREAM 2: Mendengarkan Papan Kontrak Misi secara Real-Time via Node Database
        // Menggunakan jalur fallback ID Kontrak Aktif jika ada
        const targetRefPath = window.CoreState.currentMissionId ? `kontrak_mission/${window.CoreState.currentMissionId}` : `kontrak_mission`;

        boardDB.ref(targetRefPath).on('value', (snapshot) => {
            const val = snapshot.val();
            if (!val) {
                // Jika data kosong di Firebase, cek apakah session storage punya backup
                if (window.CoreState.activeMission) {
                    console.log("[GATEWAY] Firebase kosong, mempertahankan data memori session.");
                    distributeCoreData(window.CoreState.activeMission);
                } else {
                    clearCoreMissionState();
                }
                return;
            }

            let activeMission = null;

            if (window.CoreState.currentMissionId && snapshot.key === window.CoreState.currentMissionId) {
                // Jika menembak langsung ke ID spesifik
                activeMission = val;
            } else {
                // Jika mendengarkan ke seluruh list kontrak_mission, cari yang COCOK
                Object.keys(val).forEach(key => {
                    const m = val[key];
                    // Pencarian berdasarkan kecocokan UID driver atau ID Requester yang sedang diproses
                    if ((m.driver_id === driverUID || m.id_requester === window.CoreState.driverData?.uid) && m.status_operational !== "done") {
                        activeMission = m;
                        window.CoreState.currentMissionId = key;
                    }
                });
            }

            if (activeMission) {
                // Normalisasi struktur data Firebase ke format penayangan layar
                const normalizedMission = {
                    ...activeMission,
                    id_misi: activeMission.id_misi || window.CoreState.currentMissionId,
                    status_operational: activeMission.status_operational || activeMission.status || "kerja",
                    kategori: activeMission.kategori || activeMission.category || "MOTOR RIDE",
                    judul: activeMission.judul || `KONTRAK ${activeMission.category || 'DELIVERY'}`,
                    nama_pemesan: activeMission.nama_pemesan || activeMission.client_name || "Stranger",
                    titik_jemput: activeMission.titik_jemput || activeMission.origin_name || "--",
                    titik_tujuan: activeMission.titik_tujuan || activeMission.dest_name || "--",
                    deskripsi_barang: activeMission.deskripsi_barang || activeMission.catatan || "--"
                };

                window.CoreState.activeMission = normalizedMission;
                updateNetworkStatus("ONLINE", "[SYS] KONTRAK AKTIF TERDETEKSI");
                distributeCoreData(normalizedMission);
            } else {
                if (window.CoreState.activeMission) {
                    distributeCoreData(window.CoreState.activeMission);
                } else {
                    clearCoreMissionState();
                }
            }
        }, (err) => {
            console.error("[BRAIN 1] Mission Stream Error:", err);
            activateSessionFallback("[SYS] LINK EROR - MODE CADANGAN AKTIF");
        });

    } catch (e) {
        console.error("[BRAIN 1] Firebase Initialization Crash:", e.message);
        activateSessionFallback("[SYS] OVERRIDE VIRTUAL MEMORY");
    }
}

// Fungsi mendistribusikan data matang ke Brain 2 (Viewer) & Brain 3 (Settlement)
function distributeCoreData(missionData) {
    if (typeof updateHQViewer === 'function') {
        updateHQViewer(missionData);
    } else if (typeof updateMissionUI === 'function') {
        updateMissionUI(missionData);
    }
    if (typeof syncEmergencyState === 'function') {
        syncEmergencyState(missionData);
    }
}

// Fungsi Aktivasi Jalur Memori Lokal (Fallback) saat Firebase mati/mengalami delay inisialisasi
function activateSessionFallback(customMessage) {
    updateNetworkStatus("STANDBY", customMessage || "[SYS] RUNNING VIA LOCAL STORAGE");
    if (window.CoreState.activeMission) {
        console.log("[GATEWAY VIRTUAL] Mengalirkan data replika session storage ke viewer.");
        distributeCoreData(window.CoreState.activeMission);
    } else {
        clearCoreMissionState();
    }
}

// 3. Pembersihan State saat Misi Kosong / Selesai
function clearCoreMissionState() {
    window.CoreState.currentMissionId = null;
    window.CoreState.activeMission = null;
    
    updateNetworkStatus("STANDBY", "[SYS] STANDBY - MENUNGGU DATA MASUK");
    
    if (typeof resetHQViewerToStandby === 'function') resetHQViewerToStandby();
    if (typeof resetEmergencyState === 'function') resetEmergencyState();
}

// 4. Update Status Bar di UI secara Real-Time
function updateNetworkStatus(status, message) {
    window.CoreState.networkStatus = status;
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('live-status-text');

    if (statusText) statusText.innerText = message;
    if (indicator) {
        indicator.className = "status-dot"; 
        if (status === "ONLINE") indicator.style.background = "var(--neon-green, #00ff88)";
        else if (status === "STANDBY") indicator.style.background = "var(--neon-blue, #00f3ff)";
        else if (status === "CONNECTING") indicator.style.background = "var(--neon-orange, #ff5500)";
        else indicator.style.background = "var(--neon-red, #ff3362)";
    }
}

// 5. Fungsi Paksa Refresh Aliran Data Gateway
function forceRefreshGateway() {
    playCoreSFX('click-sfx');
    initCoreGateway();
}

// Helper Audio SFX
function playCoreSFX(id) {
    const audio = document.getElementById(id);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
}

// Booting awal saat sirkuit DOM siap dimuat
window.addEventListener('DOMContentLoaded', () => {
    initCoreGateway();
});
