/**
 * PILAR 1: THE IRON WALL & UI SHIELD
 * Menghapus jejak "Web" dan mengunci integritas UI.
 */

const IronWall = {
    init() {
        this.disableInspect();
        this.lockViewport();
        this.preventScrollBounce();
        this.applyNativeFeel();
        console.log("🛡️ Iron Wall: Active. System Protected.");
    },

    // Mematikan Klik Kanan dan Shortcut Inspect Element
    disableInspect() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (
                e.key === "F12" ||
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
                (e.ctrlKey && e.key === "U")
            ) {
                e.preventDefault();
                return false;
            }
        });
    },

    // Mengunci Zoom agar layout tidak berantakan
    lockViewport() {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault(); // Mencegah double tap zoom
            }
            lastTouchEnd = now;
        }, false);
    },

    // Mematikan efek bounce/membal (khusus iOS/Safari)
    preventScrollBounce() {
        document.body.style.overscrollBehaviorY = 'contain';
    },

    // Mencegah seleksi teks (agar tidak bisa copy-paste data sensitif)
    applyNativeFeel() {
        document.documentElement.style.webkitUserSelect = 'none';
        document.documentElement.style.userSelect = 'none';
        // Mengaktifkan seleksi hanya pada input field
        const style = document.createElement('style');
        style.innerHTML = `
            input, textarea, select { 
                -webkit-user-select: text !important; 
                user-select: text !important; 
            }
            .notranslate { translate: no !important; }
        `;
        document.head.appendChild(style);
    }
};

IronWall.init();





/**
 * PILAR 2: THE SENSORY ENGINE
 * Mengatur bunyi dan getaran untuk setiap interaksi.
 */

const Sensory = {
    // Audio Context untuk menghasilkan bunyi tanpa file MP3 (Hemat Kuota)
    ctx: new (window.AudioContext || window.webkitAudioContext)(),

    // Fungsi Bunyi Beep (Frekuensi, Durasi, Tipe)
    playTone(freq, duration, type = "sine", volume = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
        osc.stop(this.ctx.currentTime + duration);
    },

    trigger(action) {
        switch(action) {
            case 'click':
                this.playTone(800, 0.1, "sine", 0.05);
                if(navigator.vibrate) navigator.vibrate(15);
                break;
            case 'success':
                this.playTone(1200, 0.3, "sine", 0.1);
                this.playTone(1500, 0.4, "sine", 0.08);
                if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
                break;
            case 'error':
                this.playTone(200, 0.5, "sawtooth", 0.1);
                if(navigator.vibrate) navigator.vibrate([100, 50, 100]);
                break;
            case 'alert':
                this.playTone(1000, 0.2, "square", 0.05);
                if(navigator.vibrate) navigator.vibrate(50);
                break;
        }
    }
};





/**
 * PILAR 3: THE MULTI-CONFIG MANAGER
 * Menghubungkan 50+ Firebase Project secara dinamis.
 */

class GuildRegistry {
    constructor() {
        this.instances = {}; // Menyimpan instance Firebase yang sudah terbuka
        this.masterApp = null;
        this.currentShardId = null;
    }

    // 1. Inisialisasi Database Pusat (Hanya sekali)
    async initMaster(masterConfig) {
        if (!firebase.apps.length) {
            this.masterApp = firebase.initializeApp(masterConfig, "MASTER_GATEWAY");
        } else {
            this.masterApp = firebase.app("MASTER_GATEWAY");
        }
        console.log("📍 Connected to Master Gateway");
        return this.masterApp.database();
    }

    /**
     * 2. Fungsi Penghubung Shard Dinamis
     * @param {string} shardId - ID Wilayah (misal: 'KNG_CIG_01')
     * @param {object} config - Firebase Config untuk wilayah tersebut
     */
    connectToShard(shardId, config) {
        // Jika sudah pernah terkoneksi, jangan buat koneksi baru (Hemat RAM)
        if (this.instances[shardId]) {
            return this.instances[shardId];
        }

        // Inisialisasi proyek baru secara on-the-fly
        const newApp = firebase.initializeApp(config, shardId);
        this.instances[shardId] = {
            rtdb: newApp.database(),
            firestore: newApp.firestore ? newApp.firestore() : null, // Jika butuh Firestore
            app: newApp
        };

        this.currentShardId = shardId;
        console.log(`🔗 Shard Connected: ${shardId}`);
        return this.instances[shardId];
    }

    /**
     * 3. Resolver: Mencari Alamat Server
     * Digunakan saat Login atau saat mengambil misi lintas wilayah.
     */
    async getShardConfig(targetRegionId) {
        const masterDb = this.masterApp.database();
        const snapshot = await masterDb.ref(`shard_registry/${targetRegionId}`).once('value');
        
        if (snapshot.exists()) {
            return snapshot.val(); // Mengembalikan config lengkap {apiKey, authDomain, dll}
        } else {
            throw new Error("SERVER_NOT_FOUND: Wilayah belum terjangkau Guild.");
        }
    }

    /**
     * 4. Helper untuk mendapatkan DB yang sedang aktif
     */
    getActiveDb() {
        if (!this.currentShardId) return null;
        return this.instances[this.currentShardId].rtdb;
    }
}

// Inisialisasi Global Manager
const Registry = new GuildRegistry();





