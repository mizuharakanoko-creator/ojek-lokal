// MODUL 11: WALLET & WITHDRAWAL SYSTEM
const DriverWallet = {
    // Mendapatkan saldo saat ini secara real-time
    watchBalance(nik, callback) {
        const balanceRef = ref(db, `drivers/${nik}/wallet/balance`);
        onValue(balanceRef, (snapshot) => {
            const balance = snapshot.val() || 0;
            callback(balance);
        });
    },

    // Fungsi Mengajukan Penarikan (Withdraw)
    async requestWithdraw(nik, amount, method, accountInfo) {
        // 1. Cek saldo dulu sebelum mengijinkan penarikan
        const walletRef = ref(db, `drivers/${nik}/wallet`);
        
        try {
            const result = await runTransaction(walletRef, (currentData) => {
                if (!currentData || currentData.balance < amount) {
                    return; // Saldo tidak cukup, gagalkan transaksi
                }

                // 2. Potong saldo di database
                currentData.balance -= amount;
                return currentData;
            });

            if (result.committed) {
                // 3. Catat antrian WD untuk diproses Admin
                const wdQueueRef = ref(db, `withdraw_requests/${nik}_${Date.now()}`);
                await set(wdQueueRef, {
                    nik: nik,
                    amount: amount,
                    method: method, // Misal: DANA, OVO, Bank BCA
                    account: accountInfo,
                    status: "pending",
                    timestamp: Date.now()
                });

                return { success: true, message: "Pengajuan WD berhasil dikirim!" };
            } else {
                return { success: false, message: "Saldo tidak mencukupi." };
            }
        } catch (error) {
            return { success: false, message: "Kesalahan sistem: " + error.message };
        }
    }
};
