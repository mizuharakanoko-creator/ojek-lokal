/**
 * DASHBOARD ENGINE PROTOCOL v1.1
 * Updated: Apply Logic (Option B)
 */

const Engine = {
    session: null,
    db: null,
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

    // --- SECURITY & UTILS ---
    applyIronWall() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.onkeydown = (e) => {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) return false;
        };
        setInterval(() => {
            if (Date.now() - this.lastActivity > 300000) window.location.reload();
        }, 10000);
        document.addEventListener('touchstart', () => { this.lastActivity = Date.now(); });
    },

    async ghostCleanupCheck() {
        const path = `identity_adventurer/${this.session.shard}/${this.session.id}/current_quest_id`;
        const snapshot = await this.db.ref(path).once('value');
        if (snapshot.exists() && snapshot.val()) {
            window.location.href = `active_mission.html?id=${snapshot.val()}`;
        }
    },

    // --- APPLY LOGIC (OPSI B) ---
    openApplyForm(questId, originalPrice) {
        this.playSfx('sndClick');
        this.triggerHaptic(70);
        
        document.getElementById('modalApply').style.display = 'flex';
        document.getElementById('targetQuestId').value = questId;
        document.getElementById('basePrice').innerText = originalPrice;
        document.getElementById('inpNego').value = originalPrice; // Default harga
    },

    closeApplyForm() {
        document.getElementById('modalApply').style.display = 'none';
    },

    async submitApplication() {
        const qId = document.getElementById('targetQuestId').value;
        const negoPrice = document.getElementById('inpNego').value;
        const note = document.getElementById('inpNote').value;

        try {
            // 1. CEK LIMIT (Maksimal 3 lamaran aktif)
            const trackerPath = `mission_applications_tracker/${this.session.id}`;
            const trackerSnap = await this.db.ref(trackerPath).once('value');
            
            if (trackerSnap.numChildren() >= 3) {
                alert("⚠️ BATAS LIMIT! Selesaikan atau batalkan lamaran Anda yang lain (Max 3).");
                return;
            }

            // 2. KIRIM DATA KE REQUESTER HUB
            const appData = {
                adv_name: this.session.name,
                adv_rank: this.session.rank || 'F',
                adv_rating: 5.0, // Mock, bisa ditarik dari profile
                total_missions: 0,
                proposed_stone: parseInt(negoPrice),
                original_stone: parseInt(document.getElementById('basePrice').innerText),
                is_nego: negoPrice != document.getElementById('basePrice').innerText,
                nego_note: note,
                timestamp: Date.now()
            };

            await this.db.ref(`mission_applications/${this.session.shard}/${qId}/${this.session.id}`).set(appData);
            
            // 3. UPDATE TRACKER PRIBADI
            await this.db.ref(`${trackerPath}/${qId}`).set(true);

            alert("✅ LAMARAN TERKIRIM! Tunggu keputusan Requester.");
            this.closeApplyForm();
            this.listenToQuests(); // Refresh visual board

        } catch (e) {
            console.error(e);
            alert("Gagal mengirim lamaran. Cek koneksi.");
        }
    },

    // --- CORE RENDERING ---
    listenToQuests() {
        const questRef = this.db.ref(`quest_board/${this.session.shard}/active_short_quests`);
        const board = document.getElementById('questBoard');

        questRef.on('value', async (snap) => {
            // Ambil data lamaran saya untuk menandai mana yang sudah dilamar
            const myApps = await this.db.ref(`mission_applications_tracker/${this.session.id}`).once('value');
            const appliedIds = myApps.val() ? Object.keys(myApps.val()) : [];

            board.innerHTML = '';
            if (!snap.exists()) {
                board.innerHTML = '<div style="text-align:center; color:#333; margin-top:50px;">NO ACTIVE MISSION</div>';
                return;
            }

            snap.forEach((child) => {
                const quest = child.val();
                const isApplied = appliedIds.includes(child.key);
                
                const card = document.createElement('div');
                card.className = `quest-card ${isApplied ? 'applied' : ''}`;
                card.innerHTML = `
                    <div class="rank-badge" style="background:${this.getRankColor(quest.min_rank)}">${quest.min_rank}</div>
                    <div style="font-size:14px; font-weight:bold; color:${isApplied ? '#555' : 'var(--neon-blue)'};">
                        ${quest.judul_misi} ${isApplied ? '(PENDING)' : ''}
                    </div>
                    <div style="font-size:11px; color:#888; margin: 5px 0;">${quest.lokasi_pickup_name}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <div style="color:var(--neon-gold); font-size:16px; font-weight:bold;">${quest.reward_stone} STONE</div>
                        <button class="btn-action" ${isApplied ? 'disabled' : ''}>
                            ${isApplied ? 'TERKIRIM' : '[ LAMAR ]'}
                        </button>
                    </div>
                `;
                
                if (!isApplied) {
                    card.onclick = () => this.openApplyForm(child.key, quest.reward_stone);
                }
                board.appendChild(card);
            });
        });
    },

    // --- OTHER ENGINE FEATURES ---
    getRankColor(rank) {
        const colors = { 'F': '#555', 'E': '#2ecc71', 'D': '#3498db', 'C': '#9b59b6', 'B': '#e67e22', 'A': '#e74c3c', 'S': '#f1c40f' };
        return colors[rank] || '#fff';
    },

    updateStone(newAmount) {
        const target = document.getElementById('txtStone');
        if (target) target.innerText = newAmount.toLocaleString();
        this.currentStone = newAmount;
    },

    syncAdventurerData() {
        const path = `identity_adventurer/${this.session.shard}/${this.session.id}`;
        this.db.ref(path).on('value', (snap) => {
            const data = snap.val();
            if (!data) return;
            document.getElementById('txtRank').innerText = data.rank || 'F';
            this.updateStone(data.stone_balance || 0);
        });
    },

    setupWatermark() {
        const container = document.getElementById('guild-watermark');
        if (!container) return;
        const idMark = this.session.id.toUpperCase();
        for (let i = 0; i < 30; i++) {
            const el = document.createElement('div');
            el.innerText = idMark;
            container.appendChild(el);
        }
    },

    startHeartbeat() {
        setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    this.db.ref(`active_adventurers_location/${this.session.shard}/${this.session.id}`).update({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        last_seen: Date.now()
                    });
                });
            }
        }, 30000);
    },

    playSfx(id) { const a = document.getElementById(id); if(a) a.play().catch(()=>{}); },
    triggerHaptic(p) { if(navigator.vibrate) navigator.vibrate(p); }
};

window.onload = () => Engine.init();
