/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DEEP MINING ENGINE
 * Fokus: Sinkronisasi Firestore & Realtime Database (Deep Mining)
 */

window.HQState = {
    timerInterval: null,
    timeLeft: 0,
    isEmergencyReady: false
};

// 1. MODULE INITIALIZER
window.initHQModule = async function() {
    console.log("🛰️ [HQ] Initializing Deep Mining Operations...");
    
    const state = window.SovereignState;
    const contractId = state.activeContractId || sessionStorage.getItem('active_contract_id');

    if (!contractId) {
        console.error("❌ [HQ] No Active Contract Found");
        if(typeof updateAI === 'function') updateAI("ERROR: Sinyal kontrak tidak terdeteksi.", "alert");
        return;
    }

    // Jalankan Deep Mining untuk mengambil data lengkap
    const fullData = await performDeepMiningHQ(contractId);
    
    if (fullData) {
        renderHQMissionCard(fullData);
        setupHQTimer(fullData.mission);
        
        // Simpan ke state global agar bisa diakses tab lain (Comms/Profile)
        window.SovereignState.currentMissionData = fullData;
    }
};

// 2. DEEP MINING ENGINE (Sesuai Referensi yang Anda Berikan)
async function performDeepMiningHQ(contractId) {
    try {
        const db = window.SovereignState.db;
        
        // A. Ambil data Kontrak Utama dari Firestore
        const snap = await db.collection('contracts').doc(contractId).get();
        if (!snap.exists) return null;
        
        const m = snap.val ? snap.val() : snap.data();
        const advNick = m.adventurer_nick;

        // B. Deep Mining ke Realtime Database (Buku Induk Adventurer)
        // Kita mencari ID asli dan Lokasi Shard berdasarkan Nickname
        const masterDB = window.getTerminal('FB1_MASTER'); // Memanggil fungsi di Brain One
        const snapIdx = await masterDB.ref('adventurer_index')
                                   .orderByChild('nickname')
                                   .equalTo(advNick)
                                   .once('value');
        
        let deepProfile = {};
        if (snapIdx.exists()) {
            const meta = Object.values(snapIdx.val())[0];
            const shardId = meta.shard_id || "FB2_RUNNER";
            const shard = window.getTerminal(shardId);
            const idAdv = meta.id_adv;
            const area = meta.area_tugas;

            // Ambil data detail lintas kategori di Shard
            const [snapRole, snapRep, snapDia] = await Promise.all([
                shard.ref(`adventurer-${area}/Umum/${idAdv}`).once('value'),
                shard.ref(`adventurer_reputation/${idAdv}`).once('value'),
                shard.ref(`adventurer_diagram/${idAdv}`).once('value')
            ]);

            deepProfile = {
                umum: snapRole.val() || {},
                reputasi: snapRep.val() || {},
                diagram: snapDia.val() || {},
                meta: meta
            };
        }

        return {
            mission: m,
            partner: deepProfile
        };

    } catch (err) {
        console.error("❌ [DEEP MINING ERROR]", err);
        return null;
    }
}

// 3. UI RENDERER (HQ CARD)
function renderHQMissionCard(data) {
    const m = data.mission;
    const p = data.partner;

    // Update Elemen di fet_missioncardhq.html
    const safeSet = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    safeSet('m-title', `ID: ${m.id_kontrak || m.id_misi}`);
    safeSet('m-reward', `Rp ${Number(m.reward).toLocaleString()}`);
    safeSet('m-partner-name', m.adventurer_nick || "Unknown");
    
    // Menampilkan Rank dari hasil Deep Mining
    const rankEl = document.getElementById('m-partner-rank');
    if (rankEl && p.meta) {
        rankEl.innerText = `RANK ${p.meta.rank || 'F'}`;
        rankEl.className = `rank-badge rank-${(p.meta.rank || 'F').replace('+', '-plus')}`;
    }

    // Detail Lokasi
    safeSet('m-origin', m.full_mission_data?.origin_name || "Point A");
    safeSet('m-destination', m.full_mission_data?.dest_name || "Point B");

    console.log("✅ [HQ] Mission Card Rendered with Deep Data.");
}

// 4. TIMER & SLIDER LOGIC
function setupHQTimer(mission) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);

    // Hitung sisa waktu (Misal durasi 2 jam dari created_at)
    const startTime = mission.created_at || Date.now();
    const duration = 2 * 60 * 60 * 1000; // 2 Jam
    const endTime = startTime + duration;

    window.HQState.timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
            clearInterval(window.HQState.timerInterval);
            document.getElementById('m-timer').innerText = "EXPIRED";
            return;
        }

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const timerStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        const el = document.getElementById('m-timer');
        if (el) el.innerText = timerStr;
    }, 1000);
}

// 5. SLIDER ACTION (Sesuai jjk.html)
window.handleMissionSlider = function(value) {
    const label = document.getElementById('slider-label');
    if (value >= 95) {
        if (typeof window.showRatingScreen === 'function') {
            window.showRatingScreen(); // Pemicu Modal Rating
        }
    } else if (value > 10) {
        if (label) label.innerText = "RELEASE TO CONFIRM";
    } else {
        if (label) label.innerText = "SLIDE TO COMPLETE";
    }
};

console.log("⚙️ [BRAIN TWO] Operational HQ: LOADED");
