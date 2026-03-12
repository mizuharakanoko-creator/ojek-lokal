document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('btn-scan-mission');
    
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            const statusText = scanBtn.querySelector('.scan-status');
            
            // Simulasi Scanning
            statusText.innerText = "SCANNING FOR NEARBY COORDINATES...";
            scanBtn.style.borderColor = "#00d4ff"; // Ubah warna jadi biru saat scan
            
            setTimeout(() => {
                statusText.innerText = "MISSION FOUND: GRADE A (EXPRESS)";
                scanBtn.style.borderColor = "var(--neon-magenta)";
                alert("Mission Detected! Siapkan kendaraan Anda.");
            }, 3000);
        });
    }
});
