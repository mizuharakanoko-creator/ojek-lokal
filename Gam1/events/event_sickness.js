GameEngine.registerEvent({
    id: "adventurer_injury_or_illness",
    weight: 3,
    hasChoices: true,
    condition: (player) => player.age >= 25, // Mulai rentan saat usia 25+
    execute: (player, log, showChoices) => {
        log("⚠️️ Akibat kelelahan kronis dan luka masa lalu, tubuhmu mendadak demam tinggi.");
        showChoices([
            {
                text: "Bayar Tabib Mahal untuk Penyembuhan (Bayar 40 Gold)",
                action: (p, l) => {
                    if (p.gold >= 40) {
                        p.gold -= 40;
                        l("Tabib menyembuhkanmu dengan ramuan khusus. Kamu kembali sehat.");
                    } else {
                        p.gold = 0;
                        p.isAlive = (Math.random() > 0.4); // Ada peluang fatal jika uang tak cukup
                        if (p.isAlive) {
                            l("Karena uang tak cukup, kamu berobat seadanya. Selamat, tapi kondisi tubuh sempat melemah.");
                        } else {
                            l("Penyakit merenggut nyawamu karena tidak mendapat perawatan yang layak...");
                        }
                    }
                }
            },
            {
                text: "Tahan Sakit dan Istirahat Total Sendiri (Risiko Tinggi)",
                action: (p, l) => {
                    // Mengurangi status secara acak tapi gratis
                    p.str = Math.max(5, p.str - 2);
                    p.agi = Math.max(5, p.agi - 2);
                    l("Kamu memaksa sembuh sendiri di kamar sewaan. Fisikmu melemah (STR/AGI -2).");
                }
            }
        ]);
    }
});
