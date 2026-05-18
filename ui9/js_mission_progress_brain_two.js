/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DUAL-PERSPECTIVE RENDERING ENGINE
 */

window.HQState = {
    timerInterval: null,
    isInitialLoad: false
};

// 1. ANCHOR UTAMA: INISIALISASI MODUL HQ
window.initHQModule = async function() {
    window.debugLog("🛰️ HQ: MEMULAI SYNCHRONIZATION...");
    
    if (!window.SovereignState || !window.SovereignState.rtdb) {
        window.debugLog("⏳ HQ: MENUNGGU RTDB FIREBASE MASTER...", "warn");
        setTimeout(window.initHQModule, 500); 
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        window.debugLog("❌ HQ: CRITICAL! ACTIVE CONTRACT ID ABSENT", "error");
        return;
    }

    await performDeepMiningHQ(contractId);
};

// 2. SUPREME AGGREGATOR ENGINE
async function performDeepMiningHQ(contractId) {
    try {
        // Memanggil fungsi router data utama di terminal_router.js
        const supremePacket = await getSupremeData(contractId);
        
        if (supremePacket) {
            window.debugLog("✅ DATA SHARD BERHASIL DIASIMILASI");
            window.SovereignState.currentMissionData = supremePacket;
            
            // Eksekusi render dengan mempassing data misi, data adventurer, dan data requester
            renderHQ(supremePacket.mission, supremePacket.adventurer, supremePacket.requester);
        } else {
            window.debugLog("⚠️ SHARD STRATEGY GAGAL, FALLBACK KE STORAGE LOCAL");
            const backup = sessionStorage.getItem('current_mission_full');
            if (backup) {
                const bData = JSON.parse(backup);
                renderHQ({ id_kontrak: contractId, full_mission_data: bData, reward: bData.reward, status: bData.status }, null, null);
            }
        }
    } catch (err) {
        window.debugLog("💥 SYSTEM CRASH PADA MINING HQ: " + err.message, "error");
    }
}

// 3. CORE RENDERING ENGINE (INTEGRATED ROLE PERSPECTIVE FROM JJK.HTML)
function renderHQ(m, advData, reqData) {
    if (!m) return;

    const safeUpdate = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    // Ambil identitas user saat ini yang tersemat di Global State
    const currentUser = window.SovereignState.currentUser || JSON.parse(sessionStorage.getItem('user_identity')) || {};
    const myRole = (currentUser.role || 'requester').toLowerCase();

    // A. ISI DATA KONTRAK DASAR
    safeUpdate('m-id-display', `ID: ${m.id_kontrak || 'SCANNING...'}`);
    
    const categoryName = m.category || m.full_mission_data?.category || "GENERAL MISSION";
    safeUpdate('m-title', categoryName.toUpperCase());
    safeUpdate('m-adv-nick', m.adventurer_nick || "---");

    // B. FORMAT REWARD CASH
    const rawReward = m.reward || m.full_mission_data?.reward || 0;
    safeUpdate('m-reward-cash', `Rp ${Number(rawReward).toLocaleString('id-ID')}`);

    // C. PENGHITUNGAN JARAK VIA HAVERSINE LOKAL
    const oCoords = m.full_mission_data?.origin_coords;
    const dCoords = m.full_mission_data?.dest_coords;
    if (oCoords && dCoords) {
        const jarakHitung = kalkulasiJarakMisi(oCoords, dCoords);
        safeUpdate('m-distance', jarakHitung.toFixed(1));
    } else {
        safeUpdate('m-distance', "0");
    }

    // D. KETERANGAN TITIK / CARGO HUB
    const cargoDetails = m.full_mission_data?.dest_details || "Tidak ada rincian kargo khusus.";
    safeUpdate('m-cargo-detail', cargoDetails);
    
    const cargoHubEl = document.getElementById('cargo-hub');
    if (cargoHubEl) cargoHubEl.classList.remove('hide');

    // E. WAKTU AKSI & TIMER ENGINE
    if (m.start_time) {
        const dateObj = new Date(m.start_time);
        safeUpdate('live-status-time', dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB");
        setupTimer(m.start_time);
    } else {
        setupTimer(m.created_at || m.full_mission_data?.created_at || Date.now());
    }

    // ==========================================================================
    // LOGIKA PERAN JUAL PERSPEKTIF (REQUESTER VS ADVENTURER)
    // ==========================================================================
    const currentStatus = (m.status || "briefing").toUpperCase();
    safeUpdate('live-status-text', currentStatus);

    const aiTerminalBox = document.getElementById('ai-terminal-box');
    const actionSliderBox = document.getElementById('action-slider-box');
    const btnMapsOrigin = document.getElementById('btn-maps-origin');

    if (myRole === 'requester') {
        // --- PERSPEKTIF USER ADALAH PEMBUAT MISI (KLIEN) ---
        window.debugLog("👤 VIEW MODE: REQUESTER PERSPECTIVE ACTIVE");

        // 1. Partner yang harus ditampilkan di profil kecil adalah ADVENTURER
        const partnerNameEl = document.getElementById('u-name');
        if (partnerNameEl) {
            partnerNameEl.classList.remove('loading-shimmer');
            partnerNameEl.innerText = advData?.meta?.nickname || m.adventurer_nick || "Mencari Runner...";
        }
        safeUpdate('u-rank', advData?.profile?.rank || "TRAINER");
        safeUpdate('u-role', "RUNNER ASSIGNED");

        // 2. Update Info Terminal Pintar untuk Klien
        if (currentStatus === "BRIEFING") {
            safeUpdate('ai-text', "Koneksi Shard Terbuka. Menunggu Adventurer melakukan verifikasi persiapan berkas kargo.");
            if (aiTerminalBox) aiTerminalBox.className = "ai-terminal";
        } else if (currentStatus === "OTW") {
            safeUpdate('ai-text', "Sistem Terhubung. Adventurer (" + (m.adventurer_nick || 'Runner') + ") sedang bergerak menuju lokasi penjemputan Anda.");
            if (aiTerminalBox) aiTerminalBox.className = "ai-terminal success";
        }

        // 3. Kunci Otoritas (Sembunyikan Slider & Maps Navigasi)
        if (actionSliderBox) actionSliderBox.classList.add('hide');
        if (btnMapsOrigin) btnMapsOrigin.classList.add('hide');

    } else {
        // --- PERSPEKTIF USER ADALAH PELAKSANA MISI (ADVENTURER) ---
        window.debugLog("⚔️ VIEW MODE: ADVENTURER PERSPECTIVE ACTIVE");

        // 1. Partner yang harus ditampilkan di profil kecil adalah REQUESTER (Klien Pemilik Kargo)
        const partnerNameEl = document.getElementById('u-name');
        if (partnerNameEl) {
            partnerNameEl.classList.remove('loading-shimmer');
            partnerNameEl.innerText = m.requester_nick || m.full_mission_data?.client_name || "STRANGER";
        }
        safeUpdate('u-rank', "CLIENT");
        safeUpdate('u-role', "TARGET MISSION CLIENT");

        // 2. Update Info Terminal Pintar untuk Adventurer
        if (currentStatus === "BRIEFING") {
            safeUpdate('ai-text', "Persiapan Dokumen Selesai. Silakan geser indikator di bawah untuk merubah status menjadi OTW menuju titik koordinat.");
            if (aiTerminalBox) aiTerminalBox.className = "ai-terminal";
        } else if (currentStatus === "OTW") {
            safeUpdate('ai-text', "Navigasi Diaktifkan. Segera menuju lokasi penjemputan, dilarang memutuskan neural link.");
            if (aiTerminalBox) aiTerminalBox.className = "ai-terminal success";
        }

        // 3. Buka Akses Kontrol Penuh
        if (actionSliderBox) actionSliderBox.classList.remove('hide');
        if (btnMapsOrigin) btnMapsOrigin.classList.remove('hide');

        // Atur Teks Slider Sesuai Status Berjalan
        const sliderLabel = document.getElementById('slider-label');
        if (sliderLabel) {
            sliderLabel.innerText = currentStatus === "BRIEFING" ? "GESER UNTUK OTW" : "GESER UNTUK SELESAI";
        }

        // Jalankan Event Listener untuk Menggeser Slider
        const sliderInput = document.getElementById('slider-thumb');
        if (sliderInput) {
            sliderInput.value = 0; // Reset thumb ke kiri
            sliderInput.oninput = function() {
                window.handleMissionSlider(this.value, m.id_kontrak, currentStatus);
            };
        }
    }
}

// 4. LOGIKA TIMER HITUNG MUNDUR (2 JAM KONTRAK)
function setupTimer(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    
    const start = typeof startTime === 'number' ? startTime : Date.now();
    const duration = 2 * 60 * 60 * 1000; 
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

// 5. HELPER KALKULASI JARAK LOKAL (HAVERSINE STRATEGY)
function kalkulasiJarakMisi(coords1, coords2) {
    try {
        const [lat1, lon1] = coords1.split(',').map(Number);
        const [lat2, lon2] = coords2.split(',').map(Number);
        const R = 6371; 
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    } catch (e) {
        return 0;
    }
}

// 6. ACTION CONTROLLER: EVENT SAAT SLIDER DI-INPUT (KHUSUS ADVENTURER)
window.handleMissionSlider = function(val, contractId, currentStatus) {
    const label = document.getElementById('slider-label');
    if (!label) return;

    if (val >= 98) {
        label.innerText = "UPDATING SHARD SERVER...";
        
        // Logika Mutasi Status Firebase RTDB (Dipindah dari jjk.html lama)
        if (currentStatus === "BRIEFING") {
            window.debugLog("🛰️ MUTASI STATUS: BRIEFING -> OTW");
            // Eksekusi fungsi update Firebase Anda di sini ke status 'otw'
        } else if (currentStatus === "OTW") {
            window.debugLog("🛰️ MUTASI STATUS: OTW -> COMPLETED");
            if (typeof window.showRatingScreen === 'function') window.showRatingScreen();
        }
    } else {
        if (currentStatus === "BRIEFING") {
            label.innerText = val > 30 ? "LEPASKAN UNTUK BERANGKAT" : "GESER UNTUK OTW";
        } else {
            label.innerText = val > 30 ? "LEPASKAN UNTUK SELESAI" : "GESER UNTUK SELESAI";
        }
    }
};

console.log("⚙️ [BRAIN TWO] OPERATIONAL HQ ENGINE DUAL-ROLE DEPLOYED SUCCESFULLY.");
