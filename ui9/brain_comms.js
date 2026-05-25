// ==========================================================================
// QUANTUM INTERCOM LOGIC CORE - BRAIN COMMS
// ==========================================================================
(function (window) {
    'use strict';

    // Konfigurasi State Internal Jaringan Obrolan
    let activeContractId = null;
    let currentChatRef = null;
    let currentChannelName = "CH-MAIN";
    let unreadCount = 0;

    // Cache Selektor DOM Komponen Tab Comms (Prefix: cm-)
    let domChatFeed = null;
    let domMessageInput = null;
    let domChannelLabel = null;
    let domGlobalBadge = null;

    /**
     * Memetakan elemen DOM saat tab_comms disuntikkan ke dalam berkas utama
     */
    function cacheCommsDOM() {
        domChatFeed = document.getElementById('cm-chat-container-feed');
        domMessageInput = document.getElementById('cm-input-message-text');
        domChannelLabel = document.getElementById('cm-channel-id');
        domGlobalBadge = document.getElementById('badge-comms');
    }

    /**
     * Menginisialisasi Saluran Komunikasi Terenkripsi Berdasarkan Kontrak Aktif
     * @param {string} contractId - ID Kontrak Unik dari FB5_DEAL
     */
    window.establishSecureCommsLink = function (contractId) {
        if (!contractId) return;
        
        // Bersihkan koneksi lama jika ada perpindahan saluran kontrak
        window.terminateActiveCommsLink();
        
        activeContractId = contractId;
        cacheCommsDOM();

        console.log(`[COMMS] Handshake mengunci saluran privat ID: ${contractId}`);
        
        // Hubungkan ke Terminal FB5_DEAL khusus penanganan Kontrak Privat & Chat
        const dealDB = window.getTerminal ? window.getTerminal('FB5_DEAL') : null;
        if (!dealDB) {
            console.error("[COMMS ERROR] Terminal Hub FB5_DEAL tidak merespon.");
            return;
        }

        currentChatRef = dealDB.ref(`private_chats/${contractId}`);
        if (domChannelLabel) domChannelLabel.innerText = `CH-${contractId.substring(0, 8).toUpperCase()}`;

        // Aktifkan Real-time Event Listener Stream dari Firebase
        currentChatRef.limitToLast(50).on('child_added', (snapshot) => {
            const msgData = snapshot.val();
            if (msgData) {
                renderIncomingCommsBubble(msgData);
                handleUnreadNotificationTrigger(msgData);
            }
        });
    };

    /**
     * Merender Struktur Obrolan ke dalam Feed Tampilan Tab Comms
     */
    function renderIncomingCommsBubble(data) {
        if (!domChatFeed) cacheCommsDOM();
        if (!domChatFeed) return;

        const currentNickname = window.CurrentOperatorProfile?.nickname || "YOU";
        const isOutgoing = data.sender_nick === currentNickname;
        
        const rowNode = document.createElement('div');
        rowNode.className = `cm-message-row ${isOutgoing ? 'outgoing' : 'incoming'}`;

        // Format Waktu Enkripsi Satelit
        let formattedTime = "00:00";
        if (data.timestamp) {
            const dt = new Date(data.timestamp);
            formattedTime = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Deteksi jenis konten: teks standar atau snapshot gambar taktis
        let contentLayout = `<div class="cm-bubble">${escapeHtmlInjection(data.message)}</div>`;
        if (data.type === 'snapshot' || data.message.startsWith('data:image')) {
            contentLayout = `
                <div class="cm-bubble" style="padding: 6px; background: rgba(0,0,0,0.4); border-color: var(--neon-purple);">
                    <img src="${data.message}" style="width:100%; max-width:240px; border-radius:8px; display:block;" alt="Tactical Snapshot" onclick="window.previewHoloSnapshot('${data.message}')">
                </div>`;
        }

        rowNode.innerHTML = `
            <div class="cm-msg-sender">${isOutgoing ? 'YOU' : escapeHtmlInjection(data.sender_nick)}</div>
            ${contentLayout}
            <div class="cm-msg-meta">${formattedTime}</div>
        `;

        domChatFeed.appendChild(rowNode);
        
        // Otomatis gulirkan layar ke baris obrolan terbawah
        domChatFeed.scrollTop = domChatFeed.scrollHeight;
    }

    /**
     * Mengirim Pesan Teks Taktis ke Firebase Shard
     */
    window.handleCommsSendMessageSubmit = function () {
        if (!domMessageInput) cacheCommsDOM();
        if (!domMessageInput || !currentChatRef) return;

        const rawText = domMessageInput.value.trim();
        if (!rawText) return;

        const currentNickname = window.CurrentOperatorProfile?.nickname || "OPERATOR";

        const packetMessage = {
            sender_nick: currentNickname,
            message: rawText,
            timestamp: Date.now(),
            type: "text"
        };

        // Kirimkan ke Firebase secara Asinkron
        currentChatRef.push(packetMessage)
            .then(() => {
                domMessageInput.value = "";
                // Mainkan SFX klik transmisi berhasil
                const clickSfx = document.getElementById('click-sfx');
                if (clickSfx) clickSfx.play().catch(()=>{});
            })
            .catch((err) => {
                console.error("[COMMS TRANSMIT ERROR]", err);
            });
    };

    /**
     * Memicu Alur Pendaran Kamera / Lampiran File Snapshot Taktis Lapangan
     */
    window.handleCommsAttachmentTrigger = function () {
        if (!currentChatRef) {
            if (window.sysNotify) window.sysNotify("COMMS OFFLINE", "Saluran transmisi privat belum dikunci. Sambungkan kontrak terlebih dahulu.");
            return;
        }

        // Bangun input file bayangan di memori untuk memicu galeri/kamera bawaan ponsel
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = function (e) {
            const file = e.target.getTerminal ? e.target.files[0] : e.target.files[0];
            if (!file) return;

            // Validasi ukuran agar tidak membebani transaksi database (Maksimal 1.5MB)
            if (file.size > 1500000) {
                if (window.sysNotify) window.sysNotify("PAYLOAD CRITICAL", "Ukuran gambar terlalu besar. Maksimal resolusi transmisi adalah 1.5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const base64Image = event.target.result;
                const currentNickname = window.CurrentOperatorProfile?.nickname || "OPERATOR";

                const imagePacket = {
                    sender_nick: currentNickname,
                    message: base64Image,
                    timestamp: Date.now(),
                    type: "snapshot"
                };

                currentChatRef.push(imagePacket);
            };
            reader.readAsDataURL(file);
        };
        
        fileInput.click();
    };

    /**
     * Menangani Notifikasi Lencana Masuk saat User tidak sedang membuka Tab Comms
     */
    function handleUnreadNotificationTrigger(msgData) {
        const currentNickname = window.CurrentOperatorProfile?.nickname || "YOU";
        if (msgData.sender_nick === currentNickname) return; // Abaikan jika kita yang mengetik

        const activePane = document.querySelector('.tab-pane.active');
        if (activePane && activePane.id !== 'tab-comms') {
            unreadCount++;
            if (!domGlobalBadge) cacheCommsDOM();
            
            if (domGlobalBadge) {
                domGlobalBadge.innerText = unreadCount;
                domGlobalBadge.classList.add('show');
            }

            // Mainkan Getaran Pulsa Pendek dan Bunyi Notifikasi Satelit
            if (window.vibratePulse) window.vibratePulse();
            const notifSfx = document.getElementById('notif-sfx');
            if (notifSfx) notifSfx.play().catch(()=>{});
        }
    }

    /**
     * Mengatur ulang atau membersihkan lencana obrolan saat tab Comms dibuka aktif
     */
    document.addEventListener('click', function () {
        const activePane = document.querySelector('.tab-pane.active');
        if (activePane && activePane.id === 'tab-comms') {
            unreadCount = 0;
            if (!domGlobalBadge) cacheCommsDOM();
            if (domGlobalBadge) {
                domGlobalBadge.innerText = "0";
                domGlobalBadge.classList.remove('show');
            }
        }
    });

    /**
     * Memutus Pemantauan Aliran Jaringan Interkom Secara Bersih
     */
    window.terminateActiveCommsLink = function () {
        if (currentChatRef) {
            currentChatRef.off();
            currentChatRef = null;
        }
        activeContractId = null;
        if (domChatFeed) domChatFeed.innerHTML = "";
        if (domChannelLabel) domChannelLabel.innerText = "CH-DISCONNECTED";
    };

    /**
     * Menyaring input teks dari karakter berbahaya XSS Injection
     */
    function escapeHtmlInjection(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Pratinjau Taktis Gambar Pop-Up Hologram Fullscreen
     */
    window.previewHoloSnapshot = function(imgSrc) {
        if(window.sysCustomModal) {
            window.sysCustomModal("TACTICAL SNAPSHOT", `
                <img src="${imgSrc}" style="width:100%; border:1px solid var(--neon-blue); border-radius:4px;" alt="Preview">
            `, false);
        }
    };

    // Callback inisialisasi awal modul komunikasi
    window.initCommsChat = function() {
        cacheCommsDOM();
        console.log("[BRAIN COMMS] Engine interkom satelit stand-by di terminal core.");
    };

})(window);
