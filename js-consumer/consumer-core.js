// CORE KONSUMEN: MESIN PEMESANAN
const ConsumerCore = {
    selectedService: 'motor',
    currentOrderId: null,
    region: "kuningan", // Contoh region default

    // 1. Membuat Order Baru
    async createOrder() {
        const pickup = document.getElementById('loc-pickup').value;
        const destination = document.getElementById('loc-dest').value;
        const orderId = "ORD-" + Date.now();
        
        const orderData = {
            id: orderId,
            customer_name: "Budi (User)",
            service: this.selectedService,
            pickup_address: pickup,
            dest_address: destination,
            status: "searching", // Status awal: mencari driver
            base_price: 15000,
            timestamp: Date.now()
        };

        try {
            // Tulis ke folder wilayah (Sharding)
            await set(ref(db, `orders_active/${this.region}/${orderId}`), orderData);
            this.currentOrderId = orderId;
            this.watchForBids(); // Mulai pantau tawaran driver
            alert("Mencari driver terdekat...");
        } catch (e) {
            alert("Gagal memesan: " + e.message);
        }
    },

    // 2. Memantau Tawaran Driver (Bidding System)
    watchForBids() {
        const bidRef = ref(db, `orders_active/${this.region}/${this.currentOrderId}/temp_bids`);
        
        document.getElementById('modal-bids').style.display = 'flex';

        onValue(bidRef, (snapshot) => {
            const bids = snapshot.val();
            const listArea = document.getElementById('list-driver-bids');
            listArea.innerHTML = ""; // Bersihkan list lama

            if (bids) {
                Object.keys(bids).forEach(driverNik => {
                    const bid = bids[driverNik];
                    listArea.innerHTML += `
                        <div class="driver-bid-card">
                            <div>
                                <b>${bid.nama}</b><br>
                                <small>Harga: Rp ${bid.harga.toLocaleString()}</small>
                            </div>
                            <button onclick="ConsumerCore.acceptDriver('${driverNik}', ${bid.harga})" 
                                    style="background:#2ecc71; color:white; border:none; padding:8px 15px; border-radius:10px;">
                                PILIH
                            </button>
                        </div>
                    `;
                });
            }
        });
    },

    // 3. Memilih Driver (Accepting Bid)
    async acceptDriver(driverNik, finalPrice) {
        const orderPath = `orders_active/${this.region}/${this.currentOrderId}`;
        
        // Update orderan dengan info driver terpilih
        await update(ref(db, orderPath), {
            driver_id: driverNik,
            status: "picked_up",
            final_price: finalPrice,
            temp_bids: null // Hapus semua tawaran lain agar bersih
        });

        alert("Driver terpilih! Mohon tunggu di titik jemput.");
        document.getElementById('modal-bids').style.display = 'none';
        
        // Selanjutnya: Pindah ke layar Tracking Driver
    }
};
