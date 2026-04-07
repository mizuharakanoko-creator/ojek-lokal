const HubEngine = {
    session: JSON.parse(localStorage.getItem('pickme_user')),
    questId: new URLSearchParams(window.location.search).get('qid'),
    db: null,
    startTime: Date.now(),
    
    tipsList: [
        "Edukasi: Pilih Adventurer dengan Rating tinggi jika membawa barang pecah belah.",
        "Sistem: Tarif Nego yang diajukan pelamar sudah mempertimbangkan jarak tempuh mereka ke titik Anda.",
        "Info: Rank 'C' ke atas telah menyelesaikan lebih dari 50 misi tanpa catatan buruk.",
        "Tip: Jangan ragu menolak lamaran jika tarif Nego tidak sesuai dengan budget Anda."
    ],

    init() {
        if (!this.session || !this.questId) window.location.href = 'create_mission.html';
        
        firebase.initializeApp({ databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app" });
        this.db = firebase.database();

        this.startTimer();
        this.startRollingTips();
        this.listenForApplicants();
    },

    startTimer() {
        setInterval(() => {
            const diff = Math.floor((Date.now() - this.startTime) / 1000);
            const m = String(Math.floor(diff / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            document.getElementById('dispTimer').innerText = `${m}:${s}`;
        }, 1000);
    },

    startRollingTips() {
        let idx = 0;
        const box = document.getElementById('dispTips');
        setInterval(() => {
            box.style.opacity = 0;
            setTimeout(() => {
                box.innerText = this.tipsList[idx];
                box.style.opacity = 1;
                idx = (idx + 1) % this.tipsList.length;
            }, 500);
        }, 5000);
    },

    listenForApplicants() {
        const ref = this.db.ref(`mission_applications/${this.session.shard}/${this.questId}`);
        ref.on('value', (snap) => {
            const list = document.getElementById('listCandidates');
            if (!snap.exists()) {
                list.innerHTML = `<div style="text-align:center; padding:30px; color:#555; font-size:12px;">Menunggu transmisi lamaran masuk...</div>`;
                return;
            }

            document.getElementById('sndPing').play().catch(()=>{});
            list.innerHTML = '';

            snap.forEach((child) => {
                const data = child.val();
                
                // Kalkulasi Mock ETA (Dalam sistem nyata, dihitung dari lat/lng adventurer ke pickup)
                const distanceKm = (Math.random() * 3 + 0.5).toFixed(1); 
                const etaMins = Math.ceil(distanceKm * 2.5); // Asumsi 40km/h

                const isNego = data.is_nego ? 'block' : 'none';

                list.innerHTML += `
                    <div class="c-card">
                        <div class="c-header">
                            <span class="c-name">${data.adv_name}</span>
                            <span class="c-rank" style="color:var(--neon-gold)">RANK ${data.adv_rank}</span>
                        </div>
                        <div class="c-stats">
                            <span>⭐ ${data.adv_rating}/5.0</span>
                            <span>⚔️ ${data.total_missions} Misi Clear</span>
                        </div>
                        <div class="c-stats" style="margin-top:5px; color:#bbb;">
                            <span>📍 Jarak: ${distanceKm} km</span>
                            <span>⏳ Tiba dalam ~${etaMins} mnt</span>
                        </div>
                        
                        <div class="c-nego-box" style="display:${isNego};">
                            <strong>Mengajukan Nego: ${data.proposed_stone} STONE</strong><br>
                            <i>Catatan: "${data.nego_note}"</i>
                        </div>

                        <button class="btn-hire" onclick="HubEngine.hireAdventurer('${child.key}', '${data.adv_name}', ${data.proposed_stone || data.original_stone})">
                            [ REKRUT ADVENTURER INI ]
                        </button>
                    </div>
                `;
            });
        });
    },

    async hireAdventurer(advId, advName, finalStone) {
        if (!confirm(`Tugaskan ${advName} untuk misi ini?`)) return;
        
        document.getElementById('sndHire').play();
        document.querySelector('.radar-core').style.background = 'rgba(0, 255, 0, 0.2)';
        document.querySelector('.radar-core').style.borderColor = '#00ff00';

        try {
            // 1. Kunci Misi, hapus dari global board agar pelamar lain berhenti
            await this.db.ref(`quest_board/${this.session.shard}/active_short_quests/${this.questId}`).remove();
            
            // 2. Buat Sesi Misi Aktif
            await this.db.ref(`active_missions_session/${this.session.shard}/${this.questId}`).set({
                requester_id: this.session.id,
                adventurer_id: advId,
                stone_deal: finalStone,
                status: "AWAITING_ADV_CONFIRMATION" // Menunggu adventurer bangkit dari idle
            });

            // 3. Kirim "GRAND NOTIFICATION" ke sistem Adventurer (Trigger ke Dashboard mereka)
            await this.db.ref(`identity_adventurer/${this.session.shard}/${advId}/grand_notification`).set({
                type: "HIRED",
                quest_id: this.questId,
                timestamp: Date.now()
            });

            // 4. Redirect Requester ke Halaman Active Mission
            setTimeout(() => {
                window.location.href = `active_mission_requester.html?id=${this.questId}`;
            }, 1500);

        } catch(e) { alert("Error saat menetapkan misi!"); }
    },

    async cancelMission() {
        if (!confirm("Yakin ingin membatalkan? Semua data misi dan pelamar akan Dihapus Total.")) return;
        
        // Hapus dari Board Global
        await this.db.ref(`quest_board/${this.session.shard}/active_short_quests/${this.questId}`).remove();
        // Hapus semua lamaran masuk (Garbage Cleanup)
        await this.db.ref(`mission_applications/${this.session.shard}/${this.questId}`).remove();
        
        alert("Misi telah dihapus.");
        window.location.href = 'create_mission.html';
    }
};

window.onload = () => HubEngine.init();
