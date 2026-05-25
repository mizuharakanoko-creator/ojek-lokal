// ==========================================================================
// CYBER-TACTICAL MAP HUD ENGINE - BRAIN TACTICAL
// ==========================================================================
(function (window) {
    'use strict';

    // State Internal Navigasi & Leaflet
    let mapInstance = null;
    let operatorMarker = null;
    let targetQuestMarker = null;
    let routingPolyline = null;
    let gpsWatchId = null;
    
    // Default Koordinat Utama (Jakarta / Pusat Hub seandainya GPS mati)
    let currentLat = -6.200000;
    let currentLng = 106.816667;
    let lastHeading = 0;

    // Cache Selektor DOM Komponen Tab Maps (Prefix: mp-)
    let domGpsCoords = null;
    let domCompassBearing = null;
    let domRouteBox = null;
    let domRouteStatus = null;
    let domRouteEta = null;

    /**
     * Memetakan elemen DOM HUD peta taktis
     */
    function cacheTacticalDOM() {
        domGpsCoords = document.getElementById('mp-gps-coords');
        domCompassBearing = document.getElementById('mp-compass-bearing');
        domRouteBox = document.getElementById('mp-route-hud-box');
        domRouteStatus = document.getElementById('mp-route-status-text');
        domRouteEta = document.getElementById('mp-route-eta-badge');
    }

    /**
     * Inisialisasi Utama Peta Leaflet dengan Gaya Peta Gelap (Cyberpunk Theme)
     */
    window.initTacticalMap = function () {
        if (mapInstance) return; // Cegah re-inisialisasi ganda

        cacheTacticalDOM();
        console.log("[TACTICAL] Mengaktifkan Grid Peta Satelit...");

        // Bangun instansiasi peta pada div id="map"
        mapInstance = L.map('map', {
            center: [currentLat, currentLng],
            zoom: 15,
            zoomControl: false, // Sembunyikan kontrol bawaan agar UI bersih
            attributionControl: false
        });

        // Menyuntikkan ubin peta gaya gelap (CartoDB Dark Matter)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            minZoom: 3
        }).addTo(mapInstance);

        // Daftarkan peta ke global window agar index.html bisa memicu invalidateSize()
        window.tacticalMap = mapInstance;

        // Aktifkan Pelacakan Sensor GPS Geolokasi Perangkat
        startLiveGpsTracking();
    };

    /**
     * Memulai Sistem Pemantauan Posisi GPS Secara Real-Time
     */
    function startLiveGpsTracking() {
        if (!navigator.geolocation) {
            console.warn("[TACTICAL ALERT] Sensor GPS tidak didukung di perangkat ini.");
            return;
        }

        const gpsOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        gpsWatchId = navigator.geolocation.watchPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                
                // Ambil data orientasi arah/heading jika tersedia (untuk pergerakan nyata)
                if (position.coords.heading !== null && position.coords.heading !== undefined) {
                    lastHeading = position.coords.heading;
                }

                updateOperatorTelemetryHUD();
                updateOperatorMarkerOnMap();
            },
            (error) => {
                console.error("[GPS TRACKING ERROR]", error);
            },
            gpsOptions
        );
    }

    /**
     * Memperbarui Visualisasi Marker Posisi Operator di Peta
     */
    function updateOperatorMarkerOnMap() {
        if (!mapInstance) return;

        // Ikon Kustom Neon Biru untuk Operator (Blinking Pulse Effect via CSS)
        const operatorIcon = L.divIcon({
            className: 'mp-operator-pulse-icon',
            html: `
                <div style="position:relative; width:18px; height:18px;">
                    <div style="position:absolute; width:100%; height:100%; background:var(--neon-blue); border-radius:50%; border:2px solid #fff; box-shadow: 0 0 15px var(--neon-blue);"></div>
                    <div style="position:absolute; width:100%; height:100%; background:var(--neon-blue); border-radius:50%; opacity:0.4; transform:scale(2); animation:mp-pulse-anim 1.5s infinite alternate;"></div>
                </div>
                <style>
                    @keyframes mp-pulse-anim { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(2.5); opacity:0; } }
                </style>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        if (!operatorMarker) {
            operatorMarker = L.marker([currentLat, currentLng], { icon: operatorIcon }).addTo(mapInstance);
            operatorMarker.bindPopup("<b>OPERATOR DATA INTEGRITY</b><br>Lokasi Anda saat ini terkunci.").openPopup();
            mapInstance.setView([currentLat, currentLng], 16);
        } else {
            operatorMarker.setLatLng([currentLat, currentLng]);
        }
    }

    /**
     * Memperbarui Data Telemetri Teks pada HUD Atas Peta
     */
    function updateOperatorTelemetryHUD() {
        if (!domGpsCoords) cacheTacticalDOM();

        if (domGpsCoords) {
            domGpsCoords.innerText = `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`;
        }

        if (domCompassBearing) {
            let directionText = "STATIC";
            if (lastHeading > 337.5 || lastHeading <= 22.5) directionText = `${lastHeading.toFixed(0)}° N`;
            else if (lastHeading > 22.5 && lastHeading <= 67.5) directionText = `${lastHeading.toFixed(0)}° NE`;
            else if (lastHeading > 67.5 && lastHeading <= 112.5) directionText = `${lastHeading.toFixed(0)}° E`;
            else if (lastHeading > 112.5 && lastHeading <= 157.5) directionText = `${lastHeading.toFixed(0)}° SE`;
            else if (lastHeading > 157.5 && lastHeading <= 202.5) directionText = `${lastHeading.toFixed(0)}° S`;
            else if (lastHeading > 202.5 && lastHeading <= 247.5) directionText = `${lastHeading.toFixed(0)}° SW`;
            else if (lastHeading > 247.5 && lastHeading <= 292.5) directionText = `${lastHeading.toFixed(0)}° W`;
            else if (lastHeading > 292.5 && lastHeading <= 337.5) directionText = `${lastHeading.toFixed(0)}° NW`;

            domCompassBearing.innerText = directionText;
        }

        // Jika rute aktif sedang berjalan, hitung ulang jarak secara dinamis
        if (targetQuestMarker && window.recalculateLiveDistance) {
            window.recalculateLiveDistance(currentLat, currentLng, targetQuestMarker.getLatLng().lat, targetQuestMarker.getLatLng().lng);
        }
    }

    /**
     * Plot Lokasi Target Misi / Quest dan Gambar Jalur Polylines
     * @param {number} tLat - Latitude Target
     * @param {number} tLng - Longitude Target
     * @param {string} targetName - Nama Lokasi / Judul Quest
     */
    window.lockTacticalTargetRoute = function (tLat, tLng, targetName) {
        if (!mapInstance) window.initTacticalMap();

        // Bersihkan objek target lama jika ada
        window.clearTacticalTargetRoute();

        // Ikon Kustom Neon Hijau untuk Titik Target Quest
        const targetIcon = L.divIcon({
            className: 'mp-target-glow-icon',
            html: `
                <div style="position:relative; width:22px; height:22px; display:flex; align-items:center; justify-content:center;">
                    <i class="fa-solid fa-crosshairs" style="color: var(--neon-green); font-size:22px; text-shadow: 0 0 10px var(--neon-green);"></i>
                </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        // Tambah marker target di peta
        targetQuestMarker = L.marker([tLat, tLng], { icon: targetIcon }).addTo(mapInstance);
        targetQuestMarker.bindPopup(`<b>TARGET PROTOKOL</b><br>${targetName || "Quest Objective Location"}`).openPopup();

        // Gambar Garis Jalur Hubungkan Posisi Operator ke Target (Polyline Gaya Laser Neon)
        const pathCoordinates = [
            [currentLat, currentLng],
            [tLat, tLng]
        ];

        routingPolyline = L.polyline(pathCoordinates, {
            color: 'var(--neon-green)',
            weight: 3,
            opacity: 0.8,
            dashArray: '8, 8', // Bergaris putus-putus gaya sirkuit militer digital
            lineCap: 'round'
        }).addTo(mapInstance);

        // Atur agar sudut kamera mencakup kedua titik secara seimbang
        const bounds = L.latLngBounds([
            [currentLat, currentLng],
            [tLat, tLng]
        ]);
        mapInstance.fitBounds(bounds, { padding: [50, 50] });

        // Tampilkan Floating HUD Rute Info
        if (!domRouteBox) cacheTacticalDOM();
        if (domRouteBox) domRouteBox.classList.remove('hide');
        if (domRouteStatus) domRouteStatus.innerText = `Mengunci koordinat: ${targetName}`;
        
        // Hitung estimasi waktu kasar berdasarkan jarak (Kecepatan rata-rata motor 40 km/jam)
        const jarakKm = mapInstance.distance([currentLat, currentLng], [tLat, tLng]) / 1000;
        const estimasiMenit = Math.ceil((jarakKm / 40) * 60) + 2; // Ditambah buffer 2 menit lampu merah
        if (domRouteEta) domRouteEta.innerText = `${estimasiMenit} MIN`;
    };

    /**
     * Membersihkan Seluruh Target Misi dan Garis Navigasi dari Peta
     */
    window.clearTacticalTargetRoute = function () {
        if (targetQuestMarker && mapInstance) {
            mapInstance.removeLayer(targetQuestMarker);
            targetQuestMarker = null;
        }
        if (routingPolyline && mapInstance) {
            mapInstance.removeLayer(routingPolyline);
            routingPolyline = null;
        }
        if (!domRouteBox) cacheTacticalDOM();
        if (domRouteBox) domRouteBox.classList.add('hide');
    };

    /**
     * Memutus Pemantauan GPS Secara Bersih Saat Sesi Berakhir
     */
    window.shutdownTacticalEngine = function () {
        if (gpsWatchId !== null) {
            navigator.geolocation.clearWatch(gpsWatchId);
            gpsWatchId = null;
        }
        window.clearTacticalTargetRoute();
        if (operatorMarker && mapInstance) {
            mapInstance.removeLayer(operatorMarker);
            operatorMarker = null;
        }
        console.log("[TACTICAL] Sistem Navigasi Dimatikan.");
    };

})(window);
