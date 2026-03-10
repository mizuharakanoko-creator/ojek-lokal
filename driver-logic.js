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
// 2. REGISTRASI & DASHBOARD (FITUR LAMA UTUH)
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
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    const income = parseInt(myDriver.incomeToday) || 0;
    const count = parseInt(myDriver.orderCount) || 0;
    
    document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    document.getElementById('total-order-badge').innerText = `${count} Order`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;

    // Dropdown Performa
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";

    renderRiwayatLokal();
}

// ==========================================
// 3. MONITOR & BIDDING (SINKRON DENGAN USER)
// ==========================================
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; btn.style.color = "#ef4444";
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; btn.style.color = "#10b981";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Anda sedang Offline</p>';
    }
}

async function pantauOrderanBaru() {
    try {
        const res = await fetch(`${DB_URL}/orders.json`);
        const orders = await res.json();
        const listArea = document.getElementById('list-order-masuk');
        
        if (!orders) return listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Belum ada orderan...</p>';

        let html = "";
        for (const id in orders) {
            const o = orders[id];
            
            // A. Jika User sudah memilih saya (Match!)
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiTripLayar(id, o);
                return;
            }

            // B. Tampilkan Orderan yang tersedia
            if (o.status === "mencari_driver") {
                const sudahTawar = o.bids && o.bids[myDriver.nik];
                html += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1">
                        <small style="color:var(--primary); font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:800; font-size:14px;">${o.tujuan}</div>
                        <div style="color:var(--primary); font-weight:800; font-size:16px;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right">
                        <button class="btn-confirm" onclick="ambilOrder('${id}', ${o.upah})" style="padding:8px 15px; margin-bottom:5px;">AMBIL</button>
                        ${sudahTawar 
                            ? `<br><small style="color:var(--accent); font-weight:bold;">Menunggu User...</small>`
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

    // Masukkan ke path 'bids' agar sinkron dengan user-logic.js
    await fetch(`${DB_URL}/orders/${orderId}/bids/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama_driver: myDriver.nama,
            harga_tawar: parseInt(tawar),
            rating: myDriver.rating,
            nik: myDriver.nik
        })
    });
    alert("Tawaran terkirim! Silahkan tunggu User memilih.");
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
// 4. TRIP & FINISH LOGIC (LAMA & FAIL-SAFE)
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    // Set Info Trip
    document.getElementById('info-tujuan-trip').innerText = `Tujuan: ${data.tujuan}`;
    const navBtn = document.getElementById('link-navigasi');
    navBtn.onclick = () => {
        window.open(`https://www.google.com/maps?q=${data.jemput_lat},${data.jemput_lon}`, '_blank');
    };
}

async function driverKlikSelesai() {
    if (!confirm("Konfirmasi Selesai?")) return;

    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);
    const jamSelesai = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver'));
        savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
        savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;

        localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
        myDriver = savedData;

        // Simpan Riwayat
        let riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
        riwayat.push({ tujuan: currentTripData.tujuan, nominal: untung, jam: jamSelesai });
        localStorage.setItem('riwayat_ojek_driver', JSON.stringify(riwayat));

        await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status_driver: "selesai" })
        });

        alert(`Selesai! +Rp ${untung.toLocaleString()} masuk saldo.`);
        activeTripId = null;
        currentTripData = null;
        loadDashboard(); 

    } catch (e) { alert("Gagal update saldo!"); }
}

function renderRiwayatLokal() {
    const container = document.getElementById('list-order-masuk'); 
    // Jika sedang di dashboard, riwayat bisa tampil di bawah list order atau di tempat lain
}

function tampilkanScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-screen');
    });
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        target.classList.add('active-screen');
    }
            }
    
