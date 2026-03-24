// wilayah.js - Database Wilayah Layanan
const dataWilayah = {
    "Bandung Kota": [
        "Andir", "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay", 
        "Bandung Kidul", "Bandung Kulon", "Bandung Nyengseret", "Bandung Wetan", 
        "Batununggal", "Bojongloa Kaler", "Bojongloa Kidul", "Buahbatu", 
        "Cibeunying Kaler", "Cibeunying Kidul", "Cibiru", "Cicendo", 
        "Cidadap", "Cinambo", "Coblong", "Gedebage", "Kiaracondong", 
        "Lengkong", "Mandalajati", "Panyileukan", "Rancasari", 
        "Regol", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung"
    ],
    "Kabupaten Bandung": [
        "Arjasari", "Baleendah", "Banjaran", "Bohtongsoang", "Cangkuang", 
        "Cicalengka", "Cikancung", "Cilengkrang", "Cileunyi", "Cimaung", 
        "Cimeunyan", "Ciparay", "Ciwidey", "Dayeuhkolot", "Ibun", 
        "Katapang", "Kertasari", "Kutawaringin", "Majalaya", "Margaasih", 
        "Margahayu", "Nagreg", "Pacet", "Pameungpeuk", "Pangalengan", 
        "Paseh", "Pasirjambu", "Rancabali", "Solokanjeruk", "Soreang"
    ],
    "Bandung Barat": [
        "Batujajar", "Cihampelas", "Cikalongwetan", "Cililin", "Cipatat", 
        "Cipeundeuy", "Cipongkor", "Cisarua", "Gununghalu", "Lembang", 
        "Ngamprah", "Padalarang", "Parongpong", "Rongga", "Sindangkerta", "Saguling"
    ],
    "Cimahi": [
        "Cimahi Selatan", "Cimahi Tengah", "Cimahi Utara"
    ]
};

// Fungsi untuk mengisi Dropdown Kecamatan saat halaman dimuat
function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    if (!kecSelect) return;

    kecSelect.innerHTML = '<option value="">-- Pilih Wilayah --</option>';
    
    for (let wilayah dalam dataWilayah) {
        let opt = document.createElement('option');
        opt.value = wilayah;
        opt.innerHTML = wilayah;
        kecSelect.appendChild(opt);
    }
}

// Fungsi untuk mengisi Dropdown Kelurahan setelah Kecamatan dipilih
function loadCities(wilayah) {
    const citySelect = document.getElementById('dest-city');
    const wrapper = document.getElementById('city-wrapper');
    
    if (!citySelect || !wrapper) return;

    citySelect.innerHTML = '<option value="">-- Pilih Kecamatan/Kelurahan --</option>';
    
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
