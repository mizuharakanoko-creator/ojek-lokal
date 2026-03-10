// MODUL 10: FINANCIAL JOURNAL (REKAP 12 BULAN)
const DriverJournal = {
    // Daftar nama bulan untuk keperluan tampilan UI
    monthNames: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"],

    // Fungsi mencatat pendapatan baru
    async recordIncome(nik, amount) {
        const now = new Date();
        const currentMonthIndex = now.getMonth(); // Menghasilkan angka 0-11
        const monthFolder = this.monthNames[currentMonthIndex];
        
        // Path: drivers/NIK/journal/Januari (misalnya)
        const journalRef = ref(db, `drivers/${nik}/journal/${monthFolder}`);

        try {
            // Menggunakan transaksi untuk menambah total pendapatan bulan tersebut
            await runTransaction(journalRef, (currentData) => {
                if (currentData === null) {
                    return { 
                        total_income: amount, 
                        total_trips: 1,
                        last_update: Date.now() 
                    };
                }
                
                // Jika tahun sudah berganti, logika penimpaan terjadi di sini
                // (Bisa ditambah pengecekan tahun jika ingin lebih ketat)
                currentData.total_income += amount;
                currentData.total_trips += 1;
                currentData.last_update = Date.now();
                return currentData;
            });
            console.log(`Berhasil mencatat pendapatan ke bulan ${monthFolder}`);
        } catch (error) {
            console.error("Gagal mencatat jurnal:", error);
        }
    },

    // Mendapatkan seluruh data 12 bulan untuk ditampilkan di dropdown statistik
    async getYearlyStats(nik, callback) {
        const journalRef = ref(db, `drivers/${nik}/journal`);
        onValue(journalRef, (snapshot) => {
            const data = snapshot.val();
            callback(data); // Mengirim data Jan-Des ke UI
        });
    }
};
