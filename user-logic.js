// ==========================================
// 1. STATE & GLOBAL VARIABLES
// ==========================================
let userLat, userLon, distKm, finalPrice, currentOrderId, monitorInterval;
let searchTimeout; 
let lastOrderData = null; 
let jumlahPesanLamaUser = 0;
let sudahNotifDriver = false;
let userRatings = { kecepatan: 0, kesopanan: 0 };
let driverData = { nik: "", nama: "" };

/**
 * AMBIL LOKASI GPS (WAJIB UNTUK MAPS DRIVER)
 */
function userAmbilLokasi() {
    const btn = document.getElementById('btn-gps');
    btn.innerHTML = '<span class="loader-ring" style="width:15px; height:15px; border-width:2px;"></span> Mencari GPS...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
            userLat = p.coords.latitude;
            userLon = p.coords.longitude;
            
            btn.innerHTML = "✅ LOKASI TERKUNCI";
            btn.style.background = "#dcfce7";
            btn.style.color = "#166534";
            
            // Aktifkan Audio Context agar klakson bisa bunyi
            const dummyCtx = new (window.AudioContext || window.webkitAudioContext)();
            dummyCtx.resume();
        }, () => {
            alert("Gagal akses GPS. Mohon izinkan lokasi di pengaturan browser Anda.");
            btn.innerHTML = "📍 COBA LAGI";
        });
    }
}

/**
 * RENDER DAFTAR DESA
 */
function renderDesa() {
    const kec = document.getElementById('select-kecamatan').value;
    const dSel = document.getElementById('select-desa');
    dSel.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    
    if (dataWilayah[kec]) {
        dataWilayah[kec].forEach(d => {
            let opt = document.createElement('option');
            opt.value = d; opt.text = d;
            dSel.add(opt);
        });
        dSel.style.display = 'block';
    }
}

/**
 * HITUNG TARIF & JARAK
 */
function prosesHitungTarif() {
    const kec = document.getElementById('select-kecamatan').value;
    if (!userLat) return alert("Klik 'Gunakan Lokasi Saya' dahulu!");
    
    const dest = koordinatKecamatan[kec];
    distKm = hitungJarakKm(userLat, userLon, dest.lat, dest.lon);
    
    document.getElementById('display-jarak').innerText = `${distKm} KM`;
    
    const h1 = bulatkanHarga(distKm * 3000);
    const h2 = bulatkanHarga(distKm * 4000);
    const h3 = bulatkanHarga(distKm * 5000);
    
    document.getElementById('p-hemat').innerText = `Rp ${h1.toLocaleString()}`;
    document.getElementById('p-reguler').innerText = `Rp ${h2.toLocaleString()}`;
    document.getElementById('p-kilat').innerText = `Rp ${h3.toLocaleString()}`;
    
    document.getElementById('price-section').style.display = 'block';
    finalPrice = h2; 
}

function pilihTipeHarga(el, pengali) {
    document.querySelectorAll('.price-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    finalPrice = bulatkanHarga(distKm * pengali);
}

// ==========================================
// 2. LOGIKA PESANAN & AUTO-CLEANUP
// ==========================================

async function buatPesanan() {
    const kec = document.getElementById('select-kecamatan').value;
    const desa = document.getElementById('select-desa').value;
    if(!kec || !desa) return alert("Pilih tujuan terlebih dahulu!");

    // Simpan data untuk Re-Order
    lastOrderData = { kec, desa, upah: finalPrice };
    sudahNotifDriver = false;
    jumlahPesanLamaUser = 0;

    // DATA PAYLOAD (Disinkronkan dengan Maps Driver)
    const payload = {
        jemput_lat: userLat, 
        jemput_lon: userLon,
        tujuan: `${kec}, ${desa}`,
        upah: finalPrice,
        status: "mencari_driver",
        timestamp: new Date().getTime()
    };
    
    const res = await fetch(`${DB_URL}/orders.json`, { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    currentOrderId = data.name;
    
    tampilkanScreen('screen-waiting');
    monitorInterval = setInterval(pantauOrderUser, 3000);

    // Timeout 3 Menit (Poin: Notif & Pembatalan Otomatis)
    searchTimeout = setTimeout(() => {
        handleTimeoutPencarian();
    }, 180000); 
}

async function handleTimeoutPencarian() {
    clearInterval(monitorInterval);
    
    // HAPUS DARI DATABASE (Keep it clean!)
    if (currentOrderId) {
        await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    }

    // Tampilkan Layar Gagal & Tombol Re-Order
    document.getElementById('waiting-content').innerHTML = `
        <div style="padding:10px;">
            <span style="font-size:60px;">⏳</span>
            <h3 style="color:#e11d48; margin-top:15px;">Belum Dapat Driver</h3>
            <p class="text-muted" style="font-size:13px; margin-bottom:20px;">
                Maaf, saat ini mitra driver di area Anda sedang sibuk atau tidak tersedia. 
                Silahkan coba beberapa saat lagi atau gunakan tarif <b>Kilat</b>.
            </p>
            <button class="btn-confirm" onclick="ulangiPesananTerakhir()">ULANGI PESANAN</button>
            <button class="btn-cancel" style="background:none; border:1px solid #ccc; color:#666; margin-top:10px;" onclick="location.reload()">KEMBALI</button>
        </div>
    `;
}

function ulangiPesananTerakhir() {
    if (!lastOrderData) return location.reload();
    tampilkanScreen('screen-order');
    document.getElementById('select-kecamatan').value = lastOrderData.kec;
    renderDesa();
    document.getElementById('select-desa').value = lastOrderData.desa;
    buatPesanan(); // Pesan lagi otomatis
}

// ==========================================
// 3. PANTAU STATUS & CHAT (KLAKSON)
// ==========================================

async function pantauOrderUser() {
    const data = await cekStatusOrder(currentOrderId);
    if (!data) return;

    // A. Driver Ketemu
    if (data.status === "diambil") {
        clearTimeout(searchTimeout); 
        if (!sudahNotifDriver) {
            bunyiKlakson(); // Bunyi klakson sukses
            sudahNotifDriver = true;
        }
        driverData.nik = data.driver_nik;
        driverData.nama = data.driver_pilihan;
        
        document.getElementById('info-driver-trip').innerHTML = `
            <div style="display:flex; align-items:center; gap:12px; background:#f1f5f9; padding:15px; border-radius:15px;">
                <div style="background:var(--primary); color:white; width:45px; height:45px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px;">
                    ${driverData.nama.charAt(0)}
                </div>
                <div>
                    <b style="font-size:16px;">${driverData.nama}</b><br>
                    <small style="color:#059669; font-weight:bold;">Ongkos: Rp ${(data.upah_final || data.upah).toLocaleString()}</small>
                </div>
            </div>
        `;
        tampilkanScreen('screen-trip');
    }

    // B. Chat & Notif Klakson
    if (data.chat) {
        const jmlChat = Object.keys(data.chat).length;
        if (jmlChat > jumlahPesanLamaUser) {
            const pesanTerakhir = Object.values(data.chat).pop();
            if (pesanTerakhir.sender === 'driver') bunyiKlakson();
            renderChat(data.chat);
        }
        jumlahPesanLamaUser = jmlChat;
    }

    // C. Cek jika Driver sudah klik Selesai
    if (data.status_driver === "selesai") {
        userKlikSelesai();
    }
}

// ==========================================
// 4. CHAT, RATING & BATAL
// ==========================================

function renderChat(chatData) {
    const box = document.getElementById('chat-messages');
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        h += `<div class="msg ${c.sender === 'user' ? 'msg-u' : 'msg-d'}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

function userKirimChat() {
    const inp = document.getElementById('input-pesan');
    kirimPesanFirebase(currentOrderId, 'user', inp.value);
    inp.value = "";
}

async function userBatalkanPesanan() {
    if (!confirm("Batalkan pesanan ini?")) return;
    clearInterval(monitorInterval);
    clearTimeout(searchTimeout);
    if(currentOrderId) await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    location.reload();
}

function setRating(kat, n) {
    userRatings[kat] = n;
    const stars = document.querySelectorAll(`[data-cat="${kat}"] span`);
    stars.forEach((s, i) => s.classList.toggle('active', i < n));
}

function userKlikSelesai() {
    clearInterval(monitorInterval);
    tampilkanScreen('screen-rating');
}

async function kirimRatingFinal() {
    if (userRatings.kecepatan === 0) return alert("Mohon beri rating bintang!");
    const ulasan = document.getElementById('input-ulasan').value;
    
    await fetch(`${DB_URL}/drivers/${driverData.nik}/feedback.json`, {
        method: 'POST',
        body: JSON.stringify({ rating: userRatings, teks: ulasan, date: new Date().toISOString() })
    });
    
    await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    alert("Terima kasih! Pesanan selesai.");
    location.reload();
        }
                               
