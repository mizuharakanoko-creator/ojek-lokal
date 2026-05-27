/* ===================================================================
   MS_LEDGER_ENGINE.JS
   Role: Physical Receipt Calculator, Camera Snapshot Attachment, 
         & Financial Settlement Engine
   =================================================================== */

// 1. STATE CONFIGURATION (Penyimpanan Data Lokal Nota)
let currentLedgerMissionId = null;
let currentLedgerData = null;
let snapshotBase64Data = null;

// 2. MAIN RENDERING ENGINE (Ditembak Otomatis Oleh ms_quest_state_manager.js)
function updateLedgerEngine(missionId, missionData) {
    currentLedgerMissionId = missionId;
    currentLedgerData = missionData;

    const inputPanel = document.getElementById('ledger-input-hub');
    const actionZone = document.getElementById('ledger-action-zone');
    const badgeLedger = document.getElementById('badge-ledger');

    if (!missionData) {
        resetLedgerToStandby();
        return;
    }

    // Mengatur ID Transaksi pada Nota sesuai ID Misi
    document.getElementById('receipt-date').innerText = `TRANS-ID: ${missionId.toUpperCase()}`;

    // Tampilkan panel input dan aksi jika status berada di fase operasional pengiriman (otw, kerja)
    if (missionData.status_operational === "otw" || missionData.status_operational === "kerja") {
        if (inputPanel) inputPanel.classList.remove('hide');
        if (actionZone) actionZone.classList.remove('hide');
        if (badgeLedger) badgeLedger.classList.add('show'); // Berikan tanda notifikasi di tab footer
    } else {
        if (inputPanel) inputPanel.classList.add('hide');
        if (actionZone) actionZone.classList.add('hide');
        if (badgeLedger) badgeLedger.classList.remove('show');
    }

    // Kalkulasi dan Render Butir-Butir Nota Ke Layar
    renderReceiptItems();
}

// 3. RENDER RECEIPT ITEMS SYSTEM
function renderReceiptItems() {
    const container = document.getElementById('nota-items-container');
    if (!container) return;

    // Bersihkan isi kontainer lama
    container.innerHTML = "";

    if (!currentLedgerData) return;

    // Mengambil nilai biaya dari database (fallback ke 0 jika kosong)
    const ongkosMurni = parseInt(currentLedgerData.harga_murni || 0);
    const biayaTambahan = parseInt(currentLedgerData.biaya_tambahan || 0);
    const totalSettlement = ongkosMurni + biayaTambahan;

    // Butir 1: Ongkos Murni Tarif Misi
    const itemOngkos = document.createElement('div');
    itemOngkos.className = 'nota-item';
    itemOngkos.innerHTML = `
        <div>
            <div style="font-weight: bold;">TARIF MISI UTAMA</div>
            <div style="font-size: 10px; color: #666;">Kalkulasi Jarak Berbasis Koordinat</div>
        </div>
        <div style="font-weight: bold;">Rp ${ongkosMurni.toLocaleString('id-ID')}</div>
    `;
    container.appendChild(itemOngkos);

    // Butir 2: Biaya Tambahan / Parkir (Jika Ada)
    if (biayaTambahan > 0) {
        const itemTambahan = document.createElement('div');
        itemTambahan.className = 'nota-item new-item';
        itemTambahan.innerHTML = `
            <div>
                <div style="font-weight: bold; color: #b58900;"><i class="fa-solid fa-square-plus"></i> ADJUSTMENT BIAYA</div>
                <div style="font-size: 10px; color: #777;">Parkir / Tol / Kendala Lapangan</div>
            </div>
            <div style="font-weight: bold; color: #b58900;">Rp ${biayaTambahan.toLocaleString('id-ID')}</div>
        `;
        container.appendChild(itemTambahan);
    }

    // Butir 3: Lampiran Foto Bukti Fisik (Jika Ada di Database)
    if (currentLedgerData.foto_nota) {
        const itemFoto = document.createElement('div');
        itemFoto.className = 'nota-item';
        itemFoto.style.flexDirection = 'column';
        itemFoto.style.alignItems = 'flex-start';
        itemFoto.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;"><i class="fa-solid fa-paperclip"></i> DOKUMEN BUKTI LAMPIRAN</div>
            <img src="${currentLedgerData.foto_nota}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #ccc; cursor: pointer;" onclick="openImgViewer('${currentLedgerData.foto_nota}')">
        `;
        container.appendChild(itemFoto);
    }

    // Perbarui Teks Grand Total pada DOM Nota
    document.getElementById('nota-grand-total').innerText = `Rp ${totalSettlement.toLocaleString('id-ID')}`;
}

// 4. CAMERA SNAPSHOT CONTROLLER
function initCameraAttachment() {
    const btnTrigger = document.getElementById('btn-camera-trigger');
    const fileInput = document.getElementById('camera-file-input');
    const previewImg = document.getElementById('snap-preview');

    if (!btnTrigger || !fileInput) return;

    btnTrigger.addEventListener('click', () => {
        playSFX('click-sfx');
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validasi tipe file gambar
        if (!file.type.startsWith('image/')) {
            sysAlert("VALIDASI GAGAL", "Format file wajib berupa gambar/foto.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const rawImg = new Image();
            rawImg.src = event.target.result;
            
            rawImg.onload = function() {
                // Kompresi otomatis resolusi gambar sebelum diunggah ke Firebase Realtime Database (Mencegah Lag Kuota)
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const MAX_WIDTH = 500;
                let width = rawImg.width;
                let height = rawImg.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(rawImg, 0, 0, width, height);

                // Ubah menjadi data Base64 dengan kualitas 70% kompresi
                snapshotBase64Data = canvas.toDataURL('image/jpeg', 0.7);
                
                // Tampilkan pratinjau gambar kecil di UI input
                if (previewImg) {
                    previewImg.src = snapshotBase64Data;
                    previewImg.style.display = 'block';
                }
                
                console.log("[CAMERA] Snapshot compressed and loaded into local storage buffer.");
            };
        };
        reader.readAsDataURL(file);
    });
}

// 5. FINANCIAL SETTLEMENT SUBMIT (Kunci data ke Firebase)
async function submitLedgerAdjustment() {
    playSFX('click-sfx');

    if (!currentLedgerMissionId) {
        sysAlert("ERROR AKSI", "Sesi misi tidak terdeteksi.");
        return;
    }

    const valOngkos = document.getElementById('input-ongkos').value;
    const valParking = document.getElementById('input-parking').value;

    if (!valOngkos) {
        sysAlert("INPUT DIPERLUKAN", "Kolom Ongkos Murni wajib diisi sebagai parameter validasi nominal.");
        return;
    }

    const confirmSettle = await sysConfirm(
        "KUNCI NOTA FISIK",
        "Apakah Anda yakin data ongkos dan bukti lampiran sudah akurat?\n\nSetelah dikunci, parameter keuangan tidak dapat diubah kembali secara mandiri.",
        false
    );

    if (!confirmSettle) return;

    // Siapkan payload paket data untuk didorong ke Firebase
    const updatePayload = {
        harga_murni: parseInt(valOngkos),
        biaya_tambahan: parseInt(valParking || 0)
    };

    // Sertakan lampiran gambar jika ada di dalam buffer memori lokal
    if (snapshotBase64Data) {
        updatePayload.foto_nota = snapshotBase64Data;
    }

    // Inject data langsung ke Firebase Realtime Database
    FB4_BOARD.child("kontrak_mission").child(currentLedgerMissionId).update(updatePayload)
        .then(() => {
            sysAlert("SUKSES NOTA", "Parameter keuangan nota fisik berhasil dikunci ke server database.");
            
            // Bersihkan kolom input setelah berhasil kirim
            document.getElementById('input-ongkos').value = "";
            document.getElementById('input-parking').value = "";
            const previewImg = document.getElementById('snap-preview');
            if (previewImg) {
                previewImg.src = "";
                previewImg.style.display = 'none';
            }
            snapshotBase64Data = null;
        })
        .catch(err => {
            console.error("[LEDGER GAGAL]", err);
            sysAlert("DATABASE ERROR", `Gagal mengunci nota: ${err.message}`);
        });
}

// 6. MODAL INTERACTIVE IMAGE VIEWER SYSTEM (Pembuka Gambar Skala Penuh)
function openImgViewer(srcPath) {
    const viewerModal = document.getElementById('modalImgViewer');
    const viewerContent = document.getElementById('viewer-img-content');
    if (viewerModal && viewerContent) {
        viewerContent.src = srcPath;
        viewerModal.classList.add('show');
    }
}

function closeImgViewer() {
    const viewerModal = document.getElementById('modalImgViewer');
    if (viewerModal) viewerModal.classList.remove('show');
}

// 7. RESET LEDGER TO STANDBY
function resetLedgerToStandby() {
    currentLedgerMissionId = null;
    currentLedgerData = null;
    snapshotBase64Data = null;

    document.getElementById('receipt-date').innerText = "TRANS-ID: STANDBY";
    document.getElementById('nota-grand-total').innerText = "Rp 0";
    
    const container = document.getElementById('nota-items-container');
    if (container) container.innerHTML = '<div style="text-align:center; padding:20px; color:#aaa; font-size:12px;">Menunggu sinkronisasi misi aktif...</div>';

    const inputPanel = document.getElementById('ledger-input-hub');
    const actionZone = document.getElementById('ledger-action-zone');
    const badgeLedger = document.getElementById('badge-ledger');

    if (inputPanel) inputPanel.classList.add('hide');
    if (actionZone) actionZone.classList.add('hide');
    if (badgeLedger) badgeLedger.classList.remove('show');
}

// Pasang event listener inisialisasi klik tombol saat DOM HTML selesai dimuat
window.addEventListener('DOMContentLoaded', () => {
    initCameraAttachment();
    
    const btnSubmit = document.getElementById('btn-submit-ledger');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', submitLedgerAdjustment);
    }
});
