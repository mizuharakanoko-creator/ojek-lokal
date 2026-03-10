// MODUL 6: CONFLICT HANDLING (THE REFEREE)
const DriverConflict = {
    // Fungsi untuk mengunci orderan agar tidak diambil driver lain
    async claimOrder(region, orderId, driverNik) {
        const orderRef = ref(db, `orders_active/${region}/${orderId}`);

        try {
            // Kita gunakan transaksi untuk memastikan operasi ini "Atomik"
            // Artinya: Jika ada 2 orang klik, server akan memproses siapa yang masuk duluan dalam milidetik
            const result = await runTransaction(orderRef, (currentData) => {
                if (currentData === null) return currentData; // Order sudah hilang

                // Jika status masih 'searching' atau 'bidding', berarti masih kosong
                if (statusBolehDiambil(currentData.status)) {
                    currentData.status = "picked_up";
                    currentData.driver_id = driverNik;
                    currentData.accepted_at = Date.now();
                    return currentData; // Menang!
                } else {
                    return; // Gagal, sudah diambil orang lain
                }
            });

            if (result.committed) {
                return { success: true, message: "Order berhasil Anda dapatkan!" };
            } else {
                return { success: false, message: "Maaf, order sudah diambil driver lain." };
            }
        } catch (error) {
            return { success: false, message: "Terjadi kesalahan sistem." };
        }
    }
};

// Fungsi pembantu pengecekan status
function statusBolehDiambil(status) {
    const statusValid = ['searching', 'bidding'];
    return statusValid.includes(status);
}
