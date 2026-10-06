// File: systems/family_tree_system.js
const FamilySystem = {
    processWorldFamilies(worldData, logCallback) {
        let npcs = worldData.discoveredPeople;

        // 1. Simulasi Pernikahan Antar NPC di Dunia
        for (let i = 0; i < npcs.length; i++) {
            for (let j = i + 1; j < npcs.length; j++) {
                let p1 = npcs[i];
                let p2 = npcs[j];

                // Syarat: Beda gender, hidup, belum punya pasangan, usia cukup
                if (p1.isAlive && p2.isAlive && !p1.spouseId && !p2.spouseId && p1.gender !== p2.gender) {
                    // Peluang 0.5% per hari NPC di dunia saling menikah
                    if (Math.random() < 0.005) {
                        p1.spouseId = p2.id;
                        p2.spouseId = p1.id;
                        if (logCallback) logCallback(`Kabar Pernikahan: ${p1.name} dan ${p2.name} resmi menikah di pemukiman!`);
                    }
                }
            }
        }

        // 2. Simulasi Kelahiran Anak bagi NPC yang Menikah
        npcs.forEach(npc => {
            if (npc.isAlive && npc.spouseId && npc.gender === "Female") {
                let husband = npcs.find(n => n.id === npc.spouseId);
                if (husband && husband.isAlive && Math.random() < 0.002) { // Peluang kecil punya anak
                    let child = NameGenerator.generate();
                    child.age = 0; // Bayi baru lahir
                    child.parents = [husband.id, npc.id];
                    
                    npc.childrenIds.push(child.id);
                    husband.childrenIds.push(child.id);

                    npcs.push(child);
                    if (logCallback) logCallback(`Kabar Bahagia: ${npc.name} dan ${husband.name} dikaruniai seorang bayi bernama ${child.name}!`);
                }
            }
        });
    }
};

// Daftarkan ke World Engine di latar belakang
if (typeof GameEngine !== 'undefined') {
    GameEngine.registerWorldUpdater((player, log) => {
        let world = WorldManager.getWorld();
        
        // NPC bertambah umur setiap hari
        world.discoveredPeople.forEach(npc => {
            if (npc.isAlive) {
                npc.age += 0.05; // Bertahap menua
                if (npc.age > 75 && Math.random() < 0.02) {
                    npc.isAlive = false;
                    log(`Kabar Duka: Kenalanmu, ${npc.name}, telah tutup usia karena lanjut usia.`);
                }
            }
        });

        // Jalankan silsilah keluarga
        FamilySystem.processWorldFamilies(world, log);
        WorldManager.saveWorld(world);
    });
}
