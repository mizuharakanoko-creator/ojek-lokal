// --- Identity & Motto System ---

const mottos = [
    '"The system has chosen you to become the strongest driver."',
    '"Level up is the only way to survive the road."',
    '"Shadows follow where the sovereign leads."',
    '"Precision is not an option, it is a requirement."',
    '"A king is only as strong as his route mastery."'
];

function updateMotto() {
    const mottoElement = document.getElementById('motto-text');
    if (mottoElement) {
        const randomMotto = mottos[Math.floor(Math.random() * mottos.length)];
        mottoElement.innerText = randomMotto;
    }
}

// Inisialisasi saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    updateMotto();
    // Anda bisa menambahkan logika perubahan bingkai berdasarkan Rank di sini nanti
});











// --- Attribute Chart Logic ---
// Fungsi untuk simulasi update stat (Jika dibutuhkan nanti)
function updateAttributes(data) {
    // Di sini Anda bisa memanipulasi points pada polygon .data-line secara dinamis
    console.log("Attributes updated with new system data.");
}

// Event Listener untuk integrasi Weather (Debuff)
function syncWeatherToStats(weather) {
    const rainSlot = document.getElementById('slot-rain');
    if (weather === 'rain') {
        rainSlot.style.display = 'block';
    } else {
        rainSlot.style.display = 'none';
    }
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
    // Sembunyikan slot rain secara default
    syncWeatherToStats('clear');
});
