GameEngine.registerEvent({
    id: "guild_official_mission",
    weight: 4,
    hasChoices: true,
    condition: (player) => player.guild !== "Belum Terdaftar", // Hanya muncul jika sudah terdaftar di guild
    execute: (player, log, showChoices) => {
        log("Papan pengumuman Guild menawarkan misi berhadiah lumayan.");
        showChoices([
            {
                text: "Ambil Misi Berbahaya (Butuh STR/AGI tinggi)",
                action: (p, l) => {
                    if (p.str >= 18 || p.agi >= 18) {
                        p.gold += 100;
                        p.str += 1;
                        l("Misi sukses besar! Kamu membawa pulang 100 Gold dan pengalaman bertarung.");
                    } else {
                        p.gold = Math.max(0, p.gold - 20);
                        l("Misi gagal dan kamu terluka parah. Kehilangan 20 Gold untuk biaya tabib.");
                    }
                }
            },
            {
                text: "Ambil Misi Santai (Kumpul Bahan Rumput Obat)",
                action: (p, l) => {
                    p.gold += 25;
                    p.int += 1;
                    l("Misi selesai dengan aman. Gold +25, INT +1.");
                }
            }
        ]);
    }
});
