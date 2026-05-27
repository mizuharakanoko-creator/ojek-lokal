/* ===================================================================
   MS_EMERGENCY_PROTOCOL.JS
   Role: Emergency AFK Protocol Countdown, Slider Input Handler,
         & Post-Mission Interactive Evaluation Rating System
   =================================================================== */

// 1. STATE CONFIGURATION (Penyimpanan Status Hitung Mundur & Data Sesi)
let emergencyCountdownInterval = null;
let currentEmMissionId = null;
let currentEmData = null;
let currentSelectedRating = 0;

// 2. MAIN SYNC ENGINE (Ditembak Otomatis Oleh ms_quest_state_manager.js)
function syncEmergencyProtocol(missionData) {
    currentEmMissionId = AppState.currentMissionId;
    currentEmData = missionData;

    if (!missionData) {
        resetEmergencyToStandby();
        return;
    }

    const statusOp = missionData.status_operational;
    const emZone = document.getElementById('emergency-zone');

    // Protokol Selesai Darurat AFK hanya diizinkan aktif saat kurir berada di fase pengantaran (kerja)
    if (statusOp === "kerja") {
        if (emZone && emZone.classList.contains('hide')) {
            startEmergencyCountdown();
        }
    } else {
        resetEmergencyToStandby();
    }
}

// 3. EMERGENCY COUNTDOWN PROTOCOL (Sistem Pengaman Berlapis 10 Detik)
function startEmergencyCountdown() {
    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-countdown-timer');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');

    if (!emZone || !emTimer || !sliderCont) return;

    // Bersihkan interval usang jika ada guncangan paritas data
    if (emergencyCountdownInterval) {
        clearInterval(emergencyCountdownInterval);
    }

    // Tampilkan container zona darurat, kunci slider merah terlebih dahulu
    emZone.classList.remove('hide');
    emTimer.style.display = 'block';
    sliderCont.style.display = 'none';
    if (emSlider) emSlider.value = 0;

    let countdownSeconds = 10;
    emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdownSeconds}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;

    emergencyCountdownInterval = setInterval(() => {
        countdownSeconds--;
        if (countdownSeconds > 0) {
            emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdownSeconds}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;
        } else {
            // Hitung mundur selesai: Sembunyikan teks panduan, rilis tuas slider merah
            clearInterval(emergencyCountdownInterval);
            emergencyCountdownInterval = null;
            
            emTimer.style.display = 'none';
            sliderCont.style.display = 'block';

            // Berikan notifikasi taktis pada asisten AI Irene
            const aiText = document.getElementById('ai-text');
            const aiBox = document.getElementById('ai-terminal-box');
            if (aiText) aiText.innerText = "Sistem mendeteksi indikasi pemesan tidak responsif (AFK). Protokol Selesai Paksa Darurat kini telah diizinkan untuk digunakan.";
            if (aiBox) aiBox.className = "ai-terminal alert";
            
            playSFX('notif-sfx');
        }
    }, 1000);

    // Ikatan Input Slider Darurat (Mekanisme Tarik Merah 100%)
    if (emSlider) {
        emSlider.oninput = function() {
            if (this.value >= 98) {
                this.value = 100; // Kunci ke ujung kanan murni
                triggerEmergencyAction();
            }
        };
    }
}

// 4. TRIGGER EMERGENCY ACTION
async function triggerEmergencyAction() {
    // Jalankan efek getar perangkat jika didukung browser seluler
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    const confirmSettlePaksa = await sysConfirm(
        "SELESAI PAKSA (AFK)", 
        "Apakah Anda yakin ingin mengaktifkan Protokol Selesai Paksa?\n\nGunakan opsi ini hanya jika pihak Requester/Pemesan menghilang tanpa kabar. Sesi Anda akan dialihkan ke pelaporan evaluasi.", 
        true
    );

    if (confirmSettlePaksa) {
        openEvaluationModal();
    } else {
        // Reset tuas ke titik nol jika batal
        const emSlider = document.getElementById('em-slider');
        if (emSlider) emSlider.value = 0;
    }
}

// 5. INTERACTIVE MISSION EVALUATION SYSTEM (Form Rating Bintang)
function openEvaluationModal() {
    currentSelectedRating = 0; // Reset nilai bintang awal
    
    const evalModal = document.getElementById('modalEvaluation');
    const starContainer = document.getElementById('eval-stars-container');
    
    if (!evalModal || !starContainer) return;

    // Bersihkan dan render ulang 5 ornamen bintang taktis interaktif
    starContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const starIcon = document.createElement('i');
        starIcon.className = "fa-solid fa-star";
        starIcon.setAttribute('data-star-index', i);
        
        starIcon.addEventListener('click', () => {
            highlightStars(i);
        });
        
        starContainer.appendChild(starIcon);
    }

    evalModal.classList.add('show');
}

function highlightStars(ratingValue) {
    playSFX('click-sfx');
    currentSelectedRating = ratingValue;
    
    const stars = document.querySelectorAll('#eval-stars-container i');
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.classList.add('on');
        } else {
            star.classList.remove('on');
        }
    });
}

async function submitMissionSettlement() {
    playSFX('click-sfx');

    if (!currentEmMissionId) {
        sysAlert("ERROR", "Sesi identifikasi ID Kontrak Misi hangus.");
        return;
    }

    if (currentSelectedRating === 0) {
        sysAlert("EVALUASI DIPERLUKAN", "Silakan pilih evaluasi performa (bintang 1-5) terlebih dahulu sebelum mengunci penutupan berkas.");
        return;
    }

    const evalModal = document.getElementById('modalEvaluation');
    if (evalModal) evalModal.classList.remove('show');

    // Tembak pembaruan status mutlak "done" dan simpan metrik rating ke Firebase
    FB4_BOARD.child("kontrak_mission").child(currentEmMissionId).update({
        status_operational: "done",
        rating_agent: currentSelectedRating,
        timestamp_closed: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        // Berikan ucapan selamat atas kesuksesan eksekusi lapangan agent
        sysAlert("KONTRAK SELESAI", "Laporan misi berhasil diarsipkan secara permanen. Status paritas Anda kembali aman. Berdiri bersiap untuk panggilan berikutnya.");
    })
    .catch(err => {
        console.error("[EMERGENCY TERMINATION FAILED]", err);
        sysAlert("SERVER MALFUNCTION", `Gagal mengarsipkan laporan misi: ${err.message}`);
    });
}

// 6. RESET EMERGENCY TO STANDBY
function resetEmergencyToStandby() {
    if (emergencyCountdownInterval) {
        clearInterval(emergencyCountdownInterval);
        emergencyCountdownInterval = null;
    }

    currentEmMissionId = null;
    currentEmData = null;
    currentSelectedRating = 0;

    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-countdown-timer');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');
    const evalModal = document.getElementById('modalEvaluation');

    if (emZone) emZone.classList.add('hide');
    if (emTimer) emTimer.style.display = 'none';
    if (sliderCont) sliderCont.style.display = 'none';
    if (emSlider) emSlider.value = 0;
    if (evalModal) evalModal.classList.remove('show');
}

// Pasang trigger event listener penyerahan evaluasi laporan akhir saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
    const btnSubmitEval = document.getElementById('btn-submit-evaluation');
    if (btnSubmitEval) {
        btnSubmitEval.addEventListener('click', submitMissionSettlement);
    }
});
