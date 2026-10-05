GameEngine.registerEvent({
    id: "ancient_ruins_artifact",
    weight: 2,
    hasChoices: false, // Berjalan otomatis tanpa jeda pilihan
    condition: (player) => player.str >= 12 || player.agi >= 12,
    execute: (player, log) => {
        let statBonus = Math.random();
        if (statBonus < 0.33) {
            player.str += 2;
            log("Saat menyusuri gua tua, kamu menemukan prasasti latihan kuno. STR +2!");
        } else if (statBonus < 0.66) {
            player.agi += 2;
            log("Kamu menghindari jebakan runtuhan kuil dengan refleks cepat. AGI +2!");
        } else {
            player.int += 2;
            log("Kamu berhasil memecahkan teka-teki ukiran dinding kuno. INT +2!");
        }
    }
});
