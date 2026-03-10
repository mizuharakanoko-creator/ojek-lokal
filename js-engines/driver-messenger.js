// MODUL 9: REAL-TIME MESSENGER & HORN (CHAT ENGINE)
const DriverMessenger = {
    // Mengirim pesan teks
    async sendMessage(region, orderId, driverName, text) {
        const chatRef = ref(db, `orders_active/${region}/${orderId}/chats`);
        const newMessageRef = push(chatRef); // Buat ID pesan unik

        await set(newMessageRef, {
            sender: "driver",
            name: driverName,
            message: text,
            timestamp: Date.now()
        });
    },

    // Fitur Klakson (Kirim sinyal PING ke pelanggan)
    async honkHorn(region, orderId) {
        const hornRef = ref(db, `orders_active/${region}/${orderId}/alerts/horn`);
        await set(hornRef, {
            triggered_at: Date.now(),
            message: "Driver sudah sampai di lokasi! 📢"
        });
        alert("Klakson dikirim! Pelanggan akan menerima notifikasi suara.");
    },

    // Mendengarkan pesan masuk (Real-time)
    listenChat(region, orderId, callback) {
        const chatRef = ref(db, `orders_active/${region}/${orderId}/chats`);
        onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            const messages = [];
            if (data) {
                Object.keys(data).forEach(key => {
                    messages.push(data[key]);
                });
            }
            callback(messages);
        });
    }
};
