const WorldManager = {
    defaultWorld: {
        locations: [
            { id: "oakhaven", name: "Desa Oakhaven", type: "desa", population: 150, status: "aman" },
            { id: "whispering_forest", name: "Hutan Berbisik", type: "hutan", status: "jelajah" }
        ],
        discoveredPeople: []
    },

    getWorld() {
        let saved = localStorage.getItem('adventurer_world_state');
        if (!saved) {
            this.saveWorld(this.defaultWorld);
            return this.defaultWorld;
        }
        return JSON.parse(saved);
    },

    saveWorld(worldObj) {
        localStorage.setItem('adventurer_world_state', JSON.stringify(worldObj));
    }
};

// Daftarkan updater dunia otomatis ke engine (Desa bisa hancur seiring waktu)
if (typeof GameEngine !== 'undefined') {
    GameEngine.registerWorldUpdater((player, log) => {
        let world = WorldManager.getWorld();
        
        world.locations.forEach(loc => {
            if (loc.type === 'desa' && loc.status === 'aman') {
                // 1% peluang desa diserang monster/krisis tiap hari
                if (Math.random() < 0.01) {
                    loc.population -= 15;
                    if (loc.population <= 0) {
                        loc.population = 0;
                        loc.status = 'hancur';
                        loc.name = `[Reruntuhan] ${loc.name}`;
                        log(`BERITA DUNIA: Desa ${loc.name} telah hancur total akibat serangan monster!`);
                    } else {
                        log(`Kabar buruk: Desa ${loc.name} diserang bandit, populasi turun menjadi ${loc.population}.`);
                    }
                }
            }
        });

        WorldManager.saveWorld(world);
    });
}
