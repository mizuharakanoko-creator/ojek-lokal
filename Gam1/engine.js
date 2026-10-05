const GameEngine = {
    player: {
        name: "Arthur",
        age: 15,
        day: 1,
        year: 1,
        str: 10,
        agi: 10,
        int: 10,
        gold: 50,
        status: "Solo Adventurer",
        guild: "Belum Terdaftar",
        party: "Sendiri (Solo)",
        isAlive: true
    },

    registry: [],
    isAutoPlaying: false,
    timer: null,
    speed: 1500, // Kecepatan jalan otomatis (dalam milidetik / 1.5 detik per hari)

    registerEvent(eventObj) {
        this.registry.push(eventObj);
    },

    init() {
        this.log("Karakter memulai perjalanan hidupnya sebagai petualang pemula.");
        this.updateUI();
    },

    log(message) {
        const logBox = document.getElementById("event-log");
        logBox.innerHTML += `[Thn ${this.player.year} - Hari ${this.player.day}] ${message}<br>`;
        logBox.scrollTop = logBox.scrollHeight;
    },

    updateUI() {
        document.getElementById("val-name").innerText = this.player.name;
        document.getElementById("val-age").innerText = this.player.age;
        document.getElementById("val-day").innerText = this.player.day;
        document.getElementById("val-year").innerText = this.player.year;
        document.getElementById("val-str").innerText = this.player.str;
        document.getElementById("val-agi").innerText = this.player.agi;
        document.getElementById("val-int").innerText = this.player.int;
        document.getElementById("val-gold").innerText = this.player.gold;
        document.getElementById("val-status").innerText = this.player.status;
        document.getElementById("val-guild").innerText = this.player.guild;
        document.getElementById("val-party").innerText = this.player.party;

        if (!this.player.isAlive) {
            this.stopAuto();
            document.getElementById("btn-toggle-auto").disabled = true;
            document.getElementById("btn-next").disabled = true;
            document.getElementById("choice-container").innerHTML = "<h3 style='color:red;'>Karakter Telah Meninggal Dunia.</h3>";
        }
    },

    nextTurn() {
        if (!this.player.isAlive) return;

        // 1. Tambah Waktu
        this.player.day++;
        if (this.player.day > 365) {
            this.player.day = 1;
            this.player.year++;
            this.player.age++;
            this.log(`Tahun berganti. Usia karakter sekarang ${this.player.age} tahun.`);
            
            // Sistem Kematian karena Usia Tua (Misal: 80 tahun)
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
                    // Jika event memiliki pilihan interaktif, JEDA otomatis game-nya
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
                ch.action(this.player, (msg) => this.log(msg));
                container.innerHTML = "";
                this.updateUI();
                // Otomatis lanjut jalan lagi setelah memilih (opsional, jika ingin dilanjut)
                // this.startAuto(); 
            };
            container.appendChild(btn);
        });
    }
};
