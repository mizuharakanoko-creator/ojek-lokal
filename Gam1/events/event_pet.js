GameEngine.registerEvent({
    id: "adopt_pet_event",
    weight: 2,
    hasChoices: true,
    condition: (player) => player.pet === "Tidak Ada" && player.age >= 16,
    execute: (player, log, showChoices) => {
        log("Di pinggir hutan, kamu mendapati anak Serigala Bayangan yang terlantar dan kelaparan.");
        showChoices([
            {
                text: "Jinakkan dan Adopsi (Beri Daging / Bayar 20 Gold)",
                action: (p, l) => {
                    if (p.gold >= 20) {
                        p.gold -= 20;
                        p.pet = "Anak Serigala Bayangan";
                        p.agi += 2;
                        l("Serigala kecil itu kini menjadi teman setiamu dalam perjalanan! (AGI +2)");
                    } else {
                        l("Kamu tidak punya cukup makanan atau uang untuk merawatnya, terpaksa meninggalkannya.");
                    }
                }
            },
            {
                text: "Abaikan Saja",
                action: (p, l) => {
                    l("Kamu mengabaikannya dan berlalu pergi.");
                }
            }
        ]);
    }
});
