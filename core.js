// ==========================================
// 1. KONFIGURASI DATABASE
// ==========================================
const DB_URL = "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app";

// ==========================================
// 2. LOGIKA TARIF & JARAK (VERSI UPDATE)
// ==========================================

/**
 * Pembulatan Harga ke Ribuan Terdekat
 */
function bulatkanHarga(nominal) {
    return Math.round(nominal / 1000) * 1000;
}

/**
 * Rumus Haversine (KM)
 */
function hitungJarakKm(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1)); 
}

/**
 * FUNGSI BARU: Hitung Tarif Spesifik Medan & Desa
 * @param {number} jarak - Jarak dalam KM
 * @param {string} namaDesa - Nama desa untuk cek medan
 * @param {number} hargaPerKm - (3000, 4000, atau 5000)
 */
function kalkulasiTarifMedan(jarak, namaDesa, hargaPerKm) {
    let tarifDasar = jarak * hargaPerKm;
    
    // Logika Medan Berat (Contoh: Desa di area pegunungan Kuningan)
    // Anda bisa menambah daftar kata kunci di sini
    const areaNanjak = ["Cisantana", "Palutungan", "Ipukan", "Gunung", "Puncak", "Pasir"];
    
    let isNanjak = areaNanjak.some(desa => namaDesa.includes(desa));
    
    if (isNanjak) {
        tarifDasar = tarifDasar * 1.3; // Tambah biaya 30% untuk medan berat
    }
    
    // Minimal tarif (Misal: Jarak dekat < 2km tetap bayar min 8rb)
    if (tarifDasar < 8000) tarifDasar = 8000;

    return bulatkanHarga(tarifDasar);
}

// ==========================================
// 3. LOGIKA NOTIFIKASI SUARA (KLAKSON)
// ==========================================
function bunyiKlakson() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square'; 
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio butuh interaksi user.");
    }
}

// ==========================================
// 4. LOGIKA CHAT & REAL-TIME (DATABASE)
// ==========================================
async function kirimPesanFirebase(orderId, pengirim, teks) {
    if (!teks.trim() || !orderId) return;
    try {
        await fetch(`${DB_URL}/orders/${orderId}/chat.json`, {
            method: 'POST',
            body: JSON.stringify({
                sender: pengirim,
                txt: teks,
                timestamp: new Date().getTime()
            })
        });
    } catch (e) { console.error("Chat Error"); }
}

async function cekStatusOrder(orderId) {
    if (!orderId) return null;
    const res = await fetch(`${DB_URL}/orders/${orderId}.json`);
    return await res.json();
}

// ==========================================
// 5. NAVIGASI UI
// ==========================================
function tampilkanScreen(idScreen) {
    document.querySelectorAll('.screen, .active-screen').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active-screen');
    });
    
    const target = document.getElementById(idScreen);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active-screen');
        window.scrollTo(0,0);
    }
}
    
