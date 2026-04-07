/**
 * DASHBOARD ENGINE PROTOCOL v1.0
 * Security: Iron Wall
 * Persistence: Ghost Cleanup
 */

const Engine = {
    session: null,
    db: null,
    userRef: null,
    currentStone: 0,
    lastActivity: Date.now(),

    config: {
        apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
        databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "ojeklokal-42b84"
    },

    async init() {
        this.session = JSON.parse(localStorage.getItem('pickme_user'));
        if (!this.session) window.location.href = 'login.html';

        if (!firebase.apps.length) firebase.initializeApp(this.config);
        this.db = firebase.database();
        
        this.applyIronWall();
        this.setupWatermark();
        this.startHeartbeat();
        await this.ghostCleanupCheck();
        this.syncAdventurerData();
        this.listenToQuests();
    },

    // 1. THE IRON WALL: SECURITY PROTOCOL
    applyIronWall() {
        // Anti-Inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = (e) => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
                return false;
            }
        };

        // App Lock Logic (5 Minutes Inactivity)
        setInterval(() => {
            if (Date.now() - this.lastActivity > 300000) {
                alert("Session Expired: Security Lock Re-engaged.");
                window.location.reload();
            }
        }, 10000);

        document.addEventListener('touchstart', () => { this.lastActivity = Date.now(); });
    },

    // 2. GHOST CLEANUP: VALIDATION KEY
    async ghostCleanupCheck() {
        const overlay = document.getElementById('ghost-cleanup');
        const path = `identity_adventurer/${this.session.shard}/${this.session.id}/current_quest_id`;
        
        const snapshot = await this.db.ref(path).once('value');
        if (snapshot.exists() && snapshot.val() !== null && snapshot.val() !== "") {
            overlay.style.display = 'flex';
            this.playSfx('sndQuest');
            setTimeout(() => {
                window.location.href = `active_mission.html?id=${snapshot.val()}`;
            }, 2000);
        }
    },

    // 3. GAME JUICE: COUNTING NUMBERS (Odometer)
    updateStone(newAmount) {
        const target = document.getElementById('txtStone');
        const start = this.currentStone;
        const duration = 1000;
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = Math.floor(progress * (newAmount - start) + start);
            target.innerText = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        this.currentStone = newAmount;
    },

    // 4. THE LIVING APP: HAPTICS & AUDIO
    playSfx(id) {
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    },

    triggerHaptic(pattern = 50) {
        if ("vibrate" in navigator) navigator.vibrate(pattern);
    },

    // 5. DATA SYNC: SENSORY ENGINE
    syncAdventurerData() {
        const path = `identity_adventurer/${this.session.shard}/${this.session.id}`;
        this.db.ref(path).on('value', (snap) => {
            const data = snap.val();
            if (!data) return;

            // Update UI
            document.getElementById('txtRank').innerText = data.rank || 'F';
            this.updateStone(data.stone_balance || 0);

            // Stamina Pulse Logic
            const stamina = data.stamina || 0;
            const bar = document.getElementById('staminaBar');
            bar.style.width = stamina + "%";
            bar.classList.toggle('stamina-low', stamina < 20);

            // Level Up Check
            if (this.oldExp && data.exp > this.oldExp) {
                // Trigger Level Up if threshold crossed (logic can be expanded)
            }
            this.oldExp = data.exp;
        });
    },

    // 6. QUEST BOARD: REAL-TIME RTDB
    listenToQuests() {
        const questRef = this.db.ref(`quest_board/${this.session.shard}/active_short_quests`);
        const board = document.getElementById('questBoard');

        questRef.on('value', (snap) => {
            board.innerHTML = '';
            if (!snap.exists()) {
                board.innerHTML = '<div style="text-align:center; color:#333; margin-top:50px;">NO ACTIVE MISSION IN RADIUS</div>';
                return;
            }

            this.playSfx('sndQuest'); // Alert new quest
            
            snap.forEach((child) => {
                const quest = child.val();
                const card = document.createElement('div');
                card.className = 'quest-card';
                card.innerHTML = `
                    <div class="rank-badge" style="background:${this.getRankColor(quest.min_rank)}">${quest.min_rank}</div>
                    <div style="font-size:14px; font-weight:bold; color:var(--neon-blue);">${quest.judul_misi}</div>
                    <div style="font-size:11px; color:#888; margin: 5px 0;">${quest.lokasi_pickup_name}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <div style="color:var(--neon-gold); font-size:16px; font-weight:bold;">${quest.reward_stone} STONE</div>
                        <div style="font-size:10px; color:#444;">ID: ${child.key.substring(0,8)}</div>
                    </div>
                `;
                card.onclick = () => {
                    this.playSfx('sndClick');
                    this.triggerHaptic(70);
                    window.location.href = `quest_detail.html?id=${child.key}`;
                };
                board.appendChild(card);
            });
        });
    },

    getRankColor(rank) {
        const colors = { 'F': '#555', 'E': '#2ecc71', 'D': '#3498db', 'C': '#9b59b6', 'B': '#e67e22', 'A': '#e74c3c', 'S': '#f1c40f' };
        return colors[rank] || '#fff';
    },

    setupWatermark() {
        const container = document.getElementById('guild-watermark');
        const idMark = this.session.id.toUpperCase();
        for (let i = 0; i < 100; i++) {
            const el = document.createElement('div');
            el.style.margin = "20px";
            el.innerText = idMark;
            container.appendChild(el);
        }
    },

    startHeartbeat() {
        // Update user location & status every 30s
        setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    this.db.ref(`active_adventurers_location/${this.session.shard}/${this.session.id}`).set({
                        ...coords,
                        last_seen: Date.now()
                    });
                });
            }
        }, 30000);
    }
};

window.onload = () => Engine.init();
