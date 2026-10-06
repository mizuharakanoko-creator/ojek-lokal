// File: events/event_exploration.js
GameEngine.registerEvent({
    id: "explore_training_and_people",
    weight: 5,
    hasChoices: true,
    execute: (player, log, showChoices) => {
        log("Arthur memiliki waktu luang hari ini. Apa yang ingin dilakukan?");

        showChoices([
            {
                text: "Latihan Fisik Keras (Peluang sukses 30% tambah STR)",
                action: (p, l) => {
                    // Peluang sukses 30% (0.3)
                    if (Math.random() < 0.3) {
                        p.str += 1;
                        l("Kerja kerasmu terbayar! Otot dan tenaganya terasa meningkat. (STR +1)");
                    } else {
                        l("Kamu berlatih seharian hingga kelelahan, namun teknikmu belum matang dan tidak ada peningkatan berarti.");
                    }
                }
            },
            {
                text: "Pergi ke Alun-alun Kota (Berkenalan dengan Warga Baru)",
                action: (p, l) => {
                    let world = WorldManager.getWorld();
                    // Buat NPC baru secara prosedural
                    let newNpc = NameGenerator.generate();
                    world.discoveredPeople.push(newNpc);
                    WorldManager.saveWorld(world);

                    l(`Di keramaian alun-alun, kamu berkenalan dengan seorang ${newNpc.gender === 'Male' ? 'pria' : 'wanita'} bernama ${newNpc.name} (${newNpc.age} tahun). Namanya dicatat dalam daftar kenalanmu.`);
                }
            },
            {
                text: "Beristirahat Saja di Rumah",
                action: (p, l) => {
                    l("Kamu memilih bersantai dan memulihkan tenaga hari ini.");
                }
            }
        ]);
    }
});
