// wilayah.js - Database Berjenjang (Kecamatan -> Desa)
const dataWilayah = {
    "Cigugur": {
        lat: -6.9712, lng: 108.4554, diff: 1.4, // Koordinat pusat kecamatan
        desa: [
            "Cigugur", "Sukamulya", "Cigadung", "Panyuran", 
            "Cisantana", "Cileuleuy", "Babakanmulya", "Cipari"
        ]
    },
    "Cilimus": {
        lat: -6.8864, lng: 108.4947, diff: 1.2,
        desa: [
            "Cilimus", "Bohtong", "Caracas", "Sampora", 
            "Kaliaren", "Bandorasa Kulon", "Bandorasa Wetan", "Linggaindah"
        ]
    },
    "Kuningan Kota": {
        lat: -6.9765, lng: 108.4841, diff: 1.0,
        desa: [
            "Kuningan", "Purwawinangun", "Cijoho", "Cirendang", 
            "Kasturi", "Winduhaji", "Ancaran", "Ciporang"
        ]
    },
    // NANTI LANJUTKAN CICILAN KECAMATAN LAIN DI SINI
};

// --- FUNGSI LOGIKA UPDATE ---

function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    if (!kecSelect) return;
    
    kecSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    for (let kecamatan in dataWilayah) {
        let opt = document.createElement('option');
        opt.value = kecamatan;
        opt.innerHTML = kecamatan;
        kecSelect.appendChild(opt);
    }
}

function loadCities(kecamatan) {
    const citySelect = document.getElementById('dest-city');
    const wrapper = document.getElementById('city-wrapper');
    if (!citySelect || !wrapper) return;

    citySelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    
    if (kecamatan && dataWilayah[kecamatan]) {
        wrapper.style.display = 'block';
        // Ambil array desa dari kecamatan yang dipilih
        dataWilayah[kecamatan].desa.forEach((namaDesa) => {
            let opt = document.createElement('option');
            opt.value = namaDesa; // Value berupa nama desa untuk dikirim ke driver
            opt.innerHTML = namaDesa;
            citySelect.appendChild(opt);
        });
    } else {
        wrapper.style.display = 'none';
    }
        }
                                            
