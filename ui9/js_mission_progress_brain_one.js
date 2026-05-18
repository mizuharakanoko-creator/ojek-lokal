/**
 * js_mission_progress_brain_one.js
 * CORE ENGINE & COMPONENT ROUTER (INTEGRATED WITH TERMINAL ROUTER)
 */

// 1. GLOBAL STATE (Tetap dipertahankan sebagai pusat penyimpanan data di UI)
window.SovereignState = {
    db: null,       // Firestore (Untuk data global jika perlu)
    rtdb: null,     // RTDB (Default/Master)
    currentUser: null,
    activeContractId: null,
    currentMissionData: null // Akan diisi oleh getSupremeData dari Brain Two
};

// 2. VISUAL DEBUGGER FOR MOBILE
window.debugLog = (msg, type = "info") => {
    console.log(`[DEBUG] ${msg}`);
    const statusEl = document.getElementById('status-pulsing') || 
                     document.getElementById('statusPulsing') || 
                     document.getElementById('intelText');
    
    if (statusEl) {
        statusEl.innerText = msg.toUpperCase();
        statusEl.style.color = type === "error" ? "#ff0055" : "#00ffff";
        // Efek kedip saat ada update
        statusEl.style.animation = 'none';
        setTimeout(() => statusEl.style.animation = 'pulse 1.5s infinite', 10);
    }
};

// 3. CORE ENGINE (Sinkronisasi dengan Terminal Router)
window.Core = {
    initFirebase: () => {
        window.debugLog("🔗 MENGHUBUNGKAN NEURAL LINK...");
        
        try {
            // Kita tidak lagi menginisialisasi Firebase secara hardcoded di sini.
            // Kita gunakan Master Terminal dari terminal_router.js
            const masterDB = getTerminal('FB1_MASTER');
            
            if (masterDB) {
                window.SovereignState.rtdb = masterDB;
                window.debugLog("🔥 MASTER DATABASE CONNECTED!");
            } else {
                throw new Error("Master Terminal FB1 Gagal Dimuat");
            }
        } catch (err) {
            window.debugLog("❌ KONEKSI GAGAL: " + err.message, "error");
        }
    },

    checkAuth: () => {
        window.debugLog("👤 MEMERIKSA OTORITAS...");
        const savedUser = sessionStorage.getItem('user_identity'); // Sesuaikan dengan key di debug anda
        const savedContractId = sessionStorage.getItem('active_contract_id');

        if (savedUser) {
            window.SovereignState.currentUser = JSON.parse(savedUser);
        } else {
            window.SovereignState.currentUser = { uid: 'GUEST', role: 'adventurer', name: 'Unknown' };
        }

        window.SovereignState.activeContractId = savedContractId;
        
        if (!savedContractId) {
            window.debugLog("⚠️ ID KONTRAK TIDAK DITEMUKAN!", "error");
        } else {
            window.debugLog(`✅ SESI AKTIF: ${savedContractId.substring(0,12)}...`);
        }
    }
};

// 4. COMPONENT ROUTER (Pemuat Modul UI)
window.Router = {
    loadComponent: async (containerId, filePath) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        window.debugLog(`📥 LOADING MODULE: ${filePath.toUpperCase()}...`);
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;

            // Eksekusi Script di dalam file yang di-fetch
            const scripts = container.querySelectorAll("script");
            for (const oldScript of scripts) {
                const newScript = document.createElement("script");
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.text = oldScript.text;
                }
                document.body.appendChild(newScript);
                newScript.parentNode.removeChild(newScript);
            }

            // Jalankan Re-inisialisasi Tab
            window.Router.reinit(containerId);
            
        } catch (err) {
            window.debugLog(`❌ GAGAL MUAT MODULE`, "error");
            console.error(err);
        }
    },

    reinit: (tabId) => {
        // Jika Tab HQ terbuka (Tempat melihat progres misi)
        if (tabId === 'tab-hq' || document.getElementById('m-title')) {
            if (typeof window.performDeepMiningHQ === 'function') {
                window.debugLog("🛰️ MENYEDOT DATA SUPREME...");
                const contractId = window.SovereignState.activeContractId;
                window.performDeepMiningHQ(contractId);
            } else {
                window.debugLog("⚠️ ENGINE BRAIN TWO TIDAK TERDETEKSI", "error");
            }
        }
    }
};

// 5. DEBUG PANEL (Pusat Inspeksi saat terjadi error di lapangan)
window.toggleDebugPanel = function() {
    const panel = document.getElementById('debug-panel');
    const content = document.getElementById('debug-content');
    if (!panel || !content) return;
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        let html = "";
        
        html += `<b style="color:#00ffff;">[ SESSION STORAGE ]</b><br>`;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const val = sessionStorage.getItem(key);
            html += `<span style="color:#aaa; font-size:10px;">${key}:</span> <span style="font-size:10px;">${val}</span><br>`;
        }
        
        html += `<br><b style="color:#00ffff;">[ GLOBAL STATE ]</b><br>`;
        // Sembunyikan API key saat display
        const cleanState = JSON.parse(JSON.stringify(window.SovereignState));
        html += `<pre style="white-space:pre-wrap; font-size:10px; background:#111; padding:5px;">${JSON.stringify(cleanState, null, 2)}</pre>`;
        
        html += `<br><b style="color:#00ffff;">[ TERMINAL STATUS ]</b><br>`;
        html += `FB1_MASTER: ${window.FirebaseInstances['FB1_MASTER'] ? "CONNECTED" : "OFFLINE"}<br>`;
        html += `ACTIVE SHARD: ${window.SovereignState.currentUser?.zone || "NONE"}<br>`;
        
        content.innerHTML = html;
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
};

// 6. AUTO-START SEQUENCE
(function() {
    // Tunggu terminal_router.js siap
    const checkRouter = setInterval(() => {
        if (typeof getTerminal === 'function') {
            clearInterval(checkRouter);
            window.Core.initFirebase();
            window.Core.checkAuth();
            console.log("🧠 [BRAIN ONE] OPERATIONAL WITH SUPREME ROUTER");
        }
    }, 100);
})();
