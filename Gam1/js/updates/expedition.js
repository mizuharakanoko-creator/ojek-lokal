// js/updates/expedition.js
import { GameCore } from '../core.js';
import { PartySystem } from './party.js';

export const ExpeditionSystem = {
    // Data daftar lantai tower dan syarat minimalnya
    towerFloors: [
        { floor: 1, name: "Gerbang Pemula", minAtk: 10, rewardGold: 20, rewardGems: 5 },
        { floor: 2, name: "Koridor Goblin", minAtk: 25, rewardGold: 45, rewardGems: 10 },
        { floor: 3, name: "Ruang Bawah Tanah Orc", minAtk: 50, rewardGold: 90, rewardGems: 20 },
        { floor: 4, name: "Sarang Wyvern", minAtk: 90, rewardGold: 160, rewardGems: 35 },
        { floor: 5, name: "Puncak Menara Kuno", minAtk: 150, rewardGold: 300, rewardGems: 50 }
    ],

    activeExpeditions: [], // Menyimpan ekspedisi yang sedang berjalan

    init() {
        console.log("Modul Ekspedisi & Manajemen Lantai Dimuat.");
        this.renderExpeditionUI();
        this.startExpeditionLoop();
    },

    // Kirim karakter tertentu ke lantai pilihan
    sendToFloor(floorNumber, heroUniqueId) {
        const floorData = this.towerFloors.find(f => f.floor === floorNumber);
        const hero = GameCore.player.party.find(h => h.uniqueId === heroUniqueId);

        if (!floorData || !hero) {
            alert("Data lantai atau hero tidak valid!");
            return;
        }

        // Cek syarat minimal ATK / Level karakter untuk lantai tersebut
        if (hero.atk < floorData.minAtk) {
            alert(`⚠️ Gagal! ${hero.name} butuh minimal ATK ${floorData.minAtk} untuk masuk ke ${floorData.name}.`);
            return;
        }

        // Cek apakah hero sudah sedang bertugas di ekspedisi lain
        const alreadyBusy = this.activeExpeditions.some(exp => exp.heroId === heroUniqueId);
        if (alreadyBusy) {
            alert(`⚠️ ${hero.name} sedang dalam misi ekspedisi lain!`);
            return;
        }

        // Masukkan ke daftar ekspedisi aktif (durasi misal 10 detik per lantai)
        this.activeExpeditions.push({
            heroId: heroUniqueId,
            heroName: hero.name,
            floor: floorData.floor,
            floorName: floorData.name,
            progress: 0,
            rewardGold: floorData.rewardGold,
            rewardGems: floorData.rewardGems
        });

        alert(`🚀 ${hero.name} dikirim berpatroli ke Lantai ${floorData.floor} (${floorData.name})!`);
        this.renderExpeditionUI();
    },

    // Loop otomatis khusus untuk karakter yang sedang dikirim ekspedisi
    startExpeditionLoop() {
        setInterval(() => {
            if (this.activeExpeditions.length === 0) return;

            this.activeExpeditions.forEach((exp, index) => {
                exp.progress += 20; // Progress naik 20% tiap detik (5 detik selesai)

                if (exp.progress >= 100) {
                    // Misi Selesai! Berikan reward
                    GameCore.player.gold += exp.rewardGold;
                    GameCore.player.gems += exp.rewardGems;

                    // Peluang kecil terjadi bahaya/kematian jika di lantai tinggi
                    if (exp.floor >= 3 && Math.random() < 0.15) {
                        // Cari hero berdasarkan ID dan beri risiko
                        const heroIdx = GameCore.player.party.findIndex(h => h.uniqueId === exp.heroId);
                        if (heroIdx !== -1) {
                            const fallen = GameCore.player.party[heroIdx];
                            // Peluang permadeath di ekspedisi
                            if (Math.random() < 0.4) {
                                GameCore.player.party.splice(heroIdx, 1);
                                console.log(`[PERMADEATH] ${fallen.name} tewas saat ekspedisi di Lantai ${exp.floor}!`);
                            }
                        }
                    }

                    // Reset progress atau selesaikan misi (bisa diulang otomatis atau manual)
                    exp.progress = 0; 
                }
            });

            this.renderExpeditionUI();
            GameCore.updateUI();
        }, 1000);
    },

    // Render tampilan pilihan lantai & penugasan karakter ke HTML
    renderExpeditionUI() {
        const container = document.getElementById('expedition-container');
        if (!container) return;

        container.innerHTML = "";

        this.towerFloors.forEach(floor => {
            let floorDiv = document.createElement('div');
            floorDiv.className = 'floor-card';
            floorDiv.style.cssText = "background: #1a2234; padding: 10px; margin-bottom: 8px; border-radius: 6px; border: 1px solid #2a374a;";
            
            let htmlContent = `<strong>Lantai ${floor.floor}: ${floor.name}</strong><br>
                               <small style="color: #94a3b8;">Syarat ATK: ${floor.minAtk} | Hadiah: ${floor.rewardGold} Gold</small><br>`;

            // Cek apakah ada hero di party yang sedang bertugas di lantai ini
            const activeExp = this.activeExpeditions.find(e => e.floor === floor.floor);
            if (activeExp) {
                htmlContent += `<div style="margin-top: 6px;">
                                  <small style="color: #4ade80;">Misi Berjalan: ${activeExp.heroName} (${activeExp.progress}%)</small>
                                  <div style="background:#0b0f19; height:6px; border-radius:3px; margin-top:2px; overflow:hidden;">
                                      <div style="background:#38bdf8; width:${activeExp.progress}%; height:100%;"></div>
                                  </div>
                                </div>`;
            } else {
                // Tombol pilih hero untuk dikirim ke lantai ini
                htmlContent += `<div style="margin-top: 6px; display: flex; gap: 5px;">
                                  <select id="select-hero-floor-${floor.floor}" style="background:#0b0f19; color:#fff; border:1px solid #334155; padding:4px; border-radius:4px; font-size:11px; flex:1;">
                                     <option value="">-- Pilih Hero --</option>`;
                
                GameCore.player.party.forEach(h => {
                    htmlContent += `<option value="${h.uniqueId}">${h.name} (ATK: ${h.atk})</option>`;
                });

                htmlContent += `  </select>
                                  <button onclick="window.dispatchExpedition(${floor.floor})" style="width: auto; padding: 4px 8px; font-size: 11px;">Kirim</button>
                                </div>`;
            }

            floorDiv.innerHTML = htmlContent;
            container.appendChild(floorDiv);
        });
    }
};

// Global helper agar tombol HTML di dalam string template bisa memanggil fungsi modul
window.dispatchExpedition = function(floorNumber) {
    const selectEl = document.getElementById(`select-hero-floor-${floorNumber}`);
    if (selectEl && selectEl.value) {
        ExpeditionSystem.sendToFloor(floorNumber, Number(selectEl.value));
    } else {
        alert("Pilih hero terlebih dahulu!");
    }
};
