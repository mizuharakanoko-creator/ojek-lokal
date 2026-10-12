// js/core.js
export const GameCore = {
    player: {
        name: "Master",
        gold: 100,
        gems: 50,
        party: [],       // Karakter yang aktif
        towerFloor: 1    // Progress lantai tower
    },
    
    init() {
        console.log("Game Core Berhasil Dimuat.");
        this.startLoop();
    },

    startLoop() {
        setInterval(() => {
            // Progres pasif dasar (Gold otomatis bertambah sedikit tiap detik)
            this.player.gold += 2;
            
            // Broadcast event tick ke modul lain (Tower & Party)
            document.dispatchEvent(new CustomEvent('gameTick', { detail: this.player }));
            
            this.updateUI();
        }, 1000);
    },

    updateUI() {
        const goldEl = document.getElementById('stat-gold');
        const floorEl = document.getElementById('stat-floor');
        const gemsEl = document.getElementById('stat-gems');
        
        if (goldEl) goldEl.innerText = this.player.gold;
        if (floorEl) floorEl.innerText = this.player.towerFloor;
        if (gemsEl) gemsEl.innerText = this.player.gems;
    }
};
