GameEngine.registerEvent({
    id: "ancient_summon_contract",
    weight: 1, // Sangat langka
    hasChoices: true,
    condition: (player) => player.int >= 18 && player.summon === "Tidak Ada",
    execute: (player, log, showChoices) => {
        log("🧠 Berkat kecerdasan (`INT`) yang tinggi, kamu berhasil meneliti gulungan sihir dimensi dan membuka portal kontrak roh!");
        showChoices([
            {
                text: "Buat Kontrak dengan Roh Api (Butuh STR >= 15)",
                action: (p, l) => {
                    if (p.str >= 15) {
                        p.summon = "Roh Api Minor";
                        p.str += 5;
                        l("Kontrak berhasil! Roh Api mendampingi bilah pedangmu. (STR +5)");
                    } else {
                        l("Tubuhmu menolak energi panas roh api karena kekuatan fisikmu kurang.");
                    }
                }
            },
            {
                text: "Buat Kontrak dengan Roh Bayangan (Butuh AGI >= 15)",
                action: (p, l) => {
                    if (p.agi >= 15) {
                        p.summon = "Roh Bayangan";
                        p.agi += 5;
                        l("Kontrak berhasil! Kamu menyatu dengan bayangan. (AGI +5)");
                    } else {
                        l("Kecepatan reaksimu belum cukup untuk mengikat Roh Bayangan.");
                    }
                }
            }
        ]);
    }
});
