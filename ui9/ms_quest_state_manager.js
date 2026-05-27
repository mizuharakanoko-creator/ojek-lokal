/* ===================================================================
   MS_QUEST_STATE_MANAGER.JS
   Role: Real-time Data Listener, Global State, & System Utility Helpers
   =================================================================== */

// 1. GLOBAL STATE MANAGER (Penyimpanan Data Sementara di Memori)
const AppState = {
    currentMissionId: null,
    missionData: null,
    driverId: "D001", // Default fallback driver ID dari kode asli
    currentTab: "hq",
    activeTimerInterval: null
};

// 2. HELPER NAVIGASI TAB UTAMA
function switchTab(tabId, element) {
    // Putar Efek Suara Klik
    playSFX('click-sfx');

    // Perbarui State
    AppState.currentTab = tabId;

    // Hapus kelas aktif dari semua elemen navigasi dan panel tab
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // Aktifkan tab pilihan
    element.classList.add('active');
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    // Kasus khusus jika berpindah ke Tab Maps (Inisialisasi ulang Leaflet jika diperlukan)
    if (tabId === 'maps' && typeof syncMapSize === 'function') {
        syncMapSize();
    }
}

// 3. AUDIO PLAYER ENGINES
function playSFX(elementId) {
    const audio = document.getElementById(elementId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("[AUDIO] Autoplay blocked or delayed:", e));
    }
}

// 4. UNIVERSAL MODAL SYSTEM (Mekanisme Promise Tanpa Tebakan Logika)
function sysConfirm(title, message, isDanger = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysConfirmModal');
        const box = document.getElementById('confirmBox');
        
        document.getElementById('confirmTitle').innerText = title;
        document.getElementById('confirmMsg').innerText = message;
        
        if (isDanger) box.classList.add('danger');
        else box.classList.remove('danger');
        
        modal.classList.add('show');
        
        const cancelBtn = document.getElementById('confirmCancelBtn');
        const executeBtn = document.getElementById('confirmExecuteBtn');
        
        cancelBtn.onclick = () => {
            modal.classList.remove('show');
            resolve(false);
        };
        
        executeBtn.onclick = () => {
            modal.classList.remove('show');
            resolve(true);
        };
    });
}

function sysAlert(title, message) {
    const modal = document.getElementById('sysAlertModal');
    document.getElementById('alertTitle').innerText = title;
    document.getElementById('alertMsg').innerText = message;
    modal.classList.add('show');
    
    document.getElementById('alertCloseBtn').onclick = () => {
        modal.classList.remove('show');
    };
}

function sysPrompt(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysPromptModal');
        const inputField = document.getElementById('promptInputField');
        
        document.getElementById('promptTitle').innerText = title;
        document.getElementById('promptMsg').innerText = message;
        inputField.value = "";
        
        modal.classList.add('show');
        
        document.getElementById('promptCancelBtn').onclick = () => {
            modal.classList.remove('show');
            resolve(null);
        };
        
        document.getElementById('promptSubmitBtn').onclick = () => {
            modal.classList.remove('show');
            resolve(inputField.value);
        };
    });
}

// 5. DATA STREAM LISTENER (Koneksi Pipa ke Node Realtime Firebase)
function initDataStream() {
    console.log("[SYS] Activating Real-time Data Stream...");

    // Tarik Parameter Profil Petualang / Driver
    FB4_BOARD.child("drivers").child(AppState.driverId).on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('u-name').innerText = data.name || "Unknown Courier";
            document.getElementById('u-role').innerText = data.role || "FIELD AGENT";
            document.getElementById('u-rank').innerText = data.rank || "?";
            
            // Statistik Drawer
            document.getElementById('v-stat-1').innerText = (data.reliability || "0") + "%";
            document.getElementById('b-stat-1').style.width = (data.reliability || "0") + "%";
            document.getElementById('v-stat-2').innerText = (data.reputation || "0") + " PTS";
            document.getElementById('b-stat-2').style.width = Math.min(data.reputation || 0, 100) + "%";
        }
    });

    // Cari Kontrak Misi yang Sedang Aktif Dipangku Oleh Driver Ini
    FB4_BOARD.child("kontrak_mission").on('value', snapshot => {
        let activeMissionFound = false;
        
        snapshot.forEach(childSnapshot => {
            const mission = childSnapshot.val();
            // Validasi kepemilikan misi berdasarkan ID driver dan kecocokan status operasional
            if (mission.driver_id === AppState.driverId && mission.status_operational !== "done") {
                activeMissionFound = true;
                AppState.currentMissionId = childSnapshot.key;
                AppState.missionData = mission;
                
                // Distribusikan data ke seluruh modul UI Controller yang terpasang
                triggerModulesUpdate();
            }
        });
        
        if (!activeMissionFound) {
            clearActiveMissionState();
        }
    });
}

// Trigger update simultan ke seluruh controller komponen halaman
function triggerModulesUpdate() {
    if (typeof updateHQController === 'function') updateHQController(AppState.missionData);
    if (typeof updateTacticalMap === 'function') updateTacticalMap(AppState.missionData);
    if (typeof updateLedgerEngine === 'function') updateLedgerEngine(AppState.currentMissionId, AppState.missionData);
    if (typeof updateCommsChat === 'function') updateCommsChat(AppState.currentMissionId, AppState.missionData);
    if (typeof syncEmergencyProtocol === 'function') syncEmergencyProtocol(AppState.missionData);
}

function clearActiveMissionState() {
    AppState.currentMissionId = null;
    AppState.missionData = null;
    
    // Matikan interval timer global jika ada misi yang hangus atau dicabut
    if (AppState.activeTimerInterval) {
        clearInterval(AppState.activeTimerInterval);
        AppState.activeTimerInterval = null;
    }

    // Kembalikan seluruh UI ke mode Standby aman
    if (typeof resetHQToStandby === 'function') resetHQToStandby();
    if (typeof resetMapToStandby === 'function') resetMapToStandby();
}

function forceRefreshData() {
    playSFX('click-sfx');
    sysAlert("SHARD SYNCHRONIZATION", "Memaksa pembaruan ulang paritas data langsung dari pusat basis data Firebase...");
    initDataStream();
}

// Jalankan aliran data taktis saat seluruh skrip modul telah siap di memori browser
window.addEventListener('DOMContentLoaded', () => {
    initDataStream();
});
