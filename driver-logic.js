// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval = null; 
let activeTripId = null;
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
// 2. DASHBOARD & REGISTRASI
// ==========================================
function prosesDaftar() {
    const nama = document.getElementById('reg-nama')?.value;
    const plat = document.getElementById('reg-plat')?.value;
    const motor = document.getElementById('reg-motor')?.value;

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
    
    // Tarik data terbaru dari memori HP
    const saved = localStorage.getItem('ojek_kuningan_driver');
    if(saved) myDriver = JSON.parse(saved);

    // Render Data Diri & Saldo
    document.getElementById('disp-nama').innerText = myDriver.nama;
    document.getElementById('disp-plat').innerText = `${myDriver.plat} | ${myDriver.motor}`;
    
    const income = parseInt(myDriver.incomeToday) || 0;
    const count = parseInt(myDriver.orderCount) || 0;
    
    document.getElementById('stat-income').innerText = `Rp ${income.toLocaleString()}`;
    document.getElementById('total-order-badge').innerText = `${count} Order`;
    document.getElementById('stat-rating').innerText = `⭐ ${myDriver.rating || '5.0'}`;

    // Render Performa
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";
}

// ==========================================
// 3. LOGIKA ONLINE & CARI ORDERAN
// ==========================================
function toggleOnline() {
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.style.background = "#fee2e2"; 
        btn.style.color = "#ef4444";
        
        // Mulai memantau orderan baru setiap 4 detik
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Mencari orderan...</p>';
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; 
        btn.style.color = "#10b981";
        
        // Berhenti memantau
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:20px;">Anda sedang Offline</p>';
    }
}

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
            
            // A. CEK JIKA USER MEMILIH DRIVER INI (MATCH!)
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiTripLayar(id, o);
                return; // Langsung keluar loop dan pindah layar
            }

            // B. TAMPILKAN ORDERAN YANG MASIH MENCARI DRIVER
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
                            ? `<br><small style="color:#f59e0b; font-weight:bold;">Menunggu User...</small>`
                            : `<br><button class="btn-tawar" onclick="tawarHarga('${id}', ${o.upah})">TAWAR</button>`
                        }
                    </div>
                </div>`;
            }
        }
        listArea.innerHTML = html || '<p style="text-align:center; opacity:0.5; margin-top:20px;">Belum ada orderan...</p>';
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
    alert("Tawaran terkirim! Silahkan tunggu respons User.");
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
// 4. LAYAR TRIP AKTIF & CHAT REAL-TIME
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data;
    jumlahPesanLamaDriver = 0; // Reset counter chat
    
    // Matikan pencarian orderan baru
    clearInterval(monitorInterval);
    
    // Tampilkan Screen Trip
    tampilkanScreen('screen-trip-driver');
    
    // Isi Informasi Penumpang
    const infoUser = document.getElementById('info-user-trip');
    if(infoUser) {
        infoUser.innerHTML = `
            <div style="padding:15px; background:#f8fafc; border-radius:10px; margin-bottom:15px; border-left: 4px solid var(--primary);">
                <small style="color:var(--gray);">PENUMPANG:</small><br>
                <b style="font-size:16px;">Pelanggan Ojek Kuningan</b><br>
                <small style="color:var(--primary); font-weight:bold; font-size:14px;">ONGKOS: Rp ${(data.upah_final || data.upah).toLocaleString()}</small>
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

    // MULAI PANTAU CHAT & STATUS TRIP SECARA REAL-TIME
    monitorInterval = setInterval(pantauTripAktif, 3000); 
}

async function pantauTripAktif() {
    if (!activeTripId) return;
    try {
        const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
        const data = await res.json();
        
        if (!data) return;

        // Render Chat Jika Ada Pesan Baru
        if (data.chat) {
            const jmlChat = Object.keys(data.chat).length;
            if (jmlChat > jumlahPesanLamaDriver) {
                renderChat(data.chat);
                if (typeof bunyiKlakson === "function") bunyiKlakson();
            }
            jumlahPesanLamaDriver = jmlChat;
        }
    } catch (e) { console.error("Gagal pantau trip", e); }
}

function renderChat(chatData) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        // Jika sender == 'driver', itu pesan kita (posisi kanan). Jika 'user', posisi kiri.
        h += `<div class="msg ${c.sender === 'driver' ? 'msg-u' : 'msg-d'}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

function driverKirimChat() {
    const inp = document.getElementById('input-pesan');
    if(!inp.value.trim() || !activeTripId) return;
    
    // Memanggil fungsi dari core.js
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

// ==========================================
// 5. PENYELESAIAN ORDER & UPDATE SALDO
// ==========================================
async function driverKlikSelesai() {
    if (!confirm("Orderan sudah selesai dan penumpang sudah turun?")) return;

    // Hitung upah
    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);
    const jamSelesai = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        // 1. Beri tahu Firebase bahwa driver sudah menyelesaikan order
        await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status_driver: "selesai" })
        });

        // 2. Kalkulasi Uang & Orderan di Memori Lokal (Force Int)
        let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver')) || myDriver;
        
        savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
        savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;

        localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
        myDriver = savedData;

        // 3. Simpan Riwayat
        let riwayat = JSON.parse(localStorage.getItem('riwayat_ojek_driver')) || [];
        riwayat.push({ tujuan: currentTripData.tujuan, nominal: untung, jam: jamSelesai });
        localStorage.setItem('riwayat_ojek_driver', JSON.stringify(riwayat));

        alert(`Alhamdulillah! +Rp ${untung.toLocaleString()} berhasil ditambahkan ke pendapatan Anda.`);

        // 4. Reset Semua State & Matikan Interval
        clearInterval(monitorInterval);
        activeTripId = null;
        currentTripData = null;
        jumlahPesanLamaDriver = 0;
        
        // Matikan tombol online (Force Offline) agar aman
        isOnline = false;
        const btn = document.getElementById('btn-status');
        btn.innerText = "MASUK ONLINE";
        btn.style.background = "white"; 
        btn.style.color = "#10b981";

        // 5. Paksa Balik ke Dashboard Utama
        loadDashboard(); 

    } catch (e) {
        console.error(e);
        alert("Gagal update saldo! Cek koneksi internet Anda.");
    }
}

// ==========================================
// 6. HELPER: PINDAH LAYAR
// ==========================================
function tampilkanScreen(id) {
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-screen');
        s.classList.add('screen');
    });
    
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        target.classList.remove('screen');
        target.classList.add('active-screen');
    }
                            }
                
