/**
 * DATA PUSAT WILAYAH KUNINGAN
 * Menentukan Desa, Kecamatan, dan Zona berdasarkan Koordinat murni.
 * Hal ini mencegah error data dari internet yang sering tertukar wilayahnya.
 */

const DATA_TITIK_PUSAT = [
    // --- KECAMATAN KUNINGAN (PUSAT) ---
    { desa: "KEDUNGARUM", kec: "KUNINGAN", zona: "PUSAT", lat: -6.9744, lng: 108.5028 },
    { desa: "PADAREK", kec: "KUNINGAN", zona: "PUSAT", lat: -6.9801, lng: 108.5105 },
    { desa: "PURWANEGARA", kec: "KUNINGAN", zona: "PUSAT", lat: -6.9850, lng: 108.4900 },
    { desa: "KUNINGAN", kec: "KUNINGAN", zona: "PUSAT", lat: -6.9765, lng: 108.4831 },
    { desa: "CIGINTUNG", kec: "KUNINGAN", zona: "PUSAT", lat: -6.9650, lng: 108.4950 },

    // --- KECAMATAN JALAKSANA (UTARA) ---
    { desa: "JALAKSANA", kec: "JALAKSANA", zona: "UTARA", lat: -6.9152, lng: 108.4892 },
    { desa: "SADAMANTRA", kec: "JALAKSANA", zona: "UTARA", lat: -6.9100, lng: 108.4950 },
    { desa: "MANISLOR", kec: "JALAKSANA", zona: "UTARA", lat: -6.9050, lng: 108.4800 },

    // --- KECAMATAN KRAMATMULYA (UTARA) ---
    { desa: "KRAMATMULYA", kec: "KRAMATMULYA", zona: "UTARA", lat: -6.9422, lng: 108.4915 },
    { desa: "KALAPAGUNUNG", kec: "KRAMATMULYA", zona: "UTARA", lat: -6.9350, lng: 108.4850 },
    { desa: "CILIKU", kec: "KRAMATMULYA", zona: "UTARA", lat: -6.9480, lng: 108.5000 }
];

/**
 * Fungsi Canggih untuk Menentukan Lokasi Berdasarkan Jarak Terdekat (Haversine)
 */
function getInternalLocation(userLat, userLng) {
    let terdekat = null;
    let jarakMin = Infinity;

    DATA_TITIK_PUSAT.forEach(titik => {
        // Menghitung selisih jarak (Pythagoras sederhana untuk akurasi lokal)
        const d = Math.sqrt(
            Math.pow(userLat - titik.lat, 2) + Math.pow(userLng - titik.lng, 2)
        );

        if (d < jarakMin) {
            jarakMin = d;
            terdekat = titik;
        }
    });

    // Batas toleransi jarak (Sekitar 2-3 KM dari titik pusat desa)
    // Jika user berada di luar jangkauan titik yang didaftarkan
    if (jarakMin > 0.025) {
        return {
            desa: "AREA-LUAR",
            kec: "KUNINGAN",
            zona: "PUSAT",
            status: "EXTERNAL"
        };
    }

    return terdekat;
}

/**
 * Fungsi cadangan untuk manual router (jika dibutuhkan)
 */
function getZonaByKecamatan(kec) {
    const mapping = {
        "KUNINGAN": "PUSAT",
        "JALAKSANA": "UTARA",
        "KRAMATMULYA": "UTARA",
        "CILIMUS": "UTARA",
        "DARMA": "SELATAN",
        "KADUGEDE": "SELATAN",
        "LURAGUNG": "TIMUR"
    };
    return mapping[kec.toUpperCase()] || "PUSAT";
}
