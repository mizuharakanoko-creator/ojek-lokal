// ==========================================
// 1. DATA & STATE (Sistem Registrasi)
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval, activeTripId;
let currentTripData = null; 
let jumlahPesanLamaDriver = 0;
let driverRatings = { puas: 0, biasa: 0, kecewa: 0 };

// Cek Registrasi & Load Data Saat Aplikasi Dibuka
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('ojek_kuningan_driver');
    if (savedProfile) {
        myDriver = JSON.parse(savedProfile);
        loadDashboard();
    } else {
        tampilkanScreen('screen-register');
    }
});

function prosesDaftar() {
    const nama = document.getElementById('reg-nama').value;
    const plat = document.getElementById('reg-plat').value;
    const motor = document.getElementById('reg-motor').value;

    if (!nama || !plat || !motor) return alert("Mohon lengkapi semua data pendaftaran!");

    myDriver = {
        nik: "DRV-" + Math.floor(Math.random() * 100000),
        nama: nama, plat: plat, motor: motor,
        moto: "Melayani dengan Sepenuh Hati",
        rating: "5.0", incomeToday: 0, orderCount: 0,
        speed: "100%", accuracy: "100%", attitude: "100%",
        rank: "#" + (Math.floor(Math.random() * 50) + 1)
    };

    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    alert("Pendaftaran Berhasil! Selamat bergabung.");
    loadDashboard();
}

// ==========================================
// 2. FUNGSI DASHBOARD (TAMPILAN UTAMA)
// ==========================================
function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    
    // Pastikan data terbaru dari storage yang dipakai
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    // Update Identitas & Stat Angka
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    // Update Angka Pendapatan & Order (ID harus sesuai dengan HTML)
    const income = parseInt(myDriver.incomeToday) || 0;
    const count = parseInt(myDriver.orderCount) || 0;
    
    if(document.getElementById('stat-income')) {
        document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    }
    if(document.getElementById('total-order-badge')) {
        document.getElementById('total-order-badge').innerText = `${count} Order`;
    }

    updateVisualKepuasan();
    renderRiwayatLokal();
}

function updateVisualKepuasan() {
    // Isi Dropdown Kepuasan
    if(document.getElementById('stat-puas')) {
        document.getElementById('stat-puas').innerText = driverRatings.puas || 0;
        document.getElementById('stat-biasa').innerText = driverRatings.biasa || 0;
        document.getElementById('stat-kurang').innerText = driverRatings.kecewa || 0;
    }
    // Isi Dropdown Performa
    if(document.getElementById('stat-speed')) {
        document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
        document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
        document.getElementById('stat-attitude').innerText = myDriver.attitude || "100%";
        document.getElementById('stat-rank').innerText = myDriver.rank || "#--";
    }
}

// ==========================================
// 3. LOGIKA ONLINE & PANTAU ORDERAN (TAWAR)
// ==========================================
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const txt = document.getElementById('text-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; btn.style.color = "#ef4444";
        txt.innerText = "ONLINE"; txt.style.color = "#10b981";
        bunyiKlakson();
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; btn.style.color = "#059669";
        txt.innerText = "OFFLINE"; txt.style.color = "#ef4444";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p class="text-center text-muted">Aktifkan status online...</p>';
    }
}

async function pantauOrderanBaru() {
    const res = await fetch(`${DB_URL}/orders.json`);
    const orders = await res.json();
    const listArea = document.getElementById('list-order-masuk');
    if (!orders) return listArea.innerHTML = '<p class="text-center text-muted">Belum ada orderan...</p>';

    let html = "";
    for (const id in orders) {
        const o = orders[id];
        if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
            mulaiTripLayar(id, o);
            return;
        }
        if (o.status === "mencari_driver") {
            const sudahTawar = o.tawaran && o.tawaran[myDriver.nik];
            html += `
            <div class="card order-card" style="border-left: 5px solid #10b981; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <small style="color:#64748b;">TUJUAN:</small>
                        <div style="font-weight:bold; font-size:14px;">${o.tujuan}</div>
                        <div style="color:#10b981; font-weight:800;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <button class="btn-confirm" onclick="ambilOrder('${id}')" style="width:auto; padding:8px 15px; font-size:11px;">AMBIL</button>
                        ${sudahTawar 
                            ? `<small style="color:#f59e0b; font-weight:bold; text-align:center;">Ditawar...</small>`
                            : `<button onclick="tawarHarga('${id}', ${o.upah})" style="padding:6px 12px; font-size:11px; background:#fff7ed; color:#c2410c; border:1px solid #fdba74; border-radius:8px;">TAWAR</button>`
                        }
                    </div>
                </div>
            </div>`;
        }
    }
    listArea.innerHTML = html || '<p class="text-center text-muted">Mencari orderan...</p>';
}

async function tawarHarga(orderId, hargaAsli) {
    const tawar = prompt(`Harga asli Rp ${hargaAsli.toLocaleString()}. Masukkan harga tawaran Anda:`, hargaAsli + 2000);
    if (!tawar || isNaN(tawar)) return;

    await fetch(`${DB_URL}/orders/${orderId}/tawaran/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama: myDriver.nama, plat: myDriver.plat,
            harga: parseInt(tawar), rating: myDriver.rating
        })
    });
    alert("Tawaran terkirim!");
}

async function ambilOrder(id) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil", driver_pilihan: myDriver.nama, driver_nik: myDriver.nik
        })
    });
}

// ==========================================
// 4. LOGIKA TRIP & NAVIGASI
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    document.getElementById('trip-destinasi').innerText = data.tujuan;
    const hargaTampil = data.upah_final || data.upah;
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + hargaTampil.toLocaleString();
    
    jalankanTimerSelesai(30, (waktu) => {
        document.getElementById('timer-text').innerText = waktu;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false; btn.style.opacity = "1";
    });

    const tripMonitor = setInterval(async () => {
        if(!activeTripId) return clearInterval(tripMonitor);
        const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
        const d = await res.json();
        if(!d) {
            alert("Orderan dibatalkan."); location.reload();
        } else {
            if(d.chat) updateChatDriver(d.chat);
            currentTripData = d; 
        }
    }, 4000);
}

// ==========================================
// 5. LOGIKA SELESAI & RIWAYAT (FIX SALDO)
// ==========================================
async function driverKlikSelesai() {
    if (!confirm("Selesaikan pesanan?")) return;

    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);
    const tujuanTrip = currentTripData.tujuan;
    const jamSelesai = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update Profil Lokal
    let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver'));
    savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
    savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;
    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
    myDriver = savedData;

    // 2. Catat Riwayat
    let riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
    riwayat.push({ tujuan: tujuanTrip, nominal: untung, jam: jamSelesai });
    localStorage.setItem('riwayat_ojek_driver', JSON.stringify(riwayat));

    // 3. Update Firebase
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert(`Berhasil! Pendapatan masuk Rp ${untung.toLocaleString()}`);
    activeTripId = null;
    currentTripData = null;
    loadDashboard(); // Render ulang tampilan
}

function renderRiwayatLokal() {
    const container = document.getElementById('list-riwayat-hari-ini');
    if (!container) return;
    const riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
    if (riwayat.length === 0) {
        container.innerHTML = '<p class="text-center text-muted" style="font-size:11px; padding:10px;">Belum ada pesanan selesai.</p>';
        return;
    }
    let html = "";
    riwayat.slice().reverse().forEach(item => {
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
                <div style="flex:1;">
                    <div style="font-size:12px; font-weight:bold;">${item.tujuan}</div>
                    <small style="font-size:10px; color:#64748b;">${item.jam}</small>
                </div>
                <div style="color:#059669; font-weight:bold; font-size:12px;">+Rp ${item.nominal.toLocaleString()}</div>
            </div>`;
    });
    container.innerHTML = html;
}

// Fitur Lain (Chat & Batal) tetap sama seperti sebelumnya...
