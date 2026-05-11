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
window.Router = {
    loadComponent: async (containerId, filePath) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        window.debugLog(`📥 Loading Module: ${filePath}...`);
        container.style.opacity = '0.5';

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            container.style.opacity = '1';

            // Eksekusi Script di dalam HTML yang di-fetch
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

            // Tunggu sebentar agar DOM stabil sebelum reinit
            setTimeout(() => {
                window.Router.reinit(containerId);
            }, 200);
            
        } catch (err) {
            window.debugLog(`❌ Gagal Muat: ${filePath}`, "error");
            container.innerHTML = `<div style="padding:20px; color:#ff0055;">[ERROR] Fail to load module.</div>`;
        }
    },

    reinit: (tabId) => {
        window.debugLog(`⚙️ Re-init Tab: ${tabId}`);
        
        // Pemicu Fungsi di Brain Two
        if (tabId === 'tab-hq') {
            if (typeof window.initHQModule === 'function') {
                window.initHQModule();
            } else {
                window.debugLog("⚠️ initHQModule belum siap", "error");
            }
        }
        // Tambahkan case lain jika ada (comms, maps, dll)
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
