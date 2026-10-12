// js/updates/gacha.js
import { GameCore } from '../core.js';

export const GachaSystem = {
    // Daftar pool karakter baru (bisa ditambah ribuan karakter di sini tanpa ganggu kode utama)
    characterPool: [
        { id: 1, name: "Eiji (Rarity: N)", atk: 10 },
        { id: 2, name: "Helena (Rarity: R)", atk: 25 },
        { id: 3, name: "Ignis (Rarity: SR)", atk: 50 }
    ],

    // Fungsi gacha
    pullCharacter() {
        const cost = 30;
        if (GameCore.player.gems >= cost) {
            GameCore.player.gems -= cost;
            
            // Pilih karakter secara acak dari modul ini sendiri
            const randomChar = this.characterPool[Math.floor(Math.random() * this.characterPool.length)];
            
            // Masukkan ke party player di core
            GameCore.player.party.push(randomChar);
            
            alert(`Berhasil Summon: ${randomChar.name}!`);
            console.log("Current Party:", GameCore.player.party);
        } else {
            alert("Gem tidak cukup!");
        }
    }
};
