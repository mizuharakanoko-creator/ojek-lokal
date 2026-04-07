/**
 * CREATE MISSION ENGINE v1.0
 * Fitur: Logic Role Stranger, Reverse Geocoding, Dynamic Pricing Formula
 */

const Mission = {
    session: JSON.parse(localStorage.getItem('pickme_user')),
    db: null,
    
    // State Variabel
    currentCat: 'motor-ride',
    destMode: 'dropdown',
    selectedPriceTier: 'normal',
    pickupCoords: null,
    pickupAddressData: null, // Data lengkap desa/jalan dari Nominatim API
    
    // Mock Koordinat untuk Tujuan (Agar formula jarak berjalan)
    mockDestCoords: { lat: -6.97, lng: 108.48 }, // Koordinat Kuningan Center
    
    init() {
        if (!this.session) window.location.href = "index.html";

        // Init Firebase
        const config = {
            apiKey: "AIzaSyA8gSce2OvSC0hece_r_kifBKoG8mkVZBk",
            databaseURL: "https://ojeklokal-42b84-default-rtdb.asia-southeast1.firebasedatabase.app"
        };
        if (!firebase.apps.length) firebase.initializeApp(config);
        this.db = firebase.database();

        // UI Penyesuaian Role
        if (this.session.role === 'stranger') {
            document.getElementById('btnLoginTop').style.display = 'block';
        }

        // Anti-Inspect
        document.addEventListener('contextmenu', e => e.preventDefault());
    },

    showAlert(title, msg) {
        document.getElementById('sndError').play().catch(()=>{});
        document.getElementById('alertTitle').innerText = title;
        document.getElementById('alertMsg').innerText = msg;
        document.getElementById('customAlert').style.display = 'flex';
    },

    playClick() { document.getElementById('sndClick').play().catch(()=>{}); },

    // --- LOGIKA KATEGORI & STRANGER ---

    selectCategory(cat, element) {
        this.playClick();
        
        // Pengecekan Stranger
        if (this.session.role === 'stranger' && cat !== 'motor-ride') {
            this.showAlert("AKSES DITOLAK", "Pengguna Anonim (Stranger) HANYA BISA membuat misi kategori Motor-Ride. Silakan Login sebagai Citizen untuk membuka semua layanan.");
            return;
        }

        this.currentCat = cat;
        
        // Update UI Tabs
        document.querySelectorAll('.cat-box').forEach(el => el.classList.remove('active'));
        if(!element.classList.contains('disabled')) element.classList.add('active');

        // Untuk sementara, kita hanya fokus ke form-ride (Sesuai instruksi prioritas)
        if (cat === 'motor-ride' || cat === 'car-ride') {
            document.getElementById('form-ride').style.display = 'block';
            this.checkPriceCalc(); // Recalculate if switching motor <-> car
        } else {
            // Logic form ekspedisi & titip beli disembunyikan untuk fokus pada algoritma motor
            document.getElementById('form-ride').style.display = 'none';
        }
    },

    lockedCategory() {
        this.playClick();
        this.showAlert("UNAVAILABLE", "Layanan ini belum dibuka oleh Guild untuk wilayah ini.");
    },

    // --- LOGIKA LOKASI (REVERSE GEOCODING) ---

    async getPickupLocation() {
        this.playClick();
        const btn = document.getElementById('btnPickupLoc');
        
        // Meminta izin lokasi
        if (!navigator.geolocation) {
            return this.showAlert("ERROR", "Browser Anda tidak mendukung fitur lokasi.");
        }

        btn.innerHTML = `⏳ <span>Mengunci Satelit Geofence...</span>`;

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const alt = pos.coords.altitude || 0; // Ketinggian untuk biaya Nanjak
            
            this.pickupCoords = { lat, lng, alt };

            try {
                // Reverse Geocoding gratis menggunakan OpenStreetMap (Nominatim API)
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
                const response = await fetch(url);
                const data = await response.json();

                // Menyusun alamat yang bisa dibaca manusia
                let address = "";
                if(data.address.road) address += data.address.road + ", ";
                if(data.address.village || data.address.town || data.address.city) 
                    address += (data.address.village || data.address.town || data.address.city);

                this.pickupAddressData = address || "Lokasi tidak bernama (Raw Coords)";

                // Update UI Success
                btn.classList.add('success');
                btn.innerHTML = `✅ <span>Titik Diamankan!</span>`;
                
                const detail = document.getElementById('txtPickupDetail');
                detail.innerText = `Terdeteksi di: ${this.pickupAddressData}\n(Elevasi: ${Math.round(alt)} mdpl)`;
                detail.style.display = 'block';
                
                document.getElementById('sndSuccess').play().catch(()=>{});

                this.checkPriceCalc();

            } catch (err) {
                btn.innerHTML = `📍 <span>Gagal menerjemahkan alamat. Coba lagi.</span>`;
                this.showAlert("NETWORK ERROR", "Gagal menghubungi satelit peta. Pastikan koneksi internet stabil.");
            }
        }, (error) => {
            btn.innerHTML = `📍 <span>Klik untuk memindai koordinat...</span>`;
            if(error.code === 1) this.showAlert("DITOLAK", "Anda harus mengizinkan akses lokasi di popup browser untuk menggunakan aplikasi ini.");
            else this.showAlert("GAGAL", "Sinyal GPS lemah atau tidak ditemukan.");
        }, { enableHighAccuracy: true });
    },

    // --- LOGIKA DESTINASI ---

    switchDestMode(mode) {
        this.playClick();
        this.destMode = mode;
        
        document.getElementById('tabDrop').classList.remove('active');
        document.getElementById('tabButa').classList.remove('active');
        
        if (mode === 'dropdown') {
            document.getElementById('tabDrop').classList.add('active');
            document.getElementById('destSystem').style.display = 'block';
            document.getElementById('destButa').style.display = 'none';
        } else {
            document.getElementById('tabButa').classList.add('active');
            document.getElementById('destSystem').style.display = 'none';
            document.getElementById('destButa').style.display = 'block';
        }
        this.checkPriceCalc();
    },

    // --- ALGORITMA PERHITUNGAN TARIF (Sesuai Syarat) ---

    // Formula Haversine: Jarak Lurus dua titik koordinat di Bumi
    calcHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius Bumi (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    checkPriceCalc() {
        const pSection = document.getElementById('priceSection');

        // Syarat kalkulasi: Harus ada titik awal, dan mode destinasi adalah Sistem Alamat (bukan Buta Alamat)
        // Dan minimal Kabupaten sudah dipilih.
        if (this.destMode === 'buta') {
            pSection.style.display = 'none';
            return;
        }

        if (!this.pickupCoords || document.getElementById('selKab').value === "") {
            pSection.style.display = 'none';
            return;
        }

        // 1. Hitung Jarak Dasar
        let baseKm = this.calcHaversineDistance(
            this.pickupCoords.lat, this.pickupCoords.lng,
            this.mockDestCoords.lat, this.mockDestCoords.lng // Di sistem asli, ini dari data koordinat Desa di Dropdown
        );

        // 2. Tambahan Kompensasi Jalan Berkelok (Sesuai Syarat)
        baseKm += 0.8; 

        // 3. Tambahan Biaya Elevasi (Nanjak)
        // Misal: Setiap ketinggian di atas 500 mdpl, tambah penalty jarak/harga
        let elevasiPenalty = 0;
        if (this.pickupCoords.alt > 500) {
            elevasiPenalty = (this.pickupCoords.alt - 500) * 0.002; // Tambahan biaya nanjak
        }

        const finalKm = parseFloat((baseKm + elevasiPenalty).toFixed(1));
        
        // 4. Hitung Tarif per Kategori
        let rHemat, rNormal, rDermawan;
        if (this.currentCat === 'motor-ride') {
            rHemat = finalKm * 2500;
            rNormal = finalKm * 3000;
            rDermawan = finalKm * 4000;
        } else { // car-ride
            rHemat = finalKm * 3500;
            rNormal = finalKm * 4500;
            rDermawan = finalKm * 5500;
        }

        // Update UI
        document.getElementById('estDist').innerText = finalKm;
        document.getElementById('pHemat').innerText = Math.round(rHemat).toLocaleString('id-ID');
        document.getElementById('pNormal').innerText = Math.round(rNormal).toLocaleString('id-ID');
        document.getElementById('pDermawan').innerText = Math.round(rDermawan).toLocaleString('id-ID');
        
        pSection.style.display = 'block';
    },

    selectPrice(tier, element) {
        this.playClick();
        this.selectedPriceTier = tier;
        document.querySelectorAll('.price-card').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    },

    // --- PUBLISH MISION ---

    async submitRide() {
        this.playClick();

        // Validasi
        if (!this.pickupCoords) return this.showAlert("HOLD!", "Titik penjemputan belum dipindai!");
        
        let destinationName = "";
        let finalPrice = "NEGO";

        if (this.destMode === 'dropdown') {
            const kab = document.getElementById('selKab').value;
            if (!kab) return this.showAlert("HOLD!", "Pilih Kabupaten tujuan!");
            destinationName = `Sistem: Kab ${kab} (Detail akan muncul di briefing)`;
            
            // Ambil harga dari UI berdasarkan tier yang dipilih
            let uiPriceText = "0";
            if(this.selectedPriceTier === 'hemat') uiPriceText = document.getElementById('pHemat').innerText;
            if(this.selectedPriceTier === 'normal') uiPriceText = document.getElementById('pNormal').innerText;
            if(this.selectedPriceTier === 'dermawan') uiPriceText = document.getElementById('pDermawan').innerText;
            
            finalPrice = parseInt(uiPriceText.replace(/\./g, ''));

        } else {
            const butaText = document.getElementById('inpButaDesc').value;
            if (butaText.length < 10) return this.showAlert("HOLD!", "Deskripsi alamat buta minimal 10 karakter.");
            destinationName = `Buta Alamat: ${butaText.substring(0, 50)}...`;
        }

        const isUrgent = document.getElementById('chkUrgentRide').checked;
        const note = document.getElementById('inpCatatanRide').value;

        // Susun Data Misi
        const questId = "Q_" + Date.now();
        const missionData = {
            requester_id: this.session.id,
            requester_name: this.session.name,
            kategori: this.currentCat,
            judul_misi: `[${this.currentCat.toUpperCase()}] ${isUrgent ? '🔴 URGENT' : 'Pengantaran'}`,
            lokasi_pickup_name: this.pickupAddressData,
            lokasi_pickup_coords: this.pickupCoords,
            lokasi_tujuan_name: destinationName,
            reward_stone: finalPrice,
            deskripsi_misi: note || "Tidak ada catatan khusus",
            is_urgent: isUrgent,
            status: "WAITING_FOR_APPLICANTS", // Status belum aktif di board, butuh apply
            timestamp: Date.now()
        };

        try {
            // Push ke RTDB (Quest Board Global)
            await this.db.ref(`quest_board/${this.session.shard}/active_short_quests/${questId}`).set(missionData);

            document.getElementById('sndSuccess').play();
            
            // Redirect ke Halaman Tunggu (Selection Hub)
            setTimeout(() => {
                window.location.href = `requester_hub.html?qid=${questId}`;
            }, 1000);

        } catch (error) {
            this.showAlert("SYSTEM ERROR", error.message);
        }
    }
};

window.onload = () => Mission.init();
