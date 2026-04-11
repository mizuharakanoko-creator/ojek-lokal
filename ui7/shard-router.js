/**
 * File: shard-router.js
 * Deskripsi: Mapping otomatis Kecamatan ke Zona Wilayah untuk penamaan tabel Firebase
 */

const WILAYAH_CONFIG = {
    "KUNINGAN": {
        // ZONA UTARA
        "JALAKSANA": "UTARA",
        "CILIMUS": "UTARA",
        "KRAMATMULYA": "UTARA",
        "MANDIRANCAN": "UTARA",
        "PANCALANG": "UTARA",
        "CIAWIGEBANG": "UTARA", // Bisa disesuaikan sesuai kebutuhan operasional
        "CIGANDAMEKAR": "UTARA",
        "JAPARA": "UTARA",

        // ZONA SELATAN
        "KADUGEDE": "SELATAN",
        "DARMA": "SELATAN",
        "NUSAHERANG": "SELATAN",
        "SELAJAMBE": "SELATAN",
        "SUBANG": "SELATAN",
        "CILEBAK": "SELATAN",

        // ZONA TIMUR
        "LURAGUNG": "TIMUR",
        "CIDAHU": "TIMUR",
        "KALIMANGGIS": "TIMUR",
        "MEKARZARI": "TIMUR",
        "MALEBER": "TIMUR",
        "LEBAKWANGI": "TIMUR",
        "CIMAHI": "TIMUR",
        "CIBEUREUM": "TIMUR",
        "KARANGKANCANA": "TIMUR",
        "CIWARU": "TIMUR",

        // ZONA BARAT
        "CIGUGUR": "BARAT",
        "HANTARA": "BARAT",
        "CINIRU": "BARAT",

        // ZONA PUSAT
        "KUNINGAN": "PUSAT",
        "SINDANGAGUNG": "PUSAT",
        "GARAWANGI": "PUSAT"
    },
    "CIREBON": {
        "SUMBER": "PUSAT",
        "CILEDUG": "TIMUR",
        "WERU": "BARAT"
    }
};

/**
 * Fungsi untuk mendapatkan Zona berdasarkan Kabupaten dan Kecamatan.
 * Digunakan untuk membentuk nama tabel: KATEGORI-KAB-ZONA-KEC-DESA
 */
function getZonaWilayah(kabupaten, kecamatan) {
    try {
        // Normalisasi teks menjadi Huruf Kapital dan hapus spasi berlebih
        const kab = kabupaten.toUpperCase().trim();
        const kec = kecamatan.toUpperCase().trim();
        
        // Cek apakah Kabupaten terdaftar
        if (WILAYAH_CONFIG[kab]) {
            // Cek apakah Kecamatan terdaftar di kabupaten tersebut
            if (WILAYAH_CONFIG[kab][kec]) {
                return WILAYAH_CONFIG[kab][kec];
            }
        }
        
        // Jika tidak ditemukan di daftar, masukkan ke kategori default
        return "UMUM"; 
    } catch (e) {
        console.error("Router Error:", e);
        return "UNKNOWN";
    }
}

/**
 * Helper untuk validasi apakah area sudah tercover sistem
 */
function isAreaSupported(kabupaten, kecamatan) {
    const kab = kabupaten.toUpperCase().trim();
    const kec = kecamatan.toUpperCase().trim();
    return !!(WILAYAH_CONFIG[kab] && WILAYAH_CONFIG[kab][kec]);
}
