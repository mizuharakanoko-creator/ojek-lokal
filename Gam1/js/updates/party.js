// js/updates/party.js
import { GameCore } from '../core.js';
import { TowerSystem } from './tower.js';

export const PartySystem = {
    heroPool: [
        { id: 1, name: "Eiji", class: "Warrior", rarity: "N", atk: 15, defense: 5 },
        { id: 2, name: "Helena", class: "Mage", rarity: "R", atk: 30, defense: 3 },
        { id: 3, name: "Ignis", class: "Assassins", rarity: "SR", atk: 55, defense: 4 },
        { id: 4, name: "Ragnar", class: "Tank", rarity: "SSR", atk: 90, defense: 15 }
    ],

    init() {
        console.log("Modul Party Dimuat.");
        this.renderPartyUI();
    },

    summonHero() {
        const cost = 25;
        if (GameCore.player.gems >= cost) {
            GameCore.player.gems -= cost;
            const template = this.heroPool[Math.floor(Math.random() * this.heroPool.length)];
            const newHero = { ...template, uniqueId: Date.now() + Math.random() };
            GameCore.player.party.push(newHero);
            
            TowerSystem.addTowerLog(`🎉 Summon Sukses: [${newHero.rarity}] ${newHero.name} bergabung!`, "success-log");
            this.renderPartyUI();
            GameCore.updateUI();
        } else {
            alert("Gem tidak cukup untuk summon!");
        }
    },

    getTotalPartyAtk() {
        return GameCore.player.party.reduce((total, hero) => total + hero.atk, 10);
    },

    getTotalPartyDefense() {
        return GameCore.player.party.reduce((total, hero) => total + hero.defense, 5);
    },

    renderPartyUI() {
        const container = document.getElementById('party-list');
        if (!container) return;
        
        container.innerHTML = "";
        if (GameCore.player.party.length === 0) {
            container.innerHTML = "<small style='color:#f87171;'>Party kosong! Semua hero gugur atau belum direkrut.</small>";
            return;
        }

        GameCore.player.party.forEach(hero => {
            const card = document.createElement('div');
            card.className = `hero-card rarity-${hero.rarity.toLowerCase()}`;
            card.innerHTML = `<strong>${hero.name}</strong> (${hero.class})<br><small>ATK: ${hero.atk} | DEF: ${hero.defense}</small>`;
            container.appendChild(card);
        });
    },

    // Mekanisme Hero Mati & Terhapus Permanen
    killRandomHero() {
        if (GameCore.player.party.length === 0) return;

        const index = Math.floor(Math.random() * GameCore.player.party.length);
        const fallenHero = GameCore.player.party[index];

        GameCore.player.party.splice(index, 1);
        
        TowerSystem.addTowerLog(`💀 TRAGEDI! [${fallenHero.rarity}] ${fallenHero.name} tewas dalam pertempuran dan TERHAPUS dari party!`, "danger-log");
        this.renderPartyUI();
    }
};
