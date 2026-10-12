// js/core.js
import { TowerSystem } from './updates/tower.js';
import { PartySystem } from './updates/party.js';

export const GameCore = {
    player: {
        name: "Master",
        gold: 100,
        gems: 50,
        party: [],
        towerFloor: 1
    },
    
    init() {
        console.log("Game Core Berhasil Dimuat.");
        this.startLoop();
    },

    startLoop() {
        setInterval(() => {
            this.player.gold += 2;
            TowerSystem.processClimb(this.player);
            this.updateUI();
        }, 1000);
    },

    updateUI() {
        document.getElementById('stat-gold').innerText = this.player.gold;
        document.getElementById('stat-floor').innerText = this.player.towerFloor;
        document.getElementById('stat-gems').innerText = this.player.gems;
        
        // Update info kesulitan & risiko berdasarkan lantai
        const difficultyMultiplier = 100 + (this.player.towerFloor - 1) * 25;
        const riskRate = Math.min(35, 5 + Math.floor(this.player.towerFloor * 1.5));
        
        const diffEl = document.getElementById('stat-difficulty');
        const riskEl = document.getElementById('stat-risk');
        if (diffEl) diffEl.innerText = `${difficultyMultiplier}%`;
        if (riskEl) riskEl.innerText = `${riskRate}%`;
    }
};
