/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DEEP MINING ENGINE
 */

window.HQState = {
    timerInterval: null,
    isInitialLoad: false
};

// 1. FUNGSI UTAMA YANG DIPANGGIL OLEH ROUTER
window.initHQModule = async function() {
    console.log("🛰️ [HQ] Starting Operational Module...");
    
    // Pastikan Firebase di Brain One sudah siap
    if (!window.SovereignState || !window.SovereignState.db) {
        console.warn("⏳ [HQ] Waiting for Firebase Connection...");
        setTimeout(window.initHQModule, 500); // Coba lagi dalam 0.5 detik
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        console.error("❌ [HQ] Missing Contract ID in Session Storage");
        return;
    }

    // Eksekusi Deep Mining
    await performDeepMiningHQ(contractId);
};

// 2. DEEP MINING ENGINE (LOGIKA REFERENSI ANDA)
async function performDeepMiningHQ(contractId) {
    try {
        const db = window.SovereignState.db;
        
        // Step A: Ambil Kontrak dari Firestore
        const snap = await db.collection('contracts').doc(contractId).get();
        
        if (!snap.exists) {
            console.error("❌ [MINING] Contract not found in Shard Firestore");
            return;
        }

        const m = snap.data();
        const advNick = m.adventurer_nick;

        // Step B: Akses Buku Induk (RTDB) untuk mencari Partner
        // window.getTerminal adalah jembatan ke Brain One
        const masterDB = window.getTerminal('FB1_MASTER');
        if (!masterDB) {
            console.error("❌ [MINING] Master Terminal FB1 not reachable");
            return;
        }

        const snapIdx = await masterDB.ref('adventurer_index')
                                   .orderByChild('nickname')
                                   .equalTo(advNick)
                                   .once('value');
        
        let partnerData = null;

        if (snapIdx.exists()) {
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
        }

        // Simpan ke Global State agar Tab lain bisa pakai tanpa Load ulang
        window.SovereignState.currentMissionData = {
            mission: m,
            partner: partnerData
        };

        // Step C: Render ke UI
        renderHQ(m, partnerData);
        setupTimer(m.created_at);

    } catch (err) {
        console.error("❌ [DEEP MINING CRASH]", err);
    }
}

// 3. UI RENDERER (Sinkron dengan ID di fet_missioncardhq.html)
function renderHQ(m, p) {
    const safeUpdate = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    // Data Misi
    safeUpdate('m-title', `ID: ${m.id_kontrak || '---'}`);
    safeUpdate('m-reward', `Rp ${Number(m.reward).toLocaleString()}`);
    safeUpdate('m-category', (m.full_mission_data?.category || 'GENERAL').toUpperCase());
    
    // Data Partner (Hasil Deep Mining)
    if (p) {
        safeUpdate('m-partner-name', m.adventurer_nick);
        safeUpdate('m-partner-rank', `RANK ${p.meta.rank || 'F'}`);
        
        // Jika ada elemen detail unit motor/mobil
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
    
    const start = startTime || Date.now();
    const duration = 2 * 60 * 60 * 1000; // 2 Jam default
    const end = start + duration;

    window.HQState.timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) {
            clearInterval(window.HQState.timerInterval);
            safeUpdate('m-timer', "EXPIRED");
            return;
        }

        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        const el = document.getElementById('m-timer');
        if (el) el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// 5. SLIDER ACTION
window.handleMissionSlider = function(val) {
    const label = document.getElementById('slider-label');
    if (val >= 98) {
        if (typeof window.showRatingScreen === 'function') window.showRatingScreen();
    } else {
        if (label) label.innerText = val > 10 ? "RELEASE TO CONFIRM" : "SLIDE TO COMPLETE";
    }
};

console.log("⚙️ [BRAIN TWO] Operational HQ: READY");
