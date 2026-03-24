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
        "Garawangi": {
        lat: -6.9956, lng: 108.5234, diff: 1.1,
        desa: ["Garawangi", "Cikananga", "Cirukem", "Giriwaringin", "Kutakembaran", "Mancagar", "Purwasari", "Tambakbaya"]
    },
    "Lebakwangi": {
        lat: -7.0012, lng: 108.5642, diff: 1.0,
        desa: ["Lebakwangi", "Bendungan", "Cipasung", "Langseb", "Mancagar", "Pagundan", "Pasayangan"]
    },
    "Cimahi (Kuningan)": {
        lat: -7.0345, lng: 108.6721, diff: 1.1,
        desa: ["Cimahi", "Batuasri", "Cikeusal", "Gunungaci", "Mulyajaya", "Sukajaya"]
    },
    "Cibingbin": {
        lat: -7.0812, lng: 108.7321, diff: 1.2,
        desa: ["Cibingbin", "Bantarpanjang", "Cisaat", "Ciujung", "Dukuhbadag", "Sindangjawa", "Sukaharja"]
    },
    "Ciwaru": {
        lat: -7.0812, lng: 108.6321, diff: 1.3,
        desa: ["Ciwaru", "Baok", "Citikur", "Garajati", "Linggajaya", "Sagaranten", "Sumberjaya"]
    },
    "Karangkancana": {
        lat: -7.1123, lng: 108.6521, diff: 1.4,
        desa: ["Karangkancana", "Cihanjaro", "Jabareanti", "Margacina", "Sukamaju", "Tanjungkertha"]
    },
    "Cilebak": {
        lat: -7.1645, lng: 108.5121, diff: 1.5,
        desa: ["Cilebak", "Cabulan", "Cisakti", "Jalatrang", "Legokherang", "Patala"]
    },
    "Hantara": {
        lat: -7.0812, lng: 108.4923, diff: 1.4,
        desa: ["Hantara", "Bunigeulis", "Cikiray", "Pasiragung", "Trijaya"]
    },
    "Ciniru": {
        lat: -7.0542, lng: 108.5212, diff: 1.3,
        desa: ["Ciniru", "Cijemit", "Cipedes", "Longkewang", "Pamupukan", "Pinara"]
    },
    "Sindangagung": {
        lat: -6.9721, lng: 108.5142, diff: 1.0,
        desa: ["Sindangagung", "Babakanreuma", "Balong", "Kertawangunan", "Kertayasa", "Mekarmukti"]
        }
        "Cigandamekar": {
        lat: -6.8745, lng: 108.5122, diff: 1.1,
        desa: ["Babakanjati", "Bunarigede", "Cigandamekar", "Indraprahasta", "Koreak", "Sangkanerang", "Timbang"]
    },
    "Pancalang": {
        lat: -6.8021, lng: 108.4982, diff: 1.2,
        desa: ["Pancalang", "Mekarjaya", "Patalagan", "Rajawetan", "Sarewu", "Sindangkempeng", "Tajurbuntu"]
    },
    "Japara": {
        lat: -6.9245, lng: 108.5231, diff: 1.1,
        desa: ["Japara", "Cengal", "Cikeleng", "Dukuhdalem", "Kalimati", "Rajadanu", "Singkup"]
    },
    "Kramatmulya": {
        lat: -6.9452, lng: 108.4921, diff: 1.0,
        desa: ["Kramatmulya", "Bohtong", "Cikaso", "Cilaja", "Gereba", "Kalapagunung", "Pajambon", "Ragawacana"]
    },
    "Cipicung": {
        lat: -6.9412, lng: 108.5423, diff: 1.1,
        desa: ["Cipicung", "Cimaranten", "Mekarsari", "Muncungela", "Pamulihan", "Salareuma", "Sugandajaya"]
    },
    "Maleber": {
        lat: -7.0123, lng: 108.5942, diff: 1.1,
        desa: ["Maleber", "Bunigeulis", "Cigedang", "Galaherang", "Kaduagung", "Mekarsari", "Padamulya"]
    },
    "Kalimanggis": {
        lat: -6.9712, lng: 108.6321, diff: 1.0,
        desa: ["Kalimanggis", "Cipasung", "Kalimanggis Kulon", "Kalimanggis Wetan", "Kertawana", "Pinigara"]
    },
    "Cibeureum": {
        lat: -7.0512, lng: 108.6921, diff: 1.2,
        desa: ["Cibeureum", "Cikadu", "Cimara", "Kawungsari", "Sukamaju", "Sukanegeara", "Tarikolot"]
    },
    "Nusaherang": {
        lat: -7.0145, lng: 108.4421, diff: 1.2,
        desa: ["Nusaherang", "Ciamis", "Ciawi", "Haurkuning", "Jurasari", "Windusari"]
            }
            
        
        
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
                                            
