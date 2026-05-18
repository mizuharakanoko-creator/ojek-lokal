/**
 * js_mission_progress_brain_two.js
 * TACTICAL COMMAND CENTER ENGINE - SINKRONISASI FLOATING INDUK & RADAR HQ
 * [UPDATED]: Arsitektur Kontrol Melayang Global, Telemetri GPS & Live Logging
 */

window.HQState = {
    timerInterval: null,
    logRotationInterval: null,
    afkCountdown: null
};

// ==========================================================================
// 1. BOOTSTRAPPING ENGINE SYNC
// ==========================================================================
window.initHQModule = async function() {
    console.log("📡 [BRAIN TWO]: INITIALIZING COMMAND ENGINE SYNC...");
    
    // Validasi ketersediaan State Global Firebase RTDB
    if (!window.SovereignState || !window.SovereignState.rtdb) {
        setTimeout(window.initHQModule, 200);
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        console.error("❌ [BRAIN TWO]: ABSENCE OF ACTIVE CONTRACT ID SHARD!");
        return;
    }

    // Tarik dan pantau data dari server secara realtime
    listenContractRealtime(contractId);
};

// ==========================================================================
// 2. REALTIME SERVER SYNCHRONIZER
// ==========================================================================
function listenContractRealtime(contractId) {
    const db4 = window.SovereignState.rtdb;
    db4.ref(`kontrak_mission/${contractId}`).on('value', async snap => {
        if (!snap.exists()) {
            console.warn("⚠️ Contract destroyed or unlinked from server.");
            return;
        }

        const contractData = snap.val();
        
        // Fail-safe Interseptor: Cek ketersediaan data eksternal paket
        if (typeof window.getSupremeData === 'function') {
            try {
                const dataPacket = await window.getSupremeData(contractId);
                if (dataPacket) {
                    window.SovereignState.currentMissionData = dataPacket;
                    executeRenderHQ(dataPacket.mission, dataPacket.adventurer, dataPacket.requester);
                    return;
                }
            } catch (err) {
                console.warn("⚠️ Fallback to snap data due to routing fetch error:", err);
            }
        }

        // Jalur Utama / Fallback Cache Render langsung dari Snapshot
        executeRenderHQ(contractData, null, null);
    });
}

// ==========================================================================
// 3. CORE LOGIC GRAPHICS & FLOATING INTERFACE RENDERING
// ==========================================================================
function executeRenderHQ(m, advData, reqData) {
    if (!m) return;

    const currentUser = window.SovereignState.currentUser || JSON.parse(sessionStorage.getItem('user_identity')) || {};
    const myRole = (currentUser.role || 'requester').toLowerCase();
    const currentStatus = (m.status || "briefing").toLowerCase();
    const contractId = m.id_kontrak || sessionStorage.getItem('active_contract_id');

    // --- BROADCAST DATA KE VIEW HQ (SIARAN RADAR SATELIT) ---
    const idDisplay = document.getElementById('m-id-display');
    if (idDisplay) idDisplay.innerText = `ID: ${contractId}`;
    
    const titleEl = document.getElementById('m-title');
    if (titleEl) {
        const categoryTitle = m.category || m.full_mission_data?.category || "REGULAR MISSION";
        titleEl.innerText = categoryTitle.toUpperCase();
    }

    const rewardEl = document.getElementById('m-reward-cash');
    if (rewardEl) {
        const rawReward = m.reward || m.full_mission_data?.reward || 0;
        rewardEl.innerText = `Rp ${Number(rawReward).toLocaleString('id-ID')}`;
    }

    const badge = document.getElementById('m-status-badge');
    if (badge) {
        badge.innerText = currentStatus.toUpperCase();
        badge.className = `status-badge-neon ${currentStatus}`;
    }

    const origDesa = document.getElementById('m-origin-desa');
    if (origDesa) origDesa.innerText = m.full_mission_data?.origin_desa || m.full_mission_data?.origin_name || m.origin_name || "-";
    
    const destDesa = document.getElementById('m-dest-desa');
    if (destDesa) destDesa.innerText = m.full_mission_data?.dest_desa || m.full_mission_data?.dest_name || m.dest_name || "-";
    
    const cargoDetail = document.getElementById('m-cargo-detail');
    if (cargoDetail) cargoDetail.innerHTML = m.full_mission_data?.dest_details || m.dest_details || "Tidak ada instruksi khusus.";
    
    const cargoHub = document.getElementById('cargo-hub');
    if (cargoHub) cargoHub.classList.remove('hide');

    // Suntikkan Koordinat ke Tombol Quick Maps Shard di HQ (Jika Elemen Tersedia)
    const quickNavBtn = document.getElementById('btn-quick-nav');
    if (quickNavBtn) {
        const targetCoords = m.full_mission_data?.dest_coords || m.dest_coords;
        if (targetCoords) {
            quickNavBtn.classList.remove('hide');
            quickNavBtn.onclick = () => window.open(`https://www.google.com/maps/search/?api=1&query=${targetCoords}`, '_blank');
        } else {
            quickNavBtn.classList.add('hide');
        }
    }

    calculateHaversineDistance(
        m.full_mission_data?.origin_coords || m.origin_coords, 
        m.full_mission_data?.dest_coords || m.dest_coords
    );

    const baseTime = m.start_time || m.created_at || m.full_mission_data?.created_at || Date.now();
    runChronoClock(baseTime);
    rotateShiftAssistant(myRole, currentStatus, advData, m);
    startLiveTerminalFeed();

    // ==========================================================================
    // MANAGEMENT TOMBOL MELAYANG GLOBAL (INTERFACES INDUK)
    // ==========================================================================
    resetActionButtons();

    // Mengaktifkan/Mematikan Speedometer GPS berdasarkan status OTW & Peran Pengguna
    if (currentStatus === 'otw' && myRole !== 'requester') {
        if (typeof window.startLocalSpeedometer === 'function') window.startLocalSpeedometer();
    } else {
        if (typeof window.stopLocalSpeedometer === 'function') window.stopLocalSpeedometer();
    }

    if (myRole === 'requester') {
        // --- PERSPEKTIF REQUESTER (KLIEN) ---
        const partnerName = advData?.meta?.nickname || m.adventurer_nick || "Runner Terpilih";
        setupPartnerLinkText(partnerName, true);
        
        if (currentStatus === 'arrival') {
            const btnComplete = document.getElementById('float-btn-complete');
            if (btnComplete) {
                btnComplete.classList.remove('hide');
                btnComplete.onclick = () => triggerMutationAction(contractId, 'completed', 'Konfirmasi Selesai?', 'Apakah Anda yakin kargo/barang sudah Anda terima dengan lengkap? Tindakan ini bersifat absolut dan akan mendepositokan reward penuh ke dompet partner.');
            }
        } else {
            const btnWaitClient = document.getElementById('float-btn-waiting');
            if (btnWaitClient) {
                btnWaitClient.classList.remove('hide');
                btnWaitClient.innerText = currentStatus === 'briefing' ? "MENUNGGU RUNNER BERANGKAT" : "RUNNER SEDANG DI PERJALANAN (OTW)";
            }
        }
    } else {
        // --- PERSPEKTIF ADVENTURER (RUNNER) ---
        const reqName = reqData?.meta?.nickname || m.requester_nick || m.full_mission_data?.client_name || "Client Requester";
        setupPartnerLinkText(reqName, false);

        const btnOtw = document.getElementById('float-btn-otw');
        const btnArrival = document.getElementById('float-btn-arrival');
        const btnWait = document.getElementById('float-btn-waiting');

        if (currentStatus === 'briefing') {
            if (btnOtw) {
                btnOtw.classList.remove('hide');
                btnOtw.onclick = () => triggerMutationAction(contractId, 'otw', 'MULAI BERANGKAT OTW?', 'Peringatan! Harap pastikan Anda sudah mengonfirmasi dan memberi kabar langsung kepada Requester melalui chat/telepon terlebih dahulu sebelum berjalan.');
            }
        } else if (currentStatus === 'otw') {
            if (btnArrival) {
                btnArrival.classList.remove('hide');
                btnArrival.onclick = () => triggerMutationAction(contractId, 'arrival', 'KONFIRMASI TIBA?', 'Apakah Anda sudah benar-benar sampai di titik lokasi koordinat tujuan pembongkaran kargo?');
            }
        } else if (currentStatus === 'arrival') {
            if (btnWait) {
                btnWait.classList.remove('hide');
                btnWait.innerText = "MENUNGGU KONFIRMASI KLIEN...";
            }
            
            // AKTIFKAN COUNTDOWN DARURAT BILA KLIEN AFK (TOMBOL MELAYANG)
            handleEmergencyWatcher(contractId);
        }
    }

    // Suntikkan update baris ke Telemetry Tracker Log di HQ
    pushTelemetryLiveLog(currentStatus, myRole);
}

// ==========================================================================
// 4. PERSPECTIVE MUTATOR WITH STANDALONE CONFIRMATION SYSTEM
// ==========================================================================
async function triggerMutationAction(contractId, nextStatus, modalTitle, warnMessage) {
    if (navigator.vibrate) navigator.vibrate(15);
    
    let confirmResult = false;
    if (typeof window.sysConfirm === 'function') {
        confirmResult = await window.sysConfirm(modalTitle, warnMessage);
    } else {
        confirmResult = confirm(`${modalTitle}\n\n${warnMessage}`);
    }

    if (!confirmResult) return;

    try {
        const db4 = window.SovereignState.rtdb;
        await db4.ref(`kontrak_mission/${contractId}`).update({ 
            status: nextStatus,
            ...(nextStatus === 'otw' ? { start_time: Date.now() } : {})
        });

        // Trigger layar rating jika status selesai dan fungsinya terintegrasi
        if (nextStatus === 'completed' && typeof window.showRatingScreen === 'function') {
            window.showRatingScreen();
        }
    } catch (err) {
        console.error("❌ [BRAIN TWO]: Status Mutation failed: ", err);
    }
}

// ==========================================================================
// 5. ANTI-AFK FLOATING COUNTDOWN CONTROLLER FOR RUNNER
// ==========================================================================
function handleEmergencyWatcher(contractId) {
    if (window.HQState.afkCountdown) clearInterval(window.HQState.afkCountdown);
    
    const emBtn = document.getElementById('float-btn-emergency');
    if (!emBtn) return;

    let timeLeft = 10;
    emBtn.classList.remove('hide');
    emBtn.disabled = true;
    emBtn.innerText = `PROTOKOL DARURAT AKTIF [${timeLeft}S]...`;

    window.HQState.afkCountdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            emBtn.innerText = `PROTOKOL DARURAT AKTIF [${timeLeft}S]...`;
        } else {
            clearInterval(window.HQState.afkCountdown);
            emBtn.disabled = false;
            emBtn.innerText = "⚠️ EMERGENCY FINISH (FORCE OVERRIDE)";
            emBtn.onclick = () => triggerMutationAction(contractId, 'completed', 'OVERRIDE DARURAT SEPIHAK?', 'Gunakan opsi ini jika pihak pemesan menghilang / AFK tanpa memberi respon setelah Anda tiba.');
            
            const txt = document.getElementById('ai-text');
            if (txt) {
                txt.classList.remove('loading-shimmer');
                txt.innerText = "Deteksi kegagalan respon dari terminal enkripsi klien. Protokol Emergency Override sepihak disetujui untuk dieksekusi.";
            }
        }
    }, 1000);
}

// ==========================================================================
// 6. TIME-BASED INTEL ASSISTANT ROTATION (8 SHIFTS FROM BRIEFING_ROOM)
// ==========================================================================
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

// ==========================================================================
// 7. COMPACT INTEGRATED PARTNER FOOTPRINT LINK
// ==========================================================================
function setupPartnerLinkText(name, isReq) {
    const pLink = document.getElementById('partner-link-trigger');
    if (!pLink) return;
    pLink.innerText = `// PARTNER: ${name.toUpperCase()} [LINK]`;
    pLink.onclick = function() {
        if (navigator.vibrate) navigator.vibrate(15);
        if (window.Router && typeof window.Router.loadComponent === 'function') {
            window.Router.loadComponent('tab-profile', 'fet_showprofile.html');
        } else {
            console.log(`Navigating to profile of: ${name}`);
        }
    };
}

// ==========================================================================
// 8. HAVERSINE MATHEMATICS
// ==========================================================================
function calculateHaversineDistance(origin, dest) {
    const distEl = document.getElementById('m-distance');
    if (!distEl) return;
    if (!origin || !dest) { distEl.innerText = "0.0"; return; }
    try {
        const [lat1, lon1] = origin.split(',').map(Number);
        const [lat2, lon2] = dest.split(',').map(Number);
        const R = 6371; // Radius bumi dalam KM
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        distEl.innerText = (R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))).toFixed(1);
    } catch(e) { distEl.innerText = "0.0"; }
}

// ==========================================================================
// 9. REFRESHING REALTIME SIMULATED LOG FEED (ANTI-BOREDOM)
// ==========================================================================
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
    }, 20000);
}

// ==========================================================================
// 10. TIMEOUT CLOCK 2 JAM
// ==========================================================================
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

// ==========================================================================
// 11. SINKRONISASI TELEMETRI LIVE TRACKER LOG BOX (HQ SPECIAL)
// ==========================================================================
function pushTelemetryLiveLog(status, role) {
    const container = document.getElementById('telemetry-container');
    if (!container) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    let logMessage = "SYSTEM DATA SHARD IS WORKING IN STEADY STATE.";
    if (status === 'briefing') {
        logMessage = `INITIAL MATRIX SYNCHRONIZED. WAITING FOR DEPLOYMENT TRIGGER.`;
    } else if (status === 'otw') {
        logMessage = `TELEMETRY ACTIVE: ${role === 'requester' ? 'RUNNER' : 'YOU ARE'} DEPLOYED ON ROUTE. GPS TRACKING LINK LIVE.`;
    } else if (status === 'arrival') {
        logMessage = `TARGET COORDINATE MATCHED. DETECTING CARGO UNBOXING UNTIL REWARD RELEASED.`;
    } else if (status === 'completed') {
        logMessage = `CORE ENCRYPTION SOLVED. REWARD CREDITED. TERM LINK TERMINATED CLEANLY.`;
    }

    // Hindari duplikasi baris status yang sama secara berulang-ulang
    const hashId = `tele-log-${status}`;
    if (document.getElementById(hashId)) return;

    const row = document.createElement('div');
    row.id = hashId;
    row.className = 'telemetry-row';
    row.innerHTML = `<span class="telemetry-time">[${timeStr}]</span>${logMessage}`;
    
    container.appendChild(row);
    
    // Auto-scroll log box ke bagian paling bawah
    const logBox = container.parentElement;
    if (logBox) logBox.scrollTop = logBox.scrollHeight;
}

// ==========================================================================
// PEMBERSIH UTAMA TOMBOL-TOMBOL INDUK MELAYANG
// ==========================================================================
function resetActionButtons() {
    const floatIds = ['float-btn-otw', 'float-btn-arrival', 'float-btn-waiting', 'float-btn-complete', 'float-btn-emergency'];
    floatIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hide');
    });
}
