GameEngine.registerEvent({
    id: "join_official_guild",
    weight: 2,
    condition: (player) => player.guild === "Belum Terdaftar" && player.str >= 15, // Syarat gabung guild
    execute: (player, log, showChoices) => {
        log("Kamu merasa sudah cukup kuat. Kantor Guild Petualang Resmi membuka pendaftaran rekrutmen.");
        showChoices([
            {
                text: "Daftar ke Guild Resmi",
                action: (p, l) => {
                    p.guild = "Cabang Ibukota (Rank E)";
                    p.status = "Guild Adventurer";
                    l("Selamat! Kamu resmi diterima sebagai anggota Guild Petualang.");
                }
            },
            {
                text: "Lewati Saja",
                action: (p, l) => {
                    l("Kamu memutuskan menunda pendaftaran guild.");
                }
            }
        ]);
    }
});
