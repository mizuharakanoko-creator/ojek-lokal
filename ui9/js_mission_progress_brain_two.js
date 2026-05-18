/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DEEP MINING ENGINE (SYNCHRONIZED WITH HTML COMPONENTS)
 */

window.HQState = {
    timerInterval: null,
    isInitialLoad: false
};

// 1. FUNGSI UTAMA (DIPANGGIL OLEH ROUTER DI BRAIN ONE DAN HTML INNER SCRIPT)
window.initHQModule = async function() {
    window.debugLog("🛰️ HQ: MEMULAI OPERASI...");
    
    // Pastikan Firebase Master di Brain One sudah terhubung
    if (!window.SovereignState || !window.SovereignState.rtdb) {
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
        window.debugLog("📡 MEMULAI SUPREME AGGREGATOR...");
        
        // Memanggil fungsi pelacakan dari terminal_router.js
        const supremePacket = await getSupremeData(contractId);
        
        if (supremePacket) {
            window.debugLog("✅ SUPREME DATA TERKUMPUL!");
            window.SovereignState.currentMissionData = supremePacket;
            
            // Render data riil dari Shard Firebase
            renderHQ(supremePacket.mission, supremePacket.adventurer);
            
        } else {
            window.debugLog("⚠️ SUPREME GAGAL, PAKAI SESSION STORAGE");
            const backup = sessionStorage.getItem('current_mission_full');
            if (backup) {
                const bData = JSON.parse(backup);
                // Sesuaikan struktur data agar cocok dengan renderHQ
                renderHQ({ id_kontrak: contractId, full_mission_data: bData, reward: bData.reward, status: bData.status }, null);
            }
        }
    } catch (err) {
        window.debugLog("💥 ERROR SUPREME: " + err.message, "error");
    }
}

// 3. UI RENDERER (SINKRON 100% DENGAN fet_missioncardhq.html)
function renderHQ(m, p) {
    if (!m) return;

    const safeUpdate = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    const safeRemoveClass = (id, className) => {
        const el = document.getElementById(id);
        if (el) el.classList.remove(className);
    };

    // A. INFO IDENTITAS & TENTARA (KONTRAK)
    safeUpdate('m-id-display', `ID: ${m.id_kontrak || 'SCANNING...'}`);
    
    const categoryName = m.category || m.full_mission_data?.category || "MOTOR RIDE";
    safeUpdate('m-title', categoryName.toUpperCase());
    
    safeUpdate('m-adv-nick', m.adventurer_nick || "---");

    // B. KONTRAK REWARD CASH (Mengubah Rp 0 menjadi Nilai Riil)
    const rawReward = m.reward || m.full_mission_data?.reward || 0;
    safeUpdate('m-reward-cash', `Rp ${Number(rawReward).toLocaleString('id-ID')}`);

    // C. RUTE (ASAL & TUJUAN)
    const originPlace = m.origin_name || m.full_mission_data?.origin_name || "---";
    const destPlace = m.dest_name || m.full_mission_data?.dest_name || "---";
    
    // D. ESTIMASI JARAK (Haversine Implementation Menggunakan Koordinat Riil)
    const oCoords = m.full_mission_data?.origin_coords;
    const dCoords = m.full_mission_data?.dest_coords;
    if (oCoords && dCoords) {
        const jarakHitung = kalkulasiJarakManual(oCoords, dCoords);
        safeUpdate('m-distance', jarakHitung.toFixed(1));
    } else {
        safeUpdate('m-distance', "0");
    }

    // E. RINCIAN CARGO / TITIK LOKASI
    const cargoDetails = m.full_mission_data?.dest_details || "Tidak ada catatan kargo khusus.";
    safeUpdate('m-cargo-detail', cargoDetails);
    safeRemoveClass('cargo-hub', 'hide');

    // F. LIVE STATUS LOGIC
    const currentStatus = (m.status || "briefing").toUpperCase();
    safeUpdate('live-status-text', currentStatus);
    
    // Atur pesan bantuan AI berdasarkan status misi
    const aiTerminalBox = document.getElementById('ai-terminal-box');
    if (currentStatus === "BRIEFING") {
        safeUpdate('ai-text', "Koneksi Shard stabil. Silakan periksa rincian kargo dan lakukan persiapan sebelum bergerak.");
        if (aiTerminalBox) aiTerminalBox.className = "ai-terminal";
    } else if (currentStatus === "OTW") {
        safeUpdate('ai-text', "Sistem mendeteksi pergerakan unit menuju titik penjemputan kargo.");
        if (aiTerminalBox) aiTerminalBox.className = "ai-terminal success";
    }

    if (m.start_time) {
        const dateObj = new Date(m.start_time);
        const timeString = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        safeUpdate('live-status-time', timeString + " WIB");
        setupTimer(m.start_time);
    } else if (m.created_at || m.full_mission_data?.created_at) {
        setupTimer(m.created_at || m.full_mission_data?.created_at);
    }

    // G. DATA ADVENTURER / PARTNER SIDE
    const partnerNameEl = document.getElementById('u-name');
    if (partnerNameEl) {
        partnerNameEl.classList.remove('loading-shimmer');
        partnerNameEl.innerText = p?.meta?.nickname || m.adventurer_nick || "STRANGER";
    }
    
    safeUpdate('u-rank', p?.profile?.rank || "TRAINER");

    // H. TOMBOL NAVIGASI & SLIDER
    safeRemoveClass('action-slider-box', 'hide');
    safeRemoveClass('btn-maps-origin', 'hide');

    // Sinkronisasi Listener Slider Input agar Berfungsi Saat Digeser
    const sliderInput = document.getElementById('slider-thumb');
    if (sliderInput) {
        sliderInput.oninput = function() {
            window.handleMissionSlider(this.value);
        };
    }
}

// 4. TIMER LOGIC (Menembak ke #timer-val)
function setupTimer(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    
    const start = typeof startTime === 'number' ? startTime : Date.now();
    const duration = 2 * 60 * 60 * 1000; // Alokasi Waktu Kontrak: 2 Jam
    const end = start + duration;

    window.HQState.timerInterval = setInterval(() => {
        const now = Date.now();
        const diff = end - now;

        const el = document.getElementById('timer-val');
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

// 5. HELPER: KALKULASI JARAK JALUR UDARA (HAVERSINE)
function kalkulasiJarakManual(coords1, coords2) {
    try {
        const [lat1, lon1] = coords1.split(',').map(Number);
        const [lat2, lon2] = coords2.split(',').map(Number);
        
        const R = 6371; // Radius Bumi dalam Kilometer
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                  
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    } catch (e) {
        console.error("Gagal menghitung jarak:", e);
        return 0;
    }
}

// 6. SLIDER ACTION DISPATCHER
window.handleMissionSlider = function(val) {
    const label = document.getElementById('slider-label');
    if (!label) return;

    if (val >= 95) {
        label.innerText = "PROSES DIKUNCI...";
        // Tempat eksekusi update status Firebase (Misal: Briefing -> OTW)
    } else {
        label.innerText = val > 40 ? "LEPASKAN UNTUK SUBMIT" : "GESER UNTUK OTW";
    }
};

console.log("⚙️ [BRAIN TWO] OPERATIONAL HQ: ALIGNED & DEPLOYED");
