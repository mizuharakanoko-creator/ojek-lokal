/* ===================================================================
   CORE_SETTLEMENT.JS (BRAIN 3) - PARITAS DARURAT & SETTLEMENT ENGINE
   Fungsi: Proteksi Selesai Paksa (AFK), Evaluasi Rating Bintang, 
           & Sinkronisasi Penutupan Arsip Finansial Misi
   =================================================================== */

let emergencyIntervalEngine = null;
let selectedRatingValue = 0;

// 1. Sinkronisasi Kondisi Darurat Berdasarkan Data Aliran Matriks Misi
function syncEmergencyState(mission) {
    if (!mission) {
        resetEmergencyState();
        return;
    }

    const statusOp = mission.status_operational || mission.status || "open";
    const emZone = document.getElementById('emergency-zone');
    
    // VALIDASI PERAN: Protokol darurat AFK HANYA berlaku untuk Adventurer (Driver) saat status "kerja"
    const currentRole = window.CoreState?.virtualRole || "adventurer";

    if (statusOp === "kerja" && currentRole === "adventurer") {
        // Deteksi apakah zone darurat masih tersembunyi (belum diproses hitung mundur)
        if (emZone && (emZone.style.display === "none" || window.getComputedStyle(emZone).display === "none" || emZone.classList.contains('hide'))) {
            // Gunakan timestamp update operasional atau fallback ke waktu saat ini
            const baseTimestamp = mission.timestamp_operational_update || Date.now();
            startEmergencyCountdown(baseTimestamp);
        }
    } else {
        resetEmergencyState();
    }
}

// 2. Engine Hitung Mundur Runtuhnya Enkripsi Tombol Selesai Paksa (AFK)
function startEmergencyCountdown(lastUpdateTimestamp) {
    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer'); // Menargetkan elemen teks counter asli Anda
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');

    if (!emZone || !emTimer || !sliderCont) return;

    if (emergencyIntervalEngine) clearInterval(emergencyIntervalEngine);

    // Buka akses pengaman visual (Hapus class hide dan atur style display)
    emZone.classList.remove('hide');
    emZone.style.display = "block";
    emTimer.style.display = "block";
    sliderCont.style.display = "none";
    if (emSlider) emSlider.value = 0;

    // Durasi tunggu pelepasan enkripsi pengaman (10 Detik)
    let countdown = 10;
    emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdown}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;

    emergencyIntervalEngine = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdown}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;
        } else {
            clearInterval(emergencyIntervalEngine);
            emergencyIntervalEngine = null;

            // Transisi: Sembunyikan teks hitung mundur, ledakkan visual slider override em
            emTimer.style.display = "none";
            sliderCont.style.display = "block";

            // Mainkan audio sfx alert sistem hq
            if (typeof playCoreSFX === 'function') {
                playCoreSFX('notif-sfx');
            } else {
                const audio = document.getElementById('notif-sfx');
                if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
            }
            
            // Perbarui log AI teks pendukung jika fungsi terintegrasi
            if (typeof updateAI === 'function') {
                updateAI("Protokol Selesai Paksa (AFK) telah diaktifkan.", "alert");
            }
        }
    }, 1000);

    // Konfigurasi Input Mekanis Slider Darurat
    if (emSlider) {
        emSlider.oninput = function() {
            if (this.value >= 98) {
                this.value = 100;
                executeEmergencyAction();
            }
        };
    }
}

// 3. Konfirmasi Eksekusi Override Darurat
async function executeEmergencyAction() {
    if (typeof vibratePulse === 'function') {
        vibratePulse();
    } else if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }

    const yakin = await sysConfirm(
        "SELESAI PAKSA (AFK)", 
        "AKTIFKAN SELESAI PAKSA?\n\nGunakan jika Requester tidak merespon/AFK. Anda akan langsung diarahkan ke form laporan evaluasi."
    );

    if (yakin) {
        openEvaluationModal();
    } else {
        // Kembalikan slider ke posisi pangkal kiri jika dibatalkan
        const emSlider = document.getElementById('em-slider');
        if (emSlider) emSlider.value = 0;
    }
}

// 4. Inisiasi Jendela Modal Evaluasi Rating Berdasarkan Komponen HTML
function openEvaluationModal() {
    selectedRatingValue = 0;
    
    // Mendukung fungsi pemanggilan bawaan jendela evaluasi di html utama Anda
    if (typeof openEvalReq === 'function') {
        openEvalReq();
        setupStarRatingEngine();
    } else {
        const evalModal = document.getElementById('reqEvalModal');
        if (evalModal) {
            evalModal.classList.add('show');
            setupStarRatingEngine();
        }
    }
}

// Helper: Merakit interaksi 5 Bintang dinamis di dalam kontainer `#req-stars`
function setupStarRatingEngine() {
    const starContainer = document.getElementById('req-stars');
    if (!starContainer) return;

    starContainer.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const starIcon = document.createElement('i');
        starIcon.className = "fa-solid fa-star";
        starIcon.style.cursor = "pointer";
        starIcon.style.margin = "0 4px";
        starIcon.style.transition = "transform 0.2s, color 0.2s";
        
        starIcon.addEventListener('click', () => highlightStars(i));
        starContainer.appendChild(starIcon);
    }
}

// 5. Efek Visual Detak & Penyalaan Kelas Aktif Bintang Rating
function highlightStars(ratingValue) {
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('click-sfx');
    }
    
    selectedRatingValue = ratingValue;
    const stars = document.querySelectorAll('#req-stars i');
    
    stars.forEach((star, index) => {
        if (index < ratingValue) {
            star.classList.add('active');
            star.style.color = "var(--neon-orange, #ff5500)";
            star.style.transform = "scale(1.25)";
        } else {
            star.classList.remove('active');
            star.style.color = "#444";
            star.style.transform = "scale(1.0)";
        }
    });
}

// 6. Transmisi Pengarsipan Penutupan Kontrak Akhir ke Firebase
function submitMissionSettlement() {
    if (typeof playCoreSFX === 'function') {
        playCoreSFX('click-sfx');
    }

    const currentId = window.CoreState?.currentMissionId;
    if (!currentId) {
        alert("Gagal memproses arsip: ID Kontrak tidak terdeteksi di dalam RAM global!");
        return;
    }

    if (selectedRatingValue === 0) {
        alert("Aksi ditolak. Mohon berikan penilaian rating bintang terlebih dahulu.");
        return;
    }

    const catatanInput = document.getElementById('input-eval-catatan') || document.getElementById('eval-catatan');
    const txtCatatan = catatanInput ? catatanInput.value.trim() : "";

    // Sembunyikan Jendela Modal secepat mungkin guna mencegah duplikasi submit data pipa
    closeEvaluationModalDOM();

    console.log(`[SETTLEMENT FINALIZE] Mengunci kontrak ${currentId} dengan akumulasi rating: ${selectedRatingValue}`);

    // Dapatkan instans router real-time database
    const boardDB = typeof getTerminal === 'function' ? (getTerminal('FB4_BOARD') || getTerminal('ojeklokal-42b84-default-rtdb')) : null;
    
    if (!boardDB) {
        // Jalur simulasi mandiri jika database terputus
        console.warn("[BRAIN 3] Database offline. Mengeksekusi penutupan dokumen pada RAM simulasi lokal.");
        if (typeof updateMissionStatusToDone === 'function') {
            updateMissionStatusToDone(); // Memanfaatkan fungsi pemutus gateway
        }
        alert("KONTRAK SELESAI (OFFLINE VIRTUAL MODE)");
        if (catatanInput) catatanInput.value = "";
        resetEmergencyState();
        return;
    }
    
    // EKSEKUSI ONLINE: Update status utama menjadi done dan bersihkan node pipa sinyal paralel
    boardDB.ref(`kontrak_mission/${currentId}`).update({
        status_operational: "done",
        status: "done",
        rating_requester: selectedRatingValue,
        catatan_evaluasi: txtCatatan,
        timestamp_closed: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        // Bersihkan node sinyal P2P paralel agar steril
        boardDB.ref(`kontrak_signals/${currentId}`).remove();
        
        alert("KONTRAK BERHASIL DISELESAIKAN: Berkas data diarsipkan ke basis data Shard.");
        if (catatanInput) catatanInput.value = "";
        
        // Panggil pembersihan state total di gateway
        if (typeof clearCoreMissionState === 'function') {
            clearCoreMissionState();
        } else {
            resetEmergencyState();
        }
    })
    .catch((err) => {
        alert("Pipa database gagal mengarsipkan dokumen: " + err.message);
    });
}

// Helper penutupan elemen modal DOM
function closeEvaluationModalDOM() {
    if (typeof closeEvalReq === 'function') {
        closeEvalReq();
    } else {
        const evalModal = document.getElementById('reqEvalModal');
        if (evalModal) evalModal.classList.remove('show');
    }
}

// 7. Reset Mutlak Komponen Darurat Ke State Siaga
function resetEmergencyState() {
    if (emergencyIntervalEngine) {
        clearInterval(emergencyIntervalEngine);
        emergencyIntervalEngine = null;
    }
    selectedRatingValue = 0;

    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');

    if (emZone) {
        emZone.classList.add('hide');
        emZone.style.display = "none";
    }
    if (emTimer) emTimer.style.display = "none";
    if (sliderCont) sliderCont.style.display = "none";
    if (emSlider) emSlider.value = 0;
    
    closeEvaluationModalDOM();
}

// Hubungkan Event Listener tombol kirim data saat sirkuit DOM siap
window.addEventListener('DOMContentLoaded', () => {
    // Mendukung ID tombol bawaan kodeB.html atau penyesuaian fungsional modular
    const btnSubmitEval = document.getElementById('btn-submit-eval') || document.getElementById('submit-eval-btn');
    if (btnSubmitEval) {
        btnSubmitEval.addEventListener('click', submitMissionSettlement);
    }
});
