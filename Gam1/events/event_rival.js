GameEngine.registerEvent({
    id: "meet_arrogant_rival",
    weight: 3,
    hasChoices: true,
    condition: (player) => player.age >= 16 && player.age <= 50,
    execute: (player, log, showChoices) => {
        log("Di sudut kota, kamu berpapasan dengan seorang petualang elit seumuran yang meremehkan kekuatanmu.");
        showChoices([
            {
                text: "Tantang Duel Langsung (Adu STR)",
                action: (p, l) => {
                    if (p.str >= 14) {
                        p.str += 2;
                        p.gold += 50;
                        l("Kamu mempermalukan sang rival dalam duel! STR +2, Gold +50.");
                    } else {
                        p.str += 1; // Tetap belajar dari kekalahan
                        p.gold = Math.max(0, p.gold - 15);
                        l("Kamu kalah telak dan menjadi tontonan warga. Kehilangan 15 Gold, tapi tekadmu menguat (STR +1).");
                    }
                }
            },
            {
                text: "Abaikan dan Fokus Latihan Sendiri",
                action: (p, l) => {
                    p.int += 1;
                    l("Kamu mengabaikannya dan memilih memperdalam strategi bertarung. INT +1.");
                }
            }
        ]);
    }
});
