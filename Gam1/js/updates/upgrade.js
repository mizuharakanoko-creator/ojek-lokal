// js/updates/upgrade.js
import { GameCore } from '../core.js';
import { PartySystem } from './party.js';

export const UpgradeSystem = {
    upgradeCost: 50, // Biaya awal upgrade party

    init() {
        console.log("Modul Upgrade Dasar Dimuat.");
    },

    // Fungsi untuk memperkuat semua hero di party
    upgradePartyPower() {
        if (GameCore.player.party.length === 0) {
            alert("Tidak ada party untuk di-upgrade! Lakukan Summon terlebih dahulu.");
            return;
        }

        if (GameCore.player.gold >= this.upgradeCost) {
            GameCore.player.gold -= this.upgradeCost;

            // Tambah kekuatan setiap hero yang ada di party saat ini
            GameCore.player.party.forEach(hero => {
                hero.atk += 5;
                hero.defense += 2;
            });

            // Naikkan biaya upgrade untuk selanjutnya
            this.upgradeCost = Math.floor(this.upgradeCost * 1.5);

            alert("💪 Berhasil memperkuat Party! ATK & DEF meningkat.");
            PartySystem.renderPartyUI();
            this.updateUpgradeUI();
            GameCore.updateUI();
        } else {
            alert("Gold tidak cukup untuk melakukan upgrade!");
        }
    },

    updateUpgradeUI() {
        const costEl = document.getElementById('upgrade-cost-text');
        if (costEl) costEl.innerText = this.upgradeCost;
    }
};
