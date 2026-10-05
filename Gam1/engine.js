const GameEngine = {
    player: {
        name: "Arthur",
        age: 15,
        day: 1,
        year: 1,
        // Status Dasar
        str: 10,
        agi: 10,
        int: 10,
        gold: 50,
        status: "Solo Adventurer",
        guild: "Belum Terdaftar",
        party: "Sendiri (Solo)",
        
        // Data Sistem Nyata (Bukan Sekadar Teks)
        housing: {
            name: "Kamar Sewa Murah",
            tier: 1,
            dailyCost: 1
        },
        partner: null, // Contoh struktur: { name: "Aria", affection: 10, status: "Pacar" }
        pet: null,     // Contoh struktur: { name: "Fifi", type: "Serigala", level: 1, hunger: 100 }
        summon: null,
        
        // Inventory & Equipment Nyata
        inventory: [
            { id: "potion_hp", name: "Ramuan Penyembuh", type: "consumable", value: 20, effect: { hp: 50 } },
            { id: "bread", name: "Roti Kering", type: "consumable", value: 5, effect: { hunger: 20 } }
        ],
        equipment: {
            weapon: { name: "Pedang Karatan", slot: "weapon", bonusStr: 2, value: 10 },
            armor: { name: "Pakaian Kain", slot: "armor", bonusAgi: 1, value: 5 }
        },
        skills: [
            { id: "slash", name: "Tebasan Dasar", level: 1, desc: "Serangan fisik dasar." }
        ],
        
        isAlive: true
    },

    registry: [],
    isAutoPlaying: false,
    timer: null,
    speed: 1500, // Kecepatan 1.5 detik per hari

    registerEvent(eventObj) {
        this.registry.push(eventObj);
    },

    init() {
        this.log("Karakter memulai perjalanan hidupnya sebagai petualang pemula.");
        this.updateUI();
    },

    log(message) {
        const logBox = document.getElementById("event-log");
        if (logBox) {
            logBox.innerHTML += `[Thn ${this.player.year} - Hari ${this.player.day}] ${message}<br>`;
            logBox.scrollTop = logBox.scrollHeight;
        }
    },

    // --- FUNGSI MANAJEMEN DATA NYATA ---
    addItem(item) {
        this.player.inventory.push(item);
        this.log(`Mendapatkan item: <b>${item.name}</b>`);
        this.updateUI();
    },

    useItem(index) {
        let item = this.player.inventory[index];
        if (!item) return;
        if (item.type === "consumable") {
            this.log(`Menggunakan ${item.name}.`);
            // Efek item bisa disesuaikan
            this.player.inventory.splice(index, 1);
        }
        this.updateUI();
    },

    sellItem(index) {
        let item = this.player.inventory[index];
        if (!item) return;
        this.player.gold += item.value;
        this.log(`Menjual ${item.name} seharga ${item.value} Gold.`);
        this.player.inventory.splice(index, 1);
        this.updateUI();
    },

    equipItem(newEquip, index) {
        let slot = newEquip.slot; // "weapon" atau "armor"
        let oldEquip = this.player.equipment[slot];
        
        // Lepas item lama ke inventory
        if (oldEquip && oldEquip.name !== "Pedang Karatan" && oldEquip.name !== "Pakaian Kain") {
            this.player.inventory.push(oldEquip);
        }
        
        // Pasang item baru
        this.player.equipment[slot] = newEquip;
        this.player.inventory.splice(index, 1);
        this.log(`Menggunakan perlengkapan: ${newEquip.name}`);
        this.updateUI();
    },

    learnOrUpgradeSkill(skillId, skillName) {
        let existing = this.player.skills.find(s => s.id === skillId);
        if (existing) {
            existing.level++;
            this.log(`Skill <b>${skillName}</b> naik ke level ${existing.level}!`);
        } else {
            this.player.skills.push({ id: skillId, name: skillName, level: 1, desc: "Skill baru." });
            this.log(`Mempelajari skill baru: <b>${skillName}</b>!`);
        }
        this.updateUI();
    },

    // --- PROGRES ENTITAS OTONOM (Istri, Pet, Rumah) DI LATAR BELAKANG ---
    updateAutonomousEntities() {
        // 1. Progres Pet
        if (this.player.pet) {
            this.player.pet.hunger -= 5;
            if (this.player.pet.hunger <= 0) {
                this.log(`⚠️ Pet kamu (${this.player.pet.name}) kelaparan dan kabur ke hutan!`);
                this.player.pet = null;
            } else if (Math.random() < 0.1) {
                this.player.pet.level++;
                this.log(`🐾 Pet kamu (${this.player.pet.name}) tumbuh semakin kuat (Level ${this.player.pet.level})!`);
            }
        }

        // 2. Progres Istri / Partner (Punya story sendiri)
        if (this.player.partner) {
            this.player.partner.affection += Math.floor(Math.random() * 3);
            // Contoh alur cerita otomatis partner
            if (this.player.partner.affection >= 50 && this.player.partner.status === "Pacar") {
                this.player.partner.status = "Tunangan";
                this.log(`💍 Hubungan dengan ${this.player.partner.name} meningkat ke tahap Tunangan!`);
            } else if (this.player.partner.affection >= 100 && this.player.partner.status === "Tunangan") {
                this.player.partner.status = "Istri (Menikah Sah)";
                this.log(`💒 ${this.player.partner.name} dan kamu resmi melangsungkan pernikahan agung!`);
            }
        }

        // 3. Biaya Hidup Rumah
        if (this.player.housing && this.player.housing.dailyCost > 0) {
            if (this.player.gold >= this.player.housing.dailyCost) {
                this.player.gold -= this.player.housing.dailyCost;
            } else {
                this.log(`⚠️ Kamu tidak sanggup membayar biaya perawatan ${this.player.housing.name}. Terpaksa diusir kembali ke kamar sewa murah!`);
                this.player.housing = { name: "Kamar Sewa Murah", tier: 1, dailyCost: 1 };
            }
        }
    },

    updateUI() {
        // Update teks status dasar
        document.getElementById("val-name").innerText = this.player.name;
        document.getElementById("val-age").innerText = this.player.age;
        document.getElementById("val-day").innerText = this.player.day;
        document.getElementById("val-year").innerText = this.player.year;
        document.getElementById("val-str").innerText = this.player.str + (this.player.equipment.weapon?.bonusStr || 0);
        document.getElementById("val-agi").innerText = this.player.agi + (this.player.equipment.armor?.bonusAgi || 0);
        document.getElementById("val-int").innerText = this.player.int;
        document.getElementById("val-gold").innerText = this.player.gold;
        document.getElementById("val-status").innerText = this.player.status;
        document.getElementById("val-guild").innerText = this.player.guild;
        document.getElementById("val-party").innerText = this.player.party;
        
        // Update Entitas Otonom
        document.getElementById("val-housing").innerText = this.player.housing ? this.player.housing.name : "-";
        document.getElementById("val-partner").innerText = this.player.partner ? `${this.player.partner.name} (${this.player.partner.status}, Keintiman: ${this.player.partner.affection})` : "Belum Ada";
        document.getElementById("val-pet").innerText = this.player.pet ? `${this.player.pet.name} (Lv.${this.player.pet.level}, Kenyang: ${this.player.pet.hunger}%)` : "Tidak Ada";
        
        // Update Inventory & Equipment UI (Opsional jika elemen HTML-nya ada)
        let invContainer = document.getElementById("inventory-list");
        if (invContainer) {
            invContainer.innerHTML = this.player.inventory.map((item, idx) => 
                `<div>${item.name} <button onclick="GameEngine.sellItem(${idx})">Jual (${item.value}G)</button></div>`
            ).join('') || "<i>Inventory Kosong</i>";
        }

        if (!this.player.isAlive) {
            this.stopAuto();
            document.getElementById("btn-toggle-auto").disabled = true;
            document.getElementById("btn-next").disabled = true;
            document.getElementById("choice-container").innerHTML = "<h3 style='color:red;'>Karakter Telah Meninggal Dunia.</h3>";
        }
    },

    nextTurn() {
        if (!this.player.isAlive) return;

        // 1. Tambah Waktu & Jalankan Entitas Otonom
        this.player.day++;
        this.updateAutonomousEntities();

        if (this.player.day > 365) {
            this.player.day = 1;
            this.player.year++;
            this.player.age++;
            this.log(`Tahun berganti. Usia karakter sekarang ${this.player.age} tahun.`);
            
            if (this.player.age >= 80 && Math.random() < 0.2) {
                this.player.isAlive = false;
                this.log("Karakter meninggal dunia dengan tenang karena usia tua.");
                this.updateUI();
                return;
            }
        }

        // 2. Filter Event yang memenuhi syarat
        let availableEvents = this.registry.filter(ev => {
            if (ev.condition) {
                return ev.condition(this.player);
            }
            return true;
        });

        // 3. Ambil Event secara Random berdasarkan bobot
        if (availableEvents.length > 0) {
            let totalWeight = availableEvents.reduce((sum, ev) => sum + (ev.weight || 1), 0);
            let randomNum = Math.random() * totalWeight;
            let currentWeight = 0;

            for (let ev of availableEvents) {
                currentWeight += (ev.weight || 1);
                if (randomNum <= currentWeight) {
                    if (ev.hasChoices) {
                        this.stopAuto();
                    }
                    ev.execute(this.player, (msg) => this.log(msg), (choices) => this.showChoices(choices));
                    break;
                }
            }
        } else {
            this.log("Hari berlalu dengan tenang tanpa kejadian berarti.");
        }

        this.updateUI();
    },

    toggleAuto() {
        if (this.isAutoPlaying) {
            this.stopAuto();
        } else {
            this.startAuto();
        }
    },

    startAuto() {
        if (!this.player.isAlive) return;
        this.isAutoPlaying = true;
        document.getElementById("btn-toggle-auto").innerText = "Pause (Berhenti Otomatis)";
        document.getElementById("btn-toggle-auto").style.background = "#ff4444";
        document.getElementById("btn-next").disabled = true;

        this.timer = setInterval(() => {
            this.nextTurn();
        }, this.speed);
    },

    stopAuto() {
        this.isAutoPlaying = false;
        clearInterval(this.timer);
        document.getElementById("btn-toggle-auto").innerText = "Mulai Auto-Progress";
        document.getElementById("btn-toggle-auto").style.background = "#ffcc00";
        document.getElementById("btn-next").disabled = false;
    },

    showChoices(choices) {
        let container = document.getElementById("choice-container");
        container.innerHTML = "<h4>⚠️ [EVENT UTAMA] Butuh Keputusanmu:</h4>";
        
        choices.forEach(ch => {
            let btn = document.createElement("button");
            btn.innerText = ch.text;
            btn.onclick = () => {
                ch.action(this.player, (msg) => this.log(msg), (choices) => this.showChoices(choices));
                container.innerHTML = "";
                this.updateUI();
            };
            container.appendChild(btn);
        });
    }
};
