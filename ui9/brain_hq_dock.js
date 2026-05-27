// ==========================================================================
// HQ PANEL & FLOATING CYBER-DOCK OVERLAY CONTROLLER - BRAIN ACTIONS (PART 2)
// ==========================================================================
(function (window) {
    'use strict';

    // State Internal Kontrak Jaringan Firebase Shard
    let currentActiveQuest = null;
    let currentContractId = null;
    let emergencyCountdownInterval = null;

    // Cache Elemen DOM Khusus Tab HQ
    let hqBubble = null, hqStatus = null, hqCompleted = null, hqBoard = null, hqEmptyState = null;
    let hqQuestTitle = null, hqQuestSubtype = null, hqQuestId = null, hqQuestReward = null, hqQuestDistance = null;
    let hqOrigName = null, hqOrigDesc = null, hqDestName = null, hqDestDesc = null;

    /**
     * Pemetaan DOM Khusus Papan Monitor HQ
     */
    function cacheHqMonitorDOM() {
        hqBubble = document.getElementById('hq-ai-bubble-text');
        hqStatus = document.getElementById('hq-status-text');
        hqCompleted = document.getElementById('hq-completed-text');
        hqBoard = document.getElementById('hq-active-quest-board');
        hqEmptyState = document.getElementById('hq-empty-quest-state');
        hqQuestTitle = document.getElementById('hq-quest-title');
        hqQuestSubtype = document.getElementById('hq-quest-subtype');
        hqQuestId = document.getElementById('hq-quest-id');
        hqQuestReward = document.getElementById('hq-quest-reward');
        hqQuestDistance = document.getElementById('hq-quest-distance');
        
        // Manifes Rute Asal vs Tujuan
        hqOrigName = document.getElementById('hq-route-origin-name');
        hqOrigDesc = document.getElementById('hq-route-origin-desc');
        hqDestName = document.getElementById('hq-route-dest-name');
        hqDestDesc = document.getElementById('hq-route-dest-desc');
    }

    /**
     * Listener Real-time Mengunci Aliran Kontrak Aktif dari Firebase Board (FB4_BOARD)
     */
    window.trackActiveOperationalQuest = function (contractId) {
        if (!contractId) {
            resetQuestDashboardToEmptyState();
            return;
        }
        currentContractId = contractId;
        cacheHqMonitorDOM();

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
            window.syncFloatingCyberDockHUD(quest); // Pintu Tunggal Penyelarasan Tombol Melayang
        });
    };

    /**
     * Menyuntikkan Data Kontrak Misi ke Layar Informasi HQ Tab
     */
    function renderTacticalQuestBoardUI(quest) {
        // PERBAIKAN SEKTOR TIMING: Paksa sistem memetakan ulang DOM yang diinjeksi index.html secara absolut
        cacheHqMonitorDOM();

        if (hqEmptyState) hqEmptyState.classList.add('hide');
        if (hqBoard) hqBoard.classList.remove('hide');

        if (hqQuestTitle) hqQuestTitle.innerText = quest.title || "MISI TANPA NAMA";
        if (hqQuestSubtype) hqQuestSubtype.innerText = `SUB-TIER: ${quest.subtype || 'REGULER'}`;
        if (hqQuestId) hqQuestId.innerText = currentContractId.substring(0, 8).toUpperCase();
        if (hqQuestReward) hqQuestReward.innerText = window.formatRupiahCurrency ? window.formatRupiahCurrency(quest.reward || 0) : `Rp ${quest.reward}`;

        // Sinkronisasi Manifes Deskripsi Rute Asal vs Tujuan (Sektor Perbaikan Penulisan Teks Alamat)
        if (hqOrigName) hqOrigName.innerText = quest.pickup_location_name || "Kordinat Awal Titik Asal";
        if (hqOrigDesc) hqOrigDesc.innerText = quest.pickup_description || "Tidak ada catatan instruksi tambahan dari pemesan.";
        if (hqDestName) hqDestName.innerText = quest.destination_location_name || "Kordinat Target Operasi";
        if (hqDestDesc) hqDestDesc.innerText = quest.destination_description || "Tidak ada catatan tugas operasional khusus.";

        // Sinkronisasi Status Teks Operasional Utama
        if (hqStatus) {
            hqStatus.innerText = (quest.status || "STANDBY").toUpperCase();
            hqStatus.style.color = quest.status === 'otw' ? 'var(--neon-blue)' : 
                                   quest.status === 'kerja' ? 'var(--neon-purple)' : 'var(--neon-green)';
        }

        // Jalankan Pembaruan Matriks Progress Bar Neon di dalam Tab
        window.updateHqMatrixProgressBar(quest.status);

        // Plot Titik Lokasi Koordinat ke Peta Taktis Leaflet secara Otomatis
        if (quest.target_lat && quest.target_lng && window.lockTacticalTargetRoute) {
            window.lockTacticalTargetRoute(quest.target_lat, quest.target_lng, quest.title);
        }
    }

    /**
     * Mengatur Pergerakan Garis Neon Progress di Tab HQ
     */
    window.updateHqMatrixProgressBar = function(status) {
        const fill = document.getElementById('hq-matrix-fill');
        const nodes = {
            'accepted': document.getElementById('step-node-accepted'),
            'otw': document.getElementById('step-node-otw'),
            'kerja': document.getElementById('step-node-kerja'),
            'done': document.getElementById('step-node-done')
        };
        const lbls = {
            'accepted': document.getElementById('step-lbl-accepted'),
            'otw': document.getElementById('step-lbl-otw'),
            'kerja': document.getElementById('step-lbl-kerja'),
            'done': document.getElementById('step-lbl-done')
        };

        // Reset state visual
        Object.values(nodes).forEach(n => { if(n) n.className = 'hq-matrix-step-node'; });
        Object.values(lbls).forEach(l => { if(l) l.className = ''; });

        let fillPct = "0%";
        if (status === 'accepted') {
            fillPct = "0%";
            if(nodes.accepted) nodes.accepted.classList.add('active');
            if(lbls.accepted) lbls.accepted.className = 'active';
        } else if (status === 'otw') {
            fillPct = "33.3%";
            if(nodes.accepted) nodes.accepted.classList.add('done');
            if(nodes.otw) nodes.otw.classList.add('active');
            if(lbls.otw) lbls.otw.className = 'active';
        } else if (status === 'kerja') {
            fillPct = "66.6%";
            if(nodes.accepted) nodes.accepted.classList.add('done');
            if(nodes.otw) nodes.otw.classList.add('done');
            if(nodes.kerja) nodes.kerja.classList.add('active');
            if(lbls.kerja) lbls.kerja.className = 'active';
        } else if (status === 'done') {
            fillPct = "100%";
            Object.values(nodes).forEach(n => { if(n) n.classList.add('done'); });
            if(lbls.done) lbls.done.className = 'active';
        }

        if (fill) fill.style.width = fillPct;
    };

    /**
     * PINTU TUNGGAL UTAMA - Pengatur Sinkronisasi Tombol Melayang di index.html
     */
    window.syncFloatingCyberDockHUD = function (quest) {
        const role = localStorage.getItem('role') || 'adventurer';
        const currentStatus = quest ? quest.status : 'standby';

        // Ambil elemen dock eksternal dari index.html
        const dockContainer = document.getElementById('floating-cyber-dock');
        const btnAdvMain = document.getElementById('dock-btn-adv-main');
        const btnAdvFinish = document.getElementById('dock-btn-adv-finish');
        const btnReqConfirm = document.getElementById('dock-btn-req-confirm');
        const reqMonitorBox = document.getElementById('dock-req-monitor-box');
        const reqMonitorMsg = document.getElementById('dock-req-monitor-text');
        const emergencyBox = document.getElementById('dock-emergency-container');

        if (!dockContainer) return; // Fail-safe jika kerangka utama belum sedia

        // Sembunyikan semua porsi default awal
        if (btnAdvMain) btnAdvMain.classList.add('hide');
        if (btnAdvFinish) btnAdvFinish.classList.add('hide');
        if (btnReqConfirm) btnReqConfirm.classList.add('hide');
        if (reqMonitorBox) reqMonitorBox.classList.add('hide');
        if (emergencyBox) emergencyBox.classList.add('hide');

        if (!quest) {
            dockContainer.classList.add('hide');
            window.shutdownEmergencySliderUI();
            return;
        }

        dockContainer.classList.remove('hide');

        // PERFORMA SUB-SISTEM SEBAGAI ADVENTURER (THE ACTOR)
        if (role === 'adventurer') {
            if (currentStatus === 'accepted') {
                if (btnAdvMain) {
                    btnAdvMain.innerText = "PROSES PROTOKOL (OTW)";
                    btnAdvMain.style.borderColor = "var(--neon-blue)";
                    btnAdvMain.style.color = "var(--neon-blue)";
                    btnAdvMain.classList.remove('hide');
                }
                window.shutdownEmergencySliderUI();
            } else if (currentStatus === 'otw') {
                if (btnAdvMain) {
                    btnAdvMain.innerText = "MULAI EKSEKUSI (KERJA)";
                    btnAdvMain.style.borderColor = "var(--neon-purple)";
                    btnAdvMain.style.color = "var(--neon-purple)";
                    btnAdvMain.classList.remove('hide');
                }
                window.shutdownEmergencySliderUI();
            } else if (currentStatus === 'kerja') {
                if (btnAdvFinish) btnAdvFinish.classList.remove('hide');
                // Picu hitung mundur slider darurat di tingkat dock melayang
                initiateEmergencyCountdownProtocol();
            } else if (currentStatus === 'done') {
                // Sembunyikan tombol, arahkan asisten AI memberikan respons pasca tugas
                window.shutdownEmergencySliderUI();
            }
        } 
        // PERFORMA SUB-SISTEM SEBAGAI REQUESTER (THE LISTENER / EVALUATOR)
        else if (role === 'requester') {
            window.shutdownEmergencySliderUI();
            if (reqMonitorBox) reqMonitorBox.classList.remove('hide');

            if (currentStatus === 'accepted') {
                if (reqMonitorMsg) reqMonitorMsg.innerText = "Misi diterima! Menunggu petualang bergerak (OTW).";
            } else if (currentStatus === 'otw') {
                if (reqMonitorMsg) reqMonitorMsg.innerText = "Petualang dalam perjalanan menembus rute asal.";
            } else if (currentStatus === 'kerja') {
                if (reqMonitorMsg) reqMonitorMsg.innerText = "Petualang sedang melakukan eksekusi parameter tugas.";
            } else if (currentStatus === 'done') {
                if (reqMonitorBox) reqMonitorBox.classList.add('hide'); // Sembunyikan monitor siaga
                if (btnReqConfirm) btnReqConfirm.classList.remove('hide'); // Munculkan tombol penilaian final
            }
        }
    };

    /**
     * Handler Pemicu Klik Tombol Utama Siklus Misi Petualang (Melayang)
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
        }

        if (!nextStatus) return;

        if (window.sysConfirm) {
            const setuju = await window.sysConfirm("TRANSMISI SISTEM", confirmLabel, true);
            if (!setuju) return;
        }

        if (window.vibratePulse) window.vibratePulse();

        boardDB.ref(`kontrak_mission/${currentContractId}/status`).set(nextStatus)
            .then(() => {
                window.updateAIBubbleSpeech(`Status transmisi perjalanan diperbarui: [${nextStatus.toUpperCase()}].`, "success");
            })
            .catch(err => console.error("[DOCK ACTION ERROR]", err));
    };

    /**
     * Handler Khusus Tombol Selesai Normal untuk Petualang
     */
    window.handleNormalFinishProtocol = async function () {
        if (!currentContractId) return;

        if (window.sysConfirm) {
            const setuju = await window.sysConfirm("TRANSMISI SISTEM", "Nyatakan seluruh parameter misi selesai dan kirimkan laporan ke Guild?", true);
            if (!setuju) return;
        }

        if (window.vibratePulse) window.vibratePulse();

        const boardDB = window.getTerminal('FB4_BOARD');
        boardDB.ref(`kontrak_mission/${currentContractId}/status`).set('done')
            .then(() => {
                window.updateAIBubbleSpeech("Misi dilaporkan SELESAI. Menunggu konfirmasi & pencairan dana dari Requester.", "success");
                if (window.openEvalReq) window.openEvalReq();
            })
            .catch(err => console.error("[FINISH ACTION ERROR]", err));
    };

    /**
     * Menghitung Jarak Koordinat GPS secara Live dari Pembaruan Peta Taktis
     */
    window.recalculateLiveDistance = function (lat1, lng1, lat2, lng2) {
        if (!hqQuestDistance) cacheHqMonitorDOM();
        if (!hqQuestDistance) return;

        const R = 6371; 
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
     * Memulai Prosedur Hitung Mundur Pengaktifan Slider Selesai Darurat (AFK Slider Melayang)
     */
    function initiateEmergencyCountdownProtocol() {
        const emZone = document.getElementById('dock-emergency-container');
        const emTimer = document.getElementById('dock-emergency-timer-msg');
        const sliderCont = document.getElementById('dock-slider-container-em');
        const emSlider = document.getElementById('dock-em-slider');

        if (!emZone || !emTimer) return;
        
        clearInterval(emergencyCountdownInterval);
        emZone.classList.remove('hide');
        emTimer.style.display = 'block';
        if (sliderCont) sliderCont.style.display = 'none';

        let sisaDetik = 10; 

        emergencyCountdownInterval = setInterval(() => {
            sisaDetik--;
            if (sisaDetik > 0) {
                emTimer.innerText = `EMERGENCY CONTROL SELESAI DARURAT MUNCUL DALAM ${sisaDetik}S...`;
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
                window.updateAIBubbleSpeech("Protokol Selesai Paksa (AFK Emergency Slider) siap di kerangka utama.", "alert");
            }
        }, 1000);
    }

    /**
     * Eksekusi Selesai Paksa Akibat Klien Menghilang / AFK di Lapangan
     */
    async function triggerEmergencyActionExecution() {
        if (window.vibratePulse) window.vibratePulse();
        
        if (window.sysConfirm) {
            const valid = await window.sysConfirm("CRITICAL PROTOCOL", "AKTIFKAN FINISH PAKSA SELESAI DARURAT?\n\nGunakan hanya jika pemesan terbukti kabur/AFK.", true);
            if (valid) {
                const boardDB = window.getTerminal('FB4_BOARD');
                if (boardDB && currentContractId) {
                    boardDB.ref(`kontrak_mission/${currentContractId}/status`).set('done');
                }
                if (window.openEvalReq) window.openEvalReq();
            } else {
                const emSlider = document.getElementById('dock-em-slider');
                if (emSlider) emSlider.value = 0;
            }
        }
    }

    /**
     * Menyumbat dan Mereset Total Panel Slider Darurat Melayang
     */
    window.shutdownEmergencySliderUI = function () {
        clearInterval(emergencyCountdownInterval);
        const emZone = document.getElementById('dock-emergency-container');
        if (emZone) emZone.classList.add('hide');
    };

    /**
     * Mereset Seluruh Komponen HQ ke Tampilan Default (Siaga)
     */
    function resetQuestDashboardToEmptyState() {
        cacheHqMonitorDOM();
        if (hqBoard) hqBoard.classList.add('hide');
        if (hqEmptyState) hqEmptyState.classList.remove('hide');
        if (hqStatus) {
            hqStatus.innerText = "STANDBY";
            hqStatus.style.color = "var(--neon-green)";
        }
        window.shutdownEmergencySliderUI();
        
        const dockContainer = document.getElementById('floating-cyber-dock');
        if (dockContainer) dockContainer.classList.add('hide');

        if (window.clearTacticalTargetRoute) window.clearTacticalTargetRoute();
        currentActiveQuest = null;
    }

    /**
     * Update Teks Balon Ucapan Obrolan Asisten AI Irene Hub + Terminal Logger Feed
     */
    window.updateAIBubbleSpeech = function (text, mode) {
        if (!hqBubble) cacheHqMonitorDOM();
        if (hqBubble) hqBubble.innerText = text;
        
        const logger = document.getElementById('hq-terminal-logger');
        if (logger) {
            const timeStr = new Date().toLocaleTimeString();
            const tagStr = mode ? mode.toUpperCase() : "INTEL";
            let colorClass = mode === 'success' ? 'success' : mode === 'alert' ? 'alert' : '';
            
            logger.innerHTML += `
                <div class="hq-log-row">
                    <span class="hq-log-time">[${timeStr}]</span>
                    <span class="hq-log-tag">[${tagStr}]</span>
                    <span class="hq-log-text ${colorClass}">${text}</span>
                </div>`;
            logger.scrollTop = logger.scrollHeight;
        }
    };

    // Sinkronisasi ulang pemetaan ketika antarmuka komponen HQ disuntikkan
    window.initActionsHQ = function () {
        cacheHqMonitorDOM();
        console.log("[HQ DOCK LINK] Monitor data terminal successfully sync-bound.");
        
        // Cek paksa kondisi saat ini jika snapshot data sudah tersimpan di memory internal
        if (currentActiveQuest) {
            renderTacticalQuestBoardUI(currentActiveQuest);
            window.syncFloatingCyberDockHUD(currentActiveQuest);
        }
    };

})(window);
