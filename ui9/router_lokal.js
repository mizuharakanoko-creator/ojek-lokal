// ==========================================
// ROUTER LOKAL: DATABASE WILAYAH & SHARDING
// ==========================================

// 1. Kamus Singkatan Kecamatan (Kunci Shard Database)
const ZONA_MAP = {
    "KNG": "Kuningan Kota",
    "KGD": "Kadugede",
    "CGR": "Cigugur", 
    "JLS": "Jalaksana",
    "KRAMAT": "Kramatmulya",
    "CLM": "Cilimus",
    "DRM": "Darma",
    "CWG": "Ciawigebang", 
    "CBR": "Cibeureum", 
    "CBB": "Cibingbin",
    "CDH": "Cidahu",
    "CMK": "Cigandamekar",
    "LRG": "Luragung"
    // Tambahkan singkatan lain jika perlu
};

// 2. Database Presisi (Data yang kamu berikan)
const LOKASI_DB = {
    "Cigugur": {
        lat: -6.960499, lng: 108.449936,
        desa: [
            { name: "Babakanmulya", lat: -6.973436, lng: 108.438999, diff: 1.3 },
            { name: "Cigadung", lat: -6.984945, lng: 108.464718, diff: 1.0 },
            { name: "Graha Alana", lat: -6.986932, lng: 108.473391, diff: 1.1 },
            { name: "Gubug Cigadung", lat: -6.985337, lng: 108.458607, diff: 1.0 },
{ name: "Cigugur", lat: -6.969728, lng: 108.456378, diff: 1.1 },
            { name: "Cileuleuy", lat: -6.980359, lng: 108.450340, diff: 1.1 },
            { name: "Cipari", lat: -6.962893, lng: 108.467001, diff: 1.1 },
            { name: "Cisantana", lat: -6.959070, lng: 108.450192, diff: 1.3 },
            { name: "Gunungkeling", lat: -6.950131, lng: 108.468031, diff: 1.2 },
            { name: "Puncak", lat: -6.970541, lng: 108.434405, diff: 1.4 },
{ name: "Mulya Asih", lat: -6.963687, lng: 108.425946, diff: 1.5 },
            { name: "Sukamulya", lat: -6.978258, lng: 108.459926, diff: 1.1 },
            { name: "Babakan Cigadung", lat: -6.989562, lng: 108.470261, diff: 1.0 },
            { name: "Palutungan", lat: -6.942973, lng: 108.441135, diff: 1.5 },
            { name: "Kamukten", lat: -6.981355, lng: 108.467490, diff: 1.0 },
            { name: "Dano Cisantana", lat: -6.960251, lng: 108.446321, diff: 1.3 },
            { name: "Sukamanah Cisantana", lat: -6.957812, lng: 108.446215, diff: 1.3 },
            { name: "Perum Quanta II", lat: -6.986356, lng: 108.449396, diff: 1.3 },
            { name: "Perum Pesona Alam", lat: -6.953115, lng: 108.465663, diff: 1.2 },
            { name: "Perum Korpri", lat: -6.960831, lng: 108.481004, diff: 1.1 },
            { name: "Perum Mulia Land", lat: -6.958914, lng: 108.477200, diff: 1.1 },
            { name: "Perum Pesona Anggrek", lat: -6.958168, lng: 108.475735, diff: 1.1 },
            { name: "Perum Taman Anggrek", lat: -6.958247, lng: 108.473830, diff: 1.1 },
            { name: "Perum Cigadung Regency", lat: -6.985609, lng: 108.450918, diff: 1.2 },
            { name: "Talaga Surian", lat: -6.952836, lng: 108.429474, diff: 1.5 },
            { name: "Lumbu", lat: -6.966740, lng: 108.452822, diff: 1.2 },
            { name: "Lumbu Kotaku", lat: -6.965970, lng: 108.451908, diff: 1.2 },
            { name: "Mayasih", lat: -6.969030, lng: 108.453074, diff: 1.1 },
            { name: "Perum Btn Cigugur", lat: -6.972149, lng: 108.462933, diff: 1.0 },
            { name: "Alun Alun Cigugur", lat: -6.968500, lng: 108.459604, diff: 1.0 },
            { name: "Rs Sekar Kamulyan", lat: -6.968761, lng: 108.455500, diff: 1.1 },
            { name: "Paseban Cigugur", lat: -6.969472, lng: 108.456558, diff: 1.0 },
            { name: "SMK Karya Nasional", lat: -6.954792, lng: 108.469258, diff: 1.1 },
            { name: "SMAN 1 Cigugur", lat: -6.983891, lng: 108.462551, diff: 1.0 },
            { name: "SMKN 1 Kuningan", lat: -6.975926, lng: 108.455348, diff: 1.1 },
            { name: "SMKN 2 Kuningan", lat: -6.980180, lng: 108.461465, diff: 1.0 },
            { name: "Winduherang", lat: -6.970923, lng: 108.472100, diff: 1.0 }
        ]
    },
    "Cibeureum": {
        lat: -7.083515, lng: 108.721566,
        desa: [
            { name: "Cibeureum", lat: -7.049924, lng: 108.723611, diff: 1.1 },
            { name: "Cimara", lat: -7.087659, lng: 108.707379, diff: 1.1 },
            { name: "Kawungsari", lat: -7.078340, lng: 108.722270, diff: 1.1 },
            { name: "Randusari", lat: -7.055894, lng: 108.708556, diff: 1.1 },
            { name: "Sukadana", lat: -7.037769, lng: 108.721279, diff: 1.1 },
            { name: "Sukarapih", lat: -7.082335, lng: 108.721310, diff: 1.1 },
            { name: "Sumurwiru", lat: -7.072859, lng: 108.729604, diff: 1.1 },
            { name: "Tarikolot", lat: -7.044098, lng: 108.729637, diff: 1.1 }
        ]
    },
    "Ciawigebang": {
        lat: -6,9516992, lng: 108,5885916,
        desa: [
            { name: "Ciawilor", lat: -6,9649463, lng: 108,5784414, diff: 1.0 },
            { name: "Ciawigebang", lat: -6,9726675, lng: 108,5824775, diff: 1.0 },
            { name: "Cigarukgak", lat: -6,9451205, lng: 108,6040066, diff: 1.0 },
            { name: "Cihaur", lat: -6,9527343, lng: 108,5722791, diff: 1.0 },
            { name: "Cijagamulya", lat: -6,9732043, lng: 108,5541748, diff: 1.0 },
            { name: "Cikubangmulya", lat: -6,9354065, lng: 108,6241969, diff: 1.0 },
            { name: "Ciomas", lat: -6,9753229, lng: 108,5616471, diff: 1.0 },
            { name: "Ciputat", lat: -6,9813075, lng: 108,5830361, diff: 1.0 },
            { name: "Dukuhdalem", lat: -6,9689269, lng: 108,5635404, diff: 1.0 },
            { name: "Geresik", lat: -6,9869533, lng: 108,6057155, diff: 1.0 },
            { name: "Kadurama", lat: -6,9745505, lng: 108,5972957, diff: 1.0 },
            { name: "Kapandayan", lat: -6,9779613, lng: 108,5756399, diff: 1.0 },
            { name: "Karamatmulya", lat: -6,9979547, lng: 108,6043881, diff: 1.0 },
            { name: "Karangkamulyan", lat: -6,9604890, lng: 108,5848573, diff: 1.0 },
            { name: "Lebaksiuh", lat: -6,9911141, lng: 108,5909808, diff: 1.0 },
            { name: "Mekarjaya", lat: -6,9410588, lng: 108,5795277, diff: 1.0 },
            { name: "Padarama", lat: -6,9161333, lng: 108,5943842, diff: 1.0 },
            { name: "Pajawanlor", lat: -6,9884987, lng: 108,5794516, diff: 1.0 },
            { name: "Pamijahan", lat: -6,9643292, lng: 108,5931332, diff: 1.0 },
            { name: "Pangkalan", lat: -6,9666425, lng: 108,5692029, diff: 1.0 },
            { name: "Sidaraja", lat: -6,9848208, lng: 108,5714647, diff: 1.0 },
            { name: "Sukadana", lat: -6,9291923, lng: 108,6120519, diff: 1.0 },
            { name: "Sukaraja", lat: -6,9303236, lng: 108,5823762, diff: 1.0 },
            { name: "Cihirup", lat: -6,9284331, lng: 108,6303730, diff: 1.0 }
        ]
    },
    "Kuningan Kota": {
        lat: -6.9765, lng: 108.4841,
        desa: [
            { name: "Kuningan", lat: -6.9765, lng: 108.4841, diff: 1.0 },
            { name: "Purwawinangun", lat: -6.9721, lng: 108.4852, diff: 1.0 },
            { name: "Cijoho", lat: -6.9654, lng: 108.4832, diff: 1.0 },
            { name: "Cirendang", lat: -6.9542, lng: 108.4791, diff: 1.0 },
            { name: "Kasturi", lat: -6.9482, lng: 108.4812, diff: 1.0 },
            { name: "Winduhaji", lat: -6.9854, lng: 108.4921, diff: 1.0 },
            { name: "Ancaran", lat: -6.9782, lng: 108.5052, diff: 1.0 },
            { name: "Ciporang", lat: -6.9712, lng: 108.4982, diff: 1.0 },
            { name: "Awirarangan", lat: -6.9821, lng: 108.4892, diff: 1.0 },
            { name: "Cibinuang", lat: -7.0054, lng: 108.4812, diff: 1.2 }, // Agak menanjak ke selatan
            { name: "Citangtu", lat: -7.0152, lng: 108.4982, diff: 1.3 }, // Area perbukitan kota
            { name: "Windusengkahan", lat: -6.9752, lng: 108.5121, diff: 1.0 },
            { name: "Karangtawang", lat: -6.9921, lng: 108.5082, diff: 1.1 },
            { name: "Kedungarum", lat: -6.9612, lng: 108.5052, diff: 1.0 },
            { name: "Cigintung", lat: -6.9452, lng: 108.4682, diff: 1.1 },
            { name: "Lumbung", lat: -6.9682, lng: 108.4752, diff: 1.0 }
        ]
    }
    // ... sertakan semua kecamatan lain (Cilimus, Jalaksana, dll)
};

// 3. Fungsi: Mencari Kecamatan berdasarkan Nama Desa (Format Baru)
function getKecamatanDariDesa(namaDesa) {
    const searchName = namaDesa.toLowerCase();
    for (const [kecamatan, data] of Object.entries(LOKASI_DB)) {
        const found = data.desa.find(d => d.name.toLowerCase() === searchName);
        if (found) return kecamatan;
    }
    return "UNKNOWN";
}

// 4. Fungsi: Mendapatkan Shard ID (Singkatan) dari nama Kecamatan
function getShardDariKecamatan(namaKecamatan) {
    return Object.keys(ZONA_MAP).find(key => ZONA_MAP[key] === namaKecamatan) || "KNG";
}

// 5. Fungsi: Mengambil Data Koordinat & Difficulty Desa
function getDetailDesa(kecamatan, namaDesa) {
    if(!LOKASI_DB[kecamatan]) return null;
    return LOKASI_DB[kecamatan].desa.find(d => d.name === namaDesa);
}
