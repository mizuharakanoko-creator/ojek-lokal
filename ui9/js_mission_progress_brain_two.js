/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DEEP MINING ENGINE (MOBILE DEBUG READY)
 */

window.HQState = {
    timerInterval: null,
    isInitialLoad: false
};

// 1. FUNGSI UTAMA (DIPANGGIL OLEH ROUTER DI BRAIN ONE)
window.initHQModule = async function() {
    window.debugLog("🛰️ HQ: MEMULAI OPERASI...");
    
    // Pastikan Firebase di Brain One sudah siap
    if (!window.SovereignState || !window.SovereignState.db) {
        window.debugLog("⏳ HQ: MENUNGGU DATABASE...", "warn");
        setTimeout(window.initHQModule, 500); 
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        window.debugLog("❌ HQ: ID KONTRAK KOSONG!", "error");
        return;
    }

    window.debugLog("🔎 HQ: MENAMBANG DATA...");
    await performDeepMiningHQ(contractId);
};

// 2. DEEP MINING ENGINE
async function performDeepMiningHQ(contractId) {
    try {
        const db = window.SovereignState.db;
        window.debugLog("📡 MENGHUBUNGI SHARD FIRESTORE...");

        // 1. Coba ambil dari Firestore
        const snap = await db.collection('contracts').doc(contractId).get();
        
        let missionData = null;

        if (snap.exists) {
            missionData = snap.data();
            window.debugLog("✅ DATA FIRESTORE DITEMUKAN");
        } else {
            // BACKUP: Jika Firestore kosong, ambil dari Session Storage (Data Debug kamu tadi)
            window.debugLog("⚠️ FIRESTORE KOSONG, PAKAI BACKUP...");
            const backup = sessionStorage.getItem('current_mission_full');
            if (backup) {
                missionData = JSON.parse(backup);
            }
        }

        if (!missionData) {
            window.debugLog("❌ SEMUA SUMBER DATA KOSONG", "error");
            return;
        }

        // 2. Kirim ke UI (Agar layar tidak Rp 0 lagi)
        // Kita render misi dulu, baru cari partner kemudian agar tidak lambat
        renderHQ(missionData, null);

        // 3. Cari Data Partner (Deep Mining RTDB)
        const masterDB = window.getTerminal('FB1_MASTER');
        if (masterDB && missionData.adventurer_nick) {
            window.debugLog("🗂️ MENCARI DATA PARTNER...");
            const snapIdx = await masterDB.ref('adventurer_index')
                                       .orderByChild('nickname')
                                       .equalTo(missionData.adventurer_nick)
                                       .once('value');
            
            if (snapIdx.exists()) {
                const meta = Object.values(snapIdx.val())[0];
                // Simpan ke memori global
                window.SovereignState.currentMissionData = {
                    mission: missionData,
                    partner: { meta: meta }
                };
                renderHQ(missionData, { meta: meta });
            }
        }

        window.debugLog("🚀 OPERASIONAL SELESAI");

    } catch (err) {
        window.debugLog(`💥 CRASH: ${err.message.substring(0, 20)}`, "error");
        // Usahakan tetap render apa yang ada
        const backup = sessionStorage.getItem('current_mission_full');
        if (backup) renderHQ(JSON.parse(backup), null);
    }
}


// 3. UI RENDERER (Sinkron dengan ID di fet_missioncardhq.html)
// Bagian Render di Brain Two diperkuat agar tidak kosong jika data telat
function renderHQ(m, p) {
    const safeUpdate = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    // Gunakan fallback || jika data spesifik tidak ditemukan
    safeUpdate('m-title', m.id_kontrak || m.id_misi || 'NO ID');
    safeUpdate('m-reward', `Rp ${Number(m.reward || 0).toLocaleString()}`);
    
    // Ambil kategori dari data penuh jika ada
    const cat = m.category || (m.full_mission_data ? m.full_mission_data.category : "GENERAL");
    safeUpdate('m-category', cat.toUpperCase());
    
    // Ambil Alamat
    safeUpdate('m-origin', m.origin_name || (m.full_mission_data ? m.full_mission_data.origin_name : "---"));
    safeUpdate('m-destination', m.dest_name || (m.full_mission_data ? m.full_mission_data.dest_name : "---"));

    if (p) {
        safeUpdate('m-partner-name', p.meta?.nickname || m.adventurer_nick || "PARTNER");
        safeUpdate('m-partner-rank', `RANK ${p.meta?.rank || 'F'}`);
    }
}


// 4. TIMER LOGIC
function setupTimer(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    
    const start = typeof startTime === 'number' ? startTime : Date.now();
    const duration = 2 * 60 * 60 * 1000; // 2 Jam
    const end = start + duration;

    window.HQState.timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = end - now;

        const el = document.getElementById('m-timer');
        if (!el) {
            clearInterval(window.HQState.timerInterval);
            return;
        }

        if (diff <= 0) {
            clearInterval(window.HQState.timerInterval);
            el.innerText = "EXPIRED";
            return;
        }

        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// 5. SLIDER ACTION
window.handleMissionSlider = function(val) {
    const label = document.getElementById('slider-label');
    if (val >= 98) {
        if (typeof window.showRatingScreen === 'function') window.showRatingScreen();
    } else {
        if (label) label.innerText = val > 10 ? "LEPASKAN UNTUK SELESAI" : "GESER UNTUK SELESAI";
    }
};

console.log("⚙️ [BRAIN TWO] OPERATIONAL HQ: LOADED");
