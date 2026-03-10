// MODUL 5: NEGOSIASI HARGA (BIDDING ENGINE)
const DriverBidding = {
    activeOrderId: null,

    // Membuka jendela nego
    openBidding(orderId, hargaAwal) {
        this.activeOrderId = orderId;
        
        // Munculkan UI Modal (Kita akan buat fungsinya di Core nanti)
        document.getElementById('modal-bidding').style.display = 'flex';
        document.getElementById('input-harga-tawar').value = hargaAwal;
        document.getElementById('display-order-id').innerText = "Order ID: " + orderId;
    },

    // Mengirim tawaran ke Firebase
    async sendBid(nik, nama) {
        const hargaTawar = document.getElementById('input-harga-tawar').value;
        const path = `orders_active/${DriverSharding.currentRegion}/${this.activeOrderId}/temp_bids/${nik}`;

        const bidData = {
            nama: nama,
            harga: parseInt(hargaTawar),
            timestamp: Date.now(),
            status: "pending"
        };

        try {
            await set(ref(db, path), bidData);
            alert("Tawaran terkirim! Menunggu konfirmasi pelanggan...");
            this.closeBidding();
        } catch (error) {
            alert("Gagal menawar: " + error.message);
        }
    },

    closeBidding() {
        document.getElementById('modal-bidding').style.display = 'none';
        this.activeOrderId = null;
    }
};
