// wilayah.js
const dataWilayah = {
    "Cibeunying": ["Cicadas", "Sukapada", "Padasuka"],
    "Coblong": ["Dago", "Sadang Serang", "Sekeloa"],
    "Lengkong": ["Malabar", "Burangrang", "Turangga"]
};

function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    // Bersihkan dulu
    kecSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    
    for (let kec in dataWilayah) {
        let opt = document.createElement('option');
        opt.value = kec;
        opt.innerHTML = kec;
        kecSelect.appendChild(opt);
    }
}
