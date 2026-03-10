// MODUL 13: DATABASE CLEANER & ARCHIVING (THE SWEEPER)
const DriverArchive = {
    // Fungsi memindahkan orderan aktif ke riwayat permanen
    async archiveOrder(region, orderId) {
        const activePath = `orders_active/${region}/${orderId}`;
        const historyPath = `orders_history/${new Date().getFullYear()}/${orderId}`;

        try {
            // 1. Ambil data terakhir dari orderan aktif
            const snapshot = await get(ref(db, activePath));
            const data = snapshot.val();

            if (data) {
                // 2. Salin data ke folder Riwayat (Tanpa sampah Chat & Live GPS)
                const cleanData = {
                    ...data,
                    chats: null,              // Hapus chat agar hemat ruang
                    driver_live_location: null, // Hapus jejak GPS lama
                    archived_at: Date.now()
                };

                await set(ref(db, historyPath), cleanData);

                // 3. Hapus data dari folder Aktif (Proses Pembersihan)
                await remove(ref(db, activePath));
                
                console.log(`Order ${orderId} berhasil diarsip dan dibersihkan.`);
            }
        } catch (error) {
            console.error("Gagal melakukan pengarsipan:", error);
        }
    },

    // Membersihkan sampah metadata perangkat secara berkala
    async purgeOldLogs(nik) {
        // Logika untuk menghapus log aktivitas yang sudah lebih dari 30 hari
        console.log("Membersihkan log lama untuk driver: " + nik);
    }
};
