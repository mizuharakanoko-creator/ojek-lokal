// ==========================================
// 1. VARIABEL GLOBAL & STATE
// ==========================================
let userLat, userLon, distKm, finalPrice, currentOrderId, monitorInterval;
let searchTimeout; 
let lastOrderData = null; // Untuk fitur Ulangi Pesanan
let jumlahPesanLamaUser = 0;
let sudahNotifDriver = false;
let userRatings = { kecepatan: 0, kesopanan: 0 };
let driverData = { nik: "", nama: "" };

/**
 * AMBIL LOKASI GPS (DENGAN VISUAL LOADING)
 */
function userAmbilLokasi() {
    const btn = document.getElementById('btn-gps');
    btn.innerHTML = '<span class="loader-ring" style="width:15px; height:15px; margin:0; border-width:2px;"></span> Mencari GPS...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => {
            userLat = p.coords.latitude;
            userLon = p.coords.longitude;
            btn.innerHTML = "✅ LOKASI TERKUNCI";
            btn.style.background = "#dcfce7";
            btn.style.color = "#166534";
            // Pemicu Audio Context (Agar suara klakson bisa bunyi nanti)
            const dummyCtx = new (window.AudioContext || window.webkitAudioContext)();
            dummyCtx.resume();
        }, () => {
            alert("Gagal ambil lokasi. Pastikan GPS aktif dan izinkan akses lokasi.");
            btn.innerHTML = "📍 COBA LAGI";
        });
    }
}

/**
 * DAFTAR DESA BERDASARKAN KECAMATAN
 */
function renderDesa() {
    const kec = document.getElementById('select-kecamatan').value;
    const dSel = document.getElementById('select-desa');
    dSel.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    
    if (dataWilayah[kec]) {
        dataWilayah[kec].forEach(d => {
            let opt = document.createElement('option');
            opt.value = d;
            opt.text = d;
            dSel.add(opt);
        });
        dSel.style.display = 'block';
    }
}

/**
 * HITUNG TARIF OTOMATIS
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
    finalPrice = h2; // Default reguler
}

function pilihTipeHarga(el, pengali) {
    document.querySelectorAll('.price-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    finalPrice = bulatkanHarga(distKm * pengali);
}

// ==========================================
// 2. LOGIKA ORDER & TIMEOUT (3 MENIT)
// ==========================================

async function buatPesanan() {
    const kec = document.getElementById('select-kecamatan').value;
    const desa = document.getElementById('select-desa').value;
    if(!kec || !desa) return alert("Pilih tujuan dengan lengkap!");

    // Simpan data untuk fitur Re-Order
    lastOrderData = { kec, desa, upah: finalPrice };
    sudahNotifDriver = false;
    jumlahPesanLamaUser = 0;

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
    
    // HAPUS DARI DATABASE (Clean up agar tetap bersih)
    if (currentOrderId) {
        await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    }

    // Ubah tampilan menjadi Pesan Profesional
    document.getElementById('waiting-content').innerHTML = `
        <div style="padding:20px;">
            <span style="font-size:50px;">⏳</span>
            <h3 style="color:var(--danger); margin-top:10px;">Driver Belum Ditemukan</h3>
            <p class="text-muted" style="font-size:13px; margin-bottom:15px;">
                Mohon maaf, saat ini mitra driver di area Anda sedang tidak tersedia. 
                Hal ini mungkin karena keterbatasan mitra atau tarif yang kurang kompetitif.
            </p>
            <div style="background:#f1f5f9; padding:15px; border-radius:15px; margin-bottom:20px; font-size:12px; text-align:left;">
                <b>Saran:</b><br>
                1. Coba lagi beberapa saat lagi.<br>
                2. Gunakan tarif <b>Kilat</b> untuk menarik minat driver.
            </div>
            <button class="btn-confirm" onclick="ulangiPesananTerakhir()">ULANGI PESANAN</button>
            <button class="btn-cancel" style="background:none; color:var(--danger); border:1px solid" onclick="location.reload()">KEMBALI</button>
        </div>
    `;
}

function ulangiPesananTerakhir() {
    if (!lastOrderData) return location.reload();
    // Kembalikan UI ke layar order
    tampilkanScreen('screen-order');
    document.getElementById('select-kecamatan').value = lastOrderData.kec;
    renderDesa();
    document.getElementById('select-desa').value = lastOrderData.desa;
    // Jalankan ulang
    buatPesanan();
}

// ==========================================
// 3. PANTAU STATUS & NOTIF KLAKSON
// ==========================================

async function pantauOrderUser() {
    const data = await cekStatusOrder(currentOrderId);
    if (!data) return;

    // A. DRIVER DITEMUKAN
    if (data.status === "diambil") {
        clearTimeout(searchTimeout); 
        
        if (!sudahNotifDriver) {
            bunyiKlakson(); // Bunyi saat driver deal
            sudahNotifDriver = true;
        }

        driverData.nik = data.driver_nik;
        driverData.nama = data.driver_pilihan;
        
        document.getElementById('info-driver-trip').innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; padding:10px; border-radius:12px;">
                <div style="background:var(--primary); color:white; width:45px; height:45px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px;">
                    ${driverData.nama.charAt(0)}
                </div>
                <div>
                    <b style="font-size:15px;">${driverData.nama}</b><br>
                    <small style="color:var(--success); font-weight:bold;">Ongkos: Rp ${data.upah_final ? data.upah_final.toLocaleString() : data.upah.toLocaleString()}</small>
                </div>
            </div>
        `;
        tampilkanScreen('screen-trip');
    }

    // B. LOGIKA CHAT & KLAKSON CHAT
    if (data.chat) {
        const jmlChat = Object.keys(data.chat).length;
        if (jmlChat > jumlahPesanLamaUser) {
            const pesanTerakhir = Object.values(data.chat).pop();
            if (pesanTerakhir.sender === 'driver') {
                bunyiKlakson(); // Bunyi saat ada pesan masuk
            }
            renderChat(data.chat);
        }
        jumlahPesanLamaUser = jmlChat;
    }

    // C. SINKRONISASI SELESAI (Poin 1: Driver Klik Selesai)
    if (data.status_driver === "selesai") {
        userKlikSelesai();
    }
}

// ==========================================
// 4. FITUR CHAT & RATING
// ==========================================

function renderChat(chatData) {
    const box = document.getElementById('chat-messages');
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        const tipe = c.sender === 'user' ? 'msg-u' : 'msg-d';
        h += `<div class="msg ${tipe}">${c.txt}</div>`;
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
    clearTimeout(searchTimeout);
    tampilkanScreen('screen-rating');
}

async function kirimRatingFinal() {
    if (userRatings.kecepatan === 0) return alert("Mohon beri rating bintang!");
    const ulasan = document.getElementById('input-ulasan').value;
    
    await fetch(`${DB_URL}/drivers/${driverData.nik}/feedback.json`, {
        method: 'POST',
        body: JSON.stringify({ rating: userRatings, teks: ulasan, date: new Date().toISOString() })
    });
    
    // Final Clean-up
    await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    alert("Terima kasih! Semoga perjalanan Anda menyenangkan.");
    location.reload();
}
