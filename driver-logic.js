// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================
let myDriver = null; 
let isOnline = false;
let monitorInterval = null; 
let activeTripId = null;
let currentTripData = null; 
let jumlahPesanLamaDriver = 0;
let isLocked = false; // State untuk sistem iuran

document.addEventListener('DOMContentLoaded', () => {
    const savedProfile = localStorage.getItem('ojek_kuningan_driver');
    if (savedProfile) {
        myDriver = JSON.parse(savedProfile);
        // Cek iuran dulu sebelum masuk dashboard
        cekSistemAdminDanIuran();
    } else {
        tampilkanScreen('screen-register');
    }
});

// ==========================================
// 2. SISTEM ADMIN (LOCK & BROADCAST)
// ==========================================
async function cekSistemAdminDanIuran() {
    try {
        // 1. Ambil Setting Global (Broadcast & Global Lock)
        const resSettings = await fetch(`${DB_URL}/admin/settings.json`);
        const settings = await resSettings.json();
        
        if (settings) {
            // Tampilkan Broadcast jika ada
            if (settings.broadcast_msg) {
                const bcArea = document.getElementById('info-broadcast');
                const bcMsg = document.getElementById('msg-broadcast');
                bcArea.style.display = 'block';
                bcMsg.innerText = settings.broadcast_msg;
            }
        }

        // 2. Cek Status Iuran Driver di Database
        const resDriver = await fetch(`${DB_URL}/drivers/${myDriver.nik}.json`);
        const driverDb = await resDriver.json();

        if (driverDb && driverDb.is_locked === true) {
            isLocked = true;
            document.getElementById('lock-overlay').style.display = 'flex';
        } else {
            isLocked = false;
            document.getElementById('lock-overlay').style.display = 'none';
            loadDashboard();
        }
    } catch (e) {
        console.warn("Gagal terhubung ke server admin, masuk mode offline dashboard.");
        loadDashboard();
    }
}

// ==========================================
// 3. DASHBOARD & REGISTRASI
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
        rank: "#" + (Math.floor(Math.random() * 50) + 1),
        is_locked: false // Default driver baru tidak terkunci
    };

    localStorage.setItem('ojek_kuningan_driver', JSON.stringify(myDriver));
    
    // Simpan juga ke Firebase agar admin bisa pantau/kunci
    fetch(`${DB_URL}/drivers/${myDriver.nik}.json`, {
        method: 'PUT',
        body: JSON.stringify(myDriver)
    });

    loadDashboard();
}

function loadDashboard() {
    if (isLocked) return;
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

    // Render Performa (Lengkap)
    document.getElementById('stat-speed').innerText = myDriver.speed || "100%";
    document.getElementById('stat-accuracy').innerText = myDriver.accuracy || "100%";
    document.getElementById('stat-attitude').innerText = myDriver.attitude || "100%";
    document.getElementById('stat-rank').innerText = myDriver.rank || "#--";
}

// ==========================================
// 4. LOGIKA ONLINE & CARI ORDERAN
// ==========================================
function toggleOnline() {
    if (isLocked) return alert("Aplikasi terkunci. Silahkan selesaikan iuran.");
    
    isOnline = !isOnline;
    const btn = document.getElementById('btn-status');
    const listArea = document.getElementById('list-order-masuk');
    
    if (isOnline) {
        btn.innerText = "MASUK OFFLINE";
        btn.classList.add('btn-cancel'); // Pakai class dari style.css
        monitorInterval = setInterval(pantauOrderanBaru, 4000);
        listArea.innerHTML = '<p class="text-center" style="opacity:0.5; margin-top:20px;">Mencari orderan...</p>';
    } else {
        btn.innerText = "MASUK ONLINE";
        btn.classList.remove('btn-cancel');
        clearInterval(monitorInterval);
        listArea.innerHTML = '<p class="text-center" style="opacity:0.5; margin-top:20px;">Anda sedang Offline</p>';
    }
}

async function pantauOrderanBaru() {
    try {
        const res = await fetch(`${DB_URL}/orders.json`);
        const orders = await res.json();
        const listArea = document.getElementById('list-order-masuk');
        
        if (!orders) {
            listArea.innerHTML = '<p class="text-center" style="opacity:0.5; margin-top:20px;">Belum ada orderan...</p>';
            return;
        }

        let html = "";
        for (const id in orders) {
            const o = orders[id];
            
            if (o.status === "diambil" && o.driver_nik === myDriver.nik) {
                mulaiTripLayar(id, o);
                return;
            }

            if (o.status === "mencari_driver") {
                const sudahTawar = o.bids && o.bids[myDriver.nik];
                html += `
                <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1">
                        <small style="color:var(--primary); font-weight:bold;">TUJUAN:</small>
                        <div style="font-weight:800; font-size:15px; margin-bottom:5px;">${o.tujuan}</div>
                        <div style="color:var(--primary); font-weight:800; font-size:18px;">Rp ${o.upah.toLocaleString()}</div>
                    </div>
                    <div style="text-align:right">
                        <button class="btn-confirm" onclick="ambilOrder('${id}', ${o.upah})" style="padding:10px 20px; width:auto; margin-bottom:5px;">AMBIL</button>
                        ${sudahTawar 
                            ? `<br><small style="color:var(--accent); font-weight:bold;">Menunggu User...</small>`
                            : `<br><button class="btn-tawar" onclick="tawarHarga('${id}', ${o.upah})">TAWAR</button>`
                        }
                    </div>
                </div>`;
            }
        }
        listArea.innerHTML = html || '<p class="text-center" style="opacity:0.5; margin-top:20px;">Belum ada orderan...</p>';
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
            nik: myDriver.nik,
            rating: myDriver.rating
        })
    });
    alert("Tawaran terkirim!");
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
// 5. TRIP AKTIF & CHAT (SYNCHRONIZED)
// ==========================================
function mulaiTripLayar(id, data) {
    activeTripId = id;
    currentTripData = data;
    jumlahPesanLamaDriver = 0;
    clearInterval(monitorInterval);
    tampilkanScreen('screen-trip-driver');
    
    const infoUser = document.getElementById('info-user-trip');
    if(infoUser) {
        infoUser.innerHTML = `
            <div class="card" style="margin:0; background:var(--bg-light); border-left: 5px solid var(--primary);">
                <small style="color:var(--text-muted); font-weight:bold;">PENUMPANG:</small><br>
                <b style="font-size:18px;">Pelanggan Ojek Kuningan</b><br>
                <b style="color:var(--primary); font-size:16px;">ONGKOS: Rp ${(data.upah_final || data.upah).toLocaleString()}</b>
            </div>
        `;
    }
    
    document.getElementById('info-tujuan-trip').innerText = `Tujuan: ${data.tujuan}`;

    const navBtn = document.getElementById('link-navigasi');
    if(navBtn) {
        navBtn.onclick = () => {
            // Gunakan jemput_lat/lon dari data order
            window.open(`https://www.google.com/maps?q=${data.jemput_lat},${data.jemput_lon}`, '_blank');
        };
    }

    monitorInterval = setInterval(pantauTripAktif, 3000); 
}

async function pantauTripAktif() {
    if (!activeTripId) return;
    try {
        const res = await fetch(`${DB_URL}/orders/${activeTripId}.json`);
        const data = await res.json();
        if (!data) return;

        if (data.chat) {
            const jmlChat = Object.keys(data.chat).length;
            if (jmlChat > jumlahPesanLamaDriver) {
                renderChat(data.chat);
                if (typeof bunyiKlakson === "function") bunyiKlakson();
            }
            jumlahPesanLamaDriver = jmlChat;
        }

        // Cek jika user membatalkan orderan
        if (data.status === "dibatalkan") {
            alert("Maaf, orderan dibatalkan oleh penumpang.");
            clearInterval(monitorInterval);
            loadDashboard();
        }
    } catch (e) { console.error("Gagal pantau trip", e); }
}

function renderChat(chatData) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    let h = "";
    for (const id in chatData) {
        const c = chatData[id];
        h += `<div class="msg ${c.sender === 'driver' ? 'msg-u' : 'msg-d'}">${c.txt}</div>`;
    }
    box.innerHTML = h;
    box.scrollTop = box.scrollHeight;
}

function driverKirimChat() {
    const inp = document.getElementById('input-pesan');
    if(!inp.value.trim() || !activeTripId) return;
    kirimPesanFirebase(activeTripId, 'driver', inp.value);
    inp.value = "";
}

// ==========================================
// 6. PENYELESAIAN ORDER & UPDATE SALDO
// ==========================================
async function driverKlikSelesai() {
    if (!confirm("Orderan sudah selesai?")) return;

    const untung = parseInt(currentTripData.upah_final || currentTripData.upah || 0);
    const jamSelesai = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        await fetch(`${DB_URL}/orders/${activeTripId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status: "selesai", status_driver: "selesai" })
        });

        let savedData = JSON.parse(localStorage.getItem('ojek_kuningan_driver')) || myDriver;
        savedData.incomeToday = (parseInt(savedData.incomeToday) || 0) + untung;
        savedData.orderCount = (parseInt(savedData.orderCount) || 0) + 1;

        localStorage.setItem('ojek_kuningan_driver', JSON.stringify(savedData));
        myDriver = savedData;

        // Update ke Firebase juga untuk sinkronisasi admin
        fetch(`${DB_URL}/drivers/${myDriver.nik}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ 
                incomeToday: savedData.incomeToday, 
                orderCount: savedData.orderCount 
            })
        });

        alert(`Sukses! +Rp ${untung.toLocaleString()}`);

        clearInterval(monitorInterval);
        activeTripId = null;
        isOnline = false;
        loadDashboard(); 

    } catch (e) {
        alert("Gagal update data!");
    }
}

// ==========================================
// 7. HELPER: PINDAH LAYAR
// ==========================================
function tampilkanScreen(id) {
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-screen');
    });
    
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        target.classList.add('active-screen');
    }
        }
            
