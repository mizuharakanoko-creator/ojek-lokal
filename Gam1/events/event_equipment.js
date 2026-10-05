GameEngine.registerEvent({
    id: "blacksmith_forge_upgrade",
    weight: 3,
    hasChoices: true,
    condition: (player) => player.gold >= 40,
    execute: (player, log, showChoices) => {
        log("Kamu mengunjungi pandai besi kota yang mengepulkan asap panas. Ia menawarkan peningkatan perlengkapan.");
        showChoices([
            {
                text: "Beli Pedang Besi (Bayar 50 Gold, STR +3)",
                action: (p, l) => {
                    if (p.gold >= 50) {
                        p.gold -= 50;
                        p.equipment.weapon = "Pedang Besi Tempa";
                        p.str += 3;
                        l("Kamu membeli Pedang Besi! Seranganmu meningkat drastis. (STR +3)");
                        
                        // Perbarui UI agar perubahan langsung terlihat di layar
                        if (typeof GameEngine.updateUI === 'function') {
                            GameEngine.updateUI();
                        }
                    } else {
                        l("Uangmu tidak cukup untuk membeli pedang tersebut.");
                    }
                }
            },
            {
                text: "Beli Armor Kulit (Bayar 40 Gold, AGI +2)",
                action: (p, l) => {
                    if (p.gold >= 40) {
                        p.gold -= 40;
                        p.equipment.armor = "Armor Kulit Rusa";
                        p.agi += 2;
                        l("Kamu mengenakan Armor Kulit. Gerakanmu lebih terlindungi dan fleksibel! (AGI +2)");
                        
                        // Perbarui UI agar perubahan langsung terlihat di layar
                        if (typeof GameEngine.updateUI === 'function') {
                            GameEngine.updateUI();
                        }
                    } else {
                        l("Uangmu tidak cukup.");
                    }
                }
            },
            {
                text: "Lewati Saja",
                action: (p, l) => {
                    l("Kamu memutuskan untuk menabung saja.");
                }
            }
        ]);
    }
});
