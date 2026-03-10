// ==========================================
// 1. INITIALIZATION & LOCK CHECK
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('ojek_kuningan_driver');
    if (savedProfile) {
        myDriver = JSON.parse(savedProfile);
        loadDashboard();
        sinkronStatusLock(); // Cek status iuran ke server
    } else {
        tampilkanScreen('screen-register');
    }
});

async function sinkronStatusLock() {
    if (!myDriver) return;
    try {
        const res = await fetch(`${DB_URL}/drivers/${myDriver.nik}.json`);
        const data = await res.json();
        
        // Jika di Firebase di-set locked oleh admin
        if (data && data.is_locked === true) {
            document.getElementById('lock-overlay').style.display = 'flex';
        } else {
            document.getElementById('lock-overlay').style.display = 'none';
        }
    } catch (e) { console.warn("Mode offline: Gagal cek status lock."); }
}

// ==========================================
// 2. REGISTRASI (TAMBAH DATA ATTITUDE)
// ==========================================
async function prosesDaftar() {
    const nama = document.getElementById('reg-nama')?.value;
    const plat = document.getElementById('reg-plat')?.value;
    const motor = document.getElementById('reg-motor')?.value;

    if (!nama || !plat || !motor) return alert("Lengkapi data!");

    myDriver = {
        nik: "DRV-" + Math.floor(Math.random() * 100000),
        nama: nama, plat: plat, motor: motor,
        rating: "5.0", incomeToday: 0, orderCount: 0,
        speed: "100%", accuracy: "100%", attitude: "100%", // Tambah Attitude
        rank: "#" + (Math.floor(Math.random() * 50) + 1),
        is_locked: false
    };

    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    
    // Kirim ke Firebase agar admin bisa pantau & lock jika perlu
    await fetch(`${DB_URL}/drivers/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify(myDriver)
    });

    loadDashboard();
}

// ==========================================
// 3. RENDER DASHBOARD (SYNC DENGAN DROPDOWN)
// ==========================================
function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    const income = parseInt(myDriver.incomeToday) || 0;
    document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    document.getElementById('total-order-badge').innerText = `${myDriver.orderCount || 0} Order`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;

    // Update Statistik di dalam Dropdown
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-attitude').innerText = myDriver.attitude || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";
}

// ==========================================
// 4. LOGIKA ONLINE (SYNC CSS CLASS)
// ==========================================
function toggleOnline() {
    // Jika sedang terkunci, jangan boleh online
    if (document.getElementById('lock-overlay').style.display === 'flex') {
        return alert("Akses terkunci! Silahkan selesaikan iuran.");
    }

    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; 
        btn.style.color = "#ef4444";
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Mencari orderan...</p>';
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; 
        btn.style.color = "#10b981";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Anda sedang Offline</p>';
    }
}
