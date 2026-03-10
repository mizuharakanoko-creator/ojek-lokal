// ==========================================
// 1. DATA & STATE
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval, activeTripId;
let currentTripData = null; 
let jumlahPesanLamaDriver = 0;

// Data kepuasan (Nanti bisa dikembangkan untuk tarik dari Firebase)
let driverRatings = { puas: 0, biasa: 0, kecewa: 0 };

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

// ==========================================
// 2. FUNGSI INTI (DASHBOARD & REGISTRASI)
// ==========================================

function loadDashboard() {
    tampilkanScreen('screen-dashboard');
    
    // Update Identitas
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    document.getElementById('disp-moto').innerText = `"${myDriver.moto || 'Melayani Sepenuh Hati'}"`;
    
    // Update Statistik Angka
    document.getElementById('stat-income').innerText = `Rp ${(myDriver.incomeToday || 0).toLocaleString()}`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;
    
    // Update Tampilan Kepuasan
    updateVisualKepuasan();
}

function updateVisualKepuasan() {
    const area = document.getElementById('area-kepuasan');
    if(area) {
        area.innerHTML = `
            <div class="stat-mini">😊 <br> <b>${driverRatings.puas}</b> <br> Puas</div>
            <div class="stat-mini">😐 <br> <b>${driverRatings.biasa}</b> <br> Biasa</div>
            <div class="stat-mini">😞 <br> <b>${driverRatings.kecewa}</b> <br> Kurang</div>
        `;
    }
}

function prosesDaftar() {
    const nama = document.getElementById('reg-nama').value;
    const plat = document.getElementById('reg-plat').value;
    const motor = document.getElementById('reg-motor').value;

    if (!nama || !plat || !motor) return alert("Mohon lengkapi semua data pendaftaran!");

    myDriver = {
        nik: "DRV-" + Math.floor(Math.random() * 100000),
        nama: nama, plat: plat, motor: motor,
        moto: "Melayani dengan Sepenuh Hati",
        rating: "5.0",
        incomeToday: 0, orderCount: 0,
        incomeM1: 0, incomeM2: 0
    };

    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    alert("Pendaftaran Berhasil!");
    loadDashboard();
}

// ==========================================
// 3. LOGIKA ORDERAN & ONLINE
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
    if (!orders) return;

    let html = "";
    for (const id in orders) {
        const o = orders[id];
        if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
            mulaiTripLayar(id, o);
            return;
        }
        if (o.status === "mencari_driver") {
            html += `
            <div class="card order-card" style="border-left: 5px solid #10b981;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <small style="color:#059669; font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:bold;">${o.tujuan}</div>
                        <div style="color:#10b981; font-weight:800;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <button class="btn-confirm" onclick="ambilOrder('${id}')" style="width:auto; padding:8px 15px;">AMBIL</button>
                </div>
            </div>`;
        }
    }
    document.getElementById('list-order-masuk').innerHTML = html || '<p class="text-center text-muted">Mencari orderan...</p>';
}

async function ambilOrder(id) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik
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
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + (data.upah).toLocaleString();
    
    // Timer 15 Menit (Simulasi waktu tempuh)
    jalankanTimerSelesai(30, (waktu) => {
        document.getElementById('timer-text').innerText = waktu;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false;
        btn.style.opacity = "1";
    });
}

function bukaGoogleMaps() {
    if (!currentTripData || !currentTripData.jemput_lat) return alert("Lokasi jemput tidak ditemukan!");
    const url = `https://www.google.com/maps/dir/?api=1&destination=${currentTripData.jemput_lat},${currentTripData.jemput_lon}&travelmode=motorcycle`;
    window.open(url, '_blank');
}

// ==========================================
// 5. CHAT & SELESAI (PENTING!)
// ==========================================

async function driverKlikSelesai() {
    const untung = currentTripData.upah;
    
    // 1. Update Data Lokal
    myDriver.incomeToday = (myDriver.incomeToday || 0) + untung;
    myDriver.orderCount = (myDriver.orderCount || 0) + 1;

    // 2. Simpan Permanen
    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));

    // 3. Update Database Firebase
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert(`Order Selesai! Rp ${untung.toLocaleString()} masuk ke kantong.`);
    
    // 4. Reset & Kembali
    activeTripId = null;
    loadDashboard();
}

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
    if(!inp.value) return;
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

async function driverBatalkanPesanan() {
    if (!confirm("Yakin ingin membatalkan?")) return;
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, { method: 'DELETE' });
    location.reload();
            }
