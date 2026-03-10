// MODUL 4: BURSA ORDER (MARKET ENGINE)
const DriverMarket = {
    // Mendengarkan orderan masuk di wilayah aktif
    listenToMarket(region, callback) {
        const marketRef = ref(db, `orders_active/${region}`);
        
        // Listener ini akan otomatis update jika ada orderan masuk/hapus
        onValue(marketRef, (snapshot) => {
            const data = snapshot.val();
            const orders = [];
            
            if (data) {
                // Ubah objek Firebase menjadi Array agar mudah di-looping
                Object.keys(data).forEach(key => {
                    orders.push({ id: key, ...data[key] });
                });
            }
            
            // Kirim data ke UI
            callback(orders);
        });
    },

    // Logika tombol "Ambil Order" (Langkah awal sebelum Nego)
    selectOrder(orderId) {
        console.log("Membuka detail order: " + orderId);
        // Di sini nanti akan memanggil DriverBidding.js
    }
};
