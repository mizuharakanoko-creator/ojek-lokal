/* ===================================================================
   CORE_HQ_VIEWER.JS (BRAIN 2) - PARITAS DATA & P2P INTERACTION VIEW
   Fungsi: Render DOM Detail Misi, Laci Drawer, P2P Deck & Logic Slider
   =================================================================== */

let missionTimerInterval = null;

// 1. Render Data Profil Driver ke Header (Menargetkan u-name dan u-rank asli Anda)
function renderDriverProfile(driverData) {
    if (!driverData) return;
    const elName = document.getElementById('u-name');
    const elRank = document.getElementById('u-rank');
    
    if (elName) elName.innerText = driverData.nick || driverData.nickname || driverData.name || "Unknown Agent";
    if (elRank) elRank.innerText = (driverData.role || driverData.rank || "?").substring(0, 2).toUpperCase();
}

function updateDriverProfileUI(driverData) {
    renderDriverProfile(driverData);
}

// 2. Render Dokumen Lengkap Misi Aktif & Ekstraksi Seluruh Data Akar Komponen
function updateHQViewer(mission) {
    if (!mission) {
        resetHQViewerToStandby();
        return;
    }

    // Ambil elemen DOM berdasarkan struktur ter-update dari HTML
    const mIdDisplay = document.getElementById('m-id-display');
    const mBadge = document.getElementById('m-kategori'); 
    const mTitle = document.getElementById('m-judul'); 
    const mClient = document.getElementById('m-pemesan'); 
    const mDistance = document.getElementById('m-jarak'); 
    const mOrigin = document.getElementById('m-titika'); 
    const mDest = document.getElementById('m-titikb'); 
    const mCargo = document.getElementById('m-barang'); 
    
    // ELEMEN TAMBAHAN INTEGRASI DATA AKAR BARU
    const mReward = document.getElementById('m-reward-display');
    const mShard = document.getElementById('m-zona-badge');
    const drawerA = document.getElementById('drawer-a');
    const drawerB = document.getElementById('drawer-b');

    // Suntik Data Utama ke HTML dengan jembatan fallback paritas
    const activeId = window.CoreState?.currentMissionId || mission.id_misi || "CTR-ACTIVE";
    if (mIdDisplay) mIdDisplay.innerText = `ID: ${activeId}`;
    if (mBadge) mBadge.innerText = (mission.kategori || mission.category || "MOTOR RIDE").toUpperCase();
    if (mTitle) mTitle.innerText = mission.judul || mission.judul_misi || `KONTRAK ${mission.category || 'OPERASIONAL'}`;
    if (mClient) mClient.innerText = mission.nama_pemesan || mission.client_name || "Stranger";
    if (mDistance) mDistance.innerText = mission.jarak || mission.jarak_estimasi || (mission.reward ? "Calculated" : "0");
    
    // Pemetaan detail rincian alamat utama [A] & [B]
    if (mOrigin) mOrigin.innerText = mission.titik_jemput || mission.origin_name || mission.origin_desa || "Tidak Ada Alamat";
    if (mDest) mDest.innerText = mission.titik_tujuan || mission.dest_name || mission.dest_desa || "Tidak Ada Alamat";
    if (mCargo) mCargo.innerText = mission.deskripsi_barang || mission.catatan || mission.dest_details || "Tidak Ada Deskripsi Kargo.";

    // SUNTIK DATA AKAR TERAKHIR (Finansial, Shard Regional, dan Isi Laci Dokumen)
    if (mReward) {
        const rewardAmount = mission.reward || 0;
        mReward.innerText = `Rp ${Number(rewardAmount).toLocaleString('id-ID')}`;
    }
    if (mShard) mShard.innerText = `SHARD: ${mission.shard_id || mission.zona || 'KNG'}`;
    if (drawerA) drawerA.innerText = mission.origin_details || "Tidak ada rincian patokan penjemputan.";
    if (drawerB) drawerB.innerText = mission.dest_details || "Tidak ada rincian patokan destinasi tujuan.";

    // Kelola Timer Operasional Berdasarkan Waktu Dibuat
    const targetTimestamp = mission.timestamp_bidding_selesai || mission.timestamp_create || mission.created_at;
    manageMissionTimer(targetTimestamp);

    // Atur Kontrol Visibilitas Lapisan Interaksi Operasional
    const currentStatus = mission.status_operational || mission.status || "open";
    
    // Ambil keputusan kemudi apakah memakai slider (terima awal) atau panel P2P deck (saat kerja)
    if (currentStatus === "kerja" || currentStatus === "taken") {
        const sliderZone = document.getElementById('slider-zone');
        if (sliderZone) sliderZone.style.display = "none";
        
        // Alihkan kendali penuh ke P2P Matrix Radar UI
        renderP2POperationalDeck();
    } else {
        const p2pDeck = document.getElementById('p2p-deck');
        if (p2pDeck) p2pDeck.style.display = "none";
        
        setupActionSlider(currentStatus);
    }
}

function updateMissionUI(mission) {
    updateHQViewer(mission);
}

// 3. Sistem Hitung Maju Waktu Operasional (Timer)
function manageMissionTimer(startTimestamp) {
    if (missionTimerInterval) clearInterval(missionTimerInterval);
    
    const timerVal = document.getElementById('live-status-time');
    if (!timerVal || !startTimestamp) return;

    missionTimerInterval = setInterval(() => {
        const sekarang = Date.now();
        const selisih = sekarang - startTimestamp;

        if (selisih < 0) {
            timerVal.innerText = "00:00:00";
            return;
        }

        const jam = Math.floor(selisih / 3600000).toString().padStart(2, '0');
        const menit = Math.floor((selisih % 3600000) / 60000).toString().padStart(2, '0');
        const detik = Math.floor((selisih % 60000) / 1000).toString().padStart(2, '0');

        timerVal.innerText = `${jam}:${menit}:${detik}`;
    }, 1000);
}

// 4. Konfigurasi Kontrol Geser (Slider Respon Misi Tahap Awal)
function setupActionSlider(statusOp) {
    const sliderZone = document.getElementById('slider-zone');
    const sliderText = document.getElementById('slider-text');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');

    if (!sliderZone) return;
    sliderZone.style.display = "block";
    
    if (statusOp === "terima") {
        if (sliderText) sliderText.innerText = "GESER UNTUK BERANGKAT (KERJA)";
    } else {
        if (sliderText) sliderText.innerText = "GESER UNTUK RESPOND KONTRAK";
    }

    if (thumb) {
        thumb.style.transition = "none";
        thumb.style.transform = "translateX(0px)";
    }
    if (fill) {
        fill.style.transition = "none";
        fill.style.width = "0px";
    }

    initSliderDragEngine(statusOp);
}

// 5. Engine Drag Slider Touch/Mouse
function initSliderDragEngine(statusOp) {
    const wrapper = document.querySelector('.slider-wrapper');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');
    
    if (!wrapper || !thumb) return;

    let isDragging = false;
    let startX = 0;
    const maxTrack = wrapper.clientWidth - thumb.clientWidth;

    const startDrag = (e) => { 
        isDragging = true; 
        thumb.style.transition = "none";
        if (fill) fill.style.transition = "none";
        startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
    };
    
    const doDrag = (e) => {
        if (!isDragging) return;
        const currentX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
        const rect = wrapper.getBoundingClientRect();
        
        let x = currentX - rect.left - (thumb.clientWidth / 2);
        if (x < 0) x = 0;
        if (x > maxTrack) x = maxTrack;

        thumb.style.transform = `translateX(${x}px)`;
        if (fill) fill.style.width = `${x + (thumb.clientWidth / 2)}px`;

        if (x >= maxTrack * 0.96) {
            isDragging = false;
            thumb.style.transform = `translateX(${maxTrack}px)`;
            if (fill) fill.style.width = "100%";
            processSliderAction(statusOp);
        }
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        
        thumb.style.transition = "transform 0.25s ease-out";
        thumb.style.transform = "translateX(0px)";
        if (fill) {
            fill.style.transition = "width 0.25s ease-out";
            fill.style.width = "0px";
        }
    };

    const newThumb = thumb.cloneNode(true);
    thumb.parentNode.replaceChild(newThumb, thumb);

    newThumb.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    newThumb.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', doDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
}

function processSliderAction(statusSekarang) {
    const targetId = window.CoreState?.currentMissionId;
    if (!targetId) {
        alert("Aksi ditolak: ID Kontrak aktif tidak ditemukan dalam RAM!");
        setupActionSlider(statusSekarang);
        return;
    }
    
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('notif-sfx');
    }

    let statusBaru = "terima";
    if (statusSekarang === "terima") {
        statusBaru = "kerja";
    }

    const boardDB = typeof getTerminal === 'function' ? (getTerminal('FB4_BOARD') || getTerminal('ojeklokal-42b84-default-rtdb')) : null;
    
    if (!boardDB) {
        console.warn("[BRAIN 2] Mengubah status operasional lokal (Virtual Override).");
        if (window.CoreState.activeMission) {
            window.CoreState.activeMission.status_operational = statusBaru;
            window.CoreState.activeMission.status = statusBaru;
            sessionStorage.setItem('current_mission_full', JSON.stringify(window.CoreState.activeMission));
            
            // Jika berubah menjadi status kerja, inisialisasi sinyal P2P tiruan untuk pengujian simulator
            if (statusBaru === "kerja") {
                window.CoreState.p2pSignal = "OTW";
            }
            
            setTimeout(() => { updateHQViewer(window.CoreState.activeMission); }, 400);
        }
        return;
    }

    boardDB.ref(`kontrak_mission/${targetId}`).update({
        status_operational: statusBaru,
        status: statusBaru,
        timestamp_operational_update: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        // Jika berhasil pindah ke status kerja, set inisialisasi sinyal P2P pertama kali ke DB
        if (statusBaru === "kerja") {
            boardDB.ref(`kontrak_signals/${targetId}`).set("OTW");
        }
    })
    .catch((err) => {
        console.error("Firebase Update Error:", err);
        setupActionSlider(statusSekarang);
    });
}

// ===================================================================
// UTILITY PENYUNTIKAN INTERAKSI REAL-TIME P2P DECK MATRIX (FITUR BARU)
// ===================================================================
function renderP2POperationalDeck() {
    const p2pDeck = document.getElementById('p2p-deck');
    const actionSpace = document.getElementById('p2p-action-space');
    
    if (!p2pDeck || !actionSpace) return;
    p2pDeck.style.display = "block";
    
    const role = window.CoreState.virtualRole || "adventurer";
    const currentSignal = window.CoreState.p2pSignal || "WAITING";
    
    let buttonHtml = "";

    // PARADIGMA KEMUDI 1: TAMPILAN SISI ADVENTURER (DRIVER)
    if (role === "adventurer") {
        if (currentSignal === "OTW") {
            buttonHtml = `<button class="btn-p2p" onclick="triggerP2PTransition('ARRIVED')" style="background:var(--neon-blue); color:#000;"><i class="fa-solid fa-location-crosshairs"></i> SAYA SUDAH SAMPAI LOKASI [A]</button>`;
        } else if (currentSignal === "ARRIVED") {
            buttonHtml = `<button class="btn-p2p" onclick="triggerP2PTransition('DELIVERING')" style="background:var(--neon-orange); color:#000;"><i class="fa-solid fa-truck-fast"></i> BARANG AMAN, MULAI ANTAR KE LOKASI [B]</button>`;
        } else if (currentSignal === "DELIVERING") {
            buttonHtml = `
                <div style="text-align:center; font-size:11px; color:#666; font-family:'JetBrains Mono'; margin-bottom:8px;">MENUNGGU KONFIRMASI REQUESTER DI LOKASI [B]</div>
                <button class="btn-p2p" style="background:rgba(0,255,136,0.05); color:var(--neon-green); border:1px solid var(--neon-green);" disabled><i class="fa-solid fa-spinner fa-spin"></i> TRANSMITTING CARGO SIGNAL...</button>
            `;
            // Trigger kemunculan penghitung waktu pengaman/AFK di sirkuit penutupan darurat HTML
            if (typeof syncEmergencyState === 'function' && window.CoreState.activeMission) {
                syncEmergencyState(window.CoreState.activeMission);
            }
        } else {
            buttonHtml = `<button class="btn-p2p" onclick="triggerP2PTransition('OTW')" style="background:var(--neon-purple); color:#fff;"><i class="fa-solid fa-satellite-dish"></i> AKTIFKAN SINYAL RADIO OTW</button>`;
        }
    } 
    // PARADIGMA KEMUDI 2: TAMPILAN SISI REQUESTER (CLIENT VIEW)
    else {
        if (currentSignal === "OTW") {
            buttonHtml = `<button class="btn-p2p" style="background:#111; color:#ff5500; border:1px solid #ff5500;" disabled><i class="fa-solid fa-motorcycle"></i> AGENT SEDANG MENUJU LOKASI ANDA</button>`;
        } else if (currentSignal === "ARRIVED") {
            buttonHtml = `<button class="btn-p2p" style="background:#111; color:#00f3ff; border:1px solid #00f3ff;" disabled><i class="fa-solid fa-box"></i> AGENT BERADA DI TITIK JEMPUT JALUR [A]</button>`;
        } else if (currentSignal === "DELIVERING") {
            buttonHtml = `<button class="btn-p2p" onclick="triggerRequesterFinalize()" style="background:var(--neon-green); color:#000; box-shadow:0 0 15px var(--neon-green);"><i class="fa-solid fa-circle-check"></i> KARGO DIKONDISIKAN, SELESAIKAN KONTRAK</button>`;
        } else {
            buttonHtml = `<button class="btn-p2p" style="background:#222; color:#555;" disabled>MENUNGGU RESPON GERAK FIELD AGENT...</button>`;
        }
    }

    actionSpace.innerHTML = buttonHtml;
}

// Fungsi Trigger Transmisi Transisi Sinyal P2P (Menembak ke Brain 1 / Gateway)
function triggerP2PTransition(nextSignal) {
    if (typeof sendP2PSignal === 'function') {
        sendP2PSignal(nextSignal);
    } else {
        // Fallback Simulasi RAM Lokal jika stand alone offline
        window.CoreState.p2pSignal = nextSignal;
        console.log(`[VIRTUAL P2P] Mengubah Sinyal Lokal ke -> ${nextSignal}`);
        renderP2POperationalDeck();
    }
}

// Fungsi Jabat Tangan Penutupan Kontrak oleh Sisi Pemesan (Requester)
async function triggerRequesterFinalize() {
    const setuju = await sysConfirm("KONFIRMASI SELESAI", "Apakah Anda menyatakan bahwa komoditas kargo telah mendarat dengan selamat di lokasi [B]?");
    if (!setuju) return;

    if (typeof updateMissionStatusToDone === 'function') {
        updateMissionStatusToDone();
    }
    
    // Buka jendela modal evaluasi bintang laporan yang ada di HTML utama
    if (typeof openEvaluationWindow === 'function') {
        openEvaluationWindow();
    } else if (typeof openEvalReq === 'function') {
        openEvalReq();
    }
}

// 7. Bersihkan Tampilan Saat Standby (Kembali ke State Kosong)
function resetHQViewerToStandby() {
    if (missionTimerInterval) { clearInterval(missionTimerInterval); missionTimerInterval = null; }

    const timerVal = document.getElementById('live-status-time');
    if (timerVal) timerVal.innerText = "00:00:00";

    const statusText = document.getElementById('live-status-text');
    if (statusText) statusText.innerText = "[SYS] STANDBY - MENUNGGU DATA MASUK";

    if (document.getElementById('m-id-display')) document.getElementById('m-id-display').innerText = "ID: STANDBY";
    if (document.getElementById('m-kategori')) document.getElementById('m-kategori').innerText = "SYSTEM";
    if (document.getElementById('m-judul')) document.getElementById('m-judul').innerText = "MENUNGGU KONTRAK MASUK";
    if (document.getElementById('m-pemesan')) document.getElementById('m-pemesan').innerText = "--";
    if (document.getElementById('m-jarak')) document.getElementById('m-jarak').innerText = "0";
    if (document.getElementById('m-titika')) document.getElementById('m-titika').innerText = "--";
    if (document.getElementById('m-titikb')) document.getElementById('m-titikb').innerText = "--";
    if (document.getElementById('m-barang')) document.getElementById('m-barang').innerText = "--";
    
    // Reset Data Tambahan Finansial & Laci Dokumen
    if (document.getElementById('m-reward-display')) document.getElementById('m-reward-display').innerText = "Rp 0";
    if (document.getElementById('m-zona-badge')) document.getElementById('m-zona-badge').innerText = "SHARD: --";
    if (document.getElementById('drawer-a')) document.getElementById('drawer-a').innerText = "--";
    if (document.getElementById('drawer-b')) document.getElementById('drawer-b').innerText = "--";
    
    const sliderZone = document.getElementById('slider-zone');
    if (sliderZone) sliderZone.style.display = "none";

    const p2pDeck = document.getElementById('p2p-deck');
    if (p2pDeck) p2pDeck.style.display = "none";
}
