/* ===================================================================
   MS_TACTICAL_MAP.JS
   Role: Leaflet Map Controller, Tactical Markers, & Distance Calculator
   =================================================================== */

// 1. VARIABLE DEFINITION (Penyimpanan Instance Peta & Marker)
let tacticalMapInstance = null;
let mapMarkers = {
    driver: null,
    origin: null,
    destination: null
};
let routePolyline = null;

// 2. INITIALIZATION ENGINE (Dipanggil saat Tab Peta Dibuka)
function initTacticalMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || tacticalMapInstance) return;

    console.log("[MAP] Initializing Tactical Satellite Layer...");

    // Koordinat default (Tengah Kota / Fallback dari kode asli Anda)
    const defaultCenter = [-6.2088, 106.8456]; 

    // Inisialisasi Peta Tanpa Kontrol Atribusi Bawaan yang Mengotori Layar
    tacticalMapInstance = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultCenter, 13);

    // Memuat Ubin Peta OpenStreetMap Standard (Filter gelap diatur via ms_design.css)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(tacticalMapInstance);

    // Pindahkan Tombol Zoom ke Pojok Kanan Bawah agar Tidak Mengganggu Pandangan
    L.control.zoom({
        position: 'bottomright'
    }).addTo(tacticalMapInstance);
}

// 3. MAP SIZE SYNCHRONIZER (Mencegah Bug Legendaris Peta Blank Saat Ganti Tab)
function syncMapSize() {
    if (!tacticalMapInstance) {
        initTacticalMap();
    }
    
    // Memaksa Leaflet menghitung ulang dimensi container HTML-nya secara instan
    setTimeout(() => {
        if (tacticalMapInstance) {
            tacticalMapInstance.invalidateSize({ animate: true });
            console.log("[MAP] Tactical Viewport Recalibrated.");
        }
    }, 150);
}

// 4. FACTORY: CUSTOM TACTICAL MARKER
function createTacticalIcon(className, iconHtml) {
    return L.divIcon({
        html: `<div class="tactical-marker ${className}">${iconHtml}</div>`,
        className: 'custom-leaflet-marker', // Reset class bawaan agar tidak bentrok
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
}

// 5. DATA RENDERING ENGINE (Ditembak Otomatis Oleh ms_quest_state_manager.js)
function updateTacticalMap(missionData) {
    // Jika peta belum diinisialisasi, jalankan engine awal
    if (!tacticalMapInstance) {
        initTacticalMap();
    }

    if (!missionData) {
        resetMapToStandby();
        return;
    }

    console.log("[MAP] Parsing Operational Coordinates...");

    const pointsToFit = [];

    // A. RENDER MARKER PETUALANG / DRIVER
    if (missionData.lat_driver && missionData.lng_driver) {
        const driverPos = [parseFloat(missionData.lat_driver), parseFloat(missionData.lng_driver)];
        pointsToFit.push(driverPos);

        if (mapMarkers.driver) {
            mapMarkers.driver.setLatLng(driverPos);
        } else {
            mapMarkers.driver = L.marker(driverPos, {
                icon: createTacticalIcon('m-adv', '<i class="fa-solid fa-person-military-pointing"></i>')
            }).addTo(tacticalMapInstance).bindPopup("<b>Field Agent (Anda)</b>");
        }
    }

    // B. RENDER MARKER TITIK JEMPUT / ORIGIN (TITIK A)
    if (missionData.lat_pickup && missionData.lng_pickup) {
        const originPos = [parseFloat(missionData.lat_pickup), parseFloat(missionData.lng_pickup)];
        pointsToFit.push(originPos);

        if (mapMarkers.origin) {
            mapMarkers.origin.setLatLng(originPos);
        } else {
            mapMarkers.origin = L.marker(originPos, {
                icon: createTacticalIcon('m-origin', '<i class="fa-solid fa-store"></i>')
            }).addTo(tacticalMapInstance).bindPopup(`<b>Titik Penjemputan (A)</b><br>${missionData.nama_tempat_pickup || ''}`);
        }
    }

    // C. RENDER MARKER TITIK TUJUAN / DESTINATION (TITIK B)
    if (missionData.lat_destination && missionData.lng_destination) {
        const destPos = [parseFloat(missionData.lat_destination), parseFloat(missionData.lng_destination)];
        pointsToFit.push(destPos);

        if (mapMarkers.destination) {
            mapMarkers.destination.setLatLng(destPos);
        } else {
            mapMarkers.destination = L.marker(destPos, {
                icon: createTacticalIcon('m-dest', '<i class="fa-solid fa-flag-checkered"></i>')
            }).addTo(tacticalMapInstance).bindPopup(`<b>Titik Tujuan (B)</b><br>${missionData.nama_tempat_destination || ''}`);
        }
    }

    // D. DRAW ROUTE LINE & CALCULATE DISTANCE (Garis Taktis Penerbangan Logistik)
    if (routePolyline) {
        tacticalMapInstance.removeLayer(routePolyline);
    }

    if (pointsToFit.length >= 2) {
        // Buat garis rute linier neon-blue
        routePolyline = L.polyline(pointsToFit, {
            color: '#00f3ff',
            weight: 3,
            opacity: 0.75,
            dashArray: '8, 8', // Efek garis putus-putus militer
            lineJoin: 'round'
        }).addTo(tacticalMapInstance);

        // Auto-Zoom Peta agar seluruh Marker muat dalam satu layar secara proporsional
        tacticalMapInstance.fitBounds(L.polyline(pointsToFit).getBounds(), {
            padding: [50, 50],
            maxZoom: 15
        });

        // Hitung Estimasi Jarak Kasar dalam KM (Haversine formula bawaan Leaflet)
        calculateTacticalDistance(pointsToFit);
    }
}

// 6. DISTANCE CALCULATOR ENGINE
function calculateTacticalDistance(points) {
    if (points.length < 2) return;
    
    let totalMeters = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const loc1 = L.latLng(points[i][0], points[i][1]);
        const loc2 = L.latLng(points[i+1][0], points[i+1][1]);
        totalMeters += loc1.distanceTo(loc2);
    }

    const totalKM = (totalMeters / 1000).toFixed(1);
    
    // Suntik Nilai Jarak Langsung ke Dom HQ Panel
    const distanceBadge = document.getElementById('m-distance');
    if (distanceBadge) {
        distanceBadge.innerText = totalKM;
    }
}

// 7. EXTERNAL SYSTEM MAP NAVIGATION ROUTING (Tombol Klik Untuk Peta Navigasi HP)
function openExternalRouting(lat, lng, label) {
    if (!lat || !lng) {
        sysAlert("NAVIGATION ERROR", "Gagal membuka tautan peta eksternal. Koordinat geo-lokasi target tidak valid.");
        return;
    }
    // Mengarahkan ke Google Maps Native App / Web dengan koordinat akurat
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(gmapsUrl, '_blank');
}

// 8. RESET ENGINE (Membersihkan seluruh marker jika misi hangus / kosong)
function resetMapToStandby() {
    console.log("[MAP] Mission Cleared. Purging Tactical Layers...");
    
    // Hapus Rute
    if (routePolyline) {
        if (tacticalMapInstance) tacticalMapInstance.removeLayer(routePolyline);
        routePolyline = null;
    }

    // Hapus Semua Marker
    Object.keys(mapMarkers).forEach(key => {
        if (mapMarkers[key]) {
            if (tacticalMapInstance) tacticalMapInstance.removeLayer(mapMarkers[key]);
            mapMarkers[key] = null;
        }
    });

    // Kembalikan Angka Jarak ke Nol di DOM HQ
    const distanceBadge = document.getElementById('m-distance');
    if (distanceBadge) distanceBadge.innerText = "0";
}

// Pemicu Listener Tombol Peta Eksternal di Halaman HQ saat DOM siap
window.addEventListener('DOMContentLoaded', () => {
    const btnMapOrigin = document.getElementById('btn-maps-origin');
    const btnMapDest = document.getElementById('btn-maps-dest');

    if (btnMapOrigin) {
        btnMapOrigin.addEventListener('click', () => {
            if (AppState.missionData) {
                openExternalRouting(AppState.missionData.lat_pickup, AppState.missionData.lng_pickup, "Origin");
            }
        });
    }

    if (btnMapDest) {
        btnMapDest.addEventListener('click', () => {
            if (AppState.missionData) {
                openExternalRouting(AppState.missionData.lat_destination, AppState.missionData.lng_destination, "Destination");
            }
        });
    }
});
