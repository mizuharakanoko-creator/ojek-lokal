// ==========================================
// ROUTER LOKAL: DATABASE WILAYAH & SHARDING
// ==========================================

// 1. Kamus Singkatan Kecamatan (Kunci Shard Database)
const ZONA_MAP = {
    "KNG": "KUNINGAN",
    "KGD": "KADUGEDE",
    "CGR": "CIGUGUR",
    "JLS": "JALAKSANA",
    "KRAMAT": "KRAMATMULYA"
};

// 2. Database Desa per Kecamatan (Kab. Kuningan)
const LOKASI_DB = {
    "KUNINGAN": [
        "KEDUNGARUM", "AWIRARANGAN", "CIGINTUNG", "CITANGTU", "PURWAWINANGUN", 
        "CUNUNGSARI", "KUNINGAN", "KASTURI", "ANCARAN", "WINDUSENGGARA"
    ],
    "KADUGEDE": [
        "KADUGEDE", "CIPADOUNG", "BABAKANREUMA", "CITEUREUP", "CINDEREUMA", 
        "SINDANGJAWA", "TINGGAR", "MERCIPU"
    ],
    "CIGUGUR": [
        "CIGUGUR", "CISANTANA", "GUNUNGKELING", "SUKAMULYA", "CIPARI", 
        "PANYEREPAN", "CIGADUNG"
    ],
    "JALAKSANA": [
        "JALAKSANA", "SADAMANTRA", "MANISKIDUL", "PEUSING", "SANGKANERANG", "BABAKANMULYA"
    ]
};

// 3. Fungsi: Mencari Nama Lengkap Kecamatan dari Singkatan (KNG -> KUNINGAN)
function getNamaLengkapKecamatan(singkatan) {
    const key = singkatan.toUpperCase();
    return ZONA_MAP[key] || "UNKNOWN";
}

// 4. Fungsi: Mencari Kecamatan berdasarkan Nama Desa
function getKecamatanDariDesa(namaDesa) {
    if (!namaDesa) return "UNKNOWN";
    const desaUpper = namaDesa.toUpperCase();
    
    for (const [kecamatan, daftarDesa] of Object.entries(LOKASI_DB)) {
        if (daftarDesa.includes(desaUpper)) {
            return kecamatan;
        }
    }
    return "UNKNOWN";
}

// 5. Fungsi: Mendapatkan Shard ID (Singkatan) dari nama Desa
function getShardDariDesa(namaDesa) {
    const kec = getKecamatanDariDesa(namaDesa);
    // Cari key (KNG/KGD) berdasarkan value (KUNINGAN/KADUGEDE)
    return Object.keys(ZONA_MAP).find(key => ZONA_MAP[key] === kec) || "UNKNOWN";
}
