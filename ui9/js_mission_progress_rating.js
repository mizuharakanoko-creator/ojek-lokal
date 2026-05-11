/**
 * js_mission_progress_rating.js
 * EVALUASI MISI & SISTEM RATING
 */

// 1. STATE INTERNAL
window.RatingState = {
    selectedStars: 0,
    isSubmitting: false
};

// 2. INITIALIZER (Dipanggil saat modal rating dimuat atau dipicu selesai)
window.initRatingModule = function() {
    console.log("⭐ Rating Module: Ready for Evaluation...");
    
    // Reset State
    window.RatingState.selectedStars = 0;
    window.RatingState.isSubmitting = false;

    // A. Setup Visual Bintang
    setupStarRating();

    // B. Setup Tombol Submit
    const submitBtn = document.getElementById('btn-submit-rating');
    if (submitBtn) {
        submitBtn.onclick = () => submitFinalEvaluation();
    }
};

// 3. LOGIKA INTERAKSI BINTANG
function setupStarRating() {
    const stars = document.querySelectorAll('.star-icon');
    if (stars.length === 0) return;

    stars.forEach(star => {
        star.onclick = function() {
            if (window.RatingState.isSubmitting) return;

            const val = parseInt(this.getAttribute('data-value'));
            window.RatingState.selectedStars = val;

            // Update Visual Bintang
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.classList.add('active');
                    s.style.color = "var(--neon-blue)";
                } else {
                    s.classList.remove('active');
                    s.style.color = "var(--text-dim)";
                }
            });

            if (navigator.vibrate) navigator.vibrate(20);
            console.log(`Rating selected: ${val} stars`);
        };
    });
}

// 4. PENGIRIMAN DATA EVALUASI
async function submitFinalEvaluation() {
    const state = window.SovereignState;
    const ratingState = window.RatingState;

    if (ratingState.selectedStars === 0) {
        if (typeof updateAI === 'function') updateAI("Harap berikan rating bintang!", "alert");
        return;
    }

    if (ratingState.isSubmitting) return;
    ratingState.isSubmitting = true;

    // Ambil input teks testimoni
    const comment = document.getElementById('rating-comment-field')?.value || "";
    
    // UI Feedback (Loading)
    const btn = document.getElementById('btn-submit-rating');
    if (btn) {
        btn.innerText = "UPLOADING DATA...";
        btn.disabled = true;
    }

    try {
        const contractId = state.activeContractId;
        const db = state.db;
        const myRole = state.currentUser.role;

        // Data yang akan disimpan
        const evalData = {
            rating: ratingState.selectedStars,
            feedback: comment,
            timestamp: Date.now(),
            reviewer_uid: state.currentUser.uid,
            reviewer_name: state.currentUser.name
        };

        // A. Simpan ke Firestore (Koleksi Reviews atau Sub-koleksi Kontrak)
        await db.collection('contracts').doc(contractId).update({
            [`evaluation_${myRole}`]: evalData,
            status: 'COMPLETED_FINAL'
        });

        // B. Update Status Realtime (RTDB) agar partner tahu misi selesai
        if (state.rtdb) {
            state.rtdb.ref(`kontrak_detail/${contractId}/latest_status`).set({
                text: "Misi Telah Dinilai & Selesai",
                ts: Date.now()
            });
        }

        if (typeof updateAI === 'function') updateAI("Evaluasi berhasil dikirim. Misi diarsipkan.", "success");

        // C. Arahkan ke Nota atau Refresh Halaman setelah jeda
        setTimeout(() => {
            // Misalnya pindah ke tab Nota
            const notaNav = document.querySelector('[data-tab="tab-nota"]');
            if (notaNav) notaNav.click();
        }, 2000);

    } catch (error) {
        console.error("Evaluation Error:", error);
        ratingState.isSubmitting = false;
        if (btn) {
            btn.innerText = "COBA LAGI";
            btn.disabled = false;
        }
        if (typeof updateAI === 'function') updateAI("Gagal mengirim evaluasi. Cek koneksi.", "alert");
    }
}

// 5. FUNGSI PEMICU MODAL (Bisa dipanggil dari Slider di Brain Two)
window.showRatingScreen = function() {
    const container = document.getElementById('modal-rating-container');
    if (container) {
        container.style.display = 'flex';
        container.style.pointerEvents = 'auto';
        // Jalankan init untuk memastikan listener terpasang
        window.initRatingModule();
    }
};

console.log("🧠 Rating Brain: Evaluator Logic Active.");
