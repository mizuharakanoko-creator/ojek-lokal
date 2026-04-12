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
    "LRG": "Luragung"
    // Tambahkan singkatan lain jika perlu
};

// 2. Database Presisi (Data yang kamu berikan)
const LOKASI_DB = {
    "Cigugur": {
        lat: -6.9754, lng: 108.4594,
        desa: [
            { name: "Kelurahan Cigugur", lat: -6.9754, lng: 108.4594, diff: 1.0 },
            { name: "Kelurahan Cigadung", lat: -6.9885, lng: 108.4612, diff: 1.0 },
            { name: "Desa Cisantana", lat: -6.9542, lng: 108.4254, diff: 1.4 },
            { name: "Babakan Cigadung", lat: -6.9912, lng: 108.4654, diff: 1.1 },
            { name: "Kelurahan Sukamulya", lat: -6.9832, lng: 108.4721, diff: 1.0 },
            { name: "Kelurahan Cipari", lat: -6.9642, lng: 108.4521, diff: 1.0 },
            { name: "Kelurahan Winduherang", lat: -6.9712, lng: 108.4782, diff: 1.0 },
            { name: "Desa Babakanmulya", lat: -6.9621, lng: 108.4452, diff: 1.1 },
            { name: "Desa Gunungkeling", lat: -6.9582, lng: 108.4521, diff: 1.1 }
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
