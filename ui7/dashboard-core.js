// Simpan file ini dengan nama: dashboard-core.js
function initDashboard(config, session) {
    firebase.initializeApp(config);
    const db = firebase.database();

    // Fungsi Load Misi
    window.loadMissions = function() {
        console.log("Loading missions for " + session.shard_id);
        const missionRef = db.ref(`missions/${session.shard_id}`);
        missionRef.on('value', (snap) => {
            const listDiv = document.getElementById('missionList');
            listDiv.innerHTML = "";
            snap.forEach(child => {
                const m = child.val();
                listDiv.innerHTML += `<div class="card"><h3>${m.title}</h3><p>${m.description}</p></div>`;
            });
        });
    };

    // Panggil fungsi awal
    window.loadMissions();
}
