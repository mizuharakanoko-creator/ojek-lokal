// ==========================================
// 1. DATA & STATE (Sistem Registrasi)
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval, activeTripId;
let currentTripData = null; // Menyimpan info jemputan user
let jumlahPesanLamaDriver = 0;

// Cek Registrasi Saat Load
document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('ojek_kuningan_driver');
    if (savedProfile) {
        myDriver = JSON.parse(savedProfile);
        loadDashboard();
    } else {
        tampilkanScreen('screen-register');
    }
});

/**
 * PROSES PENDAFTARAN DRIVER
 */
function prosesDaftar() {
    const nama = document.getElementById('reg-nama').value;
    const plat = document.getElementById('reg-plat').value;
    const motor = document.getElementById('reg-motor').value;

    if (!nama || !plat || !motor) return alert("Mohon lengkapi semua data pendaftaran!");

    myDriver = {
        nik: "DRV-" + Math.floor(Math.random() * 100000), // Generate ID Unik
        nama: nama,
        plat: plat,
        motor: motor,
        moto: "Melayani dengan Sepenuh Hati",
        rating: "5.0",
        incomeToday: 0,
        incomeM1: 0,
        incomeM2: 0
    };

    // Simpan di HP Driver agar tidak hilang saat reload
    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    alert("Pendaftaran Berhasil! Selamat bergabung.");
    loadDashboard();
}

function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    document.getElementById('disp-moto').innerText = `"${myDriver.moto}"`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating}`;
}

// ==========================================
// 2. LOGIKA ONLINE & PANTAU ORDER
// ==========================================

function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const txt = document.getElementById('text-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; btn.style.color = "#ef4444";
        txt.innerText = "ONLINE (Siap Mencari Order)";
        txt.style.color = "#10b981";
        
        // Pemicu Suara (Browser butuh interaksi user)
        bunyiKlakson();
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; btn.style.color = "#059669";
        txt.innerText = "OFFLINE";
        txt.style.color = "#ef4444";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p class="text-center text-muted">Aktifkan status online...</p>';
    }
}

async function pantauOrderanBaru() {
    const res = await fetch(`${DB_URL}/orders.json`);
    const orders = await res.json();
    const listArea = document.getElementById('list-order-masuk');
    
    if (!orders) {
        listArea.innerHTML = '<p class="text-center text-muted">Belum ada orderan masuk...</p>';
        return;
    }

    let html = "";
    for (const id in orders) {
        const o = orders[id];
        
        // Cek jika ada orderan yang sebelumnya sudah saya ambil (Session Recovery)
        if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
            mulaiTripLayar(id, o);
            return;
        }

        if (o.status === "mencari_driver") {
            html += `
            <div class="card order-card" style="margin-bottom:12px; border-left: 5px solid #10b981;">
                <div style="display:flex; justify-content:space-between;">
                    <div>
                        <small style="color:#059669; font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:bold; font-size:15px;">${o.tujuan}</div>
                        <div style="color:#10b981; font-weight:800; margin-top:5px;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-confirm" onclick="ambilOrder('${id}')" style="padding:8px 15px; font-size:12px;">AMBIL</button>
                    </div>
                </div>
            </div>`;
        }
    }
    listArea.innerHTML = html || '<p class="text-center text-muted">Belum ada orderan baru...</p>';
}

// ==========================================
// 3. LOGIKA TRIP & NAVIGASI MAPS
// ==========================================

async function ambilOrder(id) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik,
            upah_final: 0 
        })
    });
}

function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data; // Simpan koordinat jemputan
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    document.getElementById('trip-destinasi').innerText = data.tujuan;
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + (data.upah_final || data.upah).toLocaleString();
    
    // Timer Selesai Aktif Otomatis (900 detik = 15 menit)
    jalankanTimerSelesai(30, (waktu) => {
        document.getElementById('timer-text').innerText = waktu;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false; btn.style.background = "#10b981";
    });

    // Pantau Chat & Pembatalan User
    const tripMonitor = setInterval(async () => {
        if(!activeTripId) return clearInterval(tripMonitor);
        const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
        const d = await res.json();
        if(!d) {
            alert("Orderan telah dibatalkan oleh pelanggan.");
            location.reload();
        } else if(d.chat) {
            updateChatDriver(d.chat);
        }
    }, 4000);
}

/**
 * FITUR UTAMA: BUKA GOOGLE MAPS
 */
function bukaGoogleMaps() {
    if (!currentTripData) return;
    const lat = currentTripData.jemput_lat;
    const lon = currentTripData.jemput_lon;
    
    // Membuka navigasi langsung ke titik jemput user
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=motorcycle`;
    window.open(url, '_blank');
}

// ==========================================
// 4. CHAT & FINISH
// ==========================================

function updateChatDriver(chatData) {
    const jmlChat = Object.keys(chatData).length;
    if (jmlChat > jumlahPesanLamaDriver) {
        const pesanTerakhir = Object.values(chatData).pop();
        if (pesanTerakhir.sender === 'user') bunyiKlakson();
        renderChatUI(chatData);
    }
    jumlahPesanLamaDriver = jmlChat;
}

function renderChatUI(chatData) {
    const box = document.getElementById('chat-messages');
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        h += `<div class="msg ${c.sender === 'driver' ? 'msg-u' : 'msg-d'}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

function driverKirimChat() {
    const inp = document.getElementById('input-pesan-driver');
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

async function driverKlikSelesai() {
    const untung = currentTripData.upah_final || currentTripData.upah;
    myDriver.incomeToday += untung;
    
    // Update profil lokal agar pendapatan bertambah
    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));

    // Kirim sinyal selesai ke user
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert("Pesanan Selesai! Pendapatan harian Anda diperbarui.");
    location.reload();
}

async function driverBatalkanPesanan() {
    if (!confirm("Batal? Data performa Anda akan menurun.")) return;
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, { method: 'DELETE' });
    location.reload();
}
