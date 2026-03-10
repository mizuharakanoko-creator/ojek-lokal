// MODUL 16: CORE ENGINE (OTAK UTAMA)
const DriverCore = {
    init() {
        console.log("Core Engine Memulai...");
        
        // 1. Ambil data dari localStorage
        const name = localStorage.getItem('driver_nama') || "Driver";
        
        // 2. Update Tampilan Profil di Header
        document.getElementById('display-name').innerText = name;
        
        // 3. Ambil data Realtime (Saldo, Rating)
        this.loadDriverRealtimeStats();
        
        // 4. Inisialisasi Bursa Order (Langsung Tampil)
        DriverMarket.init();
        
        console.log("Core Engine Siap.");
    },

    loadDriverRealtimeStats() {
        const nik = localStorage.getItem('driver_nik');
        if(!nik) return;
        
        // Ambil data Saldo
        db.ref(`drivers/${nik}/saldo`).on('value', (snapshot) => {
            const saldo = snapshot.val() || 0;
            document.getElementById('display-saldo').innerText = `Rp ${saldo.toLocaleString('id-ID')}`;
        });
        
        // Ambil data Rating
        db.ref(`drivers/${nik}/rating`).on('value', (snapshot) => {
            const rating = snapshot.val() || 5.0;
            document.getElementById('display-rating').innerText = rating.toFixed(1);
        });
    },

    // FUNGSI UNTUK TOMBOL NAVIGASI BAWAH
    showPage(pageName) {
        console.log("Membuka halaman: " + pageName);
        
        // Update status tombol aktif di CSS
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        // (Logika CSS tambahan untuk nav-item yang diklik harus dibuat)

        // Logika untuk menampilkan/menyembunyikan konten utama
        if (pageName === 'market') {
            document.getElementById('market-list').style.display = 'block';
            // Sembunyikan div Wallet/Profil lainnya
        } else {
            alert("Fitur " + pageName + " sedang dalam pengembangan.");
        }
    }
};

// JALANKAN CORE SAAT APLIKASI DIbuka
window.onload = function() {
    DriverCore.init();
};
