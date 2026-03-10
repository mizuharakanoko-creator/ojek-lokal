// ==========================================
// 1. KONFIGURASI DATABASE
// ==========================================
const DB_URL = "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app";

// ==========================================
// 2. LOGIKA TARIF & JARAK
// ==========================================

/**
 * Pembulatan Harga ke Ribuan Terdekat (Poin 2: Tanpa Receh)
 * Contoh: 14.200 -> 14.000 | 14.600 -> 15.000
 */
function bulatkanHarga(nominal) {
    return Math.round(nominal / 1000) * 1000;
}

/**
 * Rumus Haversine untuk menghitung jarak antara dua koordinat GPS (KM)
 */
function hitungJarakKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const jarak = R * c;
    return jarak.toFixed(1); // Mengembalikan 1 angka di belakang koma
}

// ==========================================
// 3. LOGIKA NOTIFIKASI SUARA (KLAKSON)
// ==========================================

/**
 * Menghasilkan suara buzzer/klakson menggunakan Web Audio API
 * (Bekerja tanpa perlu file mp3 tambahan)
 */
function bunyiKlakson() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square'; // Suara tegas seperti klakson
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio diblokir browser. Butuh interaksi user dahulu.");
    }
}

// ==========================================
// 4. LOGIKA CHAT & REAL-TIME
// ==========================================

/**
 * Mengirim pesan ke Firebase
 */
async function kirimPesanFirebase(orderId, pengirim, teks) {
    if (!teks.trim() || !orderId) return;
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
 * Mengecek data order secara keseluruhan
 */
async function cekStatusOrder(orderId) {
    if (!orderId) return null;
    try {
        const res = await fetch(`${DB_URL}/orders/${orderId}.json`);
        return await res.json();
    } catch (e) {
        return null;
    }
}

// ==========================================
// 5. LOGIKA TIMER & NAVIGASI UI
// ==========================================

/**
 * Timer Keamanan (Poin 2 Driver: Tombol selesai aktif setelah durasi tertentu)
 */
function jalankanTimerSelesai(durasiDetik, callbackUpdate, callbackFinish) {
    let sisaWaktu = durasiDetik;
    const timer = setInterval(() => {
        sisaWaktu--;
        
        const menit = Math.floor(sisaWaktu / 60);
        const detik = sisaWaktu % 60;
        const formatWaktu = `${menit}m ${detik < 10 ? '0' + detik : detik}s`;
        
        callbackUpdate(formatWaktu);

        if (sisaWaktu <= 0) {
            clearInterval(timer);
            callbackFinish(); // Pemicu tombol Selesai jadi aktif
        }
    }, 1000);
    return timer;
}

/**
 * Navigasi antar layar aplikasi dengan animasi CSS
 */
function tampilkanScreen(idScreen) {
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.classList.remove('active-screen');
        s.classList.add('screen');
    });
    
    const target = document.getElementById(idScreen);
    if (target) {
        target.classList.remove('screen');
        target.classList.add('active-screen');
        window.scrollTo(0,0); // Reset posisi scroll ke atas
    }
                                         }
