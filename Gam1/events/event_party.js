GameEngine.registerEvent({
    id: "meet_potential_party_member",
    weight: 3,
    hasChoices: true, // Akan menjeda auto-progress karena butuh pilihan
    condition: (player) => player.party === "Sendiri (Solo)" && player.age >= 16,
    execute: (player, log, showChoices) => {
        log("Di sebuah kedai lokal, kamu didekati oleh seorang penyihir pemula yang mencari rekan petualang.");
        showChoices([
            {
                text: "Ajak Bergabung ke Party (INT Min 12)",
                action: (p, l) => {
                    if (p.int >= 12) {
                        p.party = "Duet (Bersama Penyihir)";
                        l("Penyihir tersebut setuju bergabung! Efisiensi eksplorasi meningkat.");
                    } else {
                        l("Penyihir itu menolak karena menganggapmu kurang cerdas/berpengalaman.");
                    }
                }
            },
            {
                text: "Tolak dan Tetap Solo",
                action: (p, l) => {
                    l("Kamu memilih untuk melanjutkan perjalanan seorang diri.");
                }
            }
        ]);
    }
});
