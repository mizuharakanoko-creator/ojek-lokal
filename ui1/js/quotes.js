const quotes = [
    "Driver hebat tidak hanya cepat, tetapi selalu sampai dengan selamat.",
    "Konsistensi adalah kunci untuk mencapai level tertinggi.",
    "Setiap pengiriman adalah misi yang berharga.",
    "Keamanan pelanggan adalah prioritas utama sistem."
];

function updateQuote() {
    const quoteElement = document.getElementById('daily-quote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.innerText = `"${quotes[randomIndex]}"`;
}

// Update saat halaman dimuat
window.onload = updateQuote;
