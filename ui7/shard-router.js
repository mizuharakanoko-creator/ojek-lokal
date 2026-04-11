/**
 * DATA PUSAT WILAYAH & ZONA
 * Gunakan file ini untuk mengunci agar Desa tertentu tidak pindah Kecamatan/Zona
 */
const MASTER_ROUTER = {
    "KUNINGAN": {
        "KUNINGAN": {
            zona: "PUSAT",
            desa: ["KEDUNGARUM", "PADAREK", "KUNINGAN", "PURWANEGARA", "CIGINTUNG", "CIRENDANG", "KASTURI"]
        },
        "JALAKSANA": {
            zona: "UTARA",
            desa: ["JALAKSANA", "SADAMANTRA", "MANISLOR", "SIDAMULYA", "SINDANGSARI"]
        },
        "KRAMATMULYA": {
            zona: "UTARA",
            desa: ["KRAMATMULYA", "KALAPAGUNUNG", "CILIKU", "BOJONG", "PAJABAMBAN"]
        },
        "CILIMUS": {
            zona: "UTARA",
            desa: ["CILIMUS", "BANDORASA KULON", "BANDORASA WETAN", "LINGGARIJATI"]
        },
        "DARMA": {
            zona: "SELATAN",
            desa: ["DARMA", "BAKASARI", "CIPASUNG", "PANINGGARAN"]
        }
    }
};

/**
 * Fungsi Sinkronisasi: Memastikan nama Desa & Kecamatan Sesuai Data Pusat
 */
function getVerifiedLocation(kabGPS, kecGPS, desaGPS) {
    // Normalisasi teks
    const kab = kabGPS.toUpperCase().replace("KABUPATEN ", "").trim();
    const kec = kecGPS.toUpperCase().trim();
    const desa = desaGPS.toUpperCase().trim();

    // 1. Cek apakah Kabupaten ada di Master
    if (MASTER_ROUTER[kab]) {
        const daftarKecamatan = MASTER_ROUTER[kab];

        // 2. Cari apakah Desa tersebut terdaftar di salah satu kecamatan kita
        for (const [namaKec, data] of Object.entries(daftarKecamatan)) {
            if (data.desa.includes(desa)) {
                return {
                    kab: kab,
                    kec: namaKec, // Kunci ke kecamatan yang benar (contoh: Kedungarum -> Kuningan)
                    desa: desa,
                    zona: data.zona
                };
            }
        }

        // 3. Jika desa tidak ketemu tapi Kecamatannya ada
        if (daftarKecamatan[kec]) {
            return {
                kab: kab,
                kec: kec,
                desa: desa,
                zona: daftarKecamatan[kec].zona
            };
        }
    }

    // 4. ANOMALI HANDLER: Jika benar-benar tidak terdaftar
    return {
        kab: kab || "KUNINGAN",
        kec: kec || "AREA-LUAR",
        desa: desa || "UNKNOWN",
        zona: "LUAR" // Masukkan ke Zona khusus agar tidak campur
    };
}
