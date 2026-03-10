// MODUL 3: DATABASE SHARDING & REGIONAL FILTERING
const DriverSharding = {
    currentRegion: "umum", // Default region

    // Fungsi untuk menentukan wilayah driver berdasarkan GPS atau pilihan manual
    // Ini membantu optimasi 5.000 user agar tidak menumpuk di satu jalur data
    setRegion(kecamatan) {
        // Mengubah format nama kecamatan agar aman untuk folder Firebase (tanpa spasi/simbol)
        const sanitizedRegion = kecamatan.toLowerCase().replace(/\s+/g, '_');
        this.currentRegion = sanitizedRegion;
        
        // Simpan ke LocalStorage agar saat aplikasi dibuka lagi, wilayah tetap sama
        localStorage.setItem('driver_region', sanitizedRegion);
        console.log(`Wilayah aktif diubah ke: ${sanitizedRegion}`);
    },

    // Mendapatkan path folder orderan yang sesuai dengan wilayah driver
    getOrderPath() {
        return `orders_active/${this.currentRegion}`;
    },

    // Mendapatkan path folder driver aktif yang sesuai dengan wilayahnya
    getDriverPath(nik) {
        return `active_drivers/${this.currentRegion}/${nik}`;
    },

    // Inisialisasi awal saat aplikasi dibuka
    init() {
        const savedRegion = localStorage.getItem('driver_region');
        if (savedRegion) {
            this.currentRegion = savedRegion;
        }
    }
};

// Jalankan inisialisasi
DriverSharding.init();
