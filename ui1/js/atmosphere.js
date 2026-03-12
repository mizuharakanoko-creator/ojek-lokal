// --- Atmosphere & System Sync ---

// 1. Runic Text Generator (Membuat teks acak bergaya kode/rune)
function generateRunicText() {
    const chars = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚻᚼᛂᛄᛅᛆᛇᛈᛉᛊᛋᛏᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟ";
    const container = document.getElementById('runic-loop');
    let str = "";
    for(let i=0; i<2000; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length)) + " ";
    }
    container.innerText = str;
}

// 2. Battery Sync Logic
function initBatterySync() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const updateBatteryStatus = () => {
                const overlay = document.getElementById('battery-glitch-overlay');
                if (battery.level <= 0.2) { // Jika baterai < 20%
                    overlay.classList.add('glitch-active');
                } else {
                    overlay.classList.remove('glitch-active');
                }
            };
            
            battery.addEventListener('levelchange', updateBatteryStatus);
            updateBatteryStatus();
        });
    }
}

// 3. Weather Simulation (Contoh Manual Trigger)
function setWeather(type) {
    const weatherLayer = document.getElementById('weather-effect');
    weatherLayer.className = ''; // Reset
    if(type === 'rain') {
        weatherLayer.classList.add('weather-rainy');
        console.log("Debuff: Licin Aktif!");
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateRunicText();
    initBatterySync();
    // setWeather('rain'); // Aktifkan ini untuk testing efek hujan
});
