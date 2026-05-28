/* ===================================================================
   CORE_HQ_VIEWER.JS (BRAIN 2) - PARITAS DATA & UI EXTENSION OPTIMIZED
   Fungsi: Render DOM Detail Misi, Perhitungan Timer, & Logika Slider Respon
   =================================================================== */

let missionTimerInterval = null;

// 1. Render Data Profil Driver ke Header (Menargetkan u-name dan u-rank asli Anda)
function renderDriverProfile(driverData) {
    if (!driverData) return;
    const elName = document.getElementById('u-name');
    const elRank = document.getElementById('u-rank');
    
    // Mendukung properti dari Firebase master ataupun user_identity session storage (.nick)
    if (elName) elName.innerText = driverData.nick || driverData.nickname || driverData.name || "Unknown Agent";
    if (elRank) elRank.innerText = (driverData.role || driverData.rank || "?").substring(0, 2).toUpperCase();
}

// Alias fungsi agar kompatibel dengan pemanggilan inter-modular di core_gateway.js
function updateDriverProfileUI(driverData) {
    renderDriverProfile(driverData);
}

// 2. Render Dokumen Lengkap Misi Aktif (Telah disesuaikan dengan ID Elemen kodeB.html & Paritas Dump Data)
function updateHQViewer(mission) {
    if (!mission) {
        resetHQViewerToStandby();
        return;
    }

    // Ambil elemen DOM berdasarkan struktur asli berkas Anda
    const mIdDisplay = document.getElementById('m-id-display');
    const mBadge = document.getElementById('m-kategori'); 
    const mTitle = document.getElementById('m-judul'); 
    const mClient = document.getElementById('m-pemesan'); 
    const mDistance = document.getElementById('m-jarak'); 
    const mOrigin = document.getElementById('m-titika'); 
    const mDest = document.getElementById('m-titikb'); 
    const mCargo = document.getElementById('m-barang'); 
    
    // Suntik Data ke HTML dengan jembatan fallback paritas (Bahasa Inggris <=> Bahasa Indonesia)
    const activeId = window.CoreState?.currentMissionId || mission.id_misi || "CTR-ACTIVE";
    if (mIdDisplay) mIdDisplay.innerText = `ID: ${activeId}`;
    
    if (mBadge) mBadge.innerText = (mission.kategori || mission.category || "MOTOR RIDE").toUpperCase();
    
    if (mTitle) {
        mTitle.innerText = mission.judul || mission.judul_misi || `KONTRAK ${mission.category || 'OPERASIONAL'}`;
    }
    
    if (mClient) mClient.innerText = mission.nama_pemesan || mission.client_name || "Stranger";
    if (mDistance) mDistance.innerText = mission.jarak || mission.jarak_estimasi || (mission.reward ? "Calculated" : "0");
    
    // Pemetaan detail alamat penjemputan (A)
    if (mOrigin) {
        mOrigin.innerText = mission.titik_jemput || mission.origin_name || mission.origin_desa || "Tidak Ada Alamat";
    }
    
    // Pemetaan detail alamat destinasi (B)
    if (mDest) {
        mDest.innerText = mission.titik_tujuan || mission.dest_name || mission.dest_desa || "Tidak Ada Alamat";
    }
    
    // Pemetaan spesifikasi kargo / catatan tambahan
    if (mCargo) {
        mCargo.innerText = mission.deskripsi_barang || mission.catatan || mission.dest_details || "Tidak Ada Deskripsi Kargo.";
    }

    // Kelola Timer Operasional Berdasarkan Waktu Dibuat (.created_at atau .timestamp_create)
    const targetTimestamp = mission.timestamp_bidding_selesai || mission.timestamp_create || mission.created_at;
    manageMissionTimer(targetTimestamp);

    // Atur Status Visibilitas Slider Aksi Utama (.status atau .status_operational)
    const currentStatus = mission.status_operational || mission.status || "open";
    setupActionSlider(currentStatus);
}

// Alias fungsi pemanggilan agar sinkron dengan core_gateway.js
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

// 4. Konfigurasi Kontrol Geser (Slider Respon Misi)
function setupActionSlider(statusOp) {
    const sliderZone = document.getElementById('slider-zone');
    const sliderText = document.getElementById('slider-text');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');

    if (!sliderZone) return;

    // Jika status operasional sudah dalam mode berjalan ("kerja" atau "taken")
    if (statusOp === "kerja" || statusOp === "taken") {
        sliderZone.style.display = "none";
        // Aliran penyelesaian darurat/afk diambil alih oleh core_settlement (Brain 3)
        if (typeof syncEmergencyState === 'function' && window.CoreState?.activeMission) {
            syncEmergencyState(window.CoreState.activeMission);
        }
        return;
    }

    // Tampilkan slider jika status masih "open" atau "terima"
    sliderZone.style.display = "block";
    
    // Setel label teks instruksi sesuai tingkatan status operasional
    if (statusOp === "terima") {
        if (sliderText) sliderText.innerText = "GESER UNTUK BERANGKAT (KERJA)";
    } else {
        if (sliderText) sliderText.innerText = "GESER UNTUK RESPOND KONTRAK";
    }

    // Reset posisi fisik slider mekanis kembali ke pangkal kiri
    if (thumb) {
        thumb.style.transition = "none";
        thumb.style.transform = "translateX(0px)";
    }
    if (fill) {
        fill.style.transition = "none";
        fill.style.width = "0px";
    }

    // Inisialisasi Handler Drag Seluler & Desktop Empiris
    initSliderDragEngine(statusOp);
}

// 5. Engine Drag Slider Touch/Mouse (Stabilisasi Gerakan & Transisi Koordinat)
function initSliderDragEngine(statusOp) {
    const wrapper = document.querySelector('.slider-wrapper');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');
    
    if (!wrapper || !thumb) return;

    let isDragging = false;
    let startX = 0;
    const maxTrack = wrapper.clientWidth - thumb.clientWidth;

    // Bersihkan transisi saat menyeret agar responsif 1:1 dengan jari/mouse
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
        
        // Kalkulasi posisi x absolut di dalam batas track wrapper slider
        let x = currentX - rect.left - (thumb.clientWidth / 2);
        
        if (x < 0) x = 0;
        if (x > maxTrack) x = maxTrack;

        thumb.style.transform = `translateX(${x}px)`;
        if (fill) fill.style.width = `${x + (thumb.clientWidth / 2)}px`;

        // Jika geseran mencapai ambang batas aman eksekusi 96%
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
        
        // Tambahkan animasi transisi halus saat thumb memantul kembali ke titik awal
        thumb.style.transition = "transform 0.25s ease-out";
        thumb.style.transform = "translateX(0px)";
        if (fill) {
            fill.style.transition = "width 0.25s ease-out";
            fill.style.width = "0px";
        }
    };

    // Lepas event handler lama agar tidak terjadi penumpukan listener (memory leak)
    const newThumb = thumb.cloneNode(true);
    thumb.parentNode.replaceChild(newThumb, thumb);

    // Re-bind Event Listeners Desktop Mouse
    newThumb.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    // Re-bind Event Listeners Mobile Touch Screen
    newThumb.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', doDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
}

// 6. Tembak Perubahan Status Operasional Ke Firebase (Pipa FB4_BOARD)
function processSliderAction(statusSekarang) {
    const targetId = window.CoreState?.currentMissionId;
    if (!targetId) {
        alert("Aksi ditolak: ID Kontrak aktif tidak ditemukan dalam RAM!");
        setupActionSlider(statusSekarang);
        return;
    }
    
    // Mainkan efek suara notifikasi sirkuit hq
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('notif-sfx');
    } else {
        const audio = document.getElementById('notif-sfx');
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

    // Logika Tingkatan Status: open -> terima -> kerja
    let statusBaru = "terima";
    if (statusSekarang === "terima") {
        statusBaru = "kerja";
    }

    console.log(`[BRAIN 2] Mengalihkan status matriks misi ${targetId} menjadi: ${statusBaru}`);

    // Dukungan multi-instans router board
    const boardDB = typeof getTerminal === 'function' ? (getTerminal('FB4_BOARD') || getTerminal('ojeklokal-42b84-default-rtdb')) : null;
    
    if (!boardDB) {
        // Mode Standalone Fallback: Jika database off, lakukan perubahan lokal di objek session/RAM langsung
        console.warn("[BRAIN 2] Firebase Router Off. Mengubah status operasional lokal (Virtual Override).");
        if (window.CoreState.activeMission) {
            window.CoreState.activeMission.status_operational = statusBaru;
            window.CoreState.activeMission.status = statusBaru;
            
            // Simpan pemutakhiran data ke session storage agar persisten saat di-refresh
            sessionStorage.setItem('current_mission_full', JSON.stringify(window.CoreState.activeMission));
            
            // Re-render UI otomatis berdasarkan status baru
            setTimeout(() => { setupActionSlider(statusBaru); }, 400);
        }
        return;
    }

    // Mode Online Terkoneksi: Update data langsung ke cloud real-time database
    boardDB.ref(`kontrak_mission/${targetId}`).update({
        status_operational: statusBaru,
        status: statusBaru,
        timestamp_operational_update: firebase.database.ServerValue.TIMESTAMP
    })
    .catch((err) => {
        console.error("Firebase Update Error:", err);
        alert("Gagal merespon matriks misi: " + err.message);
        setupActionSlider(statusSekarang); // Rollback visual otomatis ke posisi semula
    });
}

// 7. Bersihkan Tampilan Saat Standby (Kembali ke State Kosong)
function resetHQViewerToStandby() {
    if (missionTimerInterval) { clearInterval(missionTimerInterval); missionTimerInterval = null; }

    const timerVal = document.getElementById('live-status-time');
    if (timerVal) timerVal.innerText = "00:00:00";

    const statusText = document.getElementById('live-status-text');
    if (statusText) statusText.innerText = "[SYS] STANDBY - MENUNGGU DATA MASUK";

    // Bersihkan seluruh komponen teks menggunakan ID yang tepat
    if (document.getElementById('m-id-display')) document.getElementById('m-id-display').innerText = "ID: STANDBY";
    if (document.getElementById('m-kategori')) document.getElementById('m-kategori').innerText = "SYSTEM";
    if (document.getElementById('m-judul')) document.getElementById('m-judul').innerText = "MENUNGGU KONTRAK MASUK";
    if (document.getElementById('m-pemesan')) document.getElementById('m-pemesan').innerText = "--";
    if (document.getElementById('m-jarak')) document.getElementById('m-jarak').innerText = "0";
    if (document.getElementById('m-titika')) document.getElementById('m-titika').innerText = "--";
    if (document.getElementById('m-titikb')) document.getElementById('m-titikb').innerText = "--";
    if (document.getElementById('m-barang')) document.getElementById('m-barang').innerText = "--";
    
    const sliderZone = document.getElementById('slider-zone');
    if (sliderZone) sliderZone.style.display = "none";
}
