// ==========================================
// 1. DATA IDENTITAS & STATISTIK DRIVER
// ==========================================
const myDriver = {
    nik: "DRV-10029", 
    nama: "Asep Sunandar",
    plat: "E 1234 YX",
    motor: "Yamaha NMAX Silver",
    moto: "Kepuasan Anda, Rejeki Saya",
    foto: "https://via.placeholder.com/100", 
    rating: "4.9",
    // Data Historis (Poin permintaan Anda)
    incomeM1: 1450000, // Bulan Lalu
    incomeM2: 1200000, // 2 Bulan Lalu
    incomeToday: 0,
    orderCount: 0
};

let isOnline = false;
let monitorInterval, activeTripId;

// ==========================================
// 2. INISIALISASI TAMPILAN (ON LOAD)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Muat Profil ke UI
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    document.getElementById('disp-moto').innerText = `"${myDriver.moto}"`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating}`;
    document.getElementById('stat-m1').innerText = `Rp ${myDriver.incomeM1.toLocaleString()}`;
    document.getElementById('stat-m2').innerText = `Rp ${myDriver.incomeM2.toLocaleString()}`;
    document.getElementById('stat-income').innerText = `Rp 0`;
    
    if(myDriver.foto) document.getElementById('driver-img').src = myDriver.foto;
});

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
        // Mulai monitor orderan setiap 4 detik
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
// 4. PANTAU & TAWAR ORDERAN (SISTEM BID)
// ==========================================
async function pantauOrderanBaru() {
    const res = await fetch(`${DB_URL}/orders.json`);
    const orders = await res.json();
    const listArea = document.getElementById('list-order-masuk');
    
    if (!orders) {
        listArea.innerHTML = '<p class="text-center text-muted">Belum ada orderan di sekitar Kuningan...</p>';
        return;
    }

    let html = "";
    for (const id in orders) {
        const o = orders[id];
        
        // Cek jika orderan ini diambil oleh SAYA (Re-connect jika aplikasi tertutup)
        if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
            mulaiTripLayar(id, o);
            return;
        }

        // Tampilkan orderan yang masih mencari driver
        if (o.status === "mencari_driver") {
            html += `
            <div class="card order-card" style="margin-bottom:12px; padding:15px;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <div style="flex:1;">
                        <small style="color:var(--primary); font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:bold; font-size:15px; margin-bottom:5px;">${o.tujuan}</div>
                        <small>Ongkos User:</small>
                        <div style="color:var(--success); font-weight:800;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right;">
                        <button class="btn-confirm" style="padding:8px 15px; font-size:12px; margin-bottom:5px;" onclick="ambilOrder('${id}')">TERIMA</button>
                        <button class="btn-gps" style="padding:8px 15px; font-size:12px; margin:0; border:1px solid #ddd;" onclick="tawarOrder('${id}', ${o.upah})">TAWAR</button>
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
            upah_final: 0 // Akan diupdate di mulaiTripLayar
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
    alert("Tawaran terkirim! Silahkan tunggu user memilih Anda.");
}

// ==========================================
// 5. LOGIKA PERJALANAN (TRIP) & TIMER 15M
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    document.getElementById('trip-destinasi').innerText = data.tujuan;
    const ongkos = data.upah_final || data.upah;
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + ongkos.toLocaleString();
    
    // Timer Keamanan (900 detik = 15 menit)
    // Untuk tes, gunakan 30 detik saja dulu
    jalankanTimerSelesai(30, (waktu) => {
        document.getElementById('timer-text').innerText = waktu;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.background = "var(--success)";
    });

    // Jalankan Sinkronisasi Chat
    setInterval(async () => {
        if(activeTripId){
            const res = await fetch(`${DB_URL}/orders/${activeTripId}/chat.json`);
            const chat = await res.json();
            updateChatUI(chat);
        }
    }, 3000);
}

// ==========================================
// 6. CHAT & SELESAI
// ==========================================
function driverKirimChat() {
    const inp = document.getElementById('input-pesan-driver');
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

function updateChatUI(chatData) {
    const box = document.getElementById('chat-messages');
    if (!chatData) return;
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        const tipe = c.sender === 'driver' ? 'msg-u' : 'msg-d';
        h += `<div class="msg ${tipe}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

async function driverKlikSelesai() {
    const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
    const data = await res.json();
    const untung = data.upah_final || data.upah;

    // Update Statistik Lokal
    myDriver.incomeToday += untung;
    myDriver.orderCount++;
    document.getElementById('stat-income').innerText = `Rp ${myDriver.incomeToday.toLocaleString()}`;

    // Update Firebase untuk User (Sinkronisasi)
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert("Pesanan Selesai! Terima kasih telah melayani warga Kuningan.");
    activeTripId = null;
    tampilkanScreen('screen-dashboard');
    toggleOnline(); // Reset ke online
}

async function driverBatalkanPesanan() {
    if (!confirm("Batalkan pesanan? Saldo donasi mungkin terpotong jika sering membatalkan.")) return;
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, { method: 'DELETE' });
    location.reload();
}
