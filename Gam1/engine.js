const GameEngine = {
    player: {
        name: "Arthur",
        age: 15,
        day: 1,
        year: 1,
        gold: 50,
        str: 10,
        agi: 10,
        int: 10,
        location: "Desa Oakhaven",
        equipment: { weapon: null, armor: null },
        inventory: [], // Maksimal 20 item
        spouse: "Belum Ada"
    },

    events: [],
    worldUpdaters: [], // Fungsi latar belakang dari file lain
    isAutoRunning: false,
    autoInterval: null,

    init() {
        this.loadGame();
        this.log("Selamat datang di dunia simulasi petualangan yang hidup.");
        this.updateUI();
        this.triggerNextEvent();
    },

    // Pendaftaran Event dari file luar
    registerEvent(eventObj) {
        this.events.push(eventObj);
    },

    // Pendaftaran simulasi dunia (NPC, keluarga, dll)
    registerWorldUpdater(updaterFn) {
        this.worldUpdaters.push(updaterFn);
    },

    log(text) {
        let logDiv = document.getElementById('event-log');
        if (!logDiv) return;
        logDiv.innerHTML += `<p>[Hari ${this.player.day}, Thn ${this.player.year}] ${text}</p>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    },

    updateUI() {
        document.getElementById('val-name').innerText = this.player.name;
        document.getElementById('val-age').innerText = this.player.age;
        document.getElementById('val-day').innerText = `Hari ${this.player.day}`;
        document.getElementById('val-year').innerText = this.player.year;
        document.getElementById('val-str').innerText = this.player.str;
        document.getElementById('val-agi').innerText = this.player.agi;
        document.getElementById('val-int').innerText = this.player.int;
        document.getElementById('val-gold').innerText = this.player.gold;
        document.getElementById('val-location').innerText = this.player.location;
        document.getElementById('val-spouse').innerText = this.player.spouse;

        // Update Equipment
        document.getElementById('val-weapon').innerText = this.player.equipment.weapon ? this.player.equipment.weapon.name : "Kosong";
        document.getElementById('val-armor').innerText = this.player.equipment.armor ? this.player.equipment.armor.name : "Kosong";

        // Update Inventory List
        let invContainer = document.getElementById('inventory-list');
        if (invContainer) {
            if (this.player.inventory.length === 0) {
                invContainer.innerHTML = '<span style="color: #777;">Tas kosong...</span>';
            } else {
                invContainer.innerHTML = this.player.inventory.map((item, index) => 
                    `<div>- ${item.name} <button onclick="ItemSystem.useItem(${index})" style="font-size:10px; padding:2px 5px;">Pakai</button></div>`
                ).join('');
            }
        }

        // Update jumlah kenalan dari WorldManager jika ada
        if (typeof WorldManager !== 'undefined') {
            let world = WorldManager.getWorld();
            document.getElementById('val-acquaintances-count').innerText = world.discoveredPeople.length;
        }

        this.saveGame();
    },

    nextTurn() {
        // Waktu berjalan
        this.player.day++;
        if (this.player.day > 365) {
            this.player.day = 1;
            this.player.year++;
            this.player.age++;
            this.log(`Tahun berganti! Arthur kini berusia ${this.player.age} tahun.`);
        }

        // Jalankan semua updater dunia di latar belakang (NPC hidup, menikah, desa hancur, dll)
        this.worldUpdaters.forEach(updater => {
            updater(this.player, this.log.bind(this));
        });

        this.updateUI();
        this.triggerNextEvent();
    },

    toggleAuto() {
        if (this.isAutoRunning) {
            clearInterval(this.autoInterval);
            this.isAutoRunning = false;
            document.getElementById('btn-toggle-auto').innerText = "Mulai Auto-Progress";
            document.getElementById('btn-toggle-auto').style.background = "#ffcc00";
        } else {
            this.isAutoRunning = true;
            document.getElementById('btn-toggle-auto').innerText = "Stop Auto-Progress";
            document.getElementById('btn-toggle-auto').style.background = "#ff4444";
            this.autoInterval = setInterval(() => {
                this.nextTurn();
            }, 1500); // 1.5 detik per hari
        }
    },

    triggerNextEvent() {
        let choiceContainer = document.getElementById('choice-container');
        choiceContainer.innerHTML = '';

        // Filter event yang memenuhi syarat (condition)
        let validEvents = this.events.filter(ev => !ev.condition || ev.condition(this.player));
        if (validEvents.length === 0) {
            this.log("Hari berlalu tenang tanpa kejadian berarti.");
            return;
        }

        // Pilih event secara acak berdasarkan bobot (weight)
        let selectedEvent = this.getRandomWeightedEvent(validEvents);
        
        if (selectedEvent) {
            selectedEvent.execute(
                this.player, 
                this.log.bind(this), 
                (choices) => this.showChoices(choices)
            );
        }
    },

    getRandomWeightedEvent(events) {
        let totalWeight = events.reduce((sum, ev) => sum + (ev.weight || 1), 0);
        let randomVal = Math.random() * totalWeight;
        let currentWeight = 0;

        for (let ev of events) {
            currentWeight += (ev.weight || 1);
            if (randomVal <= currentWeight) return ev;
        }
        return events[0];
    },

    showChoices(choices) {
        let container = document.getElementById('choice-container');
        container.innerHTML = '<h3>Pilihan Aksi:</h3>';
        
        choices.forEach(choice => {
            let btn = document.createElement('button');
            btn.innerText = choice.text;
            btn.style.display = 'block';
            btn.style.margin = '5px 0';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.onclick = () => {
                container.innerHTML = ''; // Hapus pilihan setelah diklik
                choice.action(this.player, this.log.bind(this));
                this.updateUI();
            };
            container.appendChild(btn);
        });
    },

    saveGame() {
        localStorage.setItem('adventurer_save_state', JSON.stringify(this.player));
    },

    loadGame() {
        let saved = localStorage.getItem('adventurer_save_state');
        if (saved) {
            this.player = JSON.parse(saved);
        }
    }
};
