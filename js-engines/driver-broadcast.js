// MODUL 15: BROADCAST & EMERGENCY SYSTEM (SOS ENGINE)
const DriverBroadcast = {
    // 1. Mengirim Sinyal SOS (Darurat)
    async triggerSOS(nik, nama, region) {
        const coords = await this.getCurrentLocation();
        const sosRef = ref(db, `broadcasts/${region}/sos/${nik}`);
        
        const sosData = {
            sender_name: nama,
            location: coords,
            timestamp: Date.now(),
            status: "ACTIVE"
        };

        try {
            await set(sosRef, sosData);
            alert("Sinyal SOS terkirim ke Admin dan Driver terdekat!");
        } catch (error) {
            console.error("Gagal mengirim SOS:", error);
        }
    },

    // 2. Mendengarkan SOS dari Driver lain di Wilayah yang sama
    listenToEmergency(region, myNik) {
        const sosRef = ref(db, `broadcasts/${region}/sos`);
        onValue(sosRef, (snapshot) => {
            const alarms = snapshot.val();
            if (alarms) {
                Object.keys(alarms).forEach(nik => {
                    if (nik !== myNik) {
                        this.showEmergencyOverlay(alarms[nik]);
                    }
                });
            }
        });
    },

    // 3. Mendengarkan Pengumuman Admin (Global)
    listenToAdminAnnouncements(callback) {
        const infoRef = ref(db, `broadcasts/global/announcements`);
        onValue(infoRef, (snapshot) => {
            const msg = snapshot.val();
            if (msg) callback(msg);
        });
    },

    // Fungsi pembantu mendapatkan lokasi instan untuk SOS
    async getCurrentLocation() {
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition((pos) => {
                resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            });
        });
    },

    showEmergencyOverlay(data) {
        // Logika untuk memunculkan layar merah berkedip
        const overlay = document.getElementById('sos-overlay');
        overlay.style.display = 'flex';
        document.getElementById('sos-info').innerText = `DARURAT: ${data.sender_name} butuh bantuan!`;
    }
};
