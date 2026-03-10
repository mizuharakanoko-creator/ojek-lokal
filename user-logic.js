// Variabel Global
let userLat, userLon, distKm, finalPrice, currentOrderId, monitorInterval;
let searchTimeout; 
let lastOrderData = null; // Menyimpan data order terakhir untuk fitur Ulangi
let userRatings = { kecepatan: 0, kesopanan: 0 };
let driverData = { nik: "", nama: "" };

/**
 * 1. AMBIL LOKASI GPS
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
        }, () => {
            alert("Gagal ambil lokasi. Pastikan GPS aktif.");
            btn.innerHTML = "📍 COBA LAGI";
        });
    }
}

/**
 * 2. UPDATE DAFTAR DESA
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
 * 3. HITUNG TARIF (PEMBULATAN RIBUAN)
 */
function prosesHitungTarif() {
    const kec = document.getElementById('select-kecamatan').value;
    if (!userLat) return alert("Klik 'Gunakan Lokasi Saya' dahulu!");
    
    const dest = koordinatKecamatan[kec];
    distKm = hitungJarakKm(userLat, userLon, dest.lat, dest.lon);
    
    document.getElementById('display-jarak').innerText = `Jarak: ${distKm} KM`;
    
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

/**
 * 4. LOGIKA PESANAN & TIMEOUT (3 MENIT)
 */
async function buatPesanan() {
    const kec = document.getElementById('select-kecamatan').value;
    const desa = document.getElementById('select-desa').value;
    
    // Simpan data untuk fitur Re-Order jika nanti gagal
    lastOrderData = {
        kec: kec,
        desa: desa,
        upah: finalPrice
    };

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

    // Set Timeout 3 Menit (180 detik)
    searchTimeout = setTimeout(() => {
        handleTimeoutPencarian();
    }, 180000); 
}

async function handleTimeoutPencarian() {
    clearInterval(monitorInterval);
    
    // HAPUS DARI DATABASE (Clean up)
    if (currentOrderId) {
        await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    }

    // Ubah tampilan layar waiting menjadi pesan gagal
    document.getElementById('screen-waiting').innerHTML = `
        <div class="card text-center">
            <span style="font-size:50px;">⏳</span>
            <h3 style="color:var(--danger);">Driver Belum Ditemukan</h3>
            <p class="text-muted" style="font-size:13px;">Mohon maaf, saat ini mitra driver di area Anda sedang sibuk atau tidak tersedia.</p>
            <div style="background:#f1f5f9; padding:15px; border-radius:15px; margin:15px 0; font-size:12px; text-align:left;">
                <b>Saran:</b><br>
                1. Coba lagi dalam 1-2 menit.<br>
                2. Gunakan tarif <b>Kilat</b> untuk respon lebih cepat.
            </div>
            <button class="btn-confirm" onclick="ulangiPesananTerakhir()">ULANGI PESANAN</button>
            <button class="btn-cancel" onclick="location.reload()">KEMBALI KE AWAL</button>
        </div>
    `;
}

// Fitur Re-Order (Ulangi)
function ulangiPesananTerakhir() {
    if (!lastOrderData) return location.reload();
    
    // Kembalikan UI ke kondisi awal tapi tetap di layar order
    tampilkanScreen('screen-order');
    
    // Isi kembali nilai yang tadi
    document.getElementById('select-kecamatan').value = lastOrderData.kec;
    renderDesa();
    document.getElementById('select-desa').value = lastOrderData.desa;
    
    // Langsung buat pesanan lagi
    buatPesanan();
}

/**
 * 5. PANTAU STATUS ORDER
 */
async function pantauOrderUser() {
    const data = await cekStatusOrder(currentOrderId);
    if (!data) return;

    if (data.status === "diambil") {
        clearTimeout(searchTimeout); // Stop timeout karena driver ketemu!
        driverData.nik = data.driver_nik;
        driverData.nama = data.driver_pilihan;
        
        document.getElementById('info-driver-trip').innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="background:var(--primary); color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                    ${driverData.nama.charAt(0)}
                </div>
                <div>
                    <b>${driverData.nama}</b><br>
                    <small>Ongkos: Rp ${data.upah_final.toLocaleString()}</small>
                </div>
            </div>
        `;
        tampilkanScreen('screen-trip');
    }

    if (data.tawaran) {
        // Tampilkan tawaran harga dari driver (Logika Bid)
        let h = "";
        for (const key in data.tawaran) {
            const t = data.tawaran[key];
            h += `
            <div class="card" style="margin-top:10px; padding:15px; border:2px solid var(--primary-soft);">
                <b>${t.nama_driver}</b> menawarkan Rp ${t.harga_tawar.toLocaleString()}
                <button class="btn-confirm" style="padding:10px; margin-top:10px; font-size:14px;" 
                    onclick="pilihDriverFix('${t.nama_driver}','${t.driver_nik}',${t.harga_tawar})">TERIMA</button>
            </div>`;
        }
        document.getElementById('container-tawaran').innerHTML = h;
    }
}

async function pilihDriverFix(nama, nik, harga) {
    clearTimeout(searchTimeout); // Pastikan timeout mati saat user memilih driver dari bid
    await fetch(`${DB_URL}/orders/${currentOrderId}.json`, {
        method: 'PATCH', 
        body: JSON.stringify({ status: "diambil", driver_pilihan: nama, driver_nik: nik, upah_final: harga })
    });
}

/**
 * 6. CHAT & RATING
 */
function userKirimChat() {
    const inp = document.getElementById('input-pesan');
    kirimPesanFirebase(currentOrderId, 'user', inp.value);
    inp.value = "";
}

async function userBatalkanPesanan() {
    if (!confirm("Batalkan pesanan ini?")) return;
    clearInterval(monitorInterval);
    clearTimeout(searchTimeout);
    await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
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
    if (userRatings.kecepatan === 0) return alert("Mohon beri bintang!");
    const ulasan = document.getElementById('input-ulasan').value;
    await fetch(`${DB_URL}/drivers/${driverData.nik}/feedback.json`, {
        method: 'POST',
        body: JSON.stringify({ rating: userRatings, teks: ulasan, user: "Customer" })
    });
    await fetch(`${DB_URL}/orders/${currentOrderId}.json`, { method: 'DELETE' });
    alert("Terima kasih!");
    location.reload();
}
