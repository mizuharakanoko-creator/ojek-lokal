// MODUL 8: NAVIGATION & ROUTING (MAPS INTEGRATOR)
const DriverNavigator = {
    // Fungsi untuk membuka Google Maps dari koordinat
    // Mode: 'd' untuk Driving (Motor/Mobil)
    openExternalMap(lat, lng, label = "Tujuan") {
        // Format URL Google Maps untuk navigasi langsung
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        
        // Membuka aplikasi Google Maps di HP
        window.open(url, '_blank');
    },

    // Fungsi untuk memandu ke Titik Jemput
    guideToPickup(orderData) {
        if (orderData.pickup_lat && orderData.pickup_lng) {
            this.openExternalMap(
                orderData.pickup_lat, 
                orderData.pickup_lng, 
                "Titik Jemput Pelanggan"
            );
        } else {
            alert("Koordinat jemput tidak ditemukan.");
        }
    },

    // Fungsi untuk memandu ke Titik Tujuan
    guideToDestination(orderData) {
        if (orderData.dest_lat && orderData.dest_lng) {
            this.openExternalMap(
                orderData.dest_lat, 
                orderData.dest_lng, 
                "Titik Tujuan Pelanggan"
            );
        } else {
            alert("Koordinat tujuan tidak ditemukan.");
        }
    },

    // Fitur Tambahan: Estimasi Jarak Sederhana (Rumus Haversine)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius bumi dalam KM
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(2); // Menghasilkan jarak dalam KM
    }
};
