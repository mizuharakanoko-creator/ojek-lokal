const GameEngine = {
    player: {
        name: "Arthur",
        age: 15,
        day: 1,
        year: 1,
        gold: 50,
        str: 10, agi: 10, int: 10,
        
        // Slot Wadah Peralatan (Bisa dinamis / modular)
        equipment: {
            weapon: null,       // Berisi objek item
            armor: null,        // Berisi objek item
            accessory: null     // Contoh slot tambahan
        },
        
        // Slot Inventory Terbatas (Maksimal 20 slot)
        inventory: [], // Array objek item, max length = 20
        
        // Slot Dunia Hidup (Kenalan / NPC yang dikenal)
        acquaintances: [], // Berisi daftar semua orang yang pernah ditemui
        
        // Party Aktif & Relasi Khusus
        party: [],          // Berisi ID/referensi kenalan yang ikut party
        spouse: null        // Berisi ID/referensi kenalan yang jadi istri
    },

    // Sistem Event & Hook Dunia (Akan diisi dari file luar)
    events: [],
    worldUpdaters: [], // Fungsi-fungsi yang berjalan otomatis tiap ganti hari untuk menggerakkan NPC

    registerEvent(eventObj) {
        this.events.push(eventObj);
    },

    // Daftarkan fungsi otonom NPC/dunia dari file eksternal
    registerWorldUpdater(updaterFn) {
        this.worldUpdaters.push(updaterFn);
    },

    nextTurn() {
        this.player.day++;
        
        // Jalankan semua simulasi dunia luar secara otomatis di latar belakang!
        this.worldUpdaters.forEach(fn => fn(this.player, this.log.bind(this)));

        // Logika harian lainnya...
        this.updateUI();
    },

    log(text) {
        // Fungsi mencetak teks ke log panel
        let logDiv = document.getElementById('event-log');
        logDiv.innerHTML += `<p>[Hari ${this.player.day}] ${text}</p>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    },

    updateUI() {
        // Update dasar UI...
        document.getElementById('val-gold').innerText = this.player.gold;
        // Dan hook UI lainnya bisa ditarik dari ekstensi
    }
};
