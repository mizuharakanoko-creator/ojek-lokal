// File: shard-router.js
const AREA_ROUTER = {
    "KUNINGAN": {
        "JALAKSANA": "UTARA",
        "KRAMATMULYA": "UTARA",
        "KEDUNGARUM": "UTARA",
        "PADAREK": "UTARA",
        "DARMA": "SELATAN",
        "KADUGEDE": "SELATAN"
    }
};

function getAreaZone(kab, kec) {
    try {
        return AREA_ROUTER[kab][kec] || "UMUM"; 
    } catch (e) {
        return "UMUM";
    }
}
