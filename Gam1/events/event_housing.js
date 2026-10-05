GameEngine.registerEvent({
    id: "buy_better_house",
    weight: 2,
    hasChoices: true,
    condition: (player) => player.housing === "Kamar Sewa Murah" && player.gold >= 200,
    execute: (player, log, showChoices) => {
        log("Seorang agen properti menawarkan rumah kecil di distrik menengah kota yang tenang dan nyaman.");
        showChoices([
            {
                text: "Beli Rumah Kecil (Bayar 200 Gold)",
                action: (p, l) => {
                    p.gold -= 200;
                    p.housing = "Rumah Kecil Pribadi";
                    p.str += 1;
                    p.int += 1;
                    l("Selamat! Kamu resmi keluar dari kamar sewa dan memiliki rumah sendiri. Istirahatmu jauh lebih berkualitas.");
                }
            },
            {
                text: "Tolak, Belum Butuh",
                action: (p, l) => {
                    l("Kamu merasa kamar sewa saat ini masih cukup.");
                }
            }
        ]);
    }
});
