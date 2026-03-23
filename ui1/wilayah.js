// wilayah.js
const dataWilayah = {
    "Cibeunying": ["Cicadas", "Sukapada", "Padasuka"],
    "Coblong": ["Dago", "Sadang Serang", "Sekeloa"],
    // Tambahkan ribuan data lainnya di sini nanti
};

function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    for (let kec in dataWilayah) {
        let opt = document.createElement('option');
        opt.value = kec;
        opt.innerHTML = kec;
        kecSelect.appendChild(opt);
    }
}

function loadCities(kec) {
    const citySelect = document.getElementById('dest-city');
    const wrapper = document.getElementById('city-wrapper');
    citySelect.innerHTML = '<option value="">-- Pilih Kelurahan --</option>';
    
    if(kec && dataWilayah[kec]) {
        wrapper.style.display = 'block';
        dataWilayah[kec].forEach(city => {
            let opt = document.createElement('option');
            opt.value = city;
            opt.innerHTML = city;
            citySelect.appendChild(opt);
        });
    } else {
        wrapper.style.display = 'none';
    }
}
