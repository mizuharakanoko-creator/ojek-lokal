/* ===================================================================
   MS_HQ_CONTROLLER.JS
   Role: HQ Core UI Viewport, AI Irene Core, System Clock/Timers, 
         Profile Drawer, & Slide-to-Action Interactive Mechanism
   =================================================================== */

// 1. STATE LOCK & TIMING VARS
let currentHqMissionId = null;
let currentHqData = null;
let touchStartX = 0;
let isScanningSlide = false;

// 2. MAIN HQ RENDERING ENGINE (Ditembak Otomatis Oleh ms_quest_state_manager.js)
function updateHQController(missionData) {
    currentHqMissionId = AppState.currentMissionId;
    currentHqData = missionData;

    if (!missionData) {
        resetHQToStandby();
        return;
    }

    console.log("[HQ] Synchronizing Operational Dossier Panel...");

    // A. PEMBARUAN IDENTITAS BERKAS & DETAIL KATA KUNCI MISI
    document.getElementById('m-id-display').innerText = `ID: ${currentHqMissionId.substring(0, 8).toUpperCase()}`;
    document.getElementById('m-title').innerText = missionData.title_mission || "OPERASI TAKTIS";
    document.getElementById('m-client-name').innerText = missionData.nama_client || "PRIVATE ANONYMOUS";
    
    const catBadge = document.getElementById('m-category-badge');
    if (catBadge) {
        catBadge.innerText = missionData.category_mission || "GUILD QUEST";
    }

    // B. DETAIL SPESIFIKASI KARGO / BARANG
    const cargoHub = document.getElementById('cargo-hub');
    const cargoDetail = document.getElementById('m-cargo-detail');
    if (missionData.spesifikasi_barang || missionData.cargo_specification) {
        if (cargoHub) cargoHub.classList.remove('hide');
        if (cargoDetail) cargoDetail.innerText = missionData.spesifikasi_barang || missionData.cargo_specification;
    } else {
        if (cargoHub) cargoHub.classList.add('hide');
    }

    // C. DESKRIPSI ALAMAT TITIK KOORDINAT (A & B)
    document.getElementById('m-origin-name').innerText = missionData.nama_tempat_pickup || "Lokasi Penjemputan Tidak Terdefinisi";
    document.getElementById('m-dest-name').innerText = missionData.nama_tempat_destination || "Lokasi Pengantaran Tidak Terdefinisi";

    const btnOrigin = document.getElementById('btn-maps-origin');
    const btnDest = document.getElementById('btn-maps-dest');
    const destHub = document.getElementById('dest-hub');

    if (btnOrigin) btnOrigin.classList.remove('hide');

    // D. DYNAMIC MATRIX PROGRESSION BASED ON STATUS OPERATIONAL
    const statusOp = missionData.status_operational;
    let pct = 0;
    let statusText = "";
    let indicatorColor = "var(--neon-blue)";

    // Pengaturan Progress Bar, Tombol Maps, dan Slider Tindakan
    if (statusOp === "otw") {
        pct = 35;
        statusText = "[SYS] EN ROUTE TO SOURCE POINT (TITIK A)";
        indicatorColor = "var(--neon-yellow)";
        if (btnDest) btnDest.classList.add('hide');
        if (destHub) destHub.classList.add('hide');
        setupSliderAction("GESER APABILA BARANG SUDAH DI AMBIL");
    } else if (statusOp === "kerja") {
        pct = 70;
        statusText = "[SYS] CARGO ACQUIRED - DELIVERY IN PROGRESS (TITIK B)";
        indicatorColor = "var(--neon-green)";
        if (btnDest) btnDest.classList.remove('hide');
        if (destHub) destHub.classList.remove('hide');
        setupSliderAction("GESER APABILA MISI SUDAH SELESAI TOKO");
    } else {
        pct = 0;
        statusText = "[SYS] PARSING ENCRYPTED CHANNELS...";
        hideSliderAction();
    }

    // Suntik Parameter ke DOM Progress Bar
    document.getElementById('m-progress-pct').innerText = `${pct}%`;
    const progressBar = document.getElementById('m-progress-bar');
    if (progressBar) progressBar.style.width = `${pct}%`;
    
    // Sinkronisasi Panel Status Real-time Bawah AI Terminal
    document.getElementById('live-status-text').innerText = statusText;
    const dot = document.getElementById('status-indicator');
    if (dot) {
        dot.style.background = indicatorColor;
        dot.style.boxShadow = `0 0 12px ${indicatorColor}`;
    }

    // E. RUNNING MISSION CLOCK (Pewaktu Misi Berjalan)
    activateMissionTimer(missionData.timestamp_accept);

    // F. SYSTEM INTELLIGENCE (AI IRENE & GUILD GUIDE SINKRONISASI)
    syncAIPrediction(statusOp, missionData);
}

// 3. SYSTEM CLOCK / ACTIVE TIMER ENGINE
function activateMissionTimer(timestampAccept) {
    if (AppState.activeTimerInterval) {
        clearInterval(AppState.activeTimerInterval);
    }

    const timerVal = document.getElementById('timer-val');
    if (!timerVal || !timestampAccept) return;

    function refreshClock() {
        const now = Date.now();
        const start = parseInt(timestampAccept);
        const diff = now - start;

        if (diff < 0) {
            timerVal.innerText = "00:00:00";
            return;
        }

        const totalSecs = Math.floor(diff / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        // Format padding string agar selalu 2 digit (00:00:00)
        const pad = (num) => num.toString().padStart(2, '0');
        timerVal.innerText = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        
        // Perbarui Jam Kecil Realtime pada Panel Indikator Status Utama
        const clockNow = new Date();
        document.getElementById('live-status-time').innerText = `${pad(clockNow.getHours())}:${pad(clockNow.getMinutes())}`;
    }

    refreshClock();
    AppState.activeTimerInterval = setInterval(refreshClock, 1000);
}

// 4. AI IRENE CONSOLE & GUILD EDUCATION GUIDE SYNC
function syncAIPrediction(statusOp, data) {
    const aiText = document.getElementById('ai-text');
    const aiBox = document.getElementById('ai-terminal-box');
    const eduBilah = document.getElementById('edu-bilah');
    const eduText = document.getElementById('edu-text');

    if (!aiText) return;

    if (statusOp === "otw") {
        aiText.innerText = `Irene mendeteksi Anda sedang bergerak ke ${data.nama_tempat_pickup || 'Titik A'}. Tetap fokus pada rute aman hulu ledak radar.`;
        if (aiBox) { aiBox.className = "ai-terminal pulse"; }
        
        if (eduBilah && eduText) {
            eduBilah.classList.remove('hide');
            eduText.innerText = "Sistem navigasi taktis terkunci. Temui pemesan atau datangi gerai titik jemput, amankan paket kargo, lalu geser tuas hijau di bawah untuk memperbarui status radar.";
        }
    } else if (statusOp === "kerja") {
        aiText.innerText = `Kargo teramankan! Rute menuju target ${data.nama_tempat_destination || 'Titik B'} terbuka. Estimasi waktu stabil.`;
        if (aiBox) { aiBox.className = "ai-terminal success"; }

        if (eduBilah && eduText) {
            eduBilah.classList.remove('hide');
            eduText.innerText = "Barang berada di tangan Anda. Selesaikan pengiriman menuju titik koordinat B. Jika ada tagihan tambahan seperti parkir wajib, masukkan nominal di tab LEDGER sebelum melakukan penyelesaian.";
        }
    }
}

// 5. INTERACTIVE SLIDE-TO-ACTION LOGIC (MEKANISME GESER AMAN)
function setupSliderAction(labelText) {
    const sliderZone = document.getElementById('slider-zone');
    const sliderText = document.getElementById('slider-text');
    const sliderThumb = document.getElementById('slider-thumb');
    const sliderFill = document.getElementById('slider-fill');

    if (!sliderZone || !sliderThumb) return;

    sliderZone.classList.remove('hide');
    sliderText.innerText = labelText;
    
    // Reset visual posisi semula
    sliderThumb.style.left = "4px";
    sliderFill.style.width = "0px";

    // Unbind event lama (jika ada) untuk mencegah penumpukan fungsi listener
    sliderThumb.ontouchstart = null;
    sliderThumb.ontouchmove = null;
    sliderThumb.ontouchend = null;

    const maxSlideWidth = sliderZone.querySelector('.slider-wrapper').clientWidth - 56; // 56px adalah lebar thumb + margin

    // Pemicu Awal Sentuhan HP (Touch Devices)
    sliderThumb.ontouchstart = function(e) {
        touchStartX = e.touches[0].clientX;
        isScanningSlide = true;
        sliderThumb.style.transition = "none";
        sliderFill.style.transition = "none";
    };

    // Saat Jari Digeser di Atas Layar
    sliderThumb.ontouchmove = function(e) {
        if (!isScanningSlide) return;
        let currentX = e.touches[0].clientX;
        let diffX = currentX - touchStartX;

        // Batasi geseran agar tidak keluar dari jalur rel slider
        if (diffX < 0) diffX = 0;
        if (diffX > maxSlideWidth) diffX = maxSlideWidth;

        sliderThumb.style.left = (diffX + 4) + "px";
        sliderFill.style.width = (diffX + 28) + "px"; // 28px untuk kompensasi radius jempol slider
    };

    // Saat Jari Diangkat dari Layar
    sliderThumb.ontouchend = function() {
        if (!isScanningSlide) return;
        isScanningSlide = false;

        const currentLeft = parseInt(sliderThumb.style.left);
        // Validasi toleransi geser penuh (Minimal 90% geseran sukses)
        if (currentLeft >= maxSlideWidth * 0.9) {
            sliderThumb.style.left = (maxSlideWidth + 4) + "px";
            sliderFill.style.width = "100%";
            executeStatusTransition();
        } else {
            // Jika gagal geser penuh, kembalikan posisi thumb dengan animasi membal
            sliderThumb.style.transition = "left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            sliderFill.style.transition = "width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            sliderThumb.style.left = "4px";
            sliderFill.style.width = "0px";
        }
    };
}

function hideSliderAction() {
    const sliderZone = document.getElementById('slider-zone');
    if (sliderZone) sliderZone.classList.add('hide');
}

// 6. EXECUTE STATUS TRANSITION DIRECT TO DATABASE
async function executeStatusTransition() {
    if (!currentHqMissionId || !currentHqData) return;

    playSFX('click-sfx');
    const currentStatus = currentHqData.status_operational;

    if (currentStatus === "otw") {
        const confirmPick = await sysConfirm("KONFIRMASI JEMPUT", "Apakah kargo barang sudah Anda amankan dan siap dikirim menuju lokasi tujuan B?");
        if (confirmPick) {
            FB4_BOARD.child("kontrak_mission").child(currentHqMissionId).update({
                status_operational: "kerja"
            }).then(() => sysAlert("UPDATE BERHASIL", "Status berhasil diubah! Silakan buka lokasi B pada peta taktis."));
        } else {
            setupSliderAction("GESER APABILA BARANG SUDAH DI AMBIL");
        }
    } else if (currentStatus === "kerja") {
        const confirmDone = await sysConfirm("OPERASI SELESAI", "Apakah Anda yakin barang telah sampai ke tangan penerima dengan aman? Aksi ini akan mengakhiri sesi kontrak.");
        if (confirmDone) {
            // Lempar Pengguna Terlebih Dahulu ke Formulir Evaluasi/Rating sebelum Done Mutlak
            if (typeof openEvaluationModal === 'function') {
                openEvaluationModal();
            }
        } else {
            setupSliderAction("GESER APABILA MISI SUDAH SELESAI TOKO");
        }
    }
}

// 7. PROFILE EXPANDABLE DRAWER SYSTEM
function toggleProfile() {
    playSFX('click-sfx');
    const drawer = document.getElementById('profile-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

// 8. RESET HQ TO STANDBY DEFAULT SCREEN
function resetHQToStandby() {
    currentHqMissionId = null;
    currentHqData = null;

    document.getElementById('m-id-display').innerText = "ID: ---";
    document.getElementById('m-title').innerText = "MENUNGGU MISI BARU";
    document.getElementById('m-client-name').innerText = "--";
    document.getElementById('m-progress-pct').innerText = "0%";
    
    const progressBar = document.getElementById('m-progress-bar');
    if (progressBar) progressBar.style.width = "0%";
    
    document.getElementById('timer-val').innerText = "00:00:00";
    document.getElementById('m-origin-name').innerText = "--";
    document.getElementById('m-dest-name').innerText = "--";

    const btnOrigin = document.getElementById('btn-maps-origin');
    const btnDest = document.getElementById('btn-maps-dest');
    const destHub = document.getElementById('dest-hub');
    const cargoHub = document.getElementById('cargo-hub');
    const eduBilah = document.getElementById('edu-bilah');

    if (btnOrigin) btnOrigin.classList.add('hide');
    if (btnDest) btnDest.classList.add('hide');
    if (destHub) destHub.classList.add('hide');
    if (cargoHub) cargoHub.classList.add('hide');
    if (eduBilah) eduBilah.classList.add('hide');

    document.getElementById('live-status-text').innerText = "[SYS] STANDBY - MENUNGGU SINKRONISASI PUSAT";
    const dot = document.getElementById('status-indicator');
    if (dot) {
        dot.style.background = "var(--text-muted)";
        dot.style.boxShadow = "none";
    }

    const aiText = document.getElementById('ai-text');
    if (aiText) aiText.innerText = "Menghubungkan ke satelit Guild... Berdiri bersiap di hangar operasional.";
    const aiBox = document.getElementById('ai-terminal-box');
    if (aiBox) aiBox.className = "ai-terminal";

    hideSliderAction();
}
