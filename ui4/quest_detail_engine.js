/**
 * QUEST DETAIL & NEGO ENGINE v1.0
 * Implementation: Firestore (Detail) + RTDB (Nego)
 */

const NegoEngine = {
    questId: new URLSearchParams(window.location.search).get('id'),
    session: JSON.parse(localStorage.getItem('pickme_user')),
    db: null,
    fs: null,
    questData: null,

    async init() {
        if (!this.questId || !this.session) window.location.href = 'dashboard.html';

        // Init Firebase
        const config = {
            apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
            databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "ojeklokal-42b84"
        };
        
        if (!firebase.apps.length) firebase.initializeApp(config);
        this.db = firebase.database();
        this.fs = firebase.firestore();

        this.applyIronWall();
        await this.loadQuestDetail();
    },

    applyIronWall() {
        // Anti-Inspect & No Selection
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.getElementById('txtQuestId').innerText = this.questId.substring(0, 10);
    },

    async loadQuestDetail() {
        try {
            // READ FIRESTORE: Quest Detail (1x Read)
            const doc = await this.fs.collection('quest_board_detail').doc(this.questId).get();
            if (!doc.exists) throw new Error("Mission Expired or Already Taken!");
            
            this.questData = doc.data();

            // Populate UI
            document.getElementById('dispTitle').innerText = this.questData.judul_misi;
            document.getElementById('dispStone').innerText = this.questData.reward_stone;
            document.getElementById('dispRank').innerText = this.questData.min_rank;
            document.getElementById('dispRank').style.color = this.getRankColor(this.questData.min_rank);
            document.getElementById('dispDesc').innerText = this.questData.deskripsi_misi;
            document.getElementById('dispLoc1').innerText = this.questData.lokasi_pickup_name;
            document.getElementById('dispLoc2').innerText = this.questData.lokasi_tujuan_name;
            document.getElementById('dispReqName').innerText = this.questData.requester_name || "Anonymous";

            // Hide Skeleton, Show Content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('mainContent').style.display = 'block';

        } catch (e) {
            alert(e.message);
            window.location.href = 'dashboard.html';
        }
    },

    getRankColor(rank) {
        const colors = { 'F': '#555', 'E': '#2ecc71', 'D': '#3498db', 'C': '#9b59b6', 'B': '#e67e22', 'A': '#e74c3c', 'S': '#f1c40f' };
        return colors[rank] || '#fff';
    },

    // --- REAL-TIME NEGOTIATION LOGIC ---

    openNego() {
        if ("vibrate" in navigator) navigator.vibrate(50);
        document.getElementById('negoModal').style.display = 'flex';
        document.getElementById('negoInput').value = this.questData.reward_stone;
    },

    async sendOffer() {
        const offer = document.getElementById('negoInput').value;
        if (offer <= 0) return alert("Stone must be higher than 0!");

        const btn = document.querySelector('#negoModal .btn-take');
        btn.disabled = true;
        btn.innerText = "TRANSMITTING...";

        try {
            // Write to RTDB: Negotiation Channel
            // Format: negotiation/[SHARD]/[QUEST_ID]/[ADVENTURER_ID]
            const negoPath = `negotiation/${this.session.shard}/${this.questId}/${this.session.id}`;
            await this.db.ref(negoPath).set({
                adventurer_name: this.session.name || this.session.id,
                proposed_stone: parseInt(offer),
                status: "PENDING",
                timestamp: Date.now()
            });

            document.getElementById('sndNego').play();
            alert("Proposal Sent! Wait for Requester response.");
            document.getElementById('negoModal').style.display = 'none';
            
            // Listen for Response
            this.db.ref(negoPath + "/status").on('value', (snap) => {
                if (snap.val() === "ACCEPTED") {
                    alert("PROPOSAL ACCEPTED! Mission is yours.");
                    this.directTake(offer);
                } else if (snap.val() === "REJECTED") {
                    alert("Proposal Rejected. Try another price.");
                    btn.disabled = false;
                    btn.innerText = "SEND PROPOSAL";
                }
            });

        } catch (e) { alert(e.message); }
    },

    // --- THE GHOST CLEANUP TRIGGER ---

    async directTake(customStone = null) {
        if (!confirm("Ambil misi ini sekarang?")) return;

        const finalStone = customStone || this.questData.reward_stone;

        try {
            // 1. ATOMIC CHECK & LOCK (RTDB)
            // Mencegah 2 orang mengambil misi yang sama di detik yang sama
            const lockRef = this.db.ref(`quest_board/${this.session.shard}/active_short_quests/${this.questId}`);
            const check = await lockRef.once('value');
            
            if (!check.exists()) throw new Error("Misi sudah diambil ksatria lain!");

            // 2. VALIDATION KEY: Set current_quest_id ke Adventurer (The Ghost Cleanup)
            const advRef = this.db.ref(`identity_adventurer/${this.session.shard}/${this.session.id}`);
            await advRef.update({
                current_quest_id: this.questId,
                status_activity: "ON_MISSION"
            });

            // 3. REMOVE FROM PUBLIC BOARD (Delete from RTDB)
            await lockRef.remove();

            // 4. CREATE MISSION INSTANCE (Data untuk halaman Chat & Maps)
            await this.db.ref(`active_missions_session/${this.session.shard}/${this.questId}`).set({
                adventurer_id: this.session.id,
                requester_id: this.questData.requester_id,
                stone_deal: finalStone,
                status: "HEADING_TO_PICKUP",
                start_time: Date.now()
            });

            alert("CONGRATULATIONS! Portal open.");
            window.location.href = `active_mission.html?id=${this.questId}`;

        } catch (e) { alert(e.message); window.location.reload(); }
    }
};

window.onload = () => NegoEngine.init();
