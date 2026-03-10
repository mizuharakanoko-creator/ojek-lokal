// MODUL 1: AUTHENTICATION & REGISTRATION
const DriverAuth = {
    // Fungsi untuk mendapatkan metadata perangkat secara otomatis
    getDeviceMetadata() {
        return {
            os: navigator.platform,
            userAgent: navigator.userAgent,
            browser: navigator.appName,
            timestamp: new Date().toISOString(),
            screenRes: `${window.screen.width}x${window.screen.height}`
        };
    },

    // Fungsi Utama Pendaftaran
    async register(nik, nama, plat, motor) {
        const metadata = this.getDeviceMetadata();
        
        // Struktur "Laci" Database untuk Driver Baru
        const driverData = {
            profile: {
                nik: nik,
                nama: nama,
                plat: plat,
                motor: motor,
                joined_at: serverTimestamp() // Gunakan timestamp server
            },
            device_info: metadata,
            account_control: {
                is_locked: false,
                is_verified: false,
                is_online: false,
                is_banned: false
            },
            wallet: {
                balance: 0,
                history: {}
            },
            stats_lifetime: {
                total_income: 0,
                total_trips: 0
            },
            performance_score: {
                rating: 5.0,
                speed: 100,
                attitude: 100,
                accuracy: 100,
                rank: "Bronze"
            }
        };

        try {
            // Simpan ke Firebase berdasarkan NIK sebagai ID Unik
            await set(ref(db, 'drivers/' + nik), driverData);
            
            // Simpan sesi ke LocalStorage HP agar tidak perlu login ulang
            localStorage.setItem('driver_nik', nik);
            localStorage.setItem('driver_nama', nama);
            
            return { success: true, message: "Pendaftaran Berhasil!" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Cek apakah sudah login sebelumnya
    checkSession() {
        return localStorage.getItem('driver_nik');
    }
};
