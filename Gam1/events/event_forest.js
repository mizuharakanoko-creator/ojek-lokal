GameEngine.registerEvent({
    id: "forest_slime_encounter",
    weight: 5,
    condition: (player) => player.age >= 15, // Muncul jika umur >= 15
    execute: (player, log, showChoices) => {
        log("Kamu menjelajahi pinggiran hutan dan berpapasan dengan Slime Liar!");
        showChoices([
            {
                text: "Lawan (Gunakan STR)",
                action: (p, l) => {
                    if (p.str >= 12) {
                        p.gold += 10;
                        p.str += 1;
                        l("Kamu berhasil mengalahkan slime! STR +1, Gold +10");
                    } else {
                        p.gold = Math.max(0, p.gold - 5);
                        l("Kamu kewalahan dan terluka. Kehilangan 5 Gold.");
                    }
                }
            },
            {
                text: "Lari Menghindar (Gunakan AGI)",
                action: (p, l) => {
                    p.agi += 1;
                    l("Kamu berhasil kabur dengan gesit. AGI +1");
                }
            }
        ]);
    }
});
