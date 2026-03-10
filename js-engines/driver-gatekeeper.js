// MODUL 2: SECURITY & ACCESS CONTROL (GATEKEEPER)
const DriverGatekeeper = {
    // Fungsi untuk memantau status akun secara Real-Time
    watchAccountStatus(nik, callback) {
        const statusRef = ref(db, `drivers/${nik}/account_control`);
        
        // Listener aktif: Jika admin merubah status di dashboard, 
        // aplikasi driver langsung bereaksi saat itu juga.
        onValue(statusRef, (snapshot) => {
            const status = snapshot.val();
            if (status) {
                this.evaluateAccess(status, callback);
            }
        });
    },

    // Evaluasi apakah driver boleh narik atau tidak
    evaluateAccess(status, callback) {
        let access = {
            canWork: true,
            reason: ""
        };

        if (status.is_banned) {
            access.canWork = false;
            access.reason = "Akun Anda telah ditangguhkan (Banned).";
        } else if (status.is_locked) {
            access.canWork = false;
            access.reason = "Akses terkunci. Silakan selesaikan iuran/donate.";
        } else if (!status.is_verified) {
            access.canWork = false;
            access.reason = "Akun sedang menunggu verifikasi Admin.";
        }

        // Kirim hasil evaluasi ke Core untuk eksekusi tampilan
        callback(access);
    }
};
