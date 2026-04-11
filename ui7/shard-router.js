// File: shard-router.js
const SHARD_ROUTER = {
    "KUNINGAN": {
        "JALAKSANA": "S1",
        "KRAMATMULYA": "S1",
        "KEDUNGARUM": "S1",
        "DARMA": "S2",
        "KADUGEDE": "S2"
    },
    "CIREBON": {
        "SUMBER": "S3"
    }
};

function getShardID(kab, kec) {
    try {
        return SHARD_ROUTER[kab][kec] || "S1"; // Default ke S1 jika tidak ditemukan
    } catch (e) {
        return "S1";
    }
}
