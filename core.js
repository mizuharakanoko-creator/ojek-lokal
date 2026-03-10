// Konfigurasi Database - Gunakan URL Firebase Anda
const DB_URL = "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app";

/**
 * LOGIKA TARIF & JARAK
 */

// Poin 2: Fungsi Pembulatan ke Ribuan terdekat (Tidak ada receh)
function bulatkanHarga(nominal) {
    // Contoh: 14.200 -> 14.000 | 14.600 -> 15.000
    return Math.round(nominal / 1000) * 1000;
}

// Fungsi Hitung Jarak (Rumus Haversine)
function hitungJarakKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Mengembalikan jarak dengan 1 angka di belakang koma
}

/**
 * LOGIKA CHAT REAL-TIME (Poin 4 & 5)
 */

// Fungsi Kirim Pesan
async function kirimPesanFirebase(orderId, pengirim, teks) {
    if (!teks.trim()) return;
    try {
        await fetch(`${DB_URL}/orders/${orderId}/chat.json`, {
            method: 'POST',
            body: JSON.stringify({
                sender: pengirim, // 'user' atau 'driver'
                txt: teks,
                timestamp: new Date().getTime()
            })
        });
    } catch (e) {
        console.error("Gagal kirim chat:", e);
    }
}

/**
 * LOGIKA SINKRONISASI (Poin 1)
 */

// Fungsi untuk cek apakah order masih aktif atau sudah selesai/dihapus
async function cekStatusOrder(orderId) {
    const res = await fetch(`${DB_URL}/orders/${orderId}.json`);
    return await res.json();
}

/**
 * LOGIKA TIMER KEAMANAN (Poin 2 di Driver)
 */

function jalankanTimerSelesai(durasiDetik, callbackUpdate, callbackFinish) {
    let sisaWaktu = durasiDetik;
    const timer = setInterval(() => {
        sisaWaktu--;
        
        // Kirim update ke tampilan
        const menit = Math.floor(sisaWaktu / 60);
        const detik = sisaWaktu % 60;
        callbackUpdate(`${menit}m ${detik}s`);

        if (sisaWaktu <= 0) {
            clearInterval(timer);
            callbackFinish(); // Aktifkan tombol selesai
        }
    }, 1000);
    return timer;
}

/**
 * UI HELPER (Poin 4: Animasi Loading)
 */

function tampilkanScreen(idScreen) {
    // Sembunyikan semua screen dulu
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.classList.remove('active-screen');
        s.classList.add('screen');
    });
    // Tampilkan yang dipilih
    const target = document.getElementById(idScreen);
    if (target) {
        target.classList.remove('screen');
        target.classList.add('active-screen');
    }
}
