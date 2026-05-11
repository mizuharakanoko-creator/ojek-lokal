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
        window.debugLog("📡 MEMULAI SUPREME AGGREGATOR...");
        
        // 1. Panggil fungsi sakti dari terminal_router.js
        const supremePacket = await getSupremeData(contractId);
        
        if (supremePacket) {
            window.debugLog("✅ SUPREME DATA TERKUMPUL!");
            
            // Simpan ke Global State agar bisa diakses seluruh aplikasi
            window.SovereignState.currentMissionData = supremePacket;
            
            // Kirim ke UI
            // SupremePacket.mission berisi data reward, zona, dll
            // SupremePacket.adventurer berisi data partner (jika ada)
            renderHQ(supremePacket.mission, supremePacket.adventurer);
            
        } else {
            // BACKUP: Jika Supreme gagal, pakai Session Storage
            window.debugLog("⚠️ SUPREME GAGAL, PAKAI SESSION STORAGE");
            const backup = sessionStorage.getItem('current_mission_full');
            if (backup) {
                const bData = JSON.parse(backup);
                renderHQ(bData, null);
            }
        }
    } catch (err) {
        window.debugLog("💥 ERROR SUPREME: " + err.message, "error");
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
