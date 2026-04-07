/**
 * SOVEREIGN ENGINE: DASHBOARD PROTOCOL
 * Feature: Dual-Sync, Auto-Shard, Ghost Recovery, & Application Tracker
 */

const Engine = {
    session: null,
    db: null,
    currentStone: 0,
    lastActivity: Date.now(),

    // CONFIGURATION (Pastikan sesuai dengan Firebase Console Anda)
    config: {
        apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
        authDomain: "ojeklokal-42b84.firebaseapp.com",
        databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ojeklokal-42b84"
    },

    async init() {
        // 1. Session & Auth Check
        const savedSession = localStorage.getItem('pickme_user');
        if (!savedSession) {
            window.location.href = 'login.html';
            return;
        }
        this.session = JSON.parse(savedSession);

        // 2. Firebase Initialization
        if (!firebase.apps.length) {
            firebase.initializeApp(this.config);
        }
        this.db = firebase.database();
        
        // 3. Launch Core Protocols
        this.applyIronWall();
        this.setupWatermark();
        this.startHeartbeat();
        
        // 4. Mission Logic
        await this.ghostCleanupCheck();
        
        // 5. Data Synchronization (THE ENGINE)
        this.syncAdventurerData();
        this.listenToQuests();
    },

    // --- 🛡️ SECURITY & UI PROTOCOL ---
    applyIronWall() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = (e) => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
        };
        // Auto-refresh jika idle 5 menit
        setInterval(() => {
            if (Date.now() - this.lastActivity > 300000) window.location.reload();
        }, 30000);
        document.addEventListener('touchstart', () => { this.lastActivity = Date.now(); });
    },

    setupWatermark() {
        const container = document.getElementById('guild-watermark');
        if (!container) return;
        const idMark = (this.session.id || "GUEST").toUpperCase();
        container.innerHTML = ''; // Clear previous
        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.innerText = idMark;
            container.appendChild(el);
        }
    },

    // --- 🧬 DATA SYNC ENGINE (Fixed & Enhanced) ---
    syncAdventurerData() {
        const shard = this.session.shard || "KNG_01";
        const uid = this.session.id;

        // A. Profile & Trust Score (identity_adventurer)
        const profileRef = this.db.ref(`identity_adventurer/${shard}/${uid}`);
        profileRef.on('value', (snap) => {
            const data = snap.val();
            if (!data) return;

            // Update UI Rank & Stone
            if(document.getElementById('txtRank')) document.getElementById('txtRank').innerText = data.rank || 'F';
            
            // Menggunakan 'trust_score' sesuai database Anda
            const score = data.trust_score || 0;
            this.updateStoneVisual(score);

            // AUTO-SHARD SWITCHER: Jika di DB shard-nya berubah, paksa user pindah wilayah
            if (data.current_shard && data.current_shard !== shard) {
                console.log("Detecting Shard Migration...");
                this.session.shard = data.current_shard;
                localStorage.setItem('pickme_user', JSON.stringify(this.session));
                window.location.reload();
            }
        });

        // B. Health & Energy (adventurer_status)
        const statusRef = this.db.ref(`adventurer_status/${shard}/${uid}`);
        statusRef.on('value', (snap) => {
            const stats = snap.val();
            if (!stats) return;

            // Update Stamina Bar Visual
            const current = stats.current_stamina || 0;
            const max = stats.max_stamina || 100;
            const percent = Math.min((current / max) * 100, 100);
            
            const bar = document.getElementById('staminaBar');
            if (bar) bar.style.width = percent + "%";
        });
    },

    updateStoneVisual(amount) {
        const target = document.getElementById('txtStone');
        if (target) target.innerText = amount.toLocaleString();
        this.currentStone = amount;
    },

    // --- 📜 QUEST & APPLICATION ENGINE ---
    listenToQuests() {
        const questRef = this.db.ref(`quest_board/${this.session.shard}/active_short_quests`);
        const board = document.getElementById('questBoard');

        questRef.on('value', async (snap) => {
            // Cek tracker lamaran agar tombol berubah jadi 'TERKIRIM'
            const myApps = await this.db.ref(`mission_applications_tracker/${this.session.id}`).once('value');
            const appliedIds = myApps.val() ? Object.keys(myApps.val()) : [];

            board.innerHTML = '';
            if (!snap.exists()) {
                board.innerHTML = '<div style="text-align:center; color:#333; margin-top:50px; font-family:monospace;">NO MISSIONS IN THIS AREA</div>';
                return;
            }

            snap.forEach((child) => {
                const quest = child.val();
                const qId = child.key;
                const isApplied = appliedIds.includes(qId);
                
                const card = document.createElement('div');
                card.className = `quest-card ${isApplied ? 'applied' : ''}`;
                card.innerHTML = `
                    <div class="rank-badge" style="background:${this.getRankColor(quest.min_rank)}">${quest.min_rank}</div>
                    <div style="font-size:14px; font-weight:bold; color:${isApplied ? '#555' : 'var(--neon-blue)'};">
                        ${quest.judul_misi} ${isApplied ? '(PENDING)' : ''}
                    </div>
                    <div style="font-size:11px; color:#666; margin: 5px 0;">📍 ${quest.lokasi_pickup_name}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <div style="color:var(--neon-gold); font-size:16px; font-weight:bold;">${quest.reward_stone} STONE</div>
                        <button class="btn-action" ${isApplied ? 'disabled' : ''} 
                                style="${isApplied ? 'opacity:0.5; border:1px solid #333;' : ''}">
                            ${isApplied ? 'APPLIED' : '[ LAMAR ]'}
                        </button>
                    </div>
                `;
                
                if (!isApplied) {
                    card.onclick = () => this.openApplyForm(qId, quest.reward_stone);
                }
                board.appendChild(card);
            });
        });
    },

    // --- 🚀 MISSION ACTIONS ---
    openApplyForm(questId, price) {
        this.playSfx('sndClick');
        this.triggerHaptic(50);
        const modal = document.getElementById('modalApply');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('targetQuestId').value = questId;
            document.getElementById('basePrice').innerText = price;
            document.getElementById('inpNego').value = price;
        }
    },

    closeApplyForm() {
        const modal = document.getElementById('modalApply');
        if (modal) modal.style.display = 'none';
    },

    async submitApplication() {
        const qId = document.getElementById('targetQuestId').value;
        const negoPrice = parseInt(document.getElementById('inpNego').value);
        const note = document.getElementById('inpNote').value;

        try {
            // Limit check (max 3 pending)
            const trackerPath = `mission_applications_tracker/${this.session.id}`;
            const trackerSnap = await this.db.ref(trackerPath).once('value');
            if (trackerSnap.numChildren() >= 3) {
                alert("Maksimal 3 lamaran aktif. Selesaikan yang ada!");
                return;
            }

            const appData = {
                adv_name: this.session.name,
                adv_rank: document.getElementById('txtRank').innerText,
                proposed_stone: negoPrice,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };

            // Kirim ke Requester & Update Tracker
            await this.db.ref(`mission_applications/${this.session.shard}/${qId}/${this.session.id}`).set(appData);
            await this.db.ref(`${trackerPath}/${qId}`).set(true);

            alert("Lamaran Berhasil Dikirim!");
            this.closeApplyForm();
        } catch (e) {
            alert("Error: " + e.message);
        }
    },

    async ghostCleanupCheck() {
        const path = `identity_adventurer/${this.session.shard}/${this.session.id}/current_quest_id`;
        const snap = await this.db.ref(path).once('value');
        if (snap.exists() && snap.val()) {
            // Jika ada misi aktif, paksa teleport ke halaman misi
            window.location.href = `active_mission.html?id=${snap.val()}`;
        }
    },

    startHeartbeat() {
        setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    this.db.ref(`active_adventurers_location/${this.session.shard}/${this.session.id}`).update({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        last_seen: firebase.database.ServerValue.TIMESTAMP
                    });
                }, null, { enableHighAccuracy: true });
            }
        }, 30000);
    },

    getRankColor(rank) {
        const colors = { 'F': '#555', 'E': '#2ecc71', 'D': '#3498db', 'C': '#9b59b6', 'B': '#e67e22', 'A': '#e74c3c', 'S': '#f1c40f' };
        return colors[rank] || '#fff';
    },

    playSfx(id) { const a = document.getElementById(id); if(a) a.play().catch(()=>{}); },
    triggerHaptic(p) { if(navigator.vibrate) navigator.vibrate(p); }
};

// Initialize on Load
window.onload = () => Engine.init();
