// js/updates/tower.js
import { GameCore } from '../core.js';
import { PartySystem } from './party.js';

export const TowerSystem = {
    progress: 0, // Progress untuk menaklukkan lantai saat ini (0 - 100%)

    init() {
        console.log("Modul Tower Exploration Dimuat.");
        
        // Mendengarkan event tick dari core.js
        document.addEventListener('gameTick', (e) => {
            this.processClimb(e.detail);
        });
    },

    processClimb(player) {
        // Kecepatan naik lantai bergantung pada total ATK party
        const partyAtk = PartySystem.getTotalPartyAtk();
        const climbSpeed = partyAtk * 0.1; // Makin kuat party, makin cepat naik lantai
        
        this.progress += climbSpeed;

        // Jika progress mencapai 100%, naik lantai tower
        if (this.progress >= 100) {
            this.progress = 0;
            player.towerFloor++;
            
            // Hadiah naik lantai
            let rewardGold = player.towerFloor * 15;
            player.gold += rewardGold;
            
            // Setiap kelipatan 5 lantai, beri bonus Gems
            if (player.towerFloor % 5 === 0) {
                player.gems += 10;
                this.addTowerLog(`🏆 Lantai ${player.towerFloor} dibersihkan! Bonus 10 Gems didapat!`);
            } else {
                this.addTowerLog(`⚔️ Berhasil menaklukkan Lantai ${player.towerFloor - 1}. Naik ke lantai ${player.towerFloor}!`);
            }
        }

        this.updateTowerUI();
    },

    addTowerLog(text) {
        const logBox = document.getElementById('tower-logs');
        if (!logBox) return;
        const item = document.createElement('div');
        item.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
        logBox.prepend(item);
    },

    updateTowerUI() {
        const barEl = document.getElementById('tower-progress-bar');
        const textEl = document.getElementById('tower-progress-text');
        if (barEl) barEl.style.width = `${Math.floor(this.progress)}%`;
        if (textEl) textEl.innerText = `${Math.floor(this.progress)}%`;
    }
};
