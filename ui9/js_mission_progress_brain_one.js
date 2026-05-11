/**
 * js_mission_progress_brain_one.js
 * PONDASI UTAMA & ROUTER DATA
 */

// 1. GLOBAL STATE (Penyimpanan memori terpusat)
window.SovereignState = {
    db: null,
    rtdb: null,
    currentUser: null,
    activeContractId: null,
    currentMissionData: null
};

// 2. CORE ENGINE
window.Core = {
    // Inisialisasi Firebase
    initFirebase: () => {
        const firebaseConfig = {
            apiKey: "MASUKKAN_API_KEY_ANDA",
            authDomain: "PROJECT_ID.firebaseapp.com",
            projectId: "PROJECT_ID",
            storageBucket: "PROJECT_ID.appspot.com",
            messagingSenderId: "SENDER_ID",
            appId: "APP_ID",
            databaseURL: "https://PROJECT_ID-default-rtdb.firebaseio.com" // Penting untuk Status Live
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        
        window.SovereignState.db = firebase.firestore();
        window.SovereignState.rtdb = firebase.database();
        console.log("🔥 Firebase Neural Link: Connected");
    },

    // Verifikasi Identitas User
    checkAuth: () => {
        const saved = sessionStorage.getItem('user_data');
        if (saved) {
            window.SovereignState.currentUser = JSON.parse(saved);
        } else {
            // Fallback Test (Hapus saat produksi)
            window.SovereignState.currentUser = { 
                role: 'adventurer', 
                uid: 'TEST_UID', 
                name: 'Shadow Hunter' 
            };
        }
        
        // Ambil ID Kontrak Aktif
        window.SovereignState.activeContractId = sessionStorage.getItem('active_contract_id');
        console.log("👤 User Authenticated:", window.SovereignState.currentUser.role);
    },

    // Fungsi Pengambil Data (Deep Mining)
    getSupremeData: async (contractId) => {
        if (!contractId) return null;
        
        try {
            const doc = await window.SovereignState.db.collection('contracts').doc(contractId).get();
            if (doc.exists) {
                const data = doc.data();
                const structured = {
                    mission: data,
                    adventurer: data.adventurer_data || {},
                    requester: data.requester_data || {}
                };
                window.SovereignState.currentMissionData = structured;
                return structured;
            }
        } catch (err) {
            console.warn("⚠️ Firestore mining failed, falling back to local storage.");
        }

        // Fallback ke Local Shard (Session)
        const local = sessionStorage.getItem('current_mission_full');
        return local ? JSON.parse(local) : null;
    }
};

// 3. COMPONENT ROUTER (Pemuat Tampilan)
window.Router = {
    loadedFiles: new Set(),

    loadComponent: async (containerId, filePath) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Jangan load ulang jika konten sudah ada (Kecuali paksa refresh)
        if (container.innerHTML.trim() !== "") {
            console.log(`♻️ Tab ${containerId} already exists. Re-syncing...`);
            window.Router.reinit(containerId);
            return;
        }

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;

            // EKSEKUSI SCRIPT DI DALAM HTML YANG DI-FETCH
            const scripts = container.querySelectorAll("script");
            for (const oldScript of scripts) {
                const newScript = document.createElement("script");
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.text = oldScript.text;
                }
                // Paksa append ke body agar script berjalan di global scope
                document.body.appendChild(newScript);
            }

            // Inisialisasi logika spesifik tab
            window.Router.reinit(containerId);
            
        } catch (err) {
            console.error(`❌ Failed to link component [${filePath}]:`, err);
            container.innerHTML = `<div style="padding:20px; color:red;">System Error: Failed to load module ${filePath}</div>`;
        }
    },

    // Jembatan untuk memanggil fungsi init di Brain lain
    reinit: (tabId) => {
        setTimeout(() => {
            switch(tabId) {
                case 'tab-hq':
                    if (typeof window.initHQModule === 'function') window.initHQModule();
                    break;
                case 'tab-comms':
                    if (typeof window.initCommsModule === 'function') window.initCommsModule();
                    break;
                case 'tab-maps':
                    if (typeof window.initMapsModule === 'function') window.initMapsModule();
                    break;
                case 'tab-profile':
                    if (typeof window.initProfileModule === 'function') window.initProfileModule();
                    break;
                case 'tab-nota':
                    if (typeof window.initNotaModule === 'function') window.initNotaModule();
                    break;
            }
        }, 100);
    }
};

// Alias untuk kemudahan akses (Legacy Support)
window.getSupremeData = window.Core.getSupremeData;
window.Clearchance = { enforceIdentity: () => window.SovereignState.currentUser };
window.getTerminal = (type) => (type === 'FB5_DEAL' ? window.SovereignState.rtdb : null);

console.log("🧠 Brain One: Operational");
