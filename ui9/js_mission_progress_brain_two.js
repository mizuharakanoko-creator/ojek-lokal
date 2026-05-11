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
        
        // Step A: Ambil Kontrak dari Firestore
        window.debugLog("📡 FIRESTORE: MENGAMBIL KONTRAK...");
        const snap = await db.collection('contracts').doc(contractId).get();
        
        if (!snap.exists) {
            window.debugLog("❌ FIRESTORE: KONTRAK TIDAK ADA!", "error");
            return;
        }

        const m = snap.data();
        const advNick = m.adventurer_nick;
        window.debugLog(`✅ DATA DIDAPAT: ${advNick}`);

        // Step B: Akses Buku Induk (RTDB) untuk mencari Partner
        const masterDB = window.getTerminal('FB1_MASTER');
        if (!masterDB) {
            window.debugLog("❌ RTDB: TERMINAL MASTER DISCONNECT!", "error");
            return;
        }

        window.debugLog("🗂️ RTDB: MENCARI INDEX PARTNER...");
        const snapIdx = await masterDB.ref('adventurer_index')
                                   .orderByChild('nickname')
                                   .equalTo(advNick)
                                   .once('value');
        
        let partnerData = null;

        if (snapIdx.exists()) {
            window.debugLog("💎 RTDB: PARTNER DITEMUKAN!");
            const meta = Object.values(snapIdx.val())[0];
            const shard = window.getTerminal(meta.shard_id || "FB2_RUNNER");
            const idAdv = meta.id_adv;
            const area = meta.area_tugas;

            // Deep Mining Detail Shard
            const [snapRole, snapRep] = await Promise.all([
                shard.ref(`adventurer-${area}/Umum/${idAdv}`).once('value'),
                shard.ref(`adventurer_reputation/${idAdv}`).once('value')
            ]);

            partnerData = {
                umum: snapRole.val() || {},
                reputasi: snapRep.val() || {},
                meta: meta
            };
        } else {
            window.debugLog("⚠️ PARTNER TIDAK TERDAFTAR", "warn");
        }

        // Simpan ke Global State
        window.SovereignState.currentMissionData = {
            mission: m,
            partner: partnerData
        };

        // Step C: Render ke UI
        window.debugLog("🎨 UI: MENYUSUN TAMPILAN...");
        renderHQ(m, partnerData);
        
        // Jalankan Timer
        if (m.created_at) setupTimer(m.created_at);

        window.debugLog("🚀 HQ: SISTEM OPERASIONAL!");

    } catch (err) {
        window.debugLog(`💥 CRASH: ${err.message.substring(0, 20)}`, "error");
        console.error(err);
    }
}

// 3. UI RENDERER (Sinkron dengan ID di fet_missioncardhq.html)
function renderHQ(m, p) {
    const safeUpdate = (id, html) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = html;
        } else {
            // Jika elemen tidak ditemukan, log agar kita tahu ID mana yang salah
            console.warn(`Elemen ${id} tidak ditemukan di DOM`);
        }
    };

    // Data Misi
    safeUpdate('m-title', `ID: ${m.id_kontrak || '---'}`);
    safeUpdate('m-reward', `Rp ${Number(m.reward || 0).toLocaleString()}`);
    
    const category = m.full_mission_data?.category || 'GENERAL';
    safeUpdate('m-category', category.toUpperCase());
    
    // Data Partner
    if (p) {
        safeUpdate('m-partner-name', m.adventurer_nick || 'UNKNOWN');
        safeUpdate('m-partner-rank', `RANK ${p.meta?.rank || 'F'}`);
        
        if (p.umum && p.umum.arsenal) {
            safeUpdate('m-unit-info', `${p.umum.arsenal.merk} [${p.umum.arsenal.plat}]`);
        }
    }

    // Detail Alamat
    safeUpdate('m-origin', m.full_mission_data?.origin_name || "---");
    safeUpdate('m-destination', m.full_mission_data?.dest_name || "---");
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
