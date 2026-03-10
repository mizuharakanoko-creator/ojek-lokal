// MODUL 2: SECURITY & ACCESS CONTROL (GATEKEEPER)
const DriverGatekeeper = {
    
    // Fungsi Utama: Inisialisasi pengecekan saat aplikasi dibuka
    init() {
        const nik = localStorage.getItem('driver_nik');
        
        if (!nik) {
            // Jika NIK tidak ditemukan di memori HP, lempar ke halaman login
            window.location.href = "login.html";
            return;
        }

        // Jika ada NIK, pantau statusnya secara Real-Time
        this.watchAccountStatus(nik, (access) => {
            this.updateUIGate(access);
        });
    },

    // Fungsi untuk memantau status akun secara Real-Time (Gaya Penulisan Anda)
    watchAccountStatus(nik, callback) {
        // Menggunakan path 'status' agar sesuai dengan login.html kita tadi
        const statusRef = db.ref(`drivers/${nik}/status`);
        
        statusRef.on('value', (snapshot) => {
            const status = snapshot.val();
            this.evaluateAccess(status, callback);
        });
    },

    // Evaluasi apakah driver boleh narik atau tidak (Gaya Penulisan Anda)
    evaluateAccess(status, callback) {
        let access = {
            canWork: false,
            reason: "Menunggu Aktivasi"
        };

        // Logika evaluasi berdasarkan data dari Firebase
        if (status === 'active') {
            access.canWork = true;
            access.reason = "";
        } else if (status === 'banned') {
            access.canWork = false;
            access.reason = "Akun Anda ditangguhkan (Banned).";
        } else {
            access.canWork = false;
            access.reason = "Akun sedang menunggu verifikasi Admin.";
        }

        callback(access);
    },

    // Eksekusi tampilan berdasarkan hasil evaluasi
    updateUIGate(access) {
        const overlay = document.getElementById('gate-overlay');
        const message = document.getElementById('gate-message');

        if (access.canWork) {
            overlay.style.display = 'none'; // Buka Gembok
            console.log("Akses Diterima: Driver Siap Narik.");
        } else {
            overlay.style.display = 'flex'; // Kunci Layar
            message.innerText = access.reason;
        }
    }
};

// Jalankan mesin saat file ini dimuat
DriverGatekeeper.init();
