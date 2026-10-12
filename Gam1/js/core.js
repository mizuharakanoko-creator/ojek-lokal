// js/core.js
export const GameCore = {
    player: {
        name: "Player",
        gold: 100,
        gems: 50,
        party: [] // Karakter yang direkrut akan masuk sini
    },
    
    // Fungsi dasar yang berjalan otomatis
    init() {
        console.log("Game Core Berhasil Dimuat.");
        this.startLoop();
    },

    startLoop() {
        setInterval(() => {
            // Progres dasar (misal: otomatis dapat gold tiap detik)
            this.player.gold += 5;
            
            // Trigger event untuk modul tambahan jika ada
            document.dispatchEvent(new CustomEvent('gameTick', { detail: this.player }));
            
            this.updateUI();
        }, 1000);
    },

    updateUI() {
        const goldEl = document.getElementById('stat-gold');
        if (goldEl) goldEl.innerText = this.player.gold;
    }
};
