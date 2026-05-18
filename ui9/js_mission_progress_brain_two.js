/**
 * js_mission_progress_brain_two.js
 * TACTICAL COMMAND CENTER ENGINE - VERSI SINKRONISASI TOTAL TANPA SLIDER
 */

window.HQState = {
    timerInterval: null,
    logRotationInterval: null,
    afkCountdown: null
};

// 1. BOOTSTRAPPING ENGINE SYNC
window.initHQModule = async function() {
    console.log("📡 [BRAIN TWO]: INITIALIZING COMMAND ENGINE SYNC...");
    
    if (!window.SovereignState || !window.SovereignState.rtdb) {
        setTimeout(window.initHQModule, 200);
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        console.error("❌ [BRAIN TWO]: ABSENCE OF ACTIVE CONTRACT ID SHARD!");
        return;
    }

    // Sambungkan Micro-game link file eksternal jika sudah dimuat
    if (typeof window.initMicroGameEngine === 'function') {
        window.initMicroGameEngine();
    }

    // Tarik dan pantau data dari server secara realtime
    listenContractRealtime(contractId);
};

// 2. REALTIME SERVER SYNCHRONIZER
function listenContractRealtime(contractId) {
    const db4 = window.SovereignState.rtdb;
    db4.ref(`kontrak_mission/${contractId}`).on('value', async snap => {
        if (!snap.exists()) {
            console.warn("⚠️ Contract destroyed or unlinked from server.");
            return;
        }

        const contractData = snap.val();
        
        // Tarik data detail jika fungsi router tersedia
        if (typeof window.getSupremeData === 'function') {
            const dataPacket = await window.getSupremeData(contractId);
            if (dataPacket) {
                window.SovereignState.currentMissionData = dataPacket;
                executeRenderHQ(dataPacket.mission, dataPacket.adventurer, dataPacket.requester);
                return;
            }
        }

        // Fallback Cache Render
        executeRenderHQ(contractData, null, null);
    });
}

// 3. CORE LOGIC GRAPHICS RENDERING
function executeRenderHQ(m, advData, reqData) {
    if (!m) return;

    const currentUser = window.SovereignState.currentUser || JSON.parse(sessionStorage.getItem('user_identity')) || {};
    const myRole = (currentUser.role || 'requester').toLowerCase();
    const currentStatus = (m.status || "briefing").toLowerCase();
    const contractId = m.id_kontrak || sessionStorage.getItem('active_contract_id');

    // A. PEMBARUAN INFORMASI IDENTITAS & STATUS BADGE
    document.getElementById('m-id-display').innerText = `ID: ${contractId}`;
    
    const categoryTitle = m.category || m.full_mission_data?.category || "REGULAR MISSION";
    document.getElementById('m-title').innerText = categoryTitle.toUpperCase();

    const rawReward = m.reward || m.full_mission_data?.reward || 0;
    document.getElementById('m-reward-cash').innerText = `Rp ${Number(rawReward).toLocaleString('id-ID')}`;

    // Lencana Status Pusat
    const badge = document.getElementById('m-status-badge');
    if (badge) {
        badge.innerText = currentStatus.toUpperCase();
        badge.className = `status-badge-neon ${currentStatus}`;
    }

    // B. MANIFEST DUA TITIK (ORIGIN & DEST)
    document.getElementById('m-origin-desa').innerText = m.full_mission_data?.origin_desa || m.full_mission_data?.origin_name || "-";
    document.getElementById('m-dest-desa').innerText = m.full_mission_data?.dest_desa || m.full_mission_data?.dest_name || "-";
    document.getElementById('m-cargo-detail').innerHTML = m.full_mission_data?.dest_details || "Tidak ada instruksi khusus.";
    document.getElementById('cargo-hub').classList.remove('hide');

    // Jarak Haversine
    calculateHaversineDistance(m.full_mission_data?.origin_coords, m.full_mission_data?.dest_coords);

    // C. TIMING CHRONO SINKRONISASI
    const baseTime = m.start_time || m.created_at || m.full_mission_data?.created_at || Date.now();
    runChronoClock(baseTime);

    // D. SYSTEM ADVISOR INTEL (ROTASI 8 SHIFT ASISTEN)
    rotateShiftAssistant(myRole, currentStatus, advData, m);

    // E. ROTASI FEED TEXT SIMULASI TERMINAL (ANTI-BOSAN)
    startLiveTerminalFeed();

    // ==========================================================================
    // SISTEM MANAGEMENT PANEL DUA ARAH (KONTROL AKSES TOMBOL)
    // ==========================================================================
    resetActionButtons();

    if (myRole === 'requester') {
        // --- PERSPEKTIF REQUESTER (KLIEN) ---
        setupPartnerLinkText(advData?.meta?.nickname || m.adventurer_nick || "Mencari Runner...", true);
        
        if (currentStatus === 'arrival') {
            const btnComplete = document.getElementById('btn-hq-client-complete');
            btnComplete.classList.remove('hide');
            btnComplete.onclick = () => triggerMutationAction(contractId, 'completed', 'Konfirmasi Selesai?', 'Apakah Anda yakin barang/kargo sudah diterima dengan lengkap? Transaksi ini akan mendepositokan kargo reward penuh.');
        } else {
            // Beritahu klien status runner saat ini
            document.getElementById('btn-hq-waiting-client').classList.remove('hide');
            document.getElementById('btn-hq-waiting-client').innerText = currentStatus === 'briefing' ? "MENUNGGU RUNNER BERANGKAT" : "RUNNER SEDANG DI PERJALANAN (OTW)";
        }
    } else {
        // --- PERSPEKTIF ADVENTURER (RUNNER) ---
        setupPartnerLinkText(m.requester_nick || m.full_mission_data?.client_name || "Client System", false);

        const btnOtw = document.getElementById('btn-hq-otw');
        const btnArrival = document.getElementById('btn-hq-arrival');
        const btnWait = document.getElementById('btn-hq-waiting-client');

        if (currentStatus === 'briefing') {
            btnOtw.classList.remove('hide');
            btnOtw.onclick = () => triggerMutationAction(contractId, 'otw', 'MULAI BERANGKAT OTW?', 'Peringatan! Harap konfirmasi dan beri kabar langsung kepada Requester melalui chat/telepon terlebih dahulu sebelum berjalan demi menghindari pembatalan sepihak!');
        } else if (currentStatus === 'otw') {
            btnArrival.classList.remove('hide');
            btnArrival.onclick = () => triggerMutationAction(contractId, 'arrival', 'KONFIRMASI TIBA?', 'Apakah Anda sudah benar-benar sampai di titik lokasi tujuan pembongkaran kargo?');
        } else if (currentStatus === 'arrival') {
            btnWait.classList.remove('hide');
            btnWait.innerText = "MENUNGGU KONFIRMASI KLIEN...";
            
            // AKTIFKAN COUNTDOWN DARURAT BILA KLIEN AFK
            handleEmergencyWatcher(contractId);
        }
    }
}

// 4. PERSPECTIVE MUTATOR WITH INTEGRATED MANDATORY MODAL ALERT
async function triggerMutationAction(contractId, nextStatus, modalTitle, warnMessage) {
    if (navigator.vibrate) navigator.vibrate(15);
    
    if (typeof window.sysConfirm === 'function') {
        const confirmResult = await window.sysConfirm(modalTitle, warnMessage);
        if (!confirmResult) return;
    } else {
        if (!confirm(`${modalTitle}\n\n${warnMessage}`)) return;
    }

    try {
        const db4 = window.SovereignState.rtdb;
        await db4.ref(`kontrak_mission/${contractId}`).update({ 
            status: nextStatus,
            ...(nextStatus === 'otw' ? { start_time: Date.now() } : {})
        });

        if (nextStatus === 'completed' && typeof window.showRatingScreen === 'function') {
            window.showRatingScreen();
        }
    } catch (err) {
        console.error("Mutation failed: ", err);
    }
}

// 5. ANTI-AFK COUNTDOWN CONTROLLER FOR RUNNER
function handleEmergencyWatcher(contractId) {
    if (window.HQState.afkCountdown) clearInterval(window.HQState.afkCountdown);
    
    const emBtn = document.getElementById('btn-hq-emergency');
    if (!emBtn) return;

    let timeLeft = 10;
    emBtn.classList.remove('hide');
    emBtn.disabled = true;
    emBtn.innerText = `PROTOKOL DARURAT AKTIF DALAM ${timeLeft}S...`;

    window.HQState.afkCountdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            emBtn.innerText = `PROTOKOL DARURAT AKTIF DALAM ${timeLeft}S...`;
        } else {
            clearInterval(window.HQState.afkCountdown);
            emBtn.disabled = false;
            emBtn.innerText = "⚠️ EMERGENCY FINISH (REQUESTER AFK)";
            emBtn.onclick = () => triggerMutationAction(contractId, 'completed', 'OVERRIDE DARURAT SEPIHAK?', 'Gunakan opsi ini jika pihak pemesan menghilang / AFK tanpa memberi respon. Anda akan diarahkan langsung menuju layar laporan evaluasi.');
            
            const txt = document.getElementById('ai-text');
            if (txt) txt.innerText = "Deteksi kegagalan respon dari enkripsi klien. Protokol Emergency Override sepihak disetujui.";
        }
    }, 1000);
}

// 6. TIME-BASED INTEL ASSISTANT ROTATION (8 SHIFTS FROM BRIEFING_ROOM)
function rotateShiftAssistant(role, status, advData, m) {
    const hour = new Date().getHours();
    const shifts = ["irene", "amy", "aldis", "ruby", "tessia", "aria", "asia", "sissy"];
    const currentAsis = shifts[Math.floor(hour / 3)] || "irene";

    const nameEl = document.getElementById('asisName');
    const imgEl = document.getElementById('asisImg');
    const textEl = document.getElementById('ai-text');

    if (nameEl) nameEl.innerText = currentAsis.toUpperCase();
    if (imgEl) imgEl.src = `${currentAsis}.png`;

    if (textEl) {
        textEl.classList.remove('loading-shimmer');
        if (role === 'requester') {
            const runnerName = advData?.meta?.nickname || m.adventurer_nick || "Runner";
            if (status === 'briefing') textEl.innerText = `Membuka jalur komando kargo. Menunggu ${runnerName} melakukan verifikasi persiapan berkas sebelum jalan.`;
            else if (status === 'otw') textEl.innerText = `Sinyal satelit melacak pergerakan ${runnerName} sedang menuju lokasi titik asal Anda.`;
            else if (status === 'arrival') textEl.innerText = `${runnerName} terkonfirmasi sudah sampai di koordinat target. Harap segera lakukan pembongkaran kargo.`;
            else textEl.innerText = "Siklus transmisi selesai. Kontrak misi berhasil diamankan ke arsip.";
        } else {
            if (status === 'briefing') textEl.innerText = "Sinyal aman. Berikan kabar konfirmasi wajib ke pihak Requester, lalu eksekusi tombol OTW.";
            else if (status === 'otw') textEl.innerText = "Jalur navigasi satelit menyala. Harap fokus berkendara dan jaga stabilitas kecepatan paket.";
            else if (status === 'arrival') textEl.innerText = "Tiba di tujuan. Serahkan barang kargo, lalu nantikan enkripsi tombol selesai dari pihak klien.";
            else textEl.innerText = "Misi diselesaikan dengan bersih. Poin stamina reward telah ditambahkan ke database Anda.";
        }
    }
}

// 7. COMPACT INTEGRATED PARTNER FOOTPRINT LINK
function setupPartnerLinkText(name, isReq) {
    const pLink = document.getElementById('partner-link-trigger');
    if (!pLink) return;
    pLink.innerText = `// PARTNER: ${name.toUpperCase()} [LINK]`;
    pLink.onclick = function() {
        if (navigator.vibrate) navigator.vibrate(15);
        if (window.Router) {
            window.Router.loadComponent('tab-profile', 'fet_showprofile.html');
        }
    };
}

// 8. HAVERSINE MATHEMATICS
function calculateHaversineDistance(origin, dest) {
    const distEl = document.getElementById('m-distance');
    if (!distEl) return;
    if (!origin || !dest) { distEl.innerText = "0.0"; return; }
    try {
        const [lat1, lon1] = origin.split(',').map(Number);
        const [lat2, lon2] = dest.split(',').map(Number);
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        distEl.innerText = (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))).toFixed(1);
    } catch(e) { distEl.innerText = "0.0"; }
}

// 9. REFRESHING REALTIME SIMULATED LOG FEED (ANTI-BOREDOM)
function startLiveTerminalFeed() {
    if (window.HQState.logRotationInterval) clearInterval(window.HQState.logRotationInterval);
    const subLog = document.getElementById('ai-sub-log');
    if (!subLog) return;

    const feeds = [
        "SECURING NEURAL CONNECTION AGAINST PACKET SNIFFERS...",
        "REFRACTING SATELLITE RADAR FREQUENCY OVER LOCAL AREA...",
        "SCANNING CIVILIAN ROAD DENSITY... ALL CHANNELS STABLE.",
        "MONITORING RUNNER STAMINA FLUCTUATION... PULSE NORMAL.",
        "SINKRONISASI ENKRIPSI DATABASE SYNC CHANNELS ACTIVE...",
        "SATELLITE TELEMETRY LOCK ON TARGET NODE... 100% SIGNAL."
    ];
    let i = 0;
    window.HQState.logRotationInterval = setInterval(() => {
        i = (i + 1) % feeds.length;
        subLog.innerText = feeds[i];
    }, 20000); // Berganti secara otomatis setiap 20 detik
}

// 10. TIMEOUT CLOCK 2 JAM
function runChronoClock(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    const end = startTime + (2 * 60 * 60 * 1000);
    const clockEl = document.getElementById('timer-val');

    window.HQState.timerInterval = setInterval(() => {
        const d = end - Date.now();
        if (!clockEl || d <= 0) {
            clearInterval(window.HQState.timerInterval);
            if (clockEl) clockEl.innerText = "EXPIRED";
            return;
        }
        const h = Math.floor(d / 3600000).toString().padStart(2, '0');
        const m = Math.floor((d % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((d % 60000) / 1000).toString().padStart(2, '0');
        clockEl.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function resetActionButtons() {
    document.getElementById('btn-hq-otw').classList.add('hide');
    document.getElementById('btn-hq-arrival').classList.add('hide');
    document.getElementById('btn-hq-waiting-client').classList.add('hide');
    document.getElementById('btn-hq-client-complete').classList.add('hide');
    document.getElementById('btn-hq-emergency').classList.add('hide');
}

// UTILITIES OPEN/CLOSE
window.toggleCargoAccordion = function() {
    const b = document.getElementById('cargo-accordion-content');
    const a = document.getElementById('accordion-arrow');
    if (b.classList.contains('open')) {
        b.classList.remove('open'); if(a) a.style.transform = 'rotate(0deg)';
    } else {
        b.classList.add('open'); if(a) a.style.transform = 'rotate(180deg)';
    }
};

window.toggleSafetyDisclaimer = function() {
    const s = document.getElementById('safety-spoiler-box');
    s.style.display = s.style.display === 'block' ? 'none' : 'block';
};

window.toggleAmbientPulse = function() {
    const b = document.getElementById('btn-ambient-toggle');
    b.classList.toggle('active');
    if (navigator.vibrate && b.classList.contains('active')) navigator.vibrate([10, 30, 10]);
};
