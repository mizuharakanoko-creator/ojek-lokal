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
