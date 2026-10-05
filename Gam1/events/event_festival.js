GameEngine.registerEvent({
    id: "annual_kingdom_festival",
    weight: 4,
    hasChoices: true,
    condition: (player) => player.day >= 300 && player.day <= 320, // Muncul menjelang akhir tahun
    execute: (player, log, showChoices) => {
        log("Ibukota sedang merayakan Festival Panen Raya. Seluruh jalan dipenuhi lentera dan pedagang keliling.");
        showChoices([
            {
                text: "Buka Lapak / Ikut Turnamen Kecil (Modal 20 Gold)",
                action: (p, l) => {
                    if (p.gold >= 20) {
                        p.gold -= 20;
                        let untung = Math.floor(Math.random() * 40) + 10;
                        p.gold += untung;
                        l(`Kamu ikut turnamen jalanan dan meraup untung! Gold bertambah ${untung}.`);
                    } else {
                        l("Kamu ingin ikut bertarung, tapi kantongmu terlalu kosong untuk uang pendaftaran.");
                    }
                }
            },
            {
                text: "Nikmati Festival dan Beristirahat (Pulihkan Semangat)",
                action: (p, l) => {
                    p.agi += 1; // Refresh tubuh
                    l("Hari yang menyenangkan! Pikiranmu segar kembali dan tubuh terasa lebih rileks (AGI +1).");
                }
            }
        ]);
    }
});
