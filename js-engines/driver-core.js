// MODUL 16: CORE ENGINE (OTAK UTAMA) - TERUPDATE
const DriverCore = {
    init() {
        console.log("Core Engine: Menginisialisasi...");
        
        // 1. Ambil data identitas dari memori HP
        const nik = localStorage.getItem('driver_nik');
        const nama = localStorage.getItem('driver_nama') || "Driver";

        if (!nik) {
            console.error("NIK tidak ditemukan, mengalihkan ke Login.");
            window.location.href = "login.html";
            return;
        }

        // 2. Update Nama di Header secara instan
        const nameElement = document.getElementById('display-name');
        if (nameElement) nameElement.innerText = nama;

        // 3. Hubungkan ke Firebase untuk data Real-time (Saldo & Rating)
        this.syncDriverStats(nik);

        // 4. Aktifkan Mesin Pendukung lainnya
        if (typeof DriverGatekeeper !== 'undefined') DriverGatekeeper.init();
        if (typeof DriverMarket !== 'undefined') DriverMarket.init();
        if (typeof DriverSharding !== 'undefined') DriverSharding.init();

        console.log("Core Engine: Siap digunakan.");
    },

    // Sinkronisasi Saldo dan Rating langsung dari Firebase
    syncDriverStats(nik) {
        // Listener Saldo
        db.ref(`drivers/${nik}/saldo`).on('value', (snapshot) => {
            const saldo = snapshot.val() || 0;
            const saldoEl = document.getElementById('display-saldo');
            if (saldoEl) {
                saldoEl.innerText = `Rp ${saldo.toLocaleString('id-ID')}`;
            }
        });

        // Listener Rating
        db.ref(`drivers/${nik}/rating`).on('value', (snapshot) => {
            const rating = snapshot.val() || 5.0;
            const ratingEl = document.getElementById('display-rating');
            if (ratingEl) {
                ratingEl.innerText = rating.toFixed(1);
            }
        });
    },

    // Fungsi untuk tombol Navigasi Bawah
    showPage(pageId) {
        console.log("Berpindah ke halaman: " + pageId);
        
        // 1. Atur visual tombol aktif
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Cari tombol yang diklik (berdasarkan fungsi yang dipanggil)
        // Catatan: Di index.html, pastikan class 'active' diberikan pada element yang benar
        
        // 2. Logika perpindahan konten
        if (pageId === 'market') {
            document.getElementById('app-content').style.display = 'block';
        } else {
            // Tampilkan pesan untuk fitur yang belum dibuat
            alert("Halaman " + pageId + " sedang disiapkan.");
        }
    }
};

// Pastikan mesin berjalan setelah seluruh halaman dan Firebase siap
window.onload = () => {
    if (typeof db !== 'undefined') {
        DriverCore.init();
    } else {
        console.error("Firebase Database (db) belum terdeteksi. Periksa urutan script!");
    }
};
