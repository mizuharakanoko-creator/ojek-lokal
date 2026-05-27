// ==========================================================================
// CORE OPERATIONAL & SESSION ENGINE - BRAIN ACTIONS (PART 1)
// ==========================================================================
(function (window) {
    'use strict';

    // State Internal Akun & Simulasi Mini-Game
    let idleGameTimer = null;
    let accumulatedDataPoints = 0;
    let dataYieldPerSecond = 2;
    let isIdleEngineRunning = false;

    // Cache DOM Elements (Billing, Profile, Settings)
    let blGross = null, blPlayer = null, blGuild = null, blTotalNet = null;
    let prName = null, prLvl = null, prTitle = null, prExpText = null, prExpBar = null;
    let prWinrate = null, prSpeed = null, prIntegrity = null;
    let stGameState = null, stGameYield = null, stGamePool = null, stGameBtnToggle = null, stGameBtnClaim = null;

    /**
     * Memetakan seluruh hook elemen DOM dari modul non-HQ
     */
    function cacheCoreDOM() {
        // Billing Tab Hooks
        blTotalNet = document.getElementById('bl-total-revenue');
        blPlayer = document.getElementById('bl-fee-player');
        blGuild = document.getElementById('bl-fee-guild');
        blGross = document.getElementById('bl-fee-gross');

        // Profile Tab Hooks
        prName = document.getElementById('pr-core-name');
        prLvl = document.getElementById('pr-core-lvl');
        prTitle = document.getElementById('pr-core-title');
        prExpText = document.getElementById('pr-exp-text');
        prExpBar = document.getElementById('pr-exp-bar');
        prWinrate = document.getElementById('pr-attr-winrate');
        prSpeed = document.getElementById('pr-attr-speed');
        prIntegrity = document.getElementById('pr-attr-integrity');

        // Settings Tab Hooks
        stGameState = document.getElementById('st-game-state-label');
        stGameYield = document.getElementById('st-game-intel-yield');
        stGamePool = document.getElementById('st-game-pool-text');
        stGameBtnToggle = document.getElementById('st-game-btn-toggle');
        stGameBtnClaim = document.getElementById('st-game-btn-claim');
    }

    /**
     * Inisialisasi Mengikat Data Akun Terautentikasi ke UI Dashboard
     * @param {Object} operatorData - Sumber data dari Supreme Aggregator / Shard Profile
     */
    window.syncOperatorSessionProfile = function (operatorData) {
        cacheCoreDOM();
        if (!operatorData) return;

        window.CurrentOperatorProfile = operatorData.profile || operatorData;
        const prof = window.CurrentOperatorProfile;

        // Injeksi Teks Informasi Identitas Utama
        if (prName) prName.innerText = prof.nickname || "UNKNOWN_RUNNER";
        if (prLvl) prLvl.innerText = `LV ${prof.level || '01'}`;
        
        // Teruskan data level ke hq static level jika terpasang
        const hqLevel = document.getElementById('hq-level-text');
        if (hqLevel) hqLevel.innerText = `LV. ${prof.level || '01'}`;
        
        // Klasifikasi Gelar / Title RPG Dinamis Berdasarkan Tingkat Level
        let titleRank = "UNBOUND OPERATOR";
        if (prof.level >= 10) titleRank = "BRONZE VANGUARD";
        if (prof.level >= 30) titleRank = "SILVER DISPATCHER";
        if (prof.level >= 50) titleRank = "GOLD SHARD COMMANDER";
        if (prof.level >= 80) titleRank = "EMPYREAN TRANSCENDENT";
        if (prTitle) prTitle.innerText = titleRank;

        // Sinkronisasi Bar Pengalaman (Experience Matrix)
        if (prof.exp !== undefined && prof.next_level_exp) {
            if (prExpText) prExpText.innerText = `${prof.exp} / ${prof.next_level_exp} EXP`;
            const pct = Math.min(100, (prof.exp / prof.next_level_exp) * 100);
            if (prExpBar) prExpBar.style.width = `${pct}%`;
        }

        // Kalkulasi Tampilan Atribut Stat Sukses & Response Rata-rata
        if (prWinrate) prWinrate.innerText = prof.success_rate ? `${prof.success_rate}%` : "100%";
        if (prSpeed) prSpeed.innerText = prof.avg_response ? `${prof.avg_response}s` : "4.2s";
        if (prIntegrity) prIntegrity.innerText = prof.trust_score !== undefined ? prof.trust_score : "100";

        // Memuat Nilai Finansial Dompet Shard Cash
        const currentWalletCash = prof.shard_cash || 0;
        const hqCash = document.getElementById('hq-cash-text');
        if (hqCash) hqCash.innerText = window.formatRupiahCurrency(currentWalletCash);
        
        // Sinkronisasi Sisi Modul Billing Node Rincian Bagi Hasil Murni
        calculateFinancialBreakdown(currentWalletCash);

        // Kirim log ke HQ jika modul terpasang
        if (window.updateAIBubbleSpeech) {
            window.updateAIBubbleSpeech("Koneksi Shard terenkripsi berhasil disinkronisasikan. Status operasi aman.", "info");
        }
    };

    /**
     * Memproses Perhitungan Bagi Hasil Keuangan secara Akurat (80% Player / 20% Guild Tax)
     */
    function calculateFinancialBreakdown(totalNet) {
        if (!blTotalNet) cacheCoreDOM();
        
        const grossAmount = Math.round(totalNet / 0.8);
        const guildTax = grossAmount - totalNet;

        if (blTotalNet) blTotalNet.innerText = window.formatRupiahCurrency(totalNet);
        if (blPlayer) blPlayer.innerText = window.formatRupiahCurrency(totalNet);
        if (blGuild) blGuild.innerText = window.formatRupiahCurrency(guildTax);
        if (blGross) blGross.innerText = window.formatRupiahCurrency(grossAmount);
    }

    // ==========================================================================
    // SUBSYSTEM INTERAKTIF: IDLE TRAINING SIMULATOR MINI-GAME
    // ==========================================================================
    window.handleToggleIdleGameEngine = function () {
        if (!stGameState) cacheCoreDOM();

        if (!isIdleEngineRunning) {
            isIdleEngineRunning = true;
            if (stGameState) {
                stGameState.innerText = "RUNNING";
                stGameState.className = "st-game-status active";
            }
            if (stGameYield) stGameYield.innerText = `+${dataYieldPerSecond} DATA/s`;
            if (stGameBtnToggle) stGameBtnToggle.innerText = "SHUTDOWN SIMULATOR CORE";
            if (stGameBtnClaim) stGameBtnClaim.style.display = "block";

            idleGameTimer = setInterval(() => {
                accumulatedDataPoints += dataYieldPerSecond;
                if (stGamePool) stGamePool.innerText = `${accumulatedDataPoints} DATA`;
            }, 1000);
        } else {
            clearInterval(idleGameTimer);
            isIdleEngineRunning = false;
            if (stGameState) {
                stGameState.innerText = "OFFLINE";
                stGameState.className = "st-game-status";
            }
            if (stGameBtnToggle) stGameBtnToggle.innerText = "BOOT CORE SIMULATOR";
        }
    };

    window.handleClaimIdleRewards = function () {
        if (accumulatedDataPoints <= 0) return;
        
        if (window.sysNotify) {
            window.sysNotify("EXTRACT SUCCESS", `Berhasil mengekstraksi ${accumulatedDataPoints} berkas intel data ke bank memori.`);
        }
        accumulatedDataPoints = 0;
        if (stGamePool) stGamePool.innerText = "0 DATA";
    };

    /**
     * Mengakhiri Sesi Hubungan dengan Server dan Menghapus Kredensial
     */
    window.handleSecureDisconnectSession = async function () {
        if (window.sysConfirm) {
            const keluar = await window.sysConfirm("TERMINATION", "Yakin ingin memutuskan koneksi enkripsi session token dan keluar?", true);
            if (keluar) {
                if (window.shutdownTacticalEngine) window.shutdownTacticalEngine();
                if (window.terminateActiveCommsLink) window.terminateActiveCommsLink();
                localStorage.clear();
                window.location.reload();
            }
        }
    };

    /**
     * Konverter Angka Numerik Standar Menjadi String Rupiah Terformat (Rp xx.xxx)
     */
    window.formatRupiahCurrency = function (angka) {
        return 'Rp ' + Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 0 });
    };

    // Auto Init Core DOM saat script termuat
    document.addEventListener("DOMContentLoaded", () => {
        cacheCoreDOM();
        console.log("[CORE BRAIN] Operational core session engine ready.");
    });

})(window);
