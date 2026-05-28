/* ===================================================================
   CORE_HQ_VIEWER.JS (BRAIN 2) - FULL UPDATE PARITAS DATA
   Fungsi: Render DOM Detail Misi, Perhitungan Timer, & Logika Slider Respon
   =================================================================== */

let missionTimerInterval = null;

// 1. Render Data Profil Driver ke Header (Menargetkan u-name dan u-rank asli Anda)
function renderDriverProfile(driverData) {
    const elName = document.getElementById('u-name');
    const elRank = document.getElementById('u-rank');
    
    if (elName) elName.innerText = driverData.nickname || driverData.name || "Unknown Courier";
    if (elRank) elRank.innerText = driverData.rank || "?";
}

// 2. Render Dokumen Lengkap Misi Aktif (Telah disesuaikan dengan ID Elemen kodeB.html)
function updateHQViewer(mission) {
    // Ambil elemen DOM berdasarkan struktur asli berkas Anda
    const mIdDisplay = document.getElementById('m-id-display');
    const mBadge = document.getElementById('m-kategori'); // Sesuai kodeB.html
    const mTitle = document.getElementById('m-judul'); // Sesuai kodeB.html
    const mClient = document.getElementById('m-pemesan'); // Sesuai kodeB.html
    const mDistance = document.getElementById('m-jarak'); // Sesuai kodeB.html
    const mOrigin = document.getElementById('m-titika'); // Sesuai kodeB.html
    const mDest = document.getElementById('m-titikb'); // Sesuai kodeB.html
    const mCargo = document.getElementById('m-barang'); // Sesuai kodeB.html
    
    // Suntik Data Mentah dari Firebase Shard ke HTML
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
    
    // Fallback mencari target display timer di status panel
    const timerVal = document.getElementById('live-status-time') || document.getElementById('timer-val');
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

    // Jika status sudah "kerja", sembunyikan slider utama (Penyelesaian diambil alih Brain 3 / Pemesan)
    if (statusOp === "kerja") {
        sliderZone.style.display = "none";
        return;
    }

    // Tampilkan slider jika status masih "terima" atau tahap awal penjemputan
    sliderZone.style.display = "block";
    
    // Setel label teks instruksi sesuai tingkatan status operasional
    if (statusOp === "terima") {
        if (sliderText) sliderText.innerText = "GESER UNTUK BERANGKAT (KERJA)";
    } else {
        if (sliderText) sliderText.innerText = "GESER UNTUK MERESPON KONTRAK";
    }

    // Reset posisi fisik slider mekanis kembali ke pangkal kiri
    if (sliderThumb) sliderThumb.style.left = "0px";
    if (sliderFill) sliderFill.style.width = "0px";

    // Inisialisasi Handler Drag Seluler & Desktop Empiris
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

        // Jika geseran mencapai batas ambang batas aman 95%
        if (x >= maxTrack * 0.95) {
            isDragging = false;
            thumb.style.left = maxTrack + 'px';
            processSliderAction(statusOp);
        }
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        // Animasi balik ke titik nol apabila tarikan dilepas di tengah jalan
        thumb.style.left = "0px";
        if (fill) fill.style.width = "0px";
    };

    // Event Listeners Desktop Mouse
    thumb.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', (e) => doDrag(e.clientX));
    window.addEventListener('mouseup', stopDrag);

    // Event Listeners Mobile Touch
    thumb.addEventListener('touchstart', startDrag);
    window.addEventListener('touchmove', (e) => { if(e.touches[0]) doDrag(e.touches[0].clientX); });
    window.addEventListener('touchend', stopDrag);
}

// 6. Tembak Perubahan Status Operasional Ke Firebase (Pipa FB4_BOARD)
function processSliderAction(statusSekarang) {
    if (!CoreState.currentMissionId) return;
    
    // Mainkan efek suara notifikasi bawaan sirkuit utama
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('notif-sfx');
    } else {
        const audio = document.getElementById('notif-sfx');
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

    let statusBaru = "terima";
    if (statusSekarang === "terima") {
        statusBaru = "kerja";
    }

    console.log(`[BRAIN 2] Mengalihkan status misi ${CoreState.currentMissionId} menjadi: ${statusBaru}`);

    const boardDB = getTerminal('FB4_BOARD');
    if (!boardDB) {
        alert("Gagal memproses aksi: Matriks Jaringan Shard Rusak!");
        setupActionSlider(statusSekarang);
        return;
    }

    boardDB.ref(`kontrak_mission/${CoreState.currentMissionId}`).update({
        status_operational: statusBaru,
        timestamp_operational_update: firebase.database.ServerValue.TIMESTAMP
    })
    .catch((err) => {
        alert("Gagal merespon matriks misi: " + err.message);
        setupActionSlider(statusSekarang); // Rollback visual otomatis ke posisi semula
    });
}

// 7. Bersihkan Tampilan Saat Standby (Kembali ke State Awal)
function resetHQViewerToStandby() {
    if (missionTimerInterval) { clearInterval(missionTimerInterval); missionTimerInterval = null; }

    const timerVal = document.getElementById('live-status-time');
    if (timerVal) timerVal.innerText = "00:00:00";

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
