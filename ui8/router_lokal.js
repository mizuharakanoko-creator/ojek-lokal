// router_lokal.js

// Database Lokal: Pemetaan Kecamatan dan Desa-desanya di Kab. Kuningan
const LOKASI_DB = {
    "KUNINGAN": ["KEDUNGARUM", "AWIRARANGAN", "CIGINTUNG", "CITANGTU", "PURWAWINANGUN"],
    "JALAKSANA": ["JALAKSANA", "SADAMANTRA", "MANISKIDUL", "PEUSING", "SANGKANERANG"],
    "CIGUGUR": ["CIGUGUR", "CISANTANA", "GUNUNGKELING", "SUKAMULYA"]
};

// Fungsi untuk mencari Kecamatan berdasarkan nama Desa
function getKecamatanDariDesa(namaDesa) {
    const desaUpper = namaDesa.toUpperCase();
    for (const [kecamatan, daftarDesa] of Object.entries(LOKASI_DB)) {
        if (daftarDesa.includes(desaUpper)) {
            return kecamatan;
        }
    }
    return "UNKNOWN"; // Jika desa tidak terdaftar
}
