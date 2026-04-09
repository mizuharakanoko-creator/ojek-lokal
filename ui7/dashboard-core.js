function startDashboard(config, session) {
    // Inisialisasi Firebase Shard sesuai wilayah user
    firebase.initializeApp(config);
    const db = firebase.database();

    const nick = session.nick;
    const shard = session.shard_id;

    console.log(`Connected to Shard: ${shard} as ${nick}`);

    // LOGIKA LOAD MISI
    const missionRef = db.ref(`missions/${shard}`);
    missionRef.on('value', (snapshot) => {
        const listDiv = document.getElementById('missionList');
        if(!listDiv) return;
        
        listDiv.innerHTML = "";
        if (!snapshot.exists()) {
            listDiv.innerHTML = "<p style='color:#444'>TIDAK ADA MISI DI WILAYAH INI.</p>";
            return;
        }

        snapshot.forEach((child) => {
            const m = child.val();
            const mId = child.key;
            
            // Filter hanya misi yang statusnya 'posted'
            if(m.status === "posted") {
                listDiv.innerHTML += `
                    <div style="background:#111; border:1px solid #222; padding:15px; margin-bottom:10px;">
                        <h3 style="color:#00ffff; margin:0;">${m.title}</h3>
                        <p style="color:#888; font-size:13px;">${m.description}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#ffbb33; font-weight:bold;">Rp ${m.reward.toLocaleString()}</span>
                            <button onclick="takeMission('${mId}')" style="background:#ff0055; border:none; color:white; padding:5px 15px; cursor:pointer;">AMBIL</button>
                        </div>
                    </div>
                `;
            }
        });
    });

    // FUNGSI AMBIL MISI
    window.takeMission = function(mId) {
        if(!confirm("Terima kontrak misi ini?")) return;
        
        db.ref(`missions/${shard}/${mId}/applicants/${nick}`).set({
            nick: nick,
            timestamp: Date.now(),
            rating: 5.0
        }).then(() => {
            alert("Berhasil melamar! Menunggu konfirmasi Requester.");
        });
    };
}
