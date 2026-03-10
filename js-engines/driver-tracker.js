// MODUL 7: GPS TRACKING & DATA THROTTLING
const DriverTracker = {
    watchId: null,
    lastUpdate: 0,
    minInterval: 10000, // Update setiap 10 detik (Throttle)
    minDistance: 10,    // Atau jika berpindah minimal 10 meter

    // Mulai melacak posisi driver
    startTracking(nik, region, activeOrderId = null) {
        if (!navigator.geolocation) {
            console.error("GPS tidak didukung di perangkat ini.");
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.handleLocationUpdate(position, nik, region, activeOrderId);
            },
            (error) => console.error("Error GPS:", error),
            {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            }
        );
    },

    // Logika pengiriman data yang efisien
    async handleLocationUpdate(position, nik, region, activeOrderId) {
        const now = Date.now();
        
        // Filter Waktu: Jangan kirim jika belum lewat 10 detik
        if (now - this.lastUpdate < this.minInterval) return;

        const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading || 0, // Arah hadap motor
            speed: position.coords.speed || 0,     // Kecepatan (untuk fitur Rank)
            last_seen: now
        };

        try {
            // 1. Update ke folder wilayah (Untuk Sharding/Market)
            const shardingPath = `active_drivers/${region}/${nik}/location`;
            await set(ref(db, shardingPath), coords);

            // 2. Jika sedang dalam orderan, update ke folder orderan (Untuk Pelanggan)
            if (activeOrderId) {
                const orderPath = `orders_active/${region}/${activeOrderId}/driver_live_location`;
                await set(ref(db, orderPath), coords);
            }

            this.lastUpdate = now;
            console.log("Lokasi terupdate ke server.");
        } catch (error) {
            console.error("Gagal update lokasi:", error);
        }
    },

    // Berhenti melacak (saat offline atau logout)
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
};
