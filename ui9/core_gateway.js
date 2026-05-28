/* ===================================================================
   CORE_GATEWAY.JS (BRAIN 1) - P2P SIGNAL MATRIX & SHARD SYNC ENGINE
   Fungsi: Jembatan Data Utama, Real-Time P2P Listener, & State Manager
   =================================================================== */

// 1. Objek State Global Aplikasi (Sinkronisasi Sempurna dengan RAM HTML & Virtualizer Peran)
window.CoreState = window.CoreState || {
    currentMissionId: null,
    driverData: null,
    activeMission: null,
    networkStatus: "OFFLINE",
    virtualRole: "adventurer", // Mode default: adventurer / requester
    p2pSignal: "WAITING"       // State P2P: WAITING, OTW, ARRIVED, DELIVERING
};

// Ref DB global untuk mempermudah akses antar fungsi stream
let globalBoardDB = null;

// Fungsi helper: Menggali data dari sisa-sisa memori session storage
function bootstrapSessionData() {
    try {
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
            // Paritas Pemetaan Akar Data: Menjamin data krusial tidak hilang atau tertukar format
            window.CoreState.activeMission = {
                ...parsed,
                id_misi: parsed.id_misi || activeContractId,
                status_operational: parsed.status_operational || parsed.status || "kerja",
                kategori: parsed.kategori || parsed.category || "MOTOR RIDE",
                judul: parsed.judul || `KONTRAK ${parsed.category || 'DELIVERY'}`,
                nama_pemesan: parsed.nama_pemesan || parsed.client_name || "Stranger",
                jarak: parsed.jarak || (parsed.reward ? "Calculated" : "0"),
                titik_jemput: parsed.titik_jemput || parsed.origin_name || parsed.origin_desa || "--",
                titik_tujuan: parsed.titik_tujuan || parsed.dest_name || parsed.dest_desa || "--",
                deskripsi_barang: parsed.deskripsi_barang || parsed.catatan || parsed.dest_details || "--",
                
                // DATA AKAR EKSTRAKSI BARU
                reward: parsed.reward || 0,
                shard_id: parsed.shard_id || parsed.zona || "KNG",
                origin_coords: parsed.origin_coords || null,
                dest_coords: parsed.dest_coords || null,
                origin_details: parsed.origin_details || "Tidak ada rincian patokan.",
                dest_details: parsed.dest_details || "Tidak ada rincian patokan."
            };
        }
    } catch (e) {
        console.error("[GATEWAY BOOTSTRAP ERROR]", e);
    }
}

// 2. Inisialisasi Utama Sirkuit Aliran Jaringan Data
function initCoreGateway() {
    bootstrapSessionData();

    const driverUID = window.CoreState.driverData ? window.CoreState.driverData.uid : "ANONYMOUS";
    console.log("[BRAIN 1] Mengaktifkan P2P Matrix Gateway untuk Agent UID:", driverUID);
    updateNetworkStatus("CONNECTING", "[SYS] CONNECTING TO SHARD MATRIX...");

    if (typeof getTerminal !== 'function') {
        console.warn("[BRAIN 1] TERMINAL ROUTER TIDAK DIALOKASIKAN. Berjalan pada Mode Fallback Session.");
        activateSessionFallback();
        return;
    }

    try {
        // Alokasi instans database sesuai konfigurasi biding real-time
        globalBoardDB = getTerminal('FB4_BOARD') || getTerminal('ojeklokal-42b84-default-rtdb'); 
        
        if (!globalBoardDB) {
            throw new Error("Gagal mengalokasikan alur pipa Real-Time DB");
        }

        // A. STREAM 1: Sinkronisasi Profil Driver
        globalBoardDB.ref(`drivers/${driverUID}`).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                window.CoreState.driverData = { ...window.CoreState.driverData, ...data };
            }
            if (typeof updateDriverProfileUI === 'function') {
                updateDriverProfileUI(window.CoreState.driverData);
            }
        });

        // B. STREAM 2: Mendengarkan Perubahan Kontrak Misi Utama
        const targetRefPath = window.CoreState.currentMissionId ? `kontrak_mission/${window.CoreState.currentMissionId}` : `kontrak_mission`;

        globalBoardDB.ref(targetRefPath).on('value', (snapshot) => {
            const val = snapshot.val();
            if (!val) {
                if (window.CoreState.activeMission) {
                    console.log("[GATEWAY] Firebase kosong, mempertahankan replika memori RAM.");
                    distributeCoreData(window.CoreState.activeMission);
                } else {
                    clearCoreMissionState();
                }
                return;
            }

            let activeMission = null;

            if (window.CoreState.currentMissionId && snapshot.key === window.CoreState.currentMissionId) {
                activeMission = val;
            } else {
                Object.keys(val).forEach(key => {
                    const m = val[key];
                    if ((m.driver_id === driverUID || m.id_requester === driverUID) && m.status_operational !== "done") {
                        activeMission = m;
                        window.CoreState.currentMissionId = key;
                    }
                });
            }

            if (activeMission) {
                // Normalisasi & Amankan Seluruh Data Akar dari Objek Asli Firebase
                const normalizedMission = {
                    ...window.CoreState.activeMission, // Gunakan fallback lokal sebagai pondasi jika ada properti parsial
                    ...activeMission,
                    id_misi: activeMission.id_misi || window.CoreState.currentMissionId,
                    status_operational: activeMission.status_operational || activeMission.status || "kerja",
                    kategori: activeMission.kategori || activeMission.category || "MOTOR RIDE",
                    judul: activeMission.judul || `KONTRAK ${activeMission.category || 'DELIVERY'}`,
                    nama_pemesan: activeMission.nama_pemesan || activeMission.client_name || "Stranger",
                    titik_jemput: activeMission.titik_jemput || activeMission.origin_name || "--",
                    titik_tujuan: activeMission.titik_tujuan || activeMission.dest_name || "--",
                    deskripsi_barang: activeMission.deskripsi_barang || activeMission.catatan || "--",
                    
                    // PENGIKAT KOORDINAT DAN DETAIL (GALI HINGGA KE AKAR)
                    reward: activeMission.reward || window.CoreState.activeMission?.reward || 0,
                    shard_id: activeMission.shard_id || activeMission.zona || window.CoreState.activeMission?.shard_id || "KNG",
                    origin_coords: activeMission.origin_coords || window.CoreState.activeMission?.origin_coords || null,
                    dest_coords: activeMission.dest_coords || window.CoreState.activeMission?.dest_coords || null,
                    origin_details: activeMission.origin_details || window.CoreState.activeMission?.origin_details || "Tidak ada rincian patokan.",
                    dest_details: activeMission.dest_details || window.CoreState.activeMission?.dest_details || "Tidak ada rincian patokan."
                };

                window.CoreState.activeMission = normalizedMission;
                updateNetworkStatus("ONLINE", `[SYS] MAPPING MANIFEST ONLINE SUCCESS`);
                
                // Sambungkan jalur pipa Stream P2P setelah misi tervalidasi
                initP2PSignalStream(normalizedMission.id_misi);
                
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
            activateSessionFallback("[SYS] LINK LOSS - JALUR CADANGAN MANDIRI");
        });

    } catch (e) {
        console.error("[BRAIN 1] Firebase Crash Bypassed:", e.message);
        activateSessionFallback("[SYS] OVERRIDE VIRTUAL RAM");
    }
}

// C. STREAM 3: Jalur Komunikasi Komunikasi P2P ala Live Chat (HT Chat Concept)
function initP2PSignalStream(idMisi) {
    if (!globalBoardDB || !idMisi) return;

    console.log(`[P2P MATRIX] Membuka saluran pipa sinyal bebas hambatan untuk ID Kontrak: ${idMisi}`);
    
    globalBoardDB.ref(`kontrak_signals/${idMisi}`).on('value', (snapshot) => {
        const signal = snapshot.val();
        
        // Simpan sinyal ke RAM global
        window.CoreState.p2pSignal = signal || "WAITING";
        console.log(`[P2P SIGNAL RECEIVE] Real-time Sinyal: -> ${window.CoreState.p2pSignal}`);
        
        // Kirim sinyal audio pemberitahuan jika ada perubahan data dari luar
        if (signal && signal !== "WAITING") {
            playCoreSFX('notif-sfx');
        }

        // Paksa render ulang layar interaksi agar tombol P2P menyesuaikan state sinyal terbaru
        if (window.CoreState.activeMission) {
            distributeCoreData(window.CoreState.activeMission);
        }
    });
}

// 3. Fungsi Pengiriman Sinyal P2P (Ditembak oleh Klik Tombol di Viewer/HTML)
function sendP2PSignal(newSignal) {
    const idMisi = window.CoreState.currentMissionId;
    if (!globalBoardDB || !idMisi) {
        alert("Gagal mentransmisikan sinyal: Jaringan atau ID Misi tidak ditemukan!");
        return;
    }

    playCoreSFX('click-sfx');
    console.log(`[P2P SIGNAL SEND] Memancarkan Sinyal: -> ${newSignal}`);
    
    // Kirim status baru ke node pipa sinyal paralel
    globalBoardDB.ref(`kontrak_signals/${idMisi}`).set(newSignal)
        .then(() => {
            // Update status teks informatif berdasarkan kode sinyal yang dikirim
            let logMsg = "[P2P] Sinyal Berhasil Dipancarkan";
            if (newSignal === "OTW") logMsg = "[STATUS] Driver Sedang Menuju Titik Asal";
            if (newSignal === "ARRIVED") logMsg = "[STATUS] Driver Sudah Tiba Di Lokasi Penjemputan";
            if (newSignal === "DELIVERING") logMsg = "[STATUS] Kargo Dalam Perjalanan Pengantaran";
            
            updateNetworkStatus("ONLINE", logMsg);
        })
        .catch((err) => console.error("[P2P SEND ERROR]", err));
}

// 4. Pengubah Status Utama Firebase ke Tahap Akhir (Selesai Kontrak)
function updateMissionStatusToDone() {
    const idMisi = window.CoreState.currentMissionId;
    if (!globalBoardDB || !idMisi) return;

    // Aksi 1: Ubah status operasional node utama menjadi 'done' untuk mengunci sirkuit finansial
    globalBoardDB.ref(`kontrak_mission/${idMisi}/status_operational`).set("done");
    globalBoardDB.ref(`kontrak_mission/${idMisi}/status`).set("done");
    
    // Aksi 2: Bersihkan jalur komunikasi paralel P2P agar steril
    globalBoardDB.ref(`kontrak_signals/${idMisi}`).remove();
    
    console.log(`[GATEWAY FINALIZE] Kontrak ${idMisi} dinyatakan SELESAI Sempurna.`);
}

// Distribusi data matang ke lapisan antarmuka (Brain 2 & Brain 3)
function distributeCoreData(missionData) {
    // Jalankan render viewer utama jika skrip penayangan siap
    if (typeof updateHQViewer === 'function') {
        updateHQViewer(missionData);
    } else if (typeof updateMissionUI === 'function') {
        updateMissionUI(missionData);
    }
    
    if (typeof syncEmergencyState === 'function') {
        syncEmergencyState(missionData);
    }
}

// Fungsi Aktivasi Jalur Memori Lokal (Fallback Mandiri)
function activateSessionFallback(customMessage) {
    updateNetworkStatus("STANDBY", customMessage || "[SYS] RUNNING VIA EMULATED RAM");
    if (window.CoreState.activeMission) {
        distributeCoreData(window.CoreState.activeMission);
    } else {
        clearCoreMissionState();
    }
}

// Pembersihan total memori RAM aplikasi saat misi kosong / selesai dievaluasi
function clearCoreMissionState() {
    window.CoreState.currentMissionId = null;
    window.CoreState.activeMission = null;
    window.CoreState.p2pSignal = "WAITING";
    
    // Bersihkan juga riwayat di session storage agar tidak loop data usang
    sessionStorage.removeItem('active_contract_id');
    sessionStorage.removeItem('processing_contract');
    sessionStorage.removeItem('current_mission_full');
    
    updateNetworkStatus("STANDBY", "[SYS] STANDBY - MENUNGGU KONTRAK BARU");
    
    if (typeof resetHQViewerToStandby === 'function') resetHQViewerToStandby();
    if (typeof resetEmergencyState === 'function') resetEmergencyState();
}

// Pengatur status visual pada bilik monitor atas
function updateNetworkStatus(status, message) {
    window.CoreState.networkStatus = status;
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('live-status-text');

    if (statusText) statusText.innerText = message;
    if (indicator) {
        indicator.className = "status-dot"; 
        if (status === "ONLINE") indicator.style.background = "var(--neon-green)";
        else if (status === "STANDBY") indicator.style.background = "var(--neon-blue)";
        else if (status === "CONNECTING") indicator.style.background = "var(--neon-orange)";
        else indicator.style.background = "var(--neon-red)";
    }
}

// Tombol Paksa Muat Ulang Aliran Data Gateway
function forceRefreshGateway() {
    playCoreSFX('click-sfx');
    initCoreGateway();
}

// Player Audio SFX Universal
function playCoreSFX(id) {
    const audio = document.getElementById(id);
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
}

// Booting awal saat sirkuit DOM selesai dirakit oleh browser
window.addEventListener('DOMContentLoaded', () => {
    initCoreGateway();
});
