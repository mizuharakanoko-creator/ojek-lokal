/**
 * js_mission_progress_brain_two.js
 * OPERATIONAL HQ & DUAL-PERSPECTIVE RENDERING ENGINE (REVISED TACTICAL OS)
 */

window.HQState = {
    timerInterval: null,
    isInitialLoad: false,
    afkCountdownInterval: null
};

// 1. BOOTSTRAPPING ENGINE
window.initHQModule = async function() {
    console.log("🛰️ HQ: STARTING CORE SYNCHRONIZATION...");
    
    if (!window.SovereignState || !window.SovereignState.rtdb) {
        setTimeout(window.initHQModule, 300); 
        return;
    }

    const contractId = sessionStorage.getItem('active_contract_id');
    if (!contractId) {
        console.error("❌ HQ: CRITICAL FAILURE! CONTRACT ID NOT IN MEMORY SHARD");
        return;
    }

    // Sambungkan fungsi interaktif DOM lokal yang baru dimasukkan
    bindLocalUIActions();
    
    // Tarik data
    await performDeepMiningHQ(contractId);
};

// 2. DATA MINING INTERPRETER
async function performDeepMiningHQ(contractId) {
    try {
        if (typeof window.getSupremeData !== 'function') {
            console.warn("⏳ Waiting for terminal_router.js supreme functions...");
            setTimeout(() => performDeepMiningHQ(contractId), 500);
            return;
        }

        const dataPacket = await window.getSupremeData(contractId);
        
        if (dataPacket) {
            window.SovereignState.currentMissionData = dataPacket;
            renderHQ(dataPacket.mission, dataPacket.adventurer, dataPacket.requester);
        } else {
            const cache = sessionStorage.getItem('current_mission_full');
            if (cache) {
                const cData = JSON.parse(cache);
                renderHQ({ id_kontrak: contractId, full_mission_data: cData, reward: cData.reward, status: cData.status }, null, null);
            }
        }
    } catch (err) {
        console.error("💥 HQ CRASH DURING DEEP MINING: " + err.message);
    }
}

// 3. MAIN CORE RENDERING ENGINE (SINKRONISASI 100% UTAMA)
function renderHQ(m, advData, reqData) {
    if (!m) return;

    const fillText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };
    const fillHTML = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    const currentUser = window.SovereignState.currentUser || JSON.parse(sessionStorage.getItem('user_identity')) || {};
    const myRole = (currentUser.role || 'requester').toLowerCase();
    const currentStatus = (m.status || "briefing").toUpperCase();

    // A. IDENTITAS & WAKTU KONTRAK
    fillText('m-id-display', `ID: ${m.id_kontrak || 'UNKNOWN SHARD'}`);
    fillText('m-adv-nick', m.adventurer_nick || "UNASSIGNED");
    
    const categoryTitle = m.category || m.full_mission_data?.category || "REGULAR CONTRACT";
    fillText('m-title', categoryTitle.toUpperCase());

    const rawReward = m.reward || m.full_mission_data?.reward || 0;
    fillText('m-reward-cash', `Rp ${Number(rawReward).toLocaleString('id-ID')}`);

    // B. MANIFEST DUA TITIK (ORIGIN & DESTINATION)
    fillText('m-origin-desa', m.full_mission_data?.origin_desa || m.full_mission_data?.origin_name || "-");
    fillText('m-dest-desa', m.full_mission_data?.dest_desa || m.full_mission_data?.dest_name || "-");
    
    const specDetails = m.full_mission_data?.dest_details || "Tidak ada rincian manifes kargo tambahan.";
    fillHTML('m-cargo-detail', specDetails);
    
    const cargoHub = document.getElementById('cargo-hub');
    if (cargoHub) cargoHub.classList.remove('hide');

    // C. HAVERSINE DISTANCE MATHS
    const oCoords = m.full_mission_data?.origin_coords;
    const dCoords = m.full_mission_data?.dest_coords;
    if (oCoords && dCoords) {
        try {
            const [lat1, lon1] = oCoords.split(',').map(Number);
            const [lat2, lon2] = dCoords.split(',').map(Number);
            const R = 6371; 
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            fillText('m-distance', (R * c).toFixed(1));
        } catch(e) { fillText('m-distance', "0.0"); }
    } else { fillText('m-distance', "0.0"); }

    // D. LIVE CHRONO TIMER
    if (m.start_time) {
        const dObj = new Date(m.start_time);
        fillText('live-status-time', dObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + " WIB");
        runChronoCount(m.start_time);
    } else {
        runChronoCount(m.created_at || m.full_mission_data?.created_at || Date.now());
    }

    fillText('live-status-text', currentStatus);

    // E. ROTASI ASISTEN SHIFT BERBASIS JAM & PERAN
    triggerShiftAssistant(myRole, currentStatus);

    // ==========================================================================
    // SELEKSI PERSPEKTIF PERAN (REQUESTER VS ADVENTURER CONTROL ACCESS)
    // ==========================================================================
    const actionSliderBox = document.getElementById('action-slider-box');
    const btnMapsOrigin = document.getElementById('btn-maps-origin');
    const pNameEl = document.getElementById('u-name');
    const pRankEl = document.getElementById('u-rank');
    const pRoleEl = document.getElementById('u-role');

    if (myRole === 'requester') {
        // --- JALUR DATA REQUESTER (PEMILIK KONTRAK) ---
        if (pNameEl) {
            pNameEl.classList.remove('loading-shimmer');
            pNameEl.innerText = advData?.meta?.nickname || m.adventurer_nick || "MENCARI RUNNER...";
        }
        if (pRankEl) pRankEl.innerText = advData?.profile?.rank || "TRAINER";
        if (pRoleEl) pRoleEl.innerText = "RUNNER ASSIGNED (CLICK TO INSPECT)";

        // Hilangkan Slider Operasi & Tombol Peta dari Klien
        if (actionSliderBox) actionSliderBox.classList.add('hide');
        if (btnMapsOrigin) btnMapsOrigin.classList.add('hide');
        document.getElementById('emergency-zone').classList.add('hide');

    } else {
        // --- JALUR DATA ADVENTURER (RUNNER PELAKSANA) ---
        if (pNameEl) {
            pNameEl.classList.remove('loading-shimmer');
            pNameEl.innerText = m.requester_nick || m.full_mission_data?.client_name || "CLIENT SYSTEM";
        }
        if (pRankEl) pRankEl.innerText = "CLIENT";
        if (pRoleEl) pRoleEl.innerText = "TARGET MISSION CLIENT (CLICK TO INSPECT)";

        // Buka Akses Kontrol Slider & Navigasi Peta Satelit
        if (actionSliderBox) actionSliderBox.classList.remove('hide');
        if (btnMapsOrigin) btnMapsOrigin.classList.remove('hide');

        // Pengkondisian Warna & Label Slider Berdasarkan Status Berjalan
        const sliderLabel = document.getElementById('slider-label');
        const sliderWrapper = document.getElementById('slider-wrapper-bg');
        const mainSliderInput = document.getElementById('slider-thumb');

        if (mainSliderInput) mainSliderInput.value = 0; // Kembalikan ke titik awal

        if (currentStatus === "BRIEFING") {
            if (sliderLabel) sliderLabel.innerText = "GESER UNTUK OTW";
            if (sliderWrapper) sliderWrapper.style.background = "rgba(0, 242, 255, 0.02)";
        } else if (currentStatus === "OTW") {
            if (sliderLabel) sliderLabel.innerText = "GESER UNTUK ARRIVAL (TIBA)";
            if (sliderWrapper) sliderWrapper.style.background = "rgba(188, 19, 254, 0.04)";
        } else if (currentStatus === "ARRIVAL") {
            if (sliderLabel) sliderLabel.innerText = "GESER UNTUK SELESAI KONTRAK";
            if (sliderWrapper) sliderWrapper.style.background = "rgba(0, 255, 136, 0.04)";
        }

        // Tembakkan Handler Geser Slider Riil
        if (mainSliderInput) {
            mainSliderInput.oninput = function() {
                window.handleMissionSlider(this.value, m.id_kontrak, currentStatus);
            };
        }

        // Jalankan Pemicu Hitung Mundur Darurat (Anti-AFK) jika Status Telah "ARRIVAL"
        executeAFKWatcher(currentStatus);
    }
}

// 4. INTERACTIVE SLIDER CONTROLLER (MUTASI FIREBASE REALTIME)
window.handleMissionSlider = async function(val, contractId, currentStatus) {
    const label = document.getElementById('slider-label');
    if (!label) return;

    if (val >= 98) {
        document.getElementById('slider-thumb').value = 100;
        label.innerText = "SYNCHRONIZING SYSTEM SHARD...";
        
        if (navigator.vibrate) navigator.vibrate([30, 15, 30]); // Master Pulse Vibration

        try {
            const db4 = window.SovereignState.rtdb;
            let nextStatus = "";

            if (currentStatus === "BRIEFING") nextStatus = "otw";
            else if (currentStatus === "OTW") nextStatus = "arrival";
            else if (currentStatus === "ARRIVAL") nextStatus = "completed";

            if (nextStatus) {
                // Mutasi Status Kontrak secara Realtime di FB4_BOARD
                await db4.ref(`kontrak_mission/${contractId}`).update({ status: nextStatus });
                
                // Jika status selesai, otomatis buka lembar evaluasi rating
                if (nextStatus === "completed") {
                    if (typeof window.showRatingScreen === 'function') {
                        window.showRatingScreen();
                    }
                } else {
                    // Tarik data ulang untuk memperbarui UI ke fase berikutnya
                    performDeepMiningHQ(contractId);
                }
            }
        } catch (e) {
            label.innerText = "SYNCHRONIZATION ERROR!";
            console.error("Firebase Contract Update Failed: ", e);
            setTimeout(() => { label.innerText = "GESER ULANG"; document.getElementById('slider-thumb').value = 0; }, 1500);
        }
    } else {
        // Efek Getaran Mikro saat menggeser
        if (navigator.vibrate && val % 10 === 0) navigator.vibrate(4);

        if (currentStatus === "BRIEFING") {
            label.innerText = val > 40 ? "LEPASKAN UNTUK BERANGKAT" : "GESER UNTUK OTW";
        } else if (currentStatus === "OTW") {
            label.innerText = val > 40 ? "LEPASKAN UNTUK TIBA" : "GESER UNTUK ARRIVAL (TIBA)";
        } else {
            label.innerText = val > 40 ? "LEPASKAN UNTUK MENYELESAIKAN" : "GESER UNTUK SELESAI KONTRAK";
        }
    }
};

// 5. INTEL ADVISOR: ALGORITMA 8 SHIFT ASISTEN BERBASIS JAM
function triggerShiftAssistant(role, status) {
    const hour = new Date().getHours();
    const shiftLength = 3; 
    const shifts = ["irene", "amy", "aldis", "ruby", "tessia", "aria", "asia", "sissy"];
    const activeAsis = shifts[Math.floor(hour / shiftLength)] || "irene";

    const nameEl = document.getElementById('asisName');
    const imgEl = document.getElementById('asisImg');
    const textEl = document.getElementById('ai-text');

    if (nameEl) nameEl.innerText = activeAsis.toUpperCase();
    if (imgEl) imgEl.src = `${activeAsis}.png`;

    if (textEl) {
        textEl.classList.remove('loading-shimmer');
        
        // Generator Sapaan Dialog Taktis Berdasarkan Peran & Status Misi
        if (role === 'requester') {
            if (status === "BRIEFING") textEl.innerText = "Koneksi terjalin. Menunggu Runner melakukan verifikasi persiapan dokumen kargo.";
            else if (status === "OTW") textEl.innerText = "Runner terdeteksi bergerak di jalur satelit menuju titik jemput Anda.";
            else if (status === "ARRIVAL") textEl.innerText = "Runner telah berada di titik kargo Anda. Mohon segera lakukan transaksi.";
            else textEl.innerText = "Misi selesai. Terima kasih telah mempercayakan kargo pada Sovereign Guild.";
        } else {
            if (status === "BRIEFING") textEl.innerText = "Persiapan berkas kargo selesai. Geser indikator bawah untuk mulai bergerak OTW.";
            else if (status === "OTW") textEl.innerText = "Navigasi diaktifkan. Segera menuju lokasi penjemputan klien, dilarang memutus link.";
            else if (status === "ARRIVAL") textEl.innerText = "Satelit membaca Anda telah sampai. Lakukan bongkar muat lalu geser Selesai.";
            else textEl.innerText = "Protokol selesai. Shard Reward didepositokan penuh ke dalam dompet stamina Anda.";
        }
    }
}

// 6. TIMER OPERASIONAL 2 JAM
function runChronoCount(startTime) {
    if (window.HQState.timerInterval) clearInterval(window.HQState.timerInterval);
    const start = typeof startTime === 'number' ? startTime : Date.now();
    const limit = 2 * 60 * 60 * 1000; 
    const end = start + limit;

    window.HQState.timerInterval = setInterval(() => {
        const diff = end - Date.now();
        const el = document.getElementById('timer-val');
        
        if (!el || diff <= 0) {
            clearInterval(window.HQState.timerInterval);
            if (el) el.innerText = "EXPIRED";
            return;
        }
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        el.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// 7. EMERGENCY ENGINE: AFK TIMEOUT PROTOCOL
function executeAFKWatcher(status) {
    if (window.HQState.afkCountdownInterval) clearInterval(window.HQState.afkCountdownInterval);
    
    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer-text');
    const emSliderCont = document.getElementById('slider-container-em');
    const emSliderInput = document.getElementById('em-slider');

    if (!emZone) return;

    if (status !== "ARRIVAL") {
        emZone.classList.add('hide');
        return;
    }

    emZone.classList.remove('hide');
    let secondsLeft = 10;
    emSliderCont.style.display = 'none';
    emTimer.style.display = 'block';
    emTimer.innerText = `PROTOKOL DARURAT AKTIF DALAM ${secondsLeft}S... (GUNAKAN BILA REQUESTER AFK / GAGAL MERESPON)`;

    window.HQState.afkCountdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            emTimer.innerText = `PROTOKOL DARURAT AKTIF DALAM ${secondsLeft}S... (GUNAKAN BILA REQUESTER AFK / GAGAL MERESPON)`;
        } else {
            clearInterval(window.HQState.afkCountdownInterval);
            emTimer.style.display = 'none';
            emSliderCont.style.display = 'block';
            
            const textEl = document.getElementById('ai-text');
            if (textEl) textEl.innerText = "Sistem Mendeteksi Potensi Delay Klien. Emergency Override Slider Diaktifkan.";
        }
    }, 1000);

    if (emSliderInput) {
        emSliderInput.value = 0;
        emSliderInput.oninput = async function() {
            if (this.value >= 98) {
                this.value = 100;
                if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                
                // Menuju form rating / laporan penyelesaian darurat sepihak
                if (typeof window.showRatingScreen === 'function') {
                    window.showRatingScreen();
                }
            }
        };
    }
}

// 8. ACCORDION & NAVIGATION COUPLING ACTION BINDERS
function bindLocalUIActions() {
    // A. Fungsi klik mengalihkan Tab aktif ke Profil Partner
    const partnerBox = document.getElementById('partner-box-link');
    if (partnerBox) {
        partnerBox.removeAttribute('onclick'); // Bersihkan sisa instruksi inline lama
        partnerBox.onclick = function() {
            if (navigator.vibrate) navigator.vibrate(15);
            
            // Mencari bubble link berlabel profil di file induk navigation
            const targetNavLink = document.querySelector('[data-tab="tab-profile"]');
            if (targetNavLink && typeof window.switchNav === 'function') {
                window.switchNav('tab-profile', 'fet_showprofile.html', targetNavLink);
            } else if (window.Router) {
                window.Router.loadComponent('tab-profile', 'fet_showprofile.html');
            }
        };
    }

    // B. Peta Satelit Navigasi Terbuka
    const mapBtn = document.getElementById('btn-maps-origin');
    if (mapBtn) {
        mapBtn.onclick = function() {
            if (navigator.vibrate) navigator.vibrate(15);
            const activeMission = window.SovereignState.currentMissionData?.mission?.full_mission_data;
            if (activeMission && activeMission.origin_coords) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${activeMission.origin_coords}`, '_blank');
            }
        };
    }
}

// INTERACTIVE ACCORDION TOGGLES
window.toggleCargoAccordion = function() {
    const body = document.getElementById('cargo-accordion-content');
    const arrow = document.getElementById('accordion-arrow');
    if (!body) return;

    if (body.classList.contains('open')) {
        body.classList.remove('open');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
        body.classList.add('open');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
};

window.toggleSafetyDisclaimer = function() {
    const spoiler = document.getElementById('safety-spoiler-box');
    if (!spoiler) return;
    spoiler.style.display = spoiler.style.display === 'block' ? 'none' : 'block';
};

console.log("⚙️ [BRAIN TWO] OPERATIONAL HQ ENGINE SYNCED SUCCESSFULLY.");
