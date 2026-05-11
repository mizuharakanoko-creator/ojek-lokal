/**
 * js_mission_progress_brain_one.js
 * CORE ENGINE & COMPONENT ROUTER
 * Fokus: Firebase Auth, Global State, & Dynamic Loading
 */

// 1. GLOBAL STATE - Satu-satunya sumber kebenaran untuk semua file JS
window.SovereignState = {
    db: null,
    rtdb: null,
    currentUser: null,
    activeContractId: null,
    currentMissionData: null
};

// 2. CORE ENGINE
window.Core = {
    // Inisialisasi Koneksi Firebase
    initFirebase: () => {
        // Ganti dengan konfigurasi Firebase Console Anda
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
        console.log("🔥 [SYSTEM] Firebase Neural Link: Connected");
    },

    // Verifikasi Identitas & Sesi Kontrak
    checkAuth: () => {
        // Mengambil data dari sessionStorage hasil dari login/pilihan misi sebelumnya
        const savedUser = sessionStorage.getItem('user_data');
        const savedContractId = sessionStorage.getItem('active_contract_id');

        if (savedUser) {
            window.SovereignState.currentUser = JSON.parse(savedUser);
        } else {
            // Mode Tamu/Debug jika session kosong
            window.SovereignState.currentUser = { 
                uid: 'UNKNOWN_ENTITY', 
                role: 'adventurer', 
                name: 'Guest Hunter' 
            };
        }

        window.SovereignState.activeContractId = savedContractId;
        console.log("👤 [AUTH] Identity Confirmed:", window.SovereignState.currentUser.name);
        console.log("🆔 [SESSION] Active Contract:", window.SovereignState.activeContractId);
    },

    // Pengambil Data Tunggal (Deep Data Mining)
    getSupremeData: async (contractId) => {
        if (!contractId) {
            console.error("❌ [MINING] Contract ID is null");
            return null;
        }
        
        try {
            const doc = await window.SovereignState.db.collection('contracts').doc(contractId).get();
            if (doc.exists) {
                const data = doc.data();
                const structured = {
                    mission: data,
                    adventurer: data.adventurer_data || {},
                    requester: data.requester_data || {}
                };
                // Simpan ke memori global agar tab lain tidak perlu fetch ulang
                window.SovereignState.currentMissionData = structured;
                return structured;
            } else {
                console.warn("⚠️ [MINING] Document not found in Firestore");
                return null;
            }
        } catch (err) {
            console.error("❌ [MINING] Error fetching Firestore:", err);
            // Fallback: Gunakan data session jika koneksi gagal
            const local = sessionStorage.getItem('current_mission_full');
            return local ? JSON.parse(local) : null;
        }
    }
};

// 3. COMPONENT ROUTER (Pemuat Tampilan)
window.Router = {
    // Fungsi memuat HTML ke dalam kontainer tab
    loadComponent: async (containerId, filePath) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Visual Feedback: Berikan efek loading tipis saat pindah tab
        container.style.opacity = '0.5';

        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            container.style.opacity = '1';

            // EKSEKUSI SCRIPT: Re-inject script tags agar berfungsi di global scope
            const scripts = container.querySelectorAll("script");
            for (const oldScript of scripts) {
                const newScript = document.createElement("script");
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.text = oldScript.text;
                }
                document.body.appendChild(newScript);
                // Hapus script lama agar tidak duplikat di DOM
                newScript.parentNode.removeChild(newScript);
            }

            // Jalankan Re-inisialisasi Logika (Memberi waktu DOM untuk stabil)
            setTimeout(() => {
                window.Router.reinit(containerId);
            }, 150);
            
        } catch (err) {
            console.error(`❌ [ROUTER] Gagal memuat ${filePath}:`, err);
            container.innerHTML = `<div style="padding:20px; color:#ff0055; font-family:monospace;">[SYSTEM_ERROR] Module ${filePath} not found.</div>`;
        }
    },

    // Re-inisialisasi Fungsi Brain sesuai Tab yang aktif
    reinit: (tabId) => {
        console.log(`🛠️ [RE-INIT] Refreshing logic for: ${tabId}`);
        
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
    }
};

// 4. UTILITY HELPER
window.getSupremeData = window.Core.getSupremeData;
window.getTerminal = (type) => (type === 'FB5_DEAL' ? window.SovereignState.rtdb : null);

console.log("🧠 [BRAIN ONE] Neural Foundation: FULLY OPERATIONAL");
