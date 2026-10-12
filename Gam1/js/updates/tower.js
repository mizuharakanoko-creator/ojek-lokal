// js/updates/tower.js
import { PartySystem } from './party.js';

export const TowerSystem = {
    progress: 0,

    init() {
        console.log("Modul Tower Dimuat.");
    },

    processClimb(player) {
        if (player.party.length === 0) {
            this.addTowerLog("⚠️ Party kosong! Tidak bisa mendaki menara. Segera lakukan Summon!", "danger-log");
            return;
        }

        const partyAtk = PartySystem.getTotalPartyAtk();
        const partyDef = PartySystem.getTotalPartyDefense();
        
        // Penskalaan kesulitan tiap lantai
        const floorDifficultyMultiplier = 1 + (player.towerFloor - 1) * 0.25; 
        const baseClimbSpeed = partyAtk * 0.1;
        const actualClimbSpeed = baseClimbSpeed / floorDifficultyMultiplier;
        
        this.progress += actualClimbSpeed;

        // Persentase kegagalan / bahaya lantai
        let riskRate = Math.min(35, 5 + (player.towerFloor * 1.5));
        let mitigatedRisk = Math.max(1, riskRate - (partyDef * 0.2));

        if (Math.random() * 100 < mitigatedRisk) {
            this.addTowerLog(`⚡ Lantai ${player.towerFloor}: Party menghadapi jebakan maut dan gagal menahan serangan!`, "danger-log");
            this.progress = Math.max(0, this.progress - 15);

            // Peluang hero mati (permadeath) saat terjadi kegagalan fatal
            if (Math.random() < 0.6) {
                PartySystem.killRandomHero();
            }
        }

        // Cek jika lantai berhasil dibersihkan
        if (this.progress >= 100) {
            this.progress = 0;
            player.towerFloor++;
            let rewardGold = player.towerFloor * 20;
            player.gold += rewardGold;
            
            if (player.towerFloor % 5 === 0) {
                player.gems += 15;
                this.addTowerLog(`🏆 Luar biasa! Lantai ${player.towerFloor} dibersihkan! Bonus 15 Gems!`, "success-log");
            } else {
                this.addTowerLog(`⚔️ Berhasil! Naik ke lantai ${player.towerFloor}. Reward: ${rewardGold} Gold.`, "success-log");
            }
        }
        this.updateTowerUI();
    },

    addTowerLog(text, className = "") {
        const logBox = document.getElementById('tower-logs');
        if (!logBox) return;
        const item = document.createElement('div');
        if (className) item.className = className;
        item.innerText = `[${new Date().toLocaleTimeString()}] ${text}`;
        logBox.prepend(item);
    },

    updateTowerUI() {
        const barEl = document.getElementById('tower-progress-bar');
        const textEl = document.getElementById('tower-progress-text');
        if (barEl) barEl.style.width = `${Math.min(100, Math.floor(this.progress))}%`;
        if (textEl) textEl.innerText = `${Math.floor(this.progress)}%`;
    }
};
