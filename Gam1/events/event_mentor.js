GameEngine.registerEvent({
    id: "meet_wandering_master",
    weight: 2,
    hasChoices: false, // Terjadi otomatis karena keberuntungan
    condition: (player) => player.guild !== "Belum Terdaftar" && (player.str >= 15 || player.int >= 15),
    execute: (player, log) => {
        let boostType = Math.random();
        if (boostType < 0.5) {
            player.str += 3;
            player.agi += 2;
            log("✨ Kamu tidak sengaja menyelamatkan seorang pendekar pensiunan. Sebagai rasa terima kasih, dia melatih teknik pedang rahasianya! (STR +3, AGI +2)");
        } else {
            player.int += 4;
            log("✨ Seorang penyihir tua melihat potensi sihir dalam dirimu dan mewariskan sebuah buku mantra kuno! (INT +4)");
        }
    }
});
