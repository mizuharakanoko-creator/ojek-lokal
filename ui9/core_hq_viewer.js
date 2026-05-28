/* ===================================================================
   CORE_HQ_VIEWER.JS (BRAIN 2)
   Fungsi: Render DOM Detail Misi, Perhitungan Timer, & Logika Slider Respon
   =================================================================== */

let missionTimerInterval = null;

// 1. Render Data Profil Driver ke Header
function renderDriverProfile(driverData) {
    const elName = document.getElementById('u-name');
    const elRank = document.getElementById('u-rank');
    
    if (elName) elName.innerText = driverData.name || "Unknown Courier";
    if (elRank) elRank.innerText = driverData.rank || "?";
}

// 2. Render Dokumen Lengkap Misi Aktif
function updateHQViewer(mission) {
    // Ambil elemen DOM
    const mIdDisplay = document.getElementById('m-id-display');
    const mBadge = document.getElementById('m-category-badge');
    const mTitle = document.getElementById('m-title');
    const mClient = document.getElementById('m-client-name');
    const mDistance = document.getElementById('m-distance');
    const mOrigin = document.getElementById('m-origin-name');
    const mDest = document.getElementById('m-dest-name');
    const mCargo = document.getElementById('m-cargo-detail');
    
    // Suntik Data Mentah ke HTML
    if (mIdDisplay) mIdDisplay.innerText = `ID: ${CoreState.currentMissionId || '---'}`;
    if (mBadge) mBadge.innerText = mission.kategori || "DELIVERY";
    if (mTitle) mTitle.innerText = mission.judul_misi || "KONTRAK BERJALAN";
    if (mClient) mClient.innerText = mission.requester_nick || mission.nama_pemesan || "Anonim";
    if (mDistance) mDistance.innerText = mission.jarak_estimasi || "0";
    if (mOrigin) mOrigin.innerText = mission.lokasi_jemput || "Tidak Ada Alamat";
    if (mDest) mDest.innerText = mission.lokasi_tujuan || "Tidak Ada Alamat";
    if (mCargo) mCargo.innerText = mission.spesifikasi_barang || "Tidak Ada Deskripsi Kargo.";

    // Kelola Timer Operasional Berdasarkan Waktu Dibuat
    manageMissionTimer(mission.timestamp_bidding_selesai || mission.timestamp_create);

    // Atur Status Visibilitas Slider Aksi Utama
    setupActionSlider(mission.status_operational);
}

// 3. Sistem Hitung Maju Waktu Operasional (Timer)
function manageMissionTimer(startTimestamp) {
    if (missionTimerInterval) clearInterval(missionTimerInterval);
    
    const timerVal = document.getElementById('timer-val') || document.getElementById('live-status-time');
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
    const sliderThumb = document.getElementById('slider-thumb');
    const sliderFill = document.getElementById('slider-fill');

    if (!sliderZone) return;

    // Jika status sudah "kerja", matikan slider utama (Penyelesaian diambil alih Brain 3 / Pemesan)
    if (statusOp === "kerja") {
        sliderZone.style.display = "none";
        return;
    }

    // Tampilkan slider jika status masih "terima" atau tahap awal penjemputan
    sliderZone.style.display = "block";
    
    // Setel label teks instruksi sesuai tingkatan status
    if (statusOp === "terima") {
        sliderText.innerText = "GESER UNTUK BERANGKAT (KERJA)";
    } else {
        sliderText.innerText = "GESER UNTUK MERESPON KONTRAK";
    }

    // Reset posisi slider fisik secara murni
    if (sliderThumb) sliderThumb.style.left = "0px";
    if (sliderFill) sliderFill.style.width = "0px";

    // Inisialisasi Handler Drag Seluler Empiris
    initSliderDragEngine(statusOp);
}

// 5. Engine Drag Slider Touch/Mouse
function initSliderDragEngine(statusOp) {
    const wrapper = document.querySelector('.slider-wrapper');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');
    
    if (!wrapper || !thumb) return;

    let isDragging = false;
    const maxTrack = wrapper.clientWidth - thumb.clientWidth;

    const startDrag = () => { isDragging = true; };
    const doDrag = (clientX) => {
        if (!isDragging) return;
        let rect = wrapper.getBoundingClientRect();
        let x = clientX - rect.left - (thumb.clientWidth / 2);
        
        if (x < 0) x = 0;
        if (x > maxTrack) x = maxTrack;

        thumb.style.left = x + 'px';
        if (fill) fill.style.width = (x + (thumb.clientWidth / 2)) + 'px';

        // Jika geseran mencapai batas 95% eksekusi pemicu status
        if (x >= maxTrack * 0.95) {
            isDragging = false;
            thumb.style.left = maxTrack + 'px';
            processSliderAction(statusOp);
        }
    };
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        // Animasi mental kembali ke posisi 0 jika batal dilepas di tengah jalan
        thumb.style.left = "0px";
        if (fill) fill.style.width = "0px";
    };

    // Event Listeners Mobile Touch & Desktop Mouse
    thumb.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', (e) => doDrag(e.clientX));
    window.addEventListener('mouseup', stopDrag);

    thumb.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', (e) => { if(e.touches[0]) doDrag(e.touches[0].clientX); });
    window.addEventListener('touchend', stopDrag);
}

// 6. Tembak Perubahan Status Operasional Ke Firebase (Pipa FB4_BOARD)
function processSliderAction(statusSekarang) {
    if (!CoreState.currentMissionId) return;
    if (typeof playCoreSFX === 'function') playCoreSFX('notif-sfx');

    let statusBaru = "terima";
    if (statusSekarang === "terima") {
        statusBaru = "kerja";
    }

    console.log(`[BRAIN 2] Mengalihkan status misi ${CoreState.currentMissionId} menjadi: ${statusBaru}`);

    const boardDB = getTerminal('FB4_BOARD'); //
    boardDB.ref(`kontrak_mission/${CoreState.currentMissionId}`).update({
        status_operational: statusBaru,
        timestamp_operational_update: firebase.database.ServerValue.TIMESTAMP
    })
    .catch((err) => {
        alert("Gagal merespon matriks misi: " + err.message);
        setupActionSlider(statusSekarang); // Rollback visual jika gagal jaringan
    });
}

// 7. Bersihkan Tampilan Saat Standby
function resetHQViewerToStandby() {
    if (missionTimerInterval) { clearInterval(missionTimerInterval); missionTimerInterval = null; }

    const timerVal = document.getElementById('live-status-time');
    if (timerVal) timerVal.innerText = "00:00:00";

    document.getElementById('m-id-display').innerText = "ID: STANDBY";
    document.getElementById('m-category-badge').innerText = "SYSTEM";
    document.getElementById('m-title').innerText = "MENUNGGU KONTRAK MASUK";
    document.getElementById('m-client-name').innerText = "--";
    document.getElementById('m-distance').innerText = "0";
    document.getElementById('m-origin-name').innerText = "--";
    document.getElementById('m-dest-name').innerText = "--";
    document.getElementById('m-cargo-detail').innerText = "--";
    
    const sliderZone = document.getElementById('slider-zone');
    if (sliderZone) sliderZone.style.display = "none";
}
