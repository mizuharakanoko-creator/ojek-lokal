// Database Koordinat Pusat Kecamatan untuk hitung Jarak
const koordinatKecamatan = {
    "Kuningan": {lat: -6.976, lon: 108.483},
    "Cigugur": {lat: -6.975, lon: 108.460},
    "Kadugede": {lat: -6.995, lon: 108.465},
    "Nusaherang": {lat: -7.000, lon: 108.445},
    "Darma": {lat: -7.010, lon: 108.410},
    "Selajambe": {lat: -7.110, lon: 108.470},
    "Subang": {lat: -7.135, lon: 108.540},
    "Cilebak": {lat: -7.150, lon: 108.510},
    "Ciwaru": {lat: -7.060, lon: 108.620},
    "Karangkancana": {lat: -7.090, lon: 108.630},
    "Cibingbin": {lat: -7.065, lon: 108.695},
    "Cibeureum": {lat: -7.030, lon: 108.670},
    "Luragung": {lat: -7.001, lon: 108.611},
    "Cimahi": {lat: -6.950, lon: 108.670},
    "Cidahu": {lat: -6.938, lon: 108.625},
    "Kalimanggis": {lat: -6.965, lon: 108.620},
    "Ciawigebang": {lat: -6.955, lon: 108.591},
    "Cipicung": {lat: -6.955, lon: 108.535},
    "Lebakwangi": {lat: -6.990, lon: 108.570},
    "Maleber": {lat: -7.015, lon: 108.560},
    "Garawangi": {lat: -6.990, lon: 108.530},
    "Ciniru": {lat: -7.050, lon: 108.520},
    "Hantara": {lat: -7.070, lon: 108.470},
    "Sindangagung": {lat: -6.965, lon: 108.515},
    "Kramatmulya": {lat: -6.940, lon: 108.490},
    "Jalaksana": {lat: -6.915, lon: 108.490},
    "Cilimus": {lat: -6.885, lon: 108.505},
    "Cigandamekar": {lat: -6.870, lon: 108.520},
    "Mandirancan": {lat: -6.840, lon: 108.480},
    "Pancalang": {lat: -6.820, lon: 108.510},
    "Pasawahan": {lat: -6.830, lon: 108.440},
    "Chiauwi Lor": {lat: -6.960, lon: 108.580}
};

// Database Desa Lengkap (Contoh Desa Pelosok & Kota)
const dataWilayah = {
    "Kuningan": ["Ancaran", "Cijoho", "Cipurwasari", "Kuningan", "Windusengkahan", "Purwawinangun", "Kasturi", "Cipari", "Cigintung"],
    "Cigugur": ["Cigugur", "Sukamulya", "Cigadung", "Puncak", "Cisantana", "Babakanmulya"],
    "Kadugede": ["Kadugede", "Cipadu", "Sindangjawa", "Nusaherang", "Cisukadana", "Babatan", "Tinggar"],
    "Darma": ["Darma", "Cipari", "Bakom", "Paninggaran", "Sagarahiang", "Gunungmanik", "Parung"],
    "Luragung": ["Luragung Landeuh", "Luragung Heuyeuh", "Cirahayu", "Cigedang", "Sindangsari", "Dukuhtengah", "Cikadu"],
    "Ciawigebang": ["Ciawigebang", "Kapandayan", "Sidaraja", "Sukadana", "Ciawilor", "Pajawanlor", "Geresik", "Ciomas"],
    "Cilimus": ["Bandorasa Wetan", "Bojong", "Cilimus", "Sampora", "Linggarjati", "Caracas", "Kaliaren"],
    "Subang": ["Subang", "Cilebak", "Pamulihan", "Tanggerang", "Jatisari", "Situgede"],
    "Selajambe": ["Selajambe", "Cambera", "Cibubur", "Bagawat", "Kutawaringin"],
    "Cibingbin": ["Cibingbin", "Cisapi", "Ciantan", "Cipondok", "Sukaharja", "Dukuhbadag"],
    "Ciniru": ["Ciniru", "Cijemit", "Chipasung", "Pamupukan", "Rambacana"],
    "Ciwaru": ["Ciwaru", "Linggajaya", "Citundun", "Lebakherang", "Baok"],
    "Maleber": ["Maleber", "Galaherang", "Kutamandarakan", "Ciporang", "Parakan"],
    "Jalaksana": ["Jalaksana", "Sangkanerang", "Maniskidul", "Sadahayu", "Peusing"],
    "Mandirancan": ["Mandirancan", "Sukasari", "Cisantana", "Salakadomas", "Nanggela"],
    "Cidahu": ["Cidahu", "Cieurih", "Legok", "Cibulan", "Dukuhtengah"],
    "Hantara": ["Hantara", "Bunigeulis", "Pasiragung", "Trijaya"],
    "Cibeureum": ["Cibeureum", "Sukarapi", "Cimara", "Kawungsari"],
    "Kramatmulya": ["Kramatmulya", "Cilaja", "Gereba", "Cikubangsari"],
    "Sindangagung": ["Sindangagung", "Babakanreuma", "Kertayasa", "Mekarmukti"],
    "Pasawahan": ["Pasawahan", "Paniis", "Cidahu", "Singkup"],
    "Pancalang": ["Pancalang", "Sarewu", "Tajurbuntu", "Mekarjaya"],
    "Cimahi": ["Cimahi", "Cikeusal", "Gunungsari", "Mulyajaya"],
    "Kalimanggis": ["Kalimanggis Kulon", "Kalimanggis Lor", "Cipanengah"],
    "Cipicung": ["Cipicung", "Susukan", "Mekarsari", "Salareuma"],
    "Lebakwangi": ["Lebakwangi", "Mancagar", "Cinagara", "Cipetir"],
    "Garawangi": ["Garawangi", "Cikananga", "Purwasari", "Sukaimut"],
    "Cigandamekar": ["Cigandamekar", "Sangkanmulya", "Koreak", "Panawuan"],
    "Nusaherang": ["Nusaherang", "Cikadu", "Haurkuning", "Windusari"],
    "Cilebak": ["Cilebak", "Legokherang", "Mandapajaya"],
    "Karangkancana": ["Karangkancana", "Simpayjaya", "Cihanjaro", "Tanjungkerta"],
    "Sindangagung": ["Sindangagung", "Babakanreuma", "Kertayasa", "Mekarmukti"]
};

// Fungsi Helper untuk mengisi Dropdown (digunakan di index.html)
function inisialisasiWilayah() {
    const selectKec = document.getElementById('select-kecamatan');
    if (!selectKec) return;
    
    // Sortir kecamatan agar sesuai abjad
    const daftarKec = Object.keys(koordinatKecamatan).sort();
    
    daftarKec.forEach(kec => {
        let opt = document.createElement('option');
        opt.value = kec;
        opt.text = kec;
        selectKec.add(opt);
    });
}

// Jalankan saat file dimuat
document.addEventListener('DOMContentLoaded', inisialisasiWilayah);
  
