// MODUL 12: RANKING & RPG STATUS SYSTEM (LEVELING ENGINE)
const DriverRank = {
    // Definisi Syarat EXP untuk setiap Rank
    ranks: {
        "BRONZE": { minExp: 0, color: "#cd7f32" },
        "SILVER": { minExp: 500, color: "#c0c0c0" },
        "GOLD": { minExp: 2000, color: "#ffd700" },
        "PLATINUM": { minExp: 5000, color: "#e5e4e2" }
    },

    // Menghitung status berdasarkan data trip
    calculateStats(rating, speed, accuracy) {
        return {
            str: Math.floor(accuracy * 2), // Strength = Ketepatan jemput
            agi: Math.floor(speed * 1.5),  // Agility = Kecepatan sampai
            int: Math.floor(rating * 20)   // Intellect = Rating pelanggan
        };
    },

    // Fungsi Update EXP setelah menyelesaikan orderan
    async gainExp(nik, amount) {
        const rankRef = ref(db, `drivers/${nik}/performance_score`);

        await runTransaction(rankRef, (current) => {
            if (current) {
                current.exp = (current.exp || 0) + amount;
                
                // Cek apakah layak naik pangkat
                if (current.exp >= 5000) current.rank = "PLATINUM";
                else if (current.exp >= 2000) current.rank = "GOLD";
                else if (current.exp >= 500) current.rank = "SILVER";
                else current.rank = "BRONZE";
            }
            return current;
        });
    }
};
