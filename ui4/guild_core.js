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
