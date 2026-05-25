// ==========================================================================
// CORE OPERATIONAL & ACTION PROTOCOLS - BRAIN ACTIONS
// ==========================================================================
(function (window) {
    'use strict';

    // State Internal Misi & Simulasi
    let currentActiveQuest = null;
    let currentContractId = null;
    let currentShardId = null;
    let emergencyCountdownInterval = null;
    let idleGameTimer = null;

    // Cache DOM Elements (HQ, Bill, Profile, Settings)
    let hqBubble = null, hqStatus = null, hqCash = null, hqLevel = null, hqCompleted = null;
    let hqBoard = null, hqEmptyState = null, hqQuestTitle = null, hqQuestSubtype = null;
    let hqQuestId = null, hqQuestReward = null, hqQuestDistance = null, hqBtnAction = null;
    let blGross = null, blPlayer = null, blGuild = null, blTotalNet = null;
    let prName = null, prLvl = null, prTitle = null, prExpText = null, prExpBar = null;
    let prWinrate = null, prSpeed = null, prIntegrity = null;
    let stGameState = null, stGameYield = null, stGamePool = null, stGameBtnToggle = null, stGameBtnClaim = null;

    /**
     * Memetakan seluruh hook elemen DOM dari berbagai komponen tab
     */
    function cacheAllActionDOM() {
        // HQ Tab Hooks
        hqBubble = document.getElementById('hq-ai-bubble-text');
        hqStatus = document.getElementById('hq-status-text');
        hqCash = document.getElementById('hq-cash-text');
        hqLevel = document.getElementById('hq-level-text');
        hqCompleted = document.getElementById('hq-completed-text');
        hqBoard = document.getElementById('hq-active-quest-board');
        hqEmptyState = document.getElementById('hq-empty-quest-state');
        hqQuestTitle = document.getElementById('hq-quest-title');
        hqQuestSubtype = document.getElementById('hq-quest-subtype');
        hqQuestId = document.getElementById('hq-quest-id');
        hqQuestReward = document.getElementById('hq-quest-reward');
        hqQuestDistance = document.getElementById('hq-quest-distance');
        hqBtnAction = document.getElementById('hq-btn-action-trigger');

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
        cacheAllActionDOM();
        if (!operatorData) return;

        window.CurrentOperatorProfile = operatorData.profile || operatorData;
        const prof = window.CurrentOperatorProfile;

        // Injeksi Teks Informasi Identitas Utama (Profile & HQ)
        if (prName) prName.innerText = prof.nickname || "UNKNOWN_RUNNER";
        if (hqLevel) hqLevel.innerText = `LV. ${prof.level || '01'}`;
        if (prLvl) prLvl.innerText = `LV ${prof.level || '01'}`;
        
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
        if (hqCash) hqCash.innerText = formatRupiahCurrency(currentWalletCash);
        
        // Sinkronisasi Sisi Modul Billing Node Rincian Bagi Hasil Murni
        calculateFinancialBreakdown(currentWalletCash);

        updateAIBubbleSpeech("Koneksi Shard terenkripsi berhasil disinkronisasikan. Status operasi aman.", "info");
    };

    /**
     * Memproses Perhitungan Bagi Hasil Keuangan secara Akurat (80% Player / 20% Guild Tax)
     */
    function calculateFinancialBreakdown(totalNet) {
        if (!blTotalNet) cacheAllActionDOM();
        
        const grossAmount = Math.round(totalNet / 0.8);
        const guildTax = grossAmount - totalNet;

        if (blTotalNet) blTotalNet.innerText = formatRupiahCurrency(totalNet);
        if (blPlayer) blPlayer.innerText = formatRupiahCurrency(totalNet);
        if (blGuild) blGuild.innerText = formatRupiahCurrency(guildTax);
        if (blGross) blGross.innerText = formatRupiahCurrency(grossAmount);
    }

    /**
     * Listener Real-time Mengunci Aliran Kontrak Aktif dari Firebase Board (FB4_BOARD)
     * @param {string} contractId - ID Misi yang diambil oleh Driver/Adventurer
     */
    window.trackActiveOperationalQuest = function (contractId) {
        if (!contractId) {
            resetQuestDashboardToEmptyState();
            return;
        }
        currentContractId = contractId;
        cacheAllActionDOM();

        const boardDB = window.getTerminal ? window.getTerminal('FB4_BOARD') : null;
        if (!boardDB) return;

        boardDB.ref(`kontrak_mission/${contractId}`).on('value', (snapshot) => {
            const quest = snapshot.val();
            if (!quest) {
                resetQuestDashboardToEmptyState();
                return;
            }
            currentActiveQuest = quest;
            renderTacticalQuestBoardUI(quest);
        });
    };

    /**
     * Menyuntikkan Data Misi Aktif ke Lapisan UI HQ Board
     */
    function renderTacticalQuestBoardUI(quest) {
        if (!hqBoard) cacheAllActionDOM();

        // Alihkan kontainer tampilan state kosong ke state aktif
        if (hqEmptyState) hqEmptyState.classList.add('hide');
        if (hqBoard) hqBoard.classList.remove('hide');

        if (hqQuestTitle) hqQuestTitle.innerText = quest.title || "MISI TANPA NAMA";
        if (hqQuestSubtype) hqQuestSubtype.innerText = `SUB-TIER: ${quest.subtype || 'REGULER'}`;
        if (hqQuestId) hqQuestId.innerText = currentContractId.substring(0, 8).toUpperCase();
        if (hqQuestReward) hqQuestReward.innerText = formatRupiahCurrency(quest.reward || 0);

        // Atur Status Operasi Global pada Teks Utama HQ
        if (hqStatus) {
            hqStatus.innerText = (quest.status || "STANDBY").toUpperCase();
            hqStatus.style.color = quest.status === 'otw' ? 'var(--neon-blue)' : 
                                   quest.status === 'kerja' ? 'var(--neon-purple)' : 'var(--neon-green)';
        }

        // Modifikasi teks tombol pemicu aksi utama secara kondisional (Siklus Alur Misi)
        if (hqBtnAction) {
            if (quest.status === 'accepted') {
                hqBtnAction.innerText = "PROSES PROTOKOL (OTW)";
                hqBtnAction.className = "btn-main";
                hqBtnAction.style.borderColor = "var(--neon-blue)";
                hqBtnAction.style.color = "var(--neon-blue)";
            } else if (quest.status === 'otw') {
                hqBtnAction.innerText = "MULAI EKSEKUSI (KERJA)";
                hqBtnAction.className = "btn-main";
                hqBtnAction.style.borderColor = "var(--neon-purple)";
                hqBtnAction.style.color = "var(--neon-purple)";
            } else if (quest.status === 'kerja') {
                hqBtnAction.innerText = "MISI SELESAI (SUBMIT)";
                hqBtnAction.className = "btn-main";
                hqBtnAction.style.borderColor = "var(--neon-green)";
                hqBtnAction.style.color = "var(--neon-green)";
            }
        }

        // Plot Titik Lokasi Koordinat ke Peta Taktis Leaflet secara Otomatis
        if (quest.target_lat && quest.target_lng && window.lockTacticalTargetRoute) {
            window.lockTacticalTargetRoute(quest.target_lat, quest.target_lng, quest.title);
        }

        // Pemicu Protokol Pengaman Tombol Selesai Paksa (AFK Slider) jika status masuk fase "kerja"
        if (quest.status === 'kerja') {
            initiateEmergencyCountdownProtocol();
        } else {
            window.shutdownEmergencySliderUI();
        }
    }

    /**
     * Handler Pemicu Klik Tombol Utama Siklus Misi (HQ Action Trigger)
     */
    window.handleHqMainAction = async function () {
        if (!currentActiveQuest || !currentContractId) return;
        
        const boardDB = window.getTerminal('FB4_BOARD');
        const currentStatus = currentActiveQuest.status;
        let nextStatus = "";
        let confirmLabel = "";

        if (currentStatus === 'accepted') {
            nextStatus = "otw";
            confirmLabel = "Aktifkan Protokol Perjalanan (OTW) menuju target koordinat?";
        } else if (currentStatus === 'otw') {
            nextStatus = "kerja";
            confirmLabel = "Konfirmasi bahwa Anda telah tiba di lokasi dan mulai eksekusi misi?";
        } else if (currentStatus === 'kerja') {
            nextStatus = "done";
            confirmLabel = "Nyatakan seluruh parameter misi selesai dan kirimkan laporan ke Guild?";
        }

        if (!nextStatus) return;

        if (window.sysConfirm) {
            const setuju = await window.sysConfirm("TRANSMISI SISTEM", confirmLabel, true);
            if (!setuju) return;
        }

        // Mainkan getaran konfirmasi
        if (window.vibratePulse) window.vibratePulse();

        // Update status baru ke Firebase Board Shard Core
        boardDB.ref(`kontrak_mission/${currentContractId}/status`).set(nextStatus)
            .then(() => {
                updateAIBubbleSpeech(`Status transmisi misi berhasil diperbarui ke kode: [${nextStatus.toUpperCase()}].`, "success");
                
                // Jika misi selesai total (done), arahkan ke form evaluasi umpan balik
                if (nextStatus === 'done' && window.openEvalReq) {
                    window.openEvalReq();
                }
            })
            .catch(err => console.error("[HQ ACTION ERROR]", err));
    };

    /**
     * Menghitung Jarak Koordinat GPS secara Live dari Pembaruan Peta Taktis
     */
    window.recalculateLiveDistance = function (lat1, lng1, lat2, lng2) {
        if (!hqQuestDistance) cacheAllActionDOM();
        if (!hqQuestDistance) return;

        // Rumus Matematika Haversine mengukur presisi jarak lengkung bumi
        const R = 6371; // Jari-jari bumi dalam satuan Kilometer
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = R * c;

        hqQuestDistance.innerText = `${distanceKm.toFixed(2)} KM`;
    };

    /**
     * Memulai Prosedur Hitung Mundur Pengaktifan Slider Selesai Darurat (AFK Slider)
     */
    function initiateEmergencyCountdownProtocol() {
        const emZone = document.getElementById('mp-emergency-afk-zone');
        const emTimer = document.getElementById('mp-emergency-timer-msg');
        const sliderCont = document.getElementById('mp-slider-container-em');
        const emSlider = document.getElementById('em-slider');

        if (!emZone || !emTimer) return;
        
        clearInterval(emergencyCountdownInterval);
        emZone.classList.remove('hide');
        emTimer.style.display = 'block';
        if (sliderCont) sliderCont.style.display = 'none';

        let sisaDetik = 10; // Hitung mundur 10 detik pengaman

        emergencyCountdownInterval = setInterval(() => {
            sisaDetik--;
            if (sisaDetik > 0) {
                emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${sisaDetik}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;
            } else {
                clearInterval(emergencyCountdownInterval);
                emTimer.style.display = 'none';
                if (sliderCont) sliderCont.style.display = 'block';
                if (emSlider) {
                    emSlider.value = 0;
                    emSlider.oninput = function () {
                        if (this.value >= 95) {
                            this.value = 100;
                            triggerEmergencyActionExecution();
                        }
                    };
                }
                updateAIBubbleSpeech("Protokol Selesai Paksa (AFK Emergency) diaktifkan pada tab navigasi.", "alert");
            }
        }, 1000);
    }

    /**
     * Eksekusi Selesai Paksa Akibat Klien Menghilang / AFK di Lapangan
     */
    async function triggerEmergencyActionExecution() {
        if (window.vibratePulse) window.vibratePulse();
        
        if (window.sysConfirm) {
            const valid = await window.sysConfirm("CRITICAL PROTOCOL", "AKTIFKAN FINISH PAKSA SELESAI DARURAT?\n\nGunakan hanya jika pemesan terbukti kabur/AFK. Pelanggaran palsu dapat menurunkan Trust Score.", true);
            if (valid) {
                // Alihkan paksa status ke done di board database
                const boardDB = window.getTerminal('FB4_BOARD');
                if (boardDB && currentContractId) {
                    boardDB.ref(`kontrak_mission/${currentContractId}/status`).set('done');
                }
                if (window.openEvalReq) window.openEvalReq();
            } else {
                const emSlider = document.getElementById('em-slider');
                if (emSlider) emSlider.value = 0;
            }
        }
    }

    /**
     * Menyembunyikan dan Mereset Total Panel Slider Darurat
     */
    window.shutdownEmergencySliderUI = function () {
        clearInterval(emergencyCountdownInterval);
        const emZone = document.getElementById('mp-emergency-afk-zone');
        if (emZone) emZone.classList.add('hide');
    };

    /**
     * Mereset Seluruh Komponen HQ ke Tampilan Default (Kondisi Kosong / Siaga)
     */
    function resetQuestDashboardToEmptyState() {
        if (!hqBoard) cacheAllActionDOM();
        if (hqBoard) hqBoard.classList.add('hide');
        if (hqEmptyState) hqEmptyState.classList.remove('hide');
        if (hqStatus) {
            hqStatus.innerText = "STANDBY";
            hqStatus.style.color = "var(--neon-green)";
        }
        window.shutdownEmergencySliderUI();
        if (window.clearTacticalTargetRoute) window.clearTacticalTargetRoute();
        currentActiveQuest = null;
    }

    /**
     * Update Teks Balon Ucapan Obrolan Asisten AI Irene Hub
     */
    function updateAIBubbleSpeech(text, mode) {
        if (!hqBubble) cacheAllActionDOM();
        if (!hqBubble) return;

        hqBubble.innerText = text;
        
        // Pemicu log baris baru ke dalam terminal live feed hq
        const logger = document.getElementById('hq-terminal-logger');
        if (logger) {
            const timeStr = new Date().toLocaleTimeString();
            const tagStr = mode ? mode.toUpperCase() : "INTEL";
            let colorClass = mode === 'success' ? 'success' : '';
            
            logger.innerHTML += `
                <div class="hq-log-row">
                    <span class="hq-log-time">[${timeStr}]</span>
                    <span class="hq-log-tag">[${tagStr}]</span>
                    <span class="hq-log-text ${colorClass}">${text}</span>
                </div>`;
            logger.scrollTop = logger.scrollHeight;
        }
    }

    // ==========================================================================
    // SUBSYSTEM INTERAKTIF: IDLE TRAINING SIMULATOR MINI-GAME
    // ==========================================================================
    let accumulatedDataPoints = 0;
    let dataYieldPerSecond = 2;
    let isIdleEngineRunning = false;

    window.handleToggleIdleGameEngine = function () {
        if (!stGameState) cacheAllActionDOM();

        if (!isIdleEngineRunning) {
            // Jalankan Mesin Komputasi Simulator
            isIdleEngineRunning = true;
            if (stGameState) {
                stGameState.innerText = "RUNNING";
                stGameState.className = "st-game-status active";
            }
            if (stGameYield) stGameYield.innerText = `+${dataYieldPerSecond} DATA/s`;
            if (stGameBtnToggle) stGameBtnToggle.innerText = "SHUTDOWN SIMULATOR CORE";
            if (stGameBtnClaim) stGameBtnClaim.style.display = "block";

            // Loop Interval Komputasi Menggunakan Skema Akumulasi Delta Sekon
            idleGameTimer = setInterval(() => {
                accumulatedDataPoints += dataYieldPerSecond;
                if (stGamePool) stGamePool.innerText = `${accumulatedDataPoints} DATA`;
            }, 1000);
        } else {
            // Matikan Mesin Simulator
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
    function formatRupiahCurrency(angka) {
        return 'Rp ' + Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 0 });
    }

    // Eksekusi Pemetaan DOM saat file script selesai di-load penuh oleh core
    window.initActionsHQ = function () {
        cacheAllActionDOM();
        console.log("[BRAIN ACTIONS] Seluruh alur fungsionalitas core taktis terikat sempurna.");
    };

})(window);
