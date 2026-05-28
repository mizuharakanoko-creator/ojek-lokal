/* ===================================================================
   CORE_SETTLEMENT.JS (BRAIN 3) - FULL UPDATE PARITAS 100%
   Fungsi: Penghitungan Masa Proteksi AFK, Sistem Rating Bintang, 
           & Eksekusi Penutupan Dokumen Misi (Selesai Absolut)
   =================================================================== */

let emergencyIntervalEngine = null;
let selectedRatingValue = 0;

// 1. Sinkronisasi Kondisi Darurat Berdasarkan Data Mentah Brain 1
function syncEmergencyState(mission) {
    if (!mission) {
        resetEmergencyState();
        return;
    }

    const statusOp = mission.status_operational;
    const emZone = document.getElementById('emergency-zone');

    // Protokol darurat otomatis aktif HANYA saat status operasional berada di tahap "kerja"
    if (statusOp === "kerja") {
        // Perbaikan logika: Deteksi jika elemen memang tidak terlihat di layar screen
        if (emZone && (emZone.style.display === "none" || window.getComputedStyle(emZone).display === "none")) {
            startEmergencyCountdown(mission.timestamp_operational_update || Date.now());
        }
    } else {
        resetEmergencyState();
    }
}

// 2. Engine Hitung Mundur Munculnya Tombol Selesai Paksa Darurat
function startEmergencyCountdown(lastUpdateTimestamp) {
    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer-msg');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');

    if (!emZone || !emTimer || !sliderCont) return;

    if (emergencyIntervalEngine) clearInterval(emergencyIntervalEngine);

    // Tampilkan bungkus luar darurat
    emZone.style.display = "block";
    emTimer.style.display = "block";
    sliderCont.style.display = "none";
    if (emSlider) emSlider.value = 0;

    // Hitung mundur durasi tunggu pelepasan enkripsi pengaman (10 Detik)
    let countdown = 10;
    emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdown}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;

    emergencyIntervalEngine = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdown}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;
        } else {
            clearInterval(emergencyIntervalEngine);
            emergencyIntervalEngine = null;

            // Transisi: Sembunyikan teks hitung mundur, munculkan range slider override em
            emTimer.style.display = "none";
            sliderCont.style.display = "block";

            // Mainkan audio sfx alarm siber
            if (typeof playCoreSFX === 'function') {
                playCoreSFX('notif-sfx');
            } else {
                const audio = document.getElementById('notif-sfx');
                if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
            }
        }
    }, 1000);

    // Konfigurasi Input Slider Darurat
    if (emSlider) {
        emSlider.oninput = function() {
            if (this.value >= 98) {
                this.value = 100;
                executeEmergencyAction();
            }
        };
    }
}

// 3. Konfirmasi Aksi Selesai Paksa (AFK)
async function executeEmergencyAction() {
    // Jalankan haptic pulse getar
    if (typeof vibratePulse === 'function') {
        vibratePulse();
    } else if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    const yakin = await sysConfirm(
        "SELESAI PAKSA (AFK)", 
        "AKTIFKAN SELESAI PAKSA?\n\nGunakan jika Requester tidak merespon/AFK. Anda akan diarahkan ke form laporan evaluasi."
    );

    if (yakin) {
        openEvaluationModal();
    } else {
        // Reset slider darurat jika aksi dibatalkan oleh agen
        const emSlider = document.getElementById('em-slider');
        if (emSlider) emSlider.value = 0;
    }
}

// 4. Buka Form Evaluasi & Gambar Bintang Dinamis (Menyesuaikan Selector CSS Klasik Anda)
function openEvaluationModal() {
    selectedRatingValue = 0;
    const evalModal = document.getElementById('reqEvalModal');
    const starContainer = document.getElementById('req-stars');

    if (!evalModal || !starContainer) return;

    // Bersihkan kontainer murni dan suntik 5 ikon fa-star baru
    starContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const starIcon = document.createElement('i');
        starIcon.className = "fa-solid fa-star";
        starIcon.style.cursor = "pointer";
        
        // Tambah event klik seleksi bintang rating
        starIcon.addEventListener('click', () => highlightStars(i));
        starContainer.appendChild(starIcon);
    }

    evalModal.classList.add('show');
}

// 5. Efek Visual Seleksi Bintang (Perbaikan Paritas: Memakai Class '.active')
function highlightStars(ratingValue) {
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('click-sfx');
    } else {
        const audio = document.getElementById('click-sfx');
        if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }
    
    selectedRatingValue = ratingValue;

    // Menggunakan query selector murni agar sinkron dengan .star-rating-area i.active di CSS
    const stars = document.querySelectorAll('#req-stars i');
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.classList.add('active');
            star.style.transform = "scale(1.2)";
        } else {
            star.classList.remove('active');
            star.style.transform = "scale(1.0)";
        }
    });
}

// 6. Tembak Perintah Tutup Kontrak Ke Firebase Absolut
function submitMissionSettlement() {
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('click-sfx');
    }

    if (!CoreState.currentMissionId) return;

    if (selectedRatingValue === 0) {
        alert("Evaluasi gagal dikirim. Silakan pilih salah satu rating bintang.");
        return;
    }

    const catatanInput = document.getElementById('input-eval-catatan');
    const txtCatatan = catatanInput ? catatanInput.value.trim() : "";

    // Sembunyikan Modal Segera untuk Mencegah Double Submit Data Jaringan
    const evalModal = document.getElementById('reqEvalModal');
    if (evalModal) evalModal.classList.remove('show');

    console.log(`[BRAIN 3] Menutup dokumen misi ${CoreState.currentMissionId} dengan rating ${selectedRatingValue}`);

    const boardDB = getTerminal('FB4_BOARD');
    if (!boardDB) {
        alert("Gagal mengarsipkan: Koneksi Shard FB4_BOARD Terputus!");
        return;
    }
    
    // Kirim Perintah Done & Simpan Laporan Rating ke Dalam Node Misi Berjalan
    boardDB.ref(`kontrak_mission/${CoreState.currentMissionId}`).update({
        status_operational: "done",
        rating_requester: selectedRatingValue,
        catatan_evaluasi: txtCatatan,
        timestamp_closed: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        alert("KONTRAK SELESAI: Dokumen berhasil diarsipkan ke dalam basis data Guild.");
        if (catatanInput) catatanInput.value = "";
        resetEmergencyState();
    })
    .catch((err) => {
        alert("Gagal menutup berkas misi di server: " + err.message);
    });
}

// 7. Reset State Darurat ke Posisi Siaga
function resetEmergencyState() {
    if (emergencyIntervalEngine) {
        clearInterval(emergencyIntervalEngine);
        emergencyIntervalEngine = null;
    }
    selectedRatingValue = 0;

    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer-msg');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');
    const evalModal = document.getElementById('reqEvalModal');

    if (emZone) emZone.style.display = "none";
    if (emTimer) emTimer.style.display = "none";
    if (sliderCont) sliderCont.style.display = "none";
    if (emSlider) emSlider.value = 0;
    if (evalModal) evalModal.classList.remove('show');
}

// Inisialisasi Event Click Tombol Submit di Modal saat Halaman Selesai Dimuat
window.addEventListener('DOMContentLoaded', () => {
    const btnSubmitEval = document.getElementById('btn-submit-eval');
    if (btnSubmitEval) {
        btnSubmitEval.addEventListener('click', submitMissionSettlement);
    }
});
