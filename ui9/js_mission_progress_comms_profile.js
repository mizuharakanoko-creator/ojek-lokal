/**
 * js_mission_progress_comms_profile.js
 * LOGIKA CHAT & PROFIL PARTNER (TAB SYSTEM)
 */

// 1. STATE KHUSUS COMMS & PROFILE
window.SocialState = {
    chatListener: null,
    partnerData: null,
    currentRoomId: null
};

// 2. INITIALIZER UNTUK TAB COMMS
window.initCommsModule = function() {
    console.log("💬 Comms Module: Initiating Peer Connection...");
    
    const state = window.SovereignState;
    const contractId = state.activeContractId;
    
    if (!contractId || !state.rtdb) {
        console.error("Missing Contract ID or RTDB for Chat");
        return;
    }

    // Room ID biasanya berdasarkan ID Kontrak
    window.SocialState.currentRoomId = contractId;

    // A. Setup Tampilan Header Chat
    setupChatHeader();

    // B. Jalankan Listener Pesan (Realtime)
    listenToMessages();

    // C. Setup Event Listener Input
    setupChatInput();
};

// 3. INITIALIZER UNTUK TAB PROFILE
window.initProfileModule = function() {
    console.log("👤 Profile Module: Loading Partner Dossier...");
    
    const state = window.SovereignState;
    
    // Ambil data partner dari memory global (Brain One)
    if (state.currentMissionData) {
        const data = state.currentMissionData;
        const partner = state.currentUser.role === 'adventurer' ? data.requester : data.adventurer;
        renderPartnerProfile(partner);
    } else {
        // Jika belum ada di memori, lakukan mining ulang
        window.Core.getSupremeData(state.activeContractId).then(data => {
            const partner = state.currentUser.role === 'adventurer' ? data.requester : data.adventurer;
            renderPartnerProfile(partner);
        });
    }
};

// --- FUNGSI LOGIKA CHAT ---

function setupChatHeader() {
    const state = window.SovereignState;
    const data = state.currentMissionData;
    if (!data) return;

    const partner = state.currentUser.role === 'adventurer' ? data.requester : data.adventurer;
    
    const nameEl = document.getElementById('chat-partner-name');
    const statusEl = document.getElementById('chat-partner-status');
    
    if (nameEl) nameEl.innerText = partner?.profile?.nama || "Unknown Entity";
    if (statusEl) statusEl.innerText = "CONNECTED via NEURAL LINK";
}

function listenToMessages() {
    const rtdb = window.SovereignState.rtdb;
    const roomId = window.SocialState.currentRoomId;
    const chatBox = document.getElementById('chat-messages-container');

    if (!chatBox || !rtdb) return;

    // Matikan listener lama jika ada
    if (window.SocialState.chatListener) {
        rtdb.ref(`chats/${roomId}`).off();
    }

    // Pasang listener baru
    window.SocialState.chatListener = rtdb.ref(`chats/${roomId}`).limitToLast(50);
    window.SocialState.chatListener.on('value', (snapshot) => {
        chatBox.innerHTML = ""; // Clear visual
        
        snapshot.forEach((child) => {
            const msg = child.val();
            const isMe = msg.sender_uid === window.SovereignState.currentUser.uid;
            appendMessageUI(msg, isMe);
        });
        
        // Auto scroll ke bawah
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

function appendMessageUI(msg, isMe) {
    const chatBox = document.getElementById('chat-messages-container');
    const msgDiv = document.createElement('div');
    msgDiv.className = isMe ? 'message-row sent' : 'message-row received';
    
    msgDiv.innerHTML = `
        <div class="message-bubble">
            <p>${msg.text}</p>
            <span class="message-time">${new Date(msg.ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    `;
    chatBox.appendChild(msgDiv);
}

function setupChatInput() {
    const btn = document.getElementById('btn-send-chat');
    const input = document.getElementById('chat-input-field');

    if (!btn || !input) return;

    const sendMessage = () => {
        const text = input.value.trim();
        if (!text) return;

        const roomId = window.SocialState.currentRoomId;
        const rtdb = window.SovereignState.rtdb;
        
        rtdb.ref(`chats/${roomId}`).push({
            sender_uid: window.SovereignState.currentUser.uid,
            sender_name: window.SovereignState.currentUser.name,
            text: text,
            ts: Date.now()
        });

        input.value = "";
        if (navigator.vibrate) navigator.vibrate(10);
    };

    btn.onclick = sendMessage;
    input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
}

// --- FUNGSI LOGIKA PROFIL ---

function renderPartnerProfile(partner) {
    if (!partner) return;

    // Map elemen UI Profil (Pastikan ID ini ada di fet_showprofile.html)
    const uiMap = {
        'p-name': partner.profile?.nama,
        'p-rank': partner.profile?.rank || partner.profile?.tier || "F",
        'p-location': partner.profile?.lokasi || "Unknown Domain",
        'p-bio': partner.profile?.bio || "No data available in guild records.",
        'p-joined': partner.profile?.join_date || "---",
        'p-trust-val': partner.diagram?.nilai_kepercayaan + "%" || "0%",
        'p-mission-count': partner.stats?.total_misi || "0"
    };

    for (const [id, val] of Object.entries(uiMap)) {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    }

    // Update Progress Bar Trust
    const trustBar = document.getElementById('p-trust-bar');
    if (trustBar) {
        trustBar.style.width = (partner.diagram?.nilai_kepercayaan || 0) + "%";
    }

    if (typeof updateAI === 'function') {
        updateAI("Partner profile synchronized.", "success");
    }
}

console.log("🧠 Social Brain: Ready to establish connections.");
