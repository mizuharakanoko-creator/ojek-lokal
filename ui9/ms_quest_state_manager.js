/* ===================================================================
   MS_QUEST_STATE_MANAGER.JS
   Role: Real-time Data Listener, Global State, Integrity Storage Guard,
         & Universal Modal Promise Helpers
   =================================================================== */

// 1. GLOBAL STATE MANAGER (Dengan Integrasi Enkapsulasi Penyimpanan Lokal)
const AppState = {
    currentMissionId: localStorage.getItem('ms_active_mission_id') || null,
    missionData: null,
    driverId: localStorage.getItem('ms_driver_id') || "D001", // Default & Persisten ID
    currentTab: sessionStorage.getItem('ms_active_tab') || "hq", // Mengingat tab posisi terakhir
    activeTimerInterval: null
};

// 2. HELPER NAVIGASI TAB UTAMA (Proteksi Null & Session Storage Cache)
function switchTab(tabId, element = null) {
    if (typeof playSFX === 'function') playSFX('click-sfx');

    AppState.currentTab = tabId;
    sessionStorage.setItem('ms_active_tab', tabId); // Kunci riwayat tab aktif

    // Bersihkan kelas aktif dari seluruh elemen navigasi dan panel kontainer tab
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // Pasang kelas aktif ke navigasi item (Gunakan pencarian ID jika elemen null)
    if (element) {
        element.classList.add('active');
    } else {
        const fallbackNav = document.getElementById(`nav-btn-${tabId}`);
        if (fallbackNav) fallbackNav.classList.add('active');
    }

    // Tampilkan panel kontainer konten tab target
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    // Kasus khusus singkronisasi ulang ukuran Leaflet Map agar tidak ngebug/blank abu-abu
    if (tabId === 'maps' && typeof syncMapSize === 'function') {
        syncMapSize();
    }
}

// 3. DIAGNOSTIC STORAGE TRACKER (Pengecekan Manual Lewat Console Log F12)
function inspectSystemStorage() {
    console.log("=== [STORAGE INTEGRITY INSPECTION] ===");
    console.log("LocalStorage Driver ID    :", localStorage.getItem('ms_driver_id'));
    console.log("LocalStorage Mission ID   :", localStorage.getItem('ms_active_mission_id'));
    console.log("SessionStorage Active Tab :", sessionStorage.getItem('ms_active_tab'));
    console.log("=====================================");
}

// 4. AUDIO PLAYER ENGINE
function playSFX(elementId) {
    const audio = document.getElementById(elementId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("[AUDIO] Autoplay blocked or delayed:", e));
    }
}

// 5. UNIVERSAL MODAL SYSTEM (Mekanisme Promise Akurat)
function sysConfirm(title, message, isDanger = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysConfirmModal');
        const box = document.getElementById('confirmBox');
        if (!modal) return resolve(false);
        
        document.getElementById('confirmTitle').innerText = title;
        document.getElementById('confirmMsg').innerText = message;
        
        if (isDanger && box) box.classList.add('danger');
        else if (box) box.classList.remove('danger');
        
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
    if (!modal) return;
    
    document.getElementById('alertTitle').innerText = title;
    document.getElementById('alertMsg').innerText = message;
    modal.classList.add('show');
    
    const closeBtn = document.getElementById('alertCloseBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('show');
        };
    }
}

function sysPrompt(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysPromptModal');
        const inputField = document.getElementById('promptInputField');
        if (!modal) return resolve(null);
        
        document.getElementById('promptTitle').innerText = title;
        document.getElementById('promptMsg').innerText = message;
        if (inputField) inputField.value = "";
        
        modal.classList.add('show');
        
        document.getElementById('promptCancelBtn').onclick = () => {
            modal.classList.remove('show');
            resolve(null);
        };
        
        document.getElementById('promptSubmitBtn').onclick = () => {
            modal.classList.remove('show');
            resolve(inputField ? inputField.value : null);
        };
    });
}

// 6. DATA STREAM LISTENER (Pipa Sinkronisasi Aman Terhadap DOM Null)
function initDataStream() {
    console.log("[SYS] Activating Real-time Data Stream Engine...");

    // Tanam ID Driver ke penyimpanan fisik lokal
    localStorage.setItem('ms_driver_id', AppState.driverId);

    if (typeof FB4_BOARD === 'undefined') {
        console.error("[CRITICAL] Variabel FB4_BOARD belum terdefinisi. Pastikan jembatan Firebase termuat sempurna.");
        return;
    }

    // Jalankan pemantauan data profil pengemudi / driver
    FB4_BOARD.child("drivers").child(AppState.driverId).on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            const elName = document.getElementById('u-name');
            const elRole = document.getElementById('u-role');
            const elRank = document.getElementById('u-rank');
            
            if (elName) elName.innerText = data.name || "Unknown Courier";
            if (elRole) elRole.innerText = data.role || "FIELD AGENT";
            if (elRank) elRank.innerText = data.rank || "?";
            
            // Komponen data statistika laci drawer profil
            const elStat1 = document.getElementById('v-stat-1');
            const elBar1 = document.getElementById('b-stat-1');
            if (elStat1) elStat1.innerText = (data.reliability || "0") + "%";
            if (elBar1) elBar1.style.width = (data.reliability || "0") + "%";
            
            const elStat2 = document.getElementById('v-stat-2');
            const elBar2 = document.getElementById('b-stat-2');
            if (elStat2) elStat2.innerText = (data.reputation || "0") + " PTS";
            if (elBar2) elBar2.style.width = Math.min(data.reputation || 0, 100) + "%";
        }
    });

    // Jalankan pemantauan kontrak misi yang sedang aktif dipegang
    FB4_BOARD.child("kontrak_mission").on('value', snapshot => {
        let activeMissionFound = false;
        
        snapshot.forEach(childSnapshot => {
            const mission = childSnapshot.val();
            if (mission.driver_id === AppState.driverId && mission.status_operational !== "done") {
                activeMissionFound = true;
                AppState.currentMissionId = childSnapshot.key;
                AppState.missionData = mission;
                
                // Amankan kunci ID misi ke memori lokal
                localStorage.setItem('ms_active_mission_id', childSnapshot.key);
                
                // Distribusikan perubahan paritas data ke modul eksternal
                triggerModulesUpdate();
            }
        });
        
        if (!activeMissionFound) {
            clearActiveMissionState();
        }
    });
}

// Hubungkan pipa pembaruan ke fungsi pengontrol modul-modul sampingan
function triggerModulesUpdate() {
    // Memberikan jeda mikro render 60 milidetik agar inisialisasi file skrip JS lain selesai dimuat murni
    setTimeout(() => {
        if (typeof updateHQController === 'function') updateHQController(AppState.missionData);
        if (typeof updateTacticalMap === 'function') updateTacticalMap(AppState.missionData);
        if (typeof updateLedgerEngine === 'function') updateLedgerEngine(AppState.currentMissionId, AppState.missionData);
        if (typeof updateCommsChat === 'function') updateCommsChat(AppState.currentMissionId, AppState.missionData);
        if (typeof syncEmergencyProtocol === 'function') syncEmergencyProtocol(AppState.missionData);
    }, 60);
}

function clearActiveMissionState() {
    AppState.currentMissionId = null;
    AppState.missionData = null;
    
    // Hapus indeks riwayat penugasan karena status misi sudah beres total murni
    localStorage.removeItem('ms_active_mission_id');
    
    if (AppState.activeTimerInterval) {
        clearInterval(AppState.activeTimerInterval);
        AppState.activeTimerInterval = null;
    }

    setTimeout(() => {
        if (typeof resetHQToStandby === 'function') resetHQToStandby();
        if (typeof resetMapToStandby === 'function') resetMapToStandby();
        if (typeof resetLedgerToStandby === 'function') resetLedgerToStandby();
        if (typeof resetCommsToStandby === 'function') resetCommsToStandby();
    }, 60);
}

function forceRefreshData() {
    if (typeof playSFX === 'function') playSFX('click-sfx');
    sysAlert("SHARD SYNCHRONIZATION", "Memaksa sinkronisasi ulang seluruh gerbang data dari sistem server Firebase...");
    initDataStream();
}

// Trigger inisialisasi awal saat dokumen DOM siap dieksekusi browser
window.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan pembacaan data realtime
    initDataStream();

    // 2. Kembalikan paksa status letak tab navigasi terakhir sebelum ter-refresh
    switchTab(AppState.currentTab, null);

    // 3. Jalankan pelacakan diagnostik otomatis di konsol
    inspectSystemStorage();
});
