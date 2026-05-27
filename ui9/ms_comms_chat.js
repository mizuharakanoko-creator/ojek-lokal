/* ===================================================================
   MS_COMMS_CHAT.JS
   Role: Satellite Chat Messages Listener, Encrypted Input Hub, 
         & WhatsApp External Communication Drawer
   =================================================================== */

// 1. STATE CONFIGURATION (Penyimpanan Referensi Firebase Chat & Data Misi)
let currentChatMissionId = null;
let currentChatData = null;
let chatFirebaseRef = null;

// 2. MAIN RENDERING ENGINE (Ditembak Otomatis Oleh ms_quest_state_manager.js)
function updateCommsChat(missionId, missionData) {
    currentChatMissionId = missionId;
    currentChatData = missionData;

    const badgeComms = document.getElementById('badge-comms');
    const drawerToggle = document.getElementById('drawer-toggle');

    if (!missionData) {
        resetCommsToStandby();
        return;
    }

    // Tampilkan tombol WhatsApp Drawer jika data nomor telepon tersedia
    if (missionData.telp_client || missionData.phone_client) {
        if (drawerToggle) drawerToggle.classList.remove('hide');
    } else {
        if (drawerToggle) drawerToggle.classList.add('hide');
    }

    // Hubungkan Pipa Obrolan ke Firebase jika mendeteksi ID Misi baru atau perpindahan sesi
    if (chatFirebaseRef === null || currentChatMissionId !== missionId) {
        activateChatListener(missionId);
    }
}

// 3. REAL-TIME CHAT STREAM LISTENER
function activateChatListener(missionId) {
    console.log(`[COMMS] Establishing Encrypted Satellite Link for Mission: ${missionId}`);
    
    // Putus sambungan listener chat lama jika ada
    if (chatFirebaseRef) {
        chatFirebaseRef.off();
    }

    // Arahkan ke simpul pesan obrolan di dalam database Anda
    chatFirebaseRef = FB4_BOARD.child("kontrak_mission").child(missionId).child("messages");

    chatFirebaseRef.on('value', snapshot => {
        const chatWall = document.getElementById('chat-wall');
        const badgeComms = document.getElementById('badge-comms');
        
        if (!chatWall) return;

        // Bersihkan dinding obrolan lama sebelum merender ulang
        chatWall.innerHTML = "";
        let messageCount = 0;

        snapshot.forEach(childSnapshot => {
            const msg = childSnapshot.val();
            messageCount++;

            // Buat elemen balon obrolan HTML
            const bubble = document.createElement('div');
            
            // Tentukan posisi balon (me = driver/anda, them = client/pusat)
            if (msg.sender === "driver" || msg.sender === AppState.driverId) {
                bubble.className = "bubble me";
            } else {
                bubble.className = "bubble them";
            }

            bubble.innerText = msg.text || "";
            chatWall.appendChild(bubble);
        });

        // Auto-Scroll otomatis ke baris pesan paling bawah setiap ada pesan masuk baru
        chatWall.scrollTop = chatWall.scrollHeight;

        // Kelola indikator angka notifikasi merah di tab footer comms
        if (messageCount > 0 && AppState.currentTab !== 'comms') {
            if (badgeComms) {
                badgeComms.innerText = messageCount;
                badgeComms.classList.add('show');
            }
            playSFX('notif-sfx'); // Bunyikan alarm radar pesan masuk
        } else {
            if (badgeComms) {
                badgeComms.classList.remove('show');
                badgeComms.innerText = "0";
            }
        }
    });
}

// 4. SEND INTERNAL SATELLITE MESSAGE
function sendSatelliteMessage() {
    const inputField = document.getElementById('chat-input');
    if (!inputField || !currentChatMissionId || !chatFirebaseRef) return;

    const txt = inputField.value.trim();
    if (txt === "") return;

    playSFX('click-sfx');

    const messagePayload = {
        sender: "driver",
        text: txt,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    // Dorong pesan baru ke dalam list messages di Firebase
    chatFirebaseRef.push(messagePayload)
        .then(() => {
            inputField.value = ""; // Kosongkan kolom teks input
            console.log("[COMMS] Packet encrypted and sent successfully.");
        })
        .catch(err => {
            console.error("[COMMS GAGAL]", err);
            sysAlert("COMMS MALFUNCTION", "Gagal mengirim pesan melalui jaringan satelit internal.");
        });
}

// 5. WHATSAPP COMMUNICATION DRAWER ENGINE (HOTLINK OUTBOUND)
function toggleDrawer() {
    playSFX('click-sfx');
    const drawer = document.getElementById('action-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
    }
}

function openWhatsAppHotlink() {
    if (!currentChatData) return;
    
    // Normalisasi data nomor telepon client dari database
    let rawPhone = currentChatData.telp_client || currentChatData.phone_client;
    if (!rawPhone) {
        sysAlert("DRAWER ERROR", "Nomor kontak pemesan tidak terdaftar dalam berkas misi.");
        return;
    }

    // Konversi format nomor lokal (08xx) menjadi format internasional (62xx)
    rawPhone = rawPhone.toString().trim();
    if (rawPhone.startsWith('0')) {
        rawPhone = '62' + rawPhone.slice(1);
    }

    const templateMsg = encodeURIComponent(`Halo, saya kurir penjemput dari Guild. Terkait misi aktif [ID: ${currentChatMissionId.substring(0,6).toUpperCase()}], saat ini saya sedang menuju lokasi Anda.`);
    const waUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${templateMsg}`;
    
    window.open(waUrl, '_blank');
}

function shareMissionUpdate() {
    if (!currentChatData) return;
    
    let rawPhone = currentChatData.telp_client || currentChatData.phone_client;
    if (!rawPhone) return;

    rawPhone = rawPhone.toString().trim();
    if (rawPhone.startsWith('0')) {
        rawPhone = '62' + rawPhone.slice(1);
    }

    // Template update taktis instan berdasarkan status operasional saat ini
    let statusText = "MEMPROSES PESANAN";
    if (currentChatData.status_operational === "otw") statusText = "DALAM PERJALANAN MENUJU TITIK JEMPUT";
    if (currentChatData.status_operational === "kerja") statusText = "BARANG SUDAH DIAMBIL & SEDANG DIANTAR";

    const updateMsg = encodeURIComponent(`[MISSION PROGRESS UPDATE]\nID Misi: ${currentChatMissionId.toUpperCase()}\nStatus Kurir: ${statusText}\n\nTerima kasih telah memercayai layanan taktis Guild.`);
    const waUrl = `https://api.whatsapp.com/send?phone=${rawPhone}&text=${updateMsg}`;
    
    window.open(waUrl, '_blank');
}

// 6. RESET COMMS TO STANDBY
function resetCommsToStandby() {
    if (chatFirebaseRef) {
        chatFirebaseRef.off();
        chatFirebaseRef = null;
    }
    
    currentChatMissionId = null;
    currentChatData = null;

    const chatWall = document.getElementById('chat-wall');
    if (chatWall) {
        chatWall.innerHTML = '<div style="text-align:center; padding:40px; color:#555; font-size:12px; font-family:var(--font-mono); letter-spacing:1px;">[SYS] LINK OFFLINE - MENUNGGU MISI AKTIF</div>';
    }

    const badgeComms = document.getElementById('badge-comms');
    const drawerToggle = document.getElementById('drawer-toggle');
    const drawer = document.getElementById('action-drawer');

    if (badgeComms) {
        badgeComms.classList.remove('show');
        badgeComms.innerText = "0";
    }
    if (drawerToggle) drawerToggle.classList.add('hide');
    if (drawer) drawer.classList.remove('open');
}

// Pasang Event Listener Tombol saat DOM selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    const btnSend = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chat-input');
    const btnWaLink = document.getElementById('btn-wa-link');
    const btnWaShare = document.getElementById('btn-wa-share');

    if (btnSend) btnSend.addEventListener('click', sendSatelliteMessage);
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendSatelliteMessage();
            }
        });
    }

    if (btnWaLink) btnWaLink.addEventListener('click', openWhatsAppHotlink);
    if (btnWaShare) btnWaShare.addEventListener('click', shareMissionUpdate);
});
