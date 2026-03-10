let isOnline = false;
let monitorInterval, activeTripId;
let pendapatanHariIni = 0;
let totalOrderSelesai = 0;

// Data Driver (Bisa dikembangkan dengan sistem Login)
const myDriver = {
    nik: "DRV-" + Math.floor(Math.random() * 1000), // ID Acak untuk demo
    nama: "Driver Kuningan"
};

/**
 * 1. MANAJEMEN STATUS ONLINE/OFFLINE
 */
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const txt = document.getElementById('text-status');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2";
        btn.style.color = "#ef4444";
        txt.innerText = "ONLINE (Menunggu Order)";
        txt.style.color = "var(--success)";
        // Mulai pantau orderan masuk
        monitorInterval = setInterval(pantauOrderanMasuk, 4000);
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "var(--white)";
        btn.style.color = "var(--primary)";
        txt.innerText = "OFFLINE";
        txt.style.color = "var(--danger)";
        clearInterval(monitorInterval);
        document.getElementById('list-order-masuk').innerHTML = '<p class="text-center text-muted">Aplikasi Offline.</p>';
    }
}

/**
 * 2. PANTAU ORDERAN MASUK & TAWAR HARGA
 */
async function pantauOrderanMasuk() {
    const res = await fetch(`${DB_URL}/orders.json`);
    const orders = await res.json();
    
    let html = "";
    if (!orders) {
        html = '<p class="text-center text-muted">Belum ada orderan...</p>';
    } else {
        for (const id in orders) {
            const o = orders[id];
            // Hanya tampilkan yang belum diambil driver
            if (o.status === "mencari_driver") {
                html += `
                <div class="card">
                    <small>TUJUAN:</small>
                    <b style="display:block; margin-bottom:5px;">${o.tujuan}</b>
                    <small>ONGKOS USER:</small>
                    <b style="color:var(--primary); display:block;">Rp ${o.upah.toLocaleString()}</b>
                    
                    <div style="display:flex; gap:5px; margin-top:10px;">
                        <button class="btn-confirm" style="padding:10px; font-size:12px;" onclick="terimaLangsung('${id}')">TERIMA</button>
                        <button class="btn-gps" style="padding:10px; font-size:12px; margin:0;" onclick="tawarHarga('${id}', ${o.upah})">TAWAR</button>
                    </div>
                </div>`;
            }
            
            // Jika orderan ini ternyata sudah diambil oleh SAYA
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiPerjalanan(id, o);
            }
        }
    }
    document.getElementById('list-order-masuk').innerHTML = html;
}

async function terimaLangsung(id) {
    await fetch(`${DB_URL}/orders/${id}.json`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: "diambil",
            driver_pilihan: myDriver.nama,
            driver_nik: myDriver.nik,
            upah_final: 0 // Akan diisi di fungsi mulaiPerjalanan
        })
    });
}

async function tawarHarga(id, hargaAwal) {
    const tawaran = prompt("Masukkan harga tawaran Anda (Contoh: 25000):", hargaAwal + 5000);
    if (!tawaran) return;
    
    const hargaTawar = bulatkanHarga(parseInt(tawaran));
    await fetch(`${DB_URL}/orders/${id}/tawaran/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify({
            nama_driver: myDriver.nama,
            driver_nik: myDriver.nik,
            harga_tawar: hargaTawar
        })
    });
    alert("Tawaran terkirim! Tunggu konfirmasi user.");
}

/**
 * 3. LOGIKA TRIP / PERJALANAN
 */
function mulaiPerjalanan(id, data) {
    activeTripId = id;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    document.getElementById('trip-destinasi').innerText = data.tujuan;
    document.getElementById('trip-upah').innerText = "Pendapatan: Rp " + (data.upah_final || data.upah).toLocaleString();
    
    // Aktifkan Timer Keamanan (Core.js) - Demo: 30 detik (Ganti ke 900 untuk 15 menit)
    jalankanTimerSelesai(30, (txt) => {
        document.getElementById('timer-text').innerText = txt;
    }, () => {
        const btn = document.getElementById('btn-selesai-order');
        btn.disabled = false;
        btn.style.opacity = "1";
        document.getElementById('timer-box').innerHTML = "✅ Pesanan siap diselesaikan";
    });

    // Pantau Chat
    setInterval(async () => {
        const res = await fetch(`${DB_URL}/orders/${id}/chat.json`);
        const chat = await res.json();
        renderChatDriver(chat);
    }, 3000);
}

/**
 * 4. FITUR CHAT & SELESAI
 */
function driverKirimChat() {
    const inp = document.getElementById('input-pesan-driver');
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

function renderChatDriver(chatData) {
    const box = document.getElementById('chat-messages');
    if (!chatData) return;
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        const clss = c.sender === 'driver' ? 'msg-u' : 'msg-d'; // Driver di kanan (u)
        h += `<div class="msg ${clss}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

async function driverKlikSelesai() {
    // Ambil data upah untuk statistik
    const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
    const data = await res.json();
    const upah = data.upah_final || data.upah;

    // Update Statistik
    pendapatanHariIni += upah;
    totalOrderSelesai++;
    document.getElementById('stat-income').innerText = `Rp ${pendapatanHariIni.toLocaleString()}`;
    document.getElementById('stat-count').innerText = totalOrderSelesai;

    // Beri sinyal ke User bahwa driver sudah klik selesai (Sinkronisasi Poin 1)
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ status_driver: "selesai" })
    });

    alert("Pesanan Selesai! Alhamdulillah.");
    tampilkanScreen('screen-dashboard');
    toggleOnline(); // Reset status ke online untuk cari order baru
}

async function driverBatalkanPesanan() {
    if (!confirm("Batal? (Hanya jika darurat!)")) return;
    await fetch(`${DB_URL}/orders/${activeTripId}.json`, { method: 'DELETE' });
    location.reload();
}
