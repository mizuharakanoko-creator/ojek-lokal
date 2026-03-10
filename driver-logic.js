// ==========================================
// 1. DATA IDENTITAS & STATE DRIVER
// ==========================================
const myDriver = {
    nik: "DRV-10029", 
    nama: "Asep Sunandar",
    plat: "E 1234 YX",
    motor: "Yamaha NMAX Silver",
    moto: "Kepuasan Anda, Rejeki Saya",
    foto: "https://via.placeholder.com/100", 
    rating: "4.9",
    incomeM1: 1450000, // Bulan Lalu
    incomeM2: 1200000, // 2 Bulan Lalu
    incomeToday: 0,
    orderCount: 0
};

let isOnline = false;
let monitorInterval, activeTripId;
let jumlahPesanLamaDriver = 0;
let jumlahOrderanLama = 0;

// ==========================================
// 2. INISIALISASI (ON LOAD)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadProfileDriver();
});

function loadProfileDriver() {
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    document.getElementById('disp-moto').innerText = `"${myDriver.moto}"`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating}`;
    document.getElementById('stat-m1').innerText = `Rp ${myDriver.incomeM1.toLocaleString()}`;
    document.getElementById('stat-m2').innerText = `Rp ${myDriver.incomeM2.toLocaleString()}`;
    document.getElementById('stat-income').innerText = `Rp 0`;
    if(myDriver.foto) document.getElementById('driver-img').src = myDriver.foto;
}

// ==========================================
// 3. LOGIKA ONLINE / OFFLINE
// ==========================================
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const txt = document.getElementById('text-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2";
        btn.style.color = "#ef4444";
        txt.innerText = "ONLINE (Mencari Penumpang)";
        txt.style.color = "#10b981";
        // Pemicu Audio Context agar klakson bisa bunyi
        const dummyCtx = new (window.AudioContext || window.webkitAudioContext)();
        dummyCtx.resume();
        
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white";
        btn.style.color = "#059669";
        txt.innerText = "OFFLINE";
        txt.style.color = "#ef4444";
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p class="text-center text-muted" style="font-size: 13px; margin-top: 20px;">Silahkan tekan "Masuk Online" untuk melihat orderan.</p>';
    }
}

// ==========================================
// 4. PANTAU ORDER & NOTIF KLAKSON
// ==========================================
async function pantauOrderanBaru() {
    const res = await fetch(`${DB_URL}/orders.json`);
    const orders = await res.json();
    const listArea = document.getElementById('list-order-masuk');
    
    if (!orders) {
        listArea.innerHTML = '<p class="text-center text-muted">Belum ada orderan baru...</p>';
        jumlahOrderanLama = 0;
        return;
    }

    // Hitung jumlah orderan yang tersedia (status: mencari_driver)
    const orderTersedia = Object.keys(orders).filter(id => orders[id].status === "mencari_driver");
    
    // BUNYI KLAKSON JIKA ADA ORDERAN BARU MASUK
    if (orderTersedia.length > jumlahOrderanLama) {
        bunyiKlakson();
    }
    jumlahOrderanLama = orderTersedia.length;

    let html = "";
    for (const id in orders) {
        const o = orders[id];
        
        // Cek jika orderan diambil oleh saya (Re-connect)
        if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
            mulaiTripLayar(id, o);
            return;
        }

        if (o.status === "mencari_driver") {
            html += `
            <div class="card order-card" style="margin-bottom:12px; padding:15px; border-left: 5px solid #10b981;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex:1;">
                        <small style="color:#059669; font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:bold; font-size:15px; margin-bottom:5px;">${o.tujuan}</div>
                        <small>Ongkos User:</small>
                        <div style="color:#10b981; font-weight:800;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-confirm" style="padding:8px 12px; font-size:11px; margin-bottom:5px;" onclick="ambilOrder('${id}')">AMBIL</button>
                        <button class="btn-gps" style="padding:8px 12px; font-size:11px; margin:0; border:1px solid #ddd;" onclick="tawarOrder('${id}', ${o.upah})">TAWAR</button>
                    </div>
                </div>
            </div>`;
        }
    }
    listArea.innerHTML = html || '<p class="text-center text-muted">Belum ada orderan baru...</p>';
}

async function ambilOrder(id) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik,
            upah_final: 0 // Akan diisi jika ada tawar menawar
        })
    });
}

async function tawarOrder(id, hargaUser) {
    const tawar = prompt("Masukkan tawaran Anda (Contoh: 25000):", hargaUser + 5000);
    if (!tawar) return;
    
    const hargaTawar = bulatkanHarga(parseInt(tawar));
    await fetch(`${DB_URL}/orders/${id}/tawaran/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama_driver: myDriver.nama,
            driver_nik: myDriver.nik,
            harga_tawar: hargaTawar
        })
    });
    alert("Tawaran terkirim! Pantau layar, jika user setuju trip akan dimulai.");
}

// ==========================================
// 5. LOGIKA PERJALANAN & CHAT
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    jumlahPesanLamaDriver = 0;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    document.getElementById('trip-destinasi').innerText = data.tujuan;
    const ongkos = data.upah_final || data.upah;
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + ongkos.toLocaleString();
    
    // Timer Keamanan (30 detik untuk tes, ubah ke 900 untuk 15 menit)
    jalankanTimerSelesai(30, (waktu) => {
        document.getElementById('timer-text').innerText = waktu;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.background = "#10b981";
    });

    // Pantau Chat & Status
    setInterval(async () => {
        if(activeTripId){
            const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
            const d = await res.json();
            if(d && d.chat) updateChatDriver(d.chat);
            // Jika user membatalkan sepihak
            if(!d) location.reload();
        }
    }, 3000);
}

function updateChatDriver(chatData) {
    const box = document.getElementById('chat-messages');
    const jmlPesan = Object.keys(chatData).length;

    if (jmlPesan > jumlahPesanLamaDriver) {
        const pesanTerakhir = Object.values(chatData).pop();
        if (pesanTerakhir.sender === 'user') {
            bunyiKlakson(); // BUNYI JIKA USER CHAT
        }
        renderChatUI(chatData);
    }
    jumlahPesanLamaDriver = jmlPesan;
}

function renderChatUI(chatData) {
    const box = document.getElementById('chat-messages');
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        const tipe = c.sender === 'driver' ? 'msg-u' : 'msg-d';
        h += `<div class="msg ${tipe}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

function driverKirimChat() {
    const inp = document.getElementById('input-pesan-driver');
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

// ==========================================
// 6. SELESAI & STATISTIK
// ==========================================
async function driverKlikSelesai() {
    const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
    const data = await res.json();
    const untung = data.upah_final || data.upah;

    // Update Statistik Lokal
    myDriver.incomeToday += untung;
    myDriver.orderCount++;
    document.getElementById('stat-income').innerText = `Rp ${myDriver.incomeToday.toLocaleString()}`;

    // Kirim sinyal selesai ke User (Sinkronisasi)
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert("Pesanan Selesai! Alhamdulillah.");
    activeTripId = null;
    tampilkanScreen('screen-dashboard');
    toggleOnline(); // Kembali online mencari order
}

async function driverBatalkanPesanan() {
    if (!confirm("Batal? Saldo donasi dapat terpengaruh.")) return;
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, { method: 'DELETE' });
    location.reload();
            }
        
