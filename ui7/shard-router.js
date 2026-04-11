// Menghubungkan Kecamatan ke Key yang ada di shard-config.js
const SHARD_ROUTER = {
    "KUNINGAN": {
        "JALAKSANA": "IDN-JABAR-KNG-JALAKSANA",
        "KRAMATMULYA": "IDN-JABAR-KNG-KRAMATMULYA",
        "KEDUNGARUM": "IDN-JABAR-KNG-KRAMATMULYA" 
    }
};

function getShardID(kab, kec) {
    try {
        // Jika kec ditemukan di kab tersebut, ambil kodenya
        if (SHARD_ROUTER[kab] && SHARD_ROUTER[kab][kec]) {
            return SHARD_ROUTER[kab][kec];
        }
        // Default jika tidak terdaftar (Pastikan key ini ada di shard-config.js)
        return "IDN-JABAR-KNG-JALAKSANA"; 
    } catch (e) {
        return "IDN-JABAR-KNG-JALAKSANA";
    }
}
