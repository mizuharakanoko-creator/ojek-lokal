GameEngine.registerEvent({
    id: "starter_event_latihan",
    weight: 10, // Bobot tinggi agar sering muncul
    condition: (player) => true, // Tidak ada syarat khusus, pasti terpanggil!
    execute: (player, log, showChoices) => {
        log("Kamu meluangkan waktu hari ini untuk melatih fisik di tempat terbuka.");
        showChoices([
            {
                text: "Latihan Fisik (STR +2)",
                action: (p, l) => {
                    p.str += 2;
                    l("Ototmu terasa lebih kuat! STR bertambah 2.");
                }
            },
            {
                text: "Latihan Kelincahan (AGI +2)",
                action: (p, l) => {
                    p.agi += 2;
                    l("Gerakanmu menjadi lebih lincah! AGI bertambah 2.");
                }
            }
        ]);
    }
});
