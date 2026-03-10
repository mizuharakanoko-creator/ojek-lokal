// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval, activeTripId;
let currentTripData = null; 
let jumlahPesanLamaDriver = 0;

// Ambil data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('ojek_kuningan_driver');
    if (savedProfile) {
        myDriver = JSON.parse(savedProfile);
        loadDashboard();
    } else {
        tampilkanScreen('screen-register');
    }
});

// ==========================================
// 2. REGISTRASI & DASHBOARD
// ==========================================
function prosesDaftar() {
    const nama = document.getElementById('reg-nama').value;
    const plat = document.getElementById('reg-plat').value;
    const motor = document.getElementById('reg-motor').value;

    if (!nama || !plat || !motor) return alert("Lengkapi data!");

    myDriver = {
        nik: "DRV-" + Math.floor(Math.random() * 100000),
        nama: nama, plat: plat, motor: motor,
        rating: "5.0", incomeToday: 0, orderCount: 0,
        speed: "100%", accuracy: "100%", attitude: "100%",
        rank: "#" + (Math.floor(Math.random() * 50) + 1)
    };

    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    loadDashboard();
}

function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    
    // Sinkronisasi data terbaru dari Storage
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    // Update UI Identitas
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    // Update UI Saldo & Statistik (Anti-Gagal)
    const income = parseInt(myDriver.incomeToday) || 0;
    const count = parseInt(myDriver.orderCount) || 0;
    
    document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    document.getElementById('total-order-badge').innerText = `${count} Order`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;

    // Update Dropdown Performa
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";

    renderRiwayatLokal();
}

// ==========================================
// 3. FITUR TAWAR & MONITOR ORDERAN
// ==========================================
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; btn.style.color = "#ef4444";
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
        alert("Status: ONLINE. Mencari orderan...");
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; btn.style.color = "#10b981";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5;">Anda sedang Offline</p>';
    }
}

async function pantauOrderanBaru() {
    try {
        const res = await fetch(`${DB_URL}/orders.json`);
        const orders = await res.json();
        const listArea = document.getElementById('list-order-masuk');
        
        if (!orders) return listArea.innerHTML = '<p style="text-align:center; opacity:0.5;">Belum ada orderan...</p>';

        let html = "";
        for (const id in orders) {
            const o = orders[id];
            
            // Jika orderan ini sudah dikonfirmasi User untuk saya
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiTripLayar(id, o);
                return;
            }

            // Jika status masih mencari driver
            if (o.status === "mencari_driver") {
                const sudahTawar = o.tawaran && o.tawaran[myDriver.nik];
                html += `
                <div class="card order-card">
                    <div style="flex:1">
                        <small style="color:var(--primary); font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:800;">${o.tujuan}</div>
                        <div style="color:var(--primary); font-weight:bold;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right">
                        <button class="btn-confirm" onclick="ambilOrder('${id}')">AMBIL</button>
                        <br>
                        ${sudahTawar 
                            ? `<small style="color:var(--warning); font-weight:bold;">Menunggu...</small>`
                            : `<button class="btn-tawar" onclick="tawarHarga('${id}', ${o.upah})">TAWAR</button>`
                        }
                    </div>
                </div>`;
            }
        }
        listArea.innerHTML = html || '<p style="text-align:center; opacity:0.5;">Mencari orderan...</p>';
    } catch (e) { console.error("Koneksi Error", e); }
}

async function tawarHarga(orderId, hargaAsli) {
    const tawar = prompt(`Masukkan harga tawaran (Harga asli: ${hargaAsli})`, hargaAsli + 2000);
    if (!tawar || isNaN(tawar)) return;

    // PATH PENTING: Harus masuk ke sub-folder 'tawaran' agar User bisa looping data driver
    await fetch(`${DB_URL}/orders/${orderId}/tawaran/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama: myDriver.nama,
            plat: myDriver.plat,
            motor: myDriver.motor,
            harga: parseInt(tawar),
            rating: myDriver.rating,
            nik: myDriver.nik
        })
    });
    alert("Tawaran terkirim ke User!");
}

async function ambilOrder(id) {
    // Langsung ambil tanpa tawar (Harga Normal)
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik,
            upah_final: currentTripData ? currentTripData.upah : 0 // Default ke upah awal
        })
    });
}

// ==========================================
// 4. LOGIKA SELESAI & UPDATE SALDO (FAIL-SAFE)
// ==========================================
async function driverKlikSelesai() {
    if (!confirm("Konfirmasi Selesai?")) return;

    // Gunakan upah_final (hasil tawar) jika ada, jika tidak pakai upah asli
    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);
    const jamSelesai = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        // 1. Ambil data mentah dari LocalStorage untuk menghindari data 'basi'
        let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver'));
        
        // 2. Kalkulasi Angka (Pastikan tidak jadi string)
        savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
        savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;

        // 3. Simpan Permanen ke HP
        localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
        myDriver = savedData;

        // 4. Catat Riwayat
        let riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
        riwayat.push({ tujuan: currentTripData.tujuan, nominal: untung, jam: jamSelesai });
        localStorage.setItem('riwayat_ojek_driver', JSON.stringify(riwayat));

        // 5. Update Firebase
        await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status_driver: "selesai" })
        });

        alert(`Selesai! +Rp ${untung.toLocaleString()} berhasil masuk.`);
        
        // 6. Reset State & Refresh UI
        activeTripId = null;
        currentTripData = null;
        loadDashboard(); // Memperbarui tampilan saldo & riwayat seketika

    } catch (e) {
        alert("Gagal update saldo, cek internet!");
    }
}

function renderRiwayatLokal() {
    const container = document.getElementById('list-riwayat-hari-ini');
    if (!container) return;
    const riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
    
    if (riwayat.length === 0) {
        container.innerHTML = '<p style="text-align:center; font-size:11px; opacity:0.5;">Belum ada riwayat.</p>';
        return;
    }

    let html = "";
    riwayat.slice().reverse().forEach(item => {
        html += `
            <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
                <div><div style="font-weight:bold; font-size:12px;">${item.tujuan}</div><small>${item.jam}</small></div>
                <div style="color:var(--primary); font-weight:bold;">+${item.nominal.toLocaleString()}</div>
            </div>`;
    });
    container.innerHTML = html;
}

// Fungsi pembantu layar
function tampilkanScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
    
