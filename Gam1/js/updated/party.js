// js/updates/party.js
import { GameCore } from '../core.js';

export const PartySystem = {
    // Database pool karakter (bisa ditambah ratusan karakter di sini tanpa ganggu core)
    heroPool: [
        { id: 1, name: "Eiji", class: "Warrior", rarity: "N", atk: 15 },
        { id: 2, name: "Helena", class: "Mage", rarity: "R", atk: 30 },
        { id: 3, name: "Ignis", class: "Assassins", rarity: "SR", atk: 55 },
        { id: 4, name: "Ragnar", class: "Tank", rarity: "SSR", atk: 90 }
    ],

    init() {
        console.log("Modul Party & Gacha Dimuat.");
        this.renderPartyUI();
    },

    // Sistem Rekrut / Summon Karakter
    summonHero() {
        const cost = 25;
        if (GameCore.player.gems >= cost) {
            GameCore.player.gems -= cost;
            
            // Random hero dari pool
            const randomHero = this.heroPool[Math.floor(Math.random() * this.heroPool.length)];
            
            // Masukkan duplikat atau buat instance baru ke party
            GameCore.player.party.push({ ...randomHero, uniqueId: Date.now() });
            
            alert(`🎉 Berhasil merekrut pahlawan baru: [${randomHero.rarity}] ${randomHero.name}!`);
            this.renderPartyUI();
        } else {
            alert("Gem tidak cukup untuk summon!");
        }
    },

    // Menghitung total attack dari semua party yang aktif
    getTotalPartyAtk() {
        return GameCore.player.party.reduce((total, hero) => total + hero.atk, 10); // Base 10 dari Master
    },

    // Render tampilan party ke HTML
    renderPartyUI() {
        const container = document.getElementById('party-list');
        if (!container) return;
        
        container.innerHTML = "";
        if (GameCore.player.party.length === 0) {
            container.innerHTML = "<small>Belum ada pahlawan di party. Lakukan Summon!</small>";
            return;
        }

        GameCore.player.party.forEach(hero => {
            const card = document.createElement('div');
            card.className = `hero-card rarity-${hero.rarity.toLowerCase()}`;
            card.innerHTML = `<strong>${hero.name}</strong> (${hero.class})<br><small>ATK: ${hero.atk} | [${hero.rarity}]</small>`;
            container.appendChild(card);
        });
    }
};
