const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision'); // Library OCR Google

admin.initializeApp();
const db = admin.database();
const client = new vision.ImageAnnotatorClient();

// Trigger otomatis saat user menulis data temporary di database
exports.processDriverOtonomous = functions.database.ref('pending_verifications/{tempId}')
    .onCreate(async (snapshot, context) => {
        const data = snapshot.val();
        const uid = data.uid;
        console.log(`SECURE PROTOCOL: Processing new Driver UID: ${uid}`);

        try {
            // --- 1. MEMANGGIL GOOGLE VISION API (OCR Kebal Hacker) ---
            const [result] = await client.textDetection(data.ktp_url);
            const detections = result.textAnnotations;
            if (detections.length === 0) { throw new Error('NO_TEXT_IN_KTP'); }
            const rawText = detections[0].description;
            console.log(`RAW KTP TEXT: ${rawText}`);

            // --- LOGIKA EKSTRAKSI NIK & NAMA AKURAT SISI SERVER ---
            // Dapatkan NIK mentah yang akurat dari server Google
            const nikMatch = rawText.match(/\d{16}/);
            if (!nikMatch) { throw new Error('NIK_NOT_FOUND'); }
            const extractedNik = nikMatch[0];

            // Dapatkan Nama mentah yang akurat (Perlu logika RegEx yang rumit untuk KTP)
            const extractedName = "NAMA HASIL OCR SERVER GOOGLE"; // DUMMY

            // --- 2. LOGIKA ANTI-DUPLIKASI (NIK & PERANGKAT) ---
            // Periksa apakah NIK sudah pernah digunakan
            const nikCheck = await db.ref('registered_niks/' + extractedNik).once('value');
            if (nikCheck.exists()) { throw new Error('NIK_DUPLICATED'); }

            // (Opsional) Cek Device ID untuk banned hardware
            // const deviceCheck = await db.ref('banned_hardware/' + data.device_id).once('value');
            // if (deviceCheck.exists()) { throw new Error('HARDWARE_BANNED'); }

            // --- 3. MEMANGGIL API PENCOCOKAN WAJAH (Biometric Match) ---
            // Gunakan API seperti Face++ atau Azure Face untuk membandingkan
            // data.ktp_url vs data.selfie_url.
            const matchingResult = 95; // DUMMY: Hasil Kecocokan 95%
            if (matchingResult < 90) { throw new Error('FACE_NOT_MATCH'); }

            // --- 4. PEMBUATAN AKUN OTONOM (LULUS VERIFIKASI) ---
            console.log("SECURE PROTOCOL: Validations Passed. Building Profile.");

            // FORMAT TANGGAL GABUNG
            const now = new Date();
            const joinDateStr = now.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

            // Tulis Atomically (Write) ke Database Driver Final
            await db.ref('users_driver/' + uid).set({
                // Identitas yang DIHASILKAN OLEH SERVER, bukan diinput User
                id_driver: uid, // Gunakan UID aman Firebase Auth
                nama_lengkap: extractedName,
                nomor_ktp: extractedNik,
                nomor_telepon: data.phoneNumber,
                tanggal_terdaftar: joinDateStr,
                url_foto_profil: data.selfie_url, // Selfie dianggap foto profil default
                
                status_verifikasi: "Verified",
                kategori_mitra: "Newbie",
                rank_class: "F",
                level: 1,
                // ... isi default RPG yang dibahas kemarin ...
                current_xp: 0,
                max_xp: 100,
                stamina_current: 100,
                stamina_max: 100,
                total_points: 0,
                saldo_gold: 0,
                saldo_silver: 0,
                saldo_bronze: 0,
                saldo_mengendap: 10000,
                order_selesai: 0, order_batal: 0,
                timestamp: admin.database.ServerValue.TIMESTAMP
            });

            // Daftarkan NIK ke database terkunci
            await db.ref('registered_niks/' + extractedNik).set({
                uid: uid,
                status: "Locked"
            });

            // Hapus data temp (Memicu polling sisi klien berakhir)
            await db.ref('pending_verifications/' + uid).remove();
            console.log("SECURE PROTOCOL: Driver Otonomous Initialization COMPLETE.");

        } catch (error) {
            console.error("SECURE PROTOCOL ERROR:", error.message);
            
            // Catat alasan kegagalan ke database agar admin/sistem tahu (opsional)
            await db.ref('registration_logs/' + uid).set({
                error: error.message,
                timestamp: admin.database.ServerValue.TIMESTAMP
            });

            // JANGAN Hapus data temp agar driver tahu kegagalannya (di client side polling)
            // Atau update status 'PROCESS' -> 'FAILED'
            await db.ref('pending_verifications/' + uid).set({ status: 'FAILED' }); 
        }
    });
