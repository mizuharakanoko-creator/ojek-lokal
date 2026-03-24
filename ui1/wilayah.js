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
        "Kadugede": {
        lat: -7.0012, lng: 108.4612, diff: 1.2,
        desa: ["Kadugede", "Babatan", "Cipado", "Cisukadana", "Nusaherang", "Sindangjawa", "Tinggar", "Windujanten"]
    },
    "Darma": {
        lat: -7.0423, lng: 108.4123, diff: 1.3,
        desa: ["Darma", "Bakom", "Cigasong", "Cikupa", "Gunungsari", "Jagara", "Karangsari", "Paninggaran", "Parung", "Sakasari"]
    },
    "Selajambe": {
        lat: -7.1212, lng: 108.4621, diff: 1.5,
        desa: ["Selajambe", "Bagawat", "Cambereti", "Cantilan", "Jamberama", "Kutawaringin", "Padahurip"]
    },
    "Subang": {
        lat: -7.1523, lng: 108.5421, diff: 1.5,
        desa: ["Subang", "Cilebak", "Jatisari", "Pamulihan", "Situgede", "Tanggerang", "Bangunjaya"]
    },
    "Luragung": {
        lat: -7.0212, lng: 108.6321, diff: 1.0,
        desa: ["Luragung", "Cidahu", "Cikadu", "Dukuhpicung", "Margasari", "Sindangsari", "Wadasiluhur"]
    },
    "Ciawigebang": {
        lat: -6.9634, lng: 108.5912, diff: 1.0,
        desa: ["Ciawigebang", "Ciawilor", "Cidahu", "Geresik", "Kadurama", "Kapandayan", "Pajawanlor", "Sidaraja"]
    },
    "Cidahu": {
        lat: -6.9212, lng: 108.6421, diff: 1.0,
        desa: ["Cidahu", "Ceurik", "Cihideunggirang", "Cihideunghilir", "Datar", "Legok", "Nanggela"]
    },
    "Jalaksana": {
        lat: -6.9124, lng: 108.4891, diff: 1.2,
        desa: ["Jalaksana", "Babakanmulya", "Maniskidul", "Manislor", "Sadamantra", "Sangkanerang", "Sangkanurip"]
    },
    "Mandirancan": {
        lat: -6.8156, lng: 108.4735, diff: 1.3,
        desa: ["Mandirancan", "Cadeba", "Cisantana", "Nanggela", "Salakadomas", "Sukasari", "Trijaya"]
    },
    "Pasawahan": {
        lat: -6.8324, lng: 108.4354, diff: 1.4,
        desa: ["Pasawahan", "Cidahu", "Cimara", "Kaduela", "Padamatang", "Paniis", "Singkup"]
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
                                            
