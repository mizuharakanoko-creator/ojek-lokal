// wilayah.js - Database Wilayah Layanan Masif
const dataWilayah = {
    "DKI Jakarta": [
        "Jakarta Pusat", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Utara", "Kepulauan Seribu"
    ],
    "Bandung Raya": [
        "Bandung Kota", "Kabupaten Bandung", "Bandung Barat", "Cimahi"
    ],
    "Bogor & Depok": [
        "Bogor Kota", "Kabupaten Bogor", "Depok Kota"
    ],
    "Tangerang Raya": [
        "Tangerang Kota", "Tangerang Selatan", "Kabupaten Tangerang"
    ],
    "Bekasi": [
        "Bekasi Kota", "Kabupaten Bekasi"
    ],
    "Priangan Timur": [
        "Garut", "Tasikmalaya", "Ciamis", "Banjar", "Pangandaran"
    ],
    "Cirebon Raya": [
        "Cirebon Kota", "Kabupaten Cirebon", "Indramayu", "Majalengka", "Kuningan"
    ],
    "Jawa Barat Utara": [
        "Karawang", "Subang", "Purwakarta"
    ],
    "Sukabumi & Cianjur": [
        "Sukabumi Kota", "Kabupaten Sukabumi", "Cianjur"
    ]
};

// Fungsi inisialisasi Dropdown Step 1
function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    if (!kecSelect) return;
    kecSelect.innerHTML = '<option value="">-- Pilih Wilayah Besar --</option>';
    
    for (let wilayah in dataWilayah) {
        let opt = document.createElement('option');
        opt.value = wilayah;
        opt.innerHTML = wilayah;
        kecSelect.appendChild(opt);
    }
}

// Fungsi inisialisasi Dropdown Step 2
function loadCities(wilayah) {
    const citySelect = document.getElementById('dest-city');
    const wrapper = document.getElementById('city-wrapper');
    if (!citySelect || !wrapper) return;

    citySelect.innerHTML = '<option value="">-- Pilih Kota/Kabupaten --</option>';
    
    if (wilayah && dataWilayah[wilayah]) {
        wrapper.style.display = 'block';
        dataWilayah[wilayah].forEach(area => {
            let opt = document.createElement('option');
            opt.value = area;
            opt.innerHTML = area;
            citySelect.appendChild(opt);
        });
    } else {
        wrapper.style.display = 'none';
    }
}
