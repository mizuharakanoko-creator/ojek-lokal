/**
 * js_mission_progress_brain_one.js
 * CORE ENGINE & COMPONENT ROUTER (MOBILE DEBUG READY)
 */

// 1. GLOBAL STATE
window.SovereignState = {
    db: null,
    rtdb: null,
    currentUser: null,
    activeContractId: null,
    currentMissionData: null
};

// 2. VISUAL DEBUGGER FOR MOBILE (Ganti teks status di layar)
window.debugLog = (msg, type = "info") => {
    console.log(`[DEBUG] ${msg}`);
    // Mencari elemen status yang ada di header jjk.html
    const statusEl = document.getElementById('status-pulsing') || 
                     document.getElementById('statusPulsing') || 
                     document.getElementById('intelText');
    
    if (statusEl) {
        statusEl.innerText = msg.toUpperCase();
        statusEl.style.color = type === "error" ? "#ff0055" : "#00ffff";
    }
};

// 3. CORE ENGINE
window.Core = {
    initFirebase: () => {
        window.debugLog("🔗 Menginisialisasi Neural Link...");
        
        // Sesuaikan dengan Config Anda
        const firebaseConfig = {
            apiKey: "AIzaSy...",
            authDomain: "project-id.firebaseapp.com",
            projectId: "project-id",
            storageBucket: "project-id.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:abcdef",
            databaseURL: "https://project-id-default-rtdb.firebaseio.com"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        window.SovereignState.db = firebase.firestore();
        window.SovereignState.rtdb = firebase.database();
        
        window.debugLog("🔥 Firebase Connected!");
    },

    checkAuth: () => {
        window.debugLog("👤 Memeriksa Otoritas...");
        const savedUser = sessionStorage.getItem('user_data');
        const savedContractId = sessionStorage.getItem('active_contract_id');

        if (savedUser) {
            window.SovereignState.currentUser = JSON.parse(savedUser);
        } else {
            window.SovereignState.currentUser = { uid: 'GUEST', role: 'adventurer', name: 'Unknown' };
        }

        window.SovereignState.activeContractId = savedContractId;
        
        if (!savedContractId) {
            window.debugLog("⚠️ ID Kontrak Tidak Ditemukan!", "error");
        } else {
            window.debugLog(`✅ Sesi: ${savedContractId.substring(0,8)}...`);
        }
    }
};

// 4. COMPONENT ROUTER
// REVISI BAGIAN ROUTER DI BRAIN ONE
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

            // Memaksa Script di dalam file yang di-fetch untuk jalan
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

            // LANGSUNG PANGGIL DATA TANPA TUNGGU LAMA
            console.log("⚡ Triggering Logic for:", containerId);
            window.Router.reinit(containerId);
            
        } catch (err) {
            window.debugLog(`❌ GAGAL MUAT MODULE`, "error");
        }
    },

    reinit: (tabId) => {
        // Logika Paksa: Jika Tab HQ terbuka, jalankan fungsi Brain Two
        if (tabId === 'tab-hq' || document.getElementById('m-title')) {
            if (typeof window.initHQModule === 'function') {
                window.debugLog("🛰️ MENYAMBUNGKAN KE DATABASE...");
                window.initHQModule();
            } else {
                // Jika ini muncul, berarti Brain Two belum terbaca oleh Browser
                window.debugLog("⚠️ ENGINE BRAIN TWO TIDAK TERDETEKSI", "error");
            }
        }
    }
};




window.toggleDebugPanel = function() {
    const panel = document.getElementById('debug-panel');
    const content = document.getElementById('debug-content');
    
    if (panel.style.display === 'none') {
        // AMBIL SEMUA DATA
        let html = "";
        
        // A. Cek Session Storage
        html += `<b style="color:cyan;">[ SESSION STORAGE ]</b><br>`;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            const val = sessionStorage.getItem(key);
            html += `<span style="color:#aaa;">${key}:</span> ${val}<br>`;
        }
        
        html += `<br><b style="color:cyan;">[ GLOBAL STATE (SovereignState) ]</b><br>`;
        html += `<pre style="white-space:pre-wrap;">${JSON.stringify(window.SovereignState, null, 2)}</pre>`;
        
        html += `<br><b style="color:cyan;">[ FIREBASE STATUS ]</b><br>`;
        html += `Firestore: ${window.SovereignState.db ? "CONNECTED" : "DISCONNECTED"}<br>`;
        html += `RTDB: ${window.SovereignState.rtdb ? "CONNECTED" : "DISCONNECTED"}<br>`;
        
        content.innerHTML = html;
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
};




// 5. TERMINAL GATEWAY (Untuk Deep Mining Lintas Database)
window.getTerminal = (type) => {
    // Sesuaikan mapping terminal dengan kebutuhan aplikasi Anda
    if (type === 'FB1_MASTER') return firebase.database(); // Default RTDB
    if (type === 'FB4_BOARD') return firebase.database(); 
    if (type === 'FB2_RUNNER') return firebase.database();
    return window.SovereignState.rtdb;
};

// 6. AUTO-START
window.Core.initFirebase();
window.Core.checkAuth();

console.log("🧠 [BRAIN ONE] Loaded & Debug Ready");
