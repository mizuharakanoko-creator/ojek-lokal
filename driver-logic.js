// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval, activeTripId;
let currentTripData = null; 
let jumlahPesanLamaDriver = 0;

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
// 2. DASHBOARD & REGISTRASI (KEMBALI KE ASLI)
// ==========================================
function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    const income = parseInt(myDriver.incomeToday) || 0;
    const count = parseInt(myDriver.orderCount) || 0;
    
    document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    document.getElementById('total-order-badge').innerText = `${count} Order`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;

    // Update Dropdown Performa
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";
}

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
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Anda sedang Offline</p>';
    }
}

// ==========================================
// 3. LOGIKA MONITOR & TAWAR (SINKRON)
// ==========================================
async function pantauOrderanBaru() {
    try {
        const res = await fetch(`${DB_URL}/orders.json`);
        const orders = await res.json();
        const listArea = document.getElementById('list-order-masuk');
        
        if (!orders) {
            listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Belum ada orderan...</p>';
            return;
        }

        let html = "";
        for (const id in orders) {
            const o = orders[id];
            
            // FIX: Jika orderan ini sudah dikonfirmasi User untuk saya (PINDAH KE LAYAR TRIP)
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiTripLayar(id, o);
                return;
            }

            if (o.status === "mencari_driver") {
                const sudahTawar = o.bids && o.bids[myDriver.nik];
                html += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="flex:1">
                        <small style="color:var(--primary); font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:800; font-size:14px;">${o.tujuan}</div>
                        <div style="color:var(--primary); font-weight:800; font-size:16px;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right">
                        <button class="btn-confirm" onclick="ambilOrder('${id}', ${o.upah})" style="padding:8px 15px; margin-bottom:5px;">AMBIL</button>
                        ${sudahTawar 
                            ? `<br><small style="color:#f59e0b; font-weight:bold;">Menunggu...</small>`
                            : `<br><button class="btn-tawar" onclick="tawarHarga('${id}', ${o.upah})">TAWAR</button>`
                        }
                    </div>
                </div>`;
            }
        }
        listArea.innerHTML = html || '<p style="text-align:center; opacity:0.5; margin-top:20px;">Mencari orderan...</p>';
    } catch (e) { console.error("Koneksi Error", e); }
}

async function tawarHarga(orderId, hargaAsli) {
    const tawar = prompt(`Masukkan harga tawaran (Harga asli: ${hargaAsli})`, hargaAsli + 2000);
    if (!tawar || isNaN(tawar)) return;

    await fetch(`${DB_URL}/orders/${orderId}/bids/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama_driver: myDriver.nama,
            harga_tawar: parseInt(tawar),
            nik: myDriver.nik
        })
    });
    alert("Tawaran terkirim!");
}

async function ambilOrder(id, harga) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik,
            upah_final: harga 
        })
    });
}

// ==========================================
// 4. LAYAR TRIP & SELESAI (KEMBALI KE ASLI)
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data;
    clearInterval(monitorInterval);
    
    // Tampilkan Screen Trip
    tampilkanScreen('screen-trip-driver');
    
    // Isi Detail Info di Layar Trip
    const infoUser = document.getElementById('info-user-trip');
    if(infoUser) {
        infoUser.innerHTML = `
            <div style="padding:10px; background:#f8fafc; border-radius:10px; margin-bottom:15px;">
                <small>PENUMPANG:</small><br>
                <b>Pelanggan Ojek Kuningan</b><br>
                <small>ONGKOS: <b>Rp ${(data.upah_final || data.upah).toLocaleString()}</b></small>
            </div>
        `;
    }
    
    const infoTujuan = document.getElementById('info-tujuan-trip');
    if(infoTujuan) infoTujuan.innerText = `Tujuan: ${data.tujuan}`;

    const navBtn = document.getElementById('link-navigasi');
    if(navBtn) {
        navBtn.onclick = () => {
            window.open(`https://www.google.com/maps?q=${data.jemput_lat},${data.jemput_lon}`, '_blank');
        };
    }
}

async function driverKlikSelesai() {
    if (!confirm("Konfirmasi Selesai?")) return;

    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);

    try {
        // Update Local Storage (Fail-safe asli)
        let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver'));
        savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
        savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;

        localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
        myDriver = savedData;

        // Update Firebase status
        await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status_driver: "selesai" })
        });

        alert(`Alhamdulillah! +Rp ${untung.toLocaleString()} masuk saldo.`);
        
        // Reset State dan Kembali ke Dashboard
        activeTripId = null;
        currentTripData = null;
        loadDashboard(); 

    } catch (e) {
        alert("Gagal update saldo, cek koneksi!");
    }
}

// ==========================================
// 5. HELPER: TAMPILAN SCREEN
// ==========================================
function tampilkanScreen(id) {
    // Sembunyikan semua div yang punya class screen atau active-screen
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-screen');
        s.classList.add('screen');
    });
    
    // Tampilkan yang dituju
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        target.classList.remove('screen');
        target.classList.add('active-screen');
    }
}
    
