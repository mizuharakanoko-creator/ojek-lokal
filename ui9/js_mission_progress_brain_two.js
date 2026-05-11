/**
 * js_mission_progress_brain_two.js
 * HQ OPERATIONS & REAL-TIME TRACKING
 */

// 1. STATE KHUSUS HQ (Internal Memory)
window.HQState = {
    timerInterval: null,
    dbRef: null,
    isAdv: false,
    currentContractId: null
};

// 2. INITIALIZER (Dipanggil oleh Brain One saat tab HQ aktif)
window.initHQModule = function() {
    console.log("🛠️ HQ Module: Booting Logic...");
    
    // Sinkronisasi data dari Brain One
    const state = window.SovereignState;
    window.HQState.currentContractId = state.activeContractId;
    window.HQState.isAdv = state.currentUser?.role === 'adventurer';

    // A. Update Tampilan ID
    const idDisplay = document.getElementById('m-id-display');
    if (idDisplay) idDisplay.innerText = "ID: " + (window.HQState.currentContractId || "OFFLINE");

    // B. Jalankan Sistem Real-time (RTDB)
    if (state.rtdb && window.HQState.currentContractId) {
        window.HQState.dbRef = state.rtdb.ref(`kontrak_detail/${window.HQState.currentContractId}`);
        syncStatusHQ();
    }

    // C. Jalankan Deep Mining untuk Detail Kontrak
    performDeepMiningHQ();

    // D. Inisialisasi Kontrol Spesifik Role
    if (window.HQState.isAdv) {
        const advHub = document.getElementById('adv-status-hub');
        if (advHub) advHub.classList.remove('hide');
        startEmergencyProtocol(); // Cek AFK
    } else {
        const actSlider = document.getElementById('action-slider-box');
        if (actSlider) actSlider.classList.remove('hide');
        // Requester tidak butuh bar pengalaman
        const expWrap = document.getElementById('rpg-exp-wrap');
        if (expWrap) expWrap.classList.add('hide');
    }

    // E. Aktifkan Slider Konfirmasi
    initSliderActionHQ();
};

// 3. MINING & INJECTION LOGIC
async function performDeepMiningHQ() {
    const dossier = document.querySelector('.dossier-body');
    if (dossier) dossier.classList.add('data-syncing');

    try {
        // Ambil data melalui jembatan Core di Brain One
        const DATA = await window.Core.getSupremeData(window.HQState.currentContractId);
        if (!DATA) throw new Error("Shard Data Unreachable");

        // Update Profil Partner
        const partner = window.HQState.isAdv ? DATA.requester : DATA.adventurer;
        const uName = document.getElementById('u-name');
        if (uName && partner?.profile) {
            uName.innerText = partner.profile.nama || "Unknown Entity";
            uName.classList.remove('loading-shimmer');
        }

        // Update Elemen Detail (Reward, Jarak, dll)
        const m = DATA.mission;
        const detail = m.full_mission_data || {};

        const setUI = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.innerText = val;
        };

        setUI('m-title', (detail.category || m.category || "CLASSIFIED").toUpperCase());
        setUI('m-client-name', detail.client_name || "STRANGER");
        setUI('m-distance', detail.distance_est || "0");
        setUI('m-reward-cash', "Rp " + Number(m.reward || 0).toLocaleString());
        setUI('m-adv-nick', m.adventurer_nick || "Unknown");

        // Maps Logic
        if (detail.origin_coords && window.HQState.isAdv) {
            const btnMaps = document.getElementById('btn-maps-origin');
            if (btnMaps) {
                btnMaps.classList.remove('hide');
                btnMaps.onclick = () => window.open(`https://www.google.com/maps/search/?api=1&query=${detail.origin_coords}`);
            }
        }

        // Timer Start
        startMissionTimerHQ(m.start_time || Date.now());

    } catch (e) {
        console.error("Deep Mining Error:", e);
        if(typeof updateAI === 'function') updateAI("RE-SYNC FAILED", "alert");
    } finally {
        if (dossier) dossier.classList.remove('data-syncing');
    }
}

// 4. REAL-TIME SYNC (Status OTW, Tiba, dll)
function syncStatusHQ() {
    if (!window.HQState.dbRef) return;

    window.HQState.dbRef.child('latest_status').on('value', (snap) => {
        if (snap.exists()) {
            const d = snap.val();
            const statusText = document.getElementById('live-status-text');
            const statusTime = document.getElementById('live-status-time');
            
            if (statusText) statusText.innerText = d.text.toUpperCase();
            if (statusTime) statusTime.innerText = new Date(d.ts).toLocaleTimeString();
            
            // Berikan notifikasi jika status berubah
            if(typeof updateAI === 'function') updateAI(`STATUS UPDATE: ${d.text}`, "normal");
        }
    });
}

// 5. MISSION TIMER
function startMissionTimerHQ(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    
    const timerVal = document.getElementById('timer-val');
    if (!timerVal) return;

    window.HQState.timerInterval = setInterval(() => {
        const diff = Date.now() - startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerVal.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// 6. SLIDER LOGIC (The Core Interaction)
function initSliderActionHQ() {
    const slider = document.getElementById('slider-thumb');
    const label = document.getElementById('slider-label');
    if (!slider) return;

    // Reset Slider
    slider.value = 0;

    slider.oninput = function() {
        const val = parseInt(this.value);
        if (val > 95) {
            this.value = 100;
            processSliderAction(label.innerText);
            setTimeout(() => { this.value = 0; }, 1000); // Reset visual
        }
    };
}

async function processSliderAction(currentLabel) {
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

    const statusRef = window.HQState.dbRef?.child('latest_status');
    const ts = Date.now();

    if (currentLabel.includes("OTW")) {
        statusRef.set({ text: "Adventurer sedang menuju lokasi", ts });
        document.getElementById('slider-label').innerText = "GESER JIKA SUDAH TIBA";
    } 
    else if (currentLabel.includes("TIBA")) {
        statusRef.set({ text: "Adventurer telah sampai di lokasi", ts });
        document.getElementById('slider-label').innerText = "MENUNGGU SELESAI...";
        // Matikan slider sementara sampai misi benar-benar selesai
        document.getElementById('slider-thumb').disabled = true;
    }
}

// 7. EMERGENCY / AFK PROTOCOL
function startEmergencyProtocol() {
    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer-text');
    if (!emZone) return;

    let countdown = 10;
    const interval = setInterval(() => {
        countdown--;
        if (emTimer) emTimer.innerText = `PROTOKOL AFK AKTIF DALAM ${countdown}S...`;
        
        if (countdown <= 0) {
            clearInterval(interval);
            if (emTimer) emTimer.style.display = 'none';
            const emSlider = document.getElementById('slider-container-em');
            if (emSlider) emSlider.style.display = 'block';
        }
    }, 1000);
}

// Helper UI (Jika belum ada di Global)
function updateAI(text, type) {
    const box = document.getElementById('ai-terminal-box');
    const txt = document.getElementById('ai-text');
    if (!box || !txt) return;
    box.className = 'ai-terminal ' + (type || '');
    txt.innerText = text;
}

console.log("🧠 Brain Two: Tactical Operations Ready");
