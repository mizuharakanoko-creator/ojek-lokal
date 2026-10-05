GameEngine.registerEvent({
    id: "romance_and_marriage_event",
    weight: 2,
    hasChoices: true,
    condition: (player) => player.partner === "Belum Menikah" && player.age >= 20 && (player.housing !== "Kamar Sewa Murah"),
    execute: (player, log, showChoices) => {
        log("Karena kamu sudah mapan dan memiliki tempat tinggal yang layak, seorang rekan petualang wanita mengajakmu untuk menjalin hubungan serius.");
        showChoices([
            {
                text: "Lamar Menjadi Pasangan / Istri (Modal 100 Gold)",
                action: (p, l) => {
                    if (p.gold >= 100) {
                        p.gold -= 100;
                        p.partner = "Menikah (Pendamping Setia)";
                        p.int += 3;
                        l("Pernikahan kecil yang hangat dilangsungkan. Kamu kini memiliki tempat kembali yang penuh kasih! (INT +3)");
                    } else {
                        l("Kamu ingin melamarnya, tapi tabunganmu belum cukup untuk mengadakan pesta kecil.");
                    }
                }
            },
            {
                text: "Fokus Karir Saja (Tolak)",
                action: (p, l) => {
                    l("Kamu menolak dengan halus karena masih ingin fokus berpetualang.");
                }
            }
        ]);
    }
});
