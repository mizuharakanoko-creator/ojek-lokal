// ==========================================
// DEEP MINING & INJECTION LOGIC
// ==========================================

async function performDeepMining() {
    if(typeof getSupremeData === 'undefined') return;
    const dossier = document.querySelector('.dossier-body');
    const uName = document.getElementById('u-name');
    
    dossier.classList.add('data-syncing');
    uName.classList.add('loading-shimmer');

    try {
        const DATA = await getSupremeData(contractId);
        if (!DATA) throw new Error("Data Shard tidak terjangkau");

        const partner = isAdv ? DATA.requester : DATA.adventurer;
        
        setTimeout(() => {
            uName.classList.remove('loading-shimmer');
            uName.innerText = partner?.profile?.nama || "Unknown Entity";
            
            if (isAdv) {
                document.getElementById('u-rank').innerText = partner?.profile?.tier ? `T${partner.profile.tier}` : "T1";
                document.getElementById('u-role').innerText = "REQUESTER";
                const repPoints = partner?.reputation?.poin || 0;
                document.getElementById('v-stat-1').innerText = `${repPoints} REP`;
                updateProgressBar('b-stat-1', (repPoints / 1000) * 100); 
            } else {
                document.getElementById('u-rank').innerText = partner?.profile?.rank || "F";
                document.getElementById('u-role').innerText = "ADVENTURER";
                const trustScore = partner?.diagram?.nilai_kepercayaan || 0;
                document.getElementById('v-stat-1').innerText = `${trustScore}% TRUST`;
                updateProgressBar('b-stat-1', trustScore);
                document.getElementById('v-stat-2').innerText = "Lv." + (partner?.experience?.level || 1);
            }
            
            dossier.classList.remove('data-syncing');
            updateAI("Koneksi stabil. Segera jalin komunikasi dan konfirmasikan misi dikerjakan dengan baik.", "success");
        }, 600);

        injectDetails(DATA);

    } catch (e) {
        updateAI(`ERROR: ${e.message}`, "alert");
        dossier.classList.remove('data-syncing');
        uName.classList.remove('loading-shimmer');
    }
}

function updateProgressBar(id, percent) {
    const el = document.getElementById(id);
    if(el) el.style.width = Math.min(percent, 100) + "%";
}

function updateAI(text, type) {
    const box = document.getElementById('ai-terminal-box');
    const txt = document.getElementById('ai-text');
    box.className = 'ai-terminal ' + (type === 'normal' ? '' : type);
    txt.innerText = text;
    
    if(type === 'alert' || type === 'success') {
        setTimeout(() => { box.className = 'ai-terminal'; }, 5000);
    }
}

function parseCoordsString(coordStr) {
    if(!coordStr || coordStr === "NEGO") return null;
    const parts = coordStr.split(',');
    if(parts.length === 2) return [parseFloat(parts[0]), parseFloat(parts[1])];
    return null;
}

function injectDetails(DATA) {
    if (!DATA || !DATA.mission) return;

    const m = DATA.mission;
    const detail = m.full_mission_data || {};

    const catStr = detail.category || m.category || "CLASSIFIED";
    document.getElementById('m-title').innerText = catStr.toUpperCase();
    document.getElementById('m-client-name').innerText = detail.client_name || "STRANGER";
    document.getElementById('m-distance').innerText = detail.distance_est || "0";
    
    document.getElementById('m-status-text').innerText = isAdv ? "Mission Secured. Menunggu pergerakan." : `Partner Engaged: ${m.adventurer_nick || 'Unknown'}`;
    document.getElementById('m-progress-pct').innerText = "15%";
    document.getElementById('m-progress-bar').style.width = "15%";

    document.getElementById('m-reward-cash').innerText = "Rp " + Number(m.reward || 0).toLocaleString();
    document.getElementById('m-adv-nick').innerText = m.adventurer_nick || "Unknown";

    const btnMapsO = document.getElementById('btn-maps-origin');
    const oCoords = parseCoordsString(detail.origin_coords);
    if (oCoords) {
        document.getElementById('m-origin-name').innerText = detail.origin_name || "Koordinat Terenkripsi";
        if(!originMarker && map) {
            const i = L.divIcon({className: 'tactical-marker m-origin', html: "A", iconSize: [20,20]});
            originMarker = L.marker(oCoords, {icon: i}).addTo(map);
        } else if(originMarker) { originMarker.setLatLng(oCoords); }
        
        if (isAdv) {
            btnMapsO.classList.remove('hide');
            btnMapsO.onclick = () => window.open(`https://maps.google.com/?q=${detail.origin_coords}`);
        }
    }

    const destHub = document.getElementById('dest-hub');
    if (detail.dest_name || detail.dest_desa) {
        destHub.classList.remove('hide');
        document.getElementById('m-dest-name').innerText = detail.dest_desa || detail.dest_name;
        
        const dCoords = parseCoordsString(detail.dest_coords);
        if(dCoords) {
            destCoordsGlobal = dCoords; 
            if(!destMarker && map) {
                const i = L.divIcon({className: 'tactical-marker m-dest', html: "B", iconSize: [20,20]});
                destMarker = L.marker(dCoords, {icon: i}).addTo(map);
            } else if(destMarker) { destMarker.setLatLng(dCoords); }

            const btnMapsD = document.getElementById('btn-maps-dest');
            if (isAdv) {
                btnMapsD.classList.remove('hide');
                btnMapsD.onclick = () => window.open(`https://maps.google.com/?q=${detail.dest_coords}`);
            }
        }
    }

    if(!baseMarker && oCoords && map) {
        const i = L.divIcon({className: 'tactical-marker m-base', html: "<i class='fa-solid fa-house' style='font-size:10px;'></i>", iconSize: [20,20]});
        baseMarker = L.marker(oCoords, {icon: i}).addTo(map);
    }

    if (detail.multi_points && Array.isArray(detail.multi_points)) {
        document.getElementById('cargo-hub').classList.remove('hide');
        document.getElementById('m-cargo-detail').innerText = detail.multi_points.map((t, i) => `${i + 1}. ${t}`).join('\n');
    }

    if(!isAdv) {
        document.getElementById('rpg-exp-wrap').classList.add('hide');
        document.getElementById('rpg-stone-wrap').classList.add('hide');

        const area = document.getElementById('role-action-area');
        const phone = DATA?.adventurer?.profile?.whatsapp || "";
        
        area.innerHTML = `
            <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); padding: 15px; border-radius: 15px; text-align: center;">
                <div style="font-size: 11px; color: #aaa; margin-bottom: 15px;">Nomor anda tidak kami sebarkan, hubungi via whatsapp untuk komunikasi stabil.</div>
                <button onclick="window.open('https://wa.me/${phone.replace(/\D/g,'')}')" style="background:#25d366; color:#000; border:none; padding:15px; border-radius:12px; font-weight:900; cursor:pointer; transition:0.2s; width:100%; box-shadow:0 5px 15px rgba(37,211,102,0.3);">
                    <i class="fa-brands fa-whatsapp" style="font-size:20px; margin-right:8px;"></i> HUBUNGI ADVENTURER
                </button>
            </div>
        `;

        const hqContainer = document.querySelector('.hq-container');
        const eduBilah = document.getElementById('edu-bilah');
        if(eduBilah) hqContainer.prepend(eduBilah);
        startRequesterEducation();
    }
    
    startMissionTimer(m.start_time || Date.now());
    recenterMap();
}

// ==========================================
// HQ & STATUS TRANSMISSION
// ==========================================

function sendLiveStatus(str) {
    playSfx();
    if(dbDeal) dbDeal.ref(`kontrak_detail/${contractId}/latest_status`).set({ text: str, ts: Date.now() });
}

function syncStatus() {
    if(!dbDeal) return;
    dbDeal.ref(`kontrak_detail/${contractId}/latest_status`).on('value', snap => {
        if(snap.exists()) {
            const d = snap.val();
            const sText = document.getElementById('live-status-text');
            const sTime = document.getElementById('live-status-time');
            const sInd = document.getElementById('status-indicator');
            
            sText.innerText = d.text.toUpperCase();
            sTime.innerText = new Date(d.ts).toLocaleTimeString();
            
            if(d.text.includes('Kendala')) {
                updateAI("Mendeteksi gangguan di lapangan...", "alert");
                sInd.style.background = "var(--neon-red)"; sInd.style.boxShadow = "0 0 10px var(--neon-red)";
                document.getElementById('m-status-text').innerText = "Warning: ada kendala.";
                document.getElementById('m-status-text').style.color = "var(--neon-red)";
                document.getElementById('m-progress-bar').style.background = "var(--neon-red)";
            } else if(d.text.includes('Tiba')) {
                updateAI("Partner telah mencapai titik koordinat. Menunggu konfirmasi.", "success");
                sInd.style.background = "var(--neon-green)"; sInd.style.boxShadow = "0 0 10px var(--neon-green)";
                document.getElementById('m-status-text').innerText = "Objective Reached.";
                document.getElementById('m-status-text').style.color = "var(--neon-green)";
                document.getElementById('m-progress-pct').innerText = "100%";
                document.getElementById('m-progress-bar').style.width = "100%";
                document.getElementById('m-progress-bar').style.background = "var(--neon-green)";
                
                if(!isAdv) { vibratePulse(); document.getElementById('action-slider-box').classList.add('pulse'); }
            } else if(d.text.includes('OTW')) {
                updateAI("Kendaraan sedang bergerak melintasi sektor.", "normal");
                sInd.style.background = "var(--neon-blue)"; sInd.style.boxShadow = "0 0 10px var(--neon-blue)";
                document.getElementById('m-status-text').innerText = "In Transit...";
                document.getElementById('m-progress-pct').innerText = "55%";
                document.getElementById('m-progress-bar').style.width = "55%";
                document.getElementById('m-progress-bar').style.background = "linear-gradient(90deg, var(--neon-blue), var(--neon-purple))";
            }
        }
    });

    dbDeal.ref(`kontrak_detail/${contractId}/status`).on('value', snap => {
        if(snap.val() === 'completed_req' && isAdv) openEvalReq();
    });
}

// ==========================================
// MAP & PROXIMITY ENGINE
// ==========================================

function initMap() {
    if(!document.getElementById('map')) return;
    map = L.map('map', {zoomControl:false}).setView([-6.97, 108.48], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
    
    const advIco = L.divIcon({className: 'tactical-marker m-adv', html: "V", iconSize: [22, 22]});
    const reqIco = L.divIcon({className: 'tactical-marker m-req', html: "R", iconSize: [18, 18]});
    
    advMarker = L.marker([0,0], {icon: advIco}).addTo(map);
    reqMarker = L.marker([0,0], {icon: reqIco, opacity:0.8}).addTo(map);

    mapPolyline = L.polyline([], {color: 'var(--neon-green)', weight: 3, dashArray: '5, 10'}).addTo(map);
}

function recenterMap() {
    if(!map) return;
    const bounds = L.latLngBounds();
    let added = false;
    
    if(advMarker && advMarker.getLatLng().lat !== 0) { bounds.extend(advMarker.getLatLng()); added = true; }
    if(reqMarker && reqMarker.getLatLng().lat !== 0) { bounds.extend(reqMarker.getLatLng()); added = true; }
    if(originMarker) { bounds.extend(originMarker.getLatLng()); added = true; }
    if(destMarker) { bounds.extend(destMarker.getLatLng()); added = true; }
    if(baseMarker) { bounds.extend(baseMarker.getLatLng()); added = true; }

    if(added) map.fitBounds(bounds, {padding: [30, 30]});
}

function checkProximity(lat, lng) {
    if(!destCoordsGlobal || !map) return;
    const current = L.latLng(lat, lng);
    const dest = L.latLng(destCoordsGlobal[0], destCoordsGlobal[1]);
    const dist = current.distanceTo(dest); 

    if(dist < 500 && document.getElementById('ai-terminal-box').className.indexOf('pulse') === -1) {
        document.getElementById('ai-terminal-box').classList.add('pulse');
        updateAI("Target terdeteksi di zona perimeter (<500m). Mohon bersiap di titik temu.", "success");
        vibratePulse();
    }
}

function syncTracking() {
    if(navigator.geolocation && dbDeal) {
        navigator.geolocation.watchPosition(p => {
            const {latitude, longitude} = p.coords;
            const myM = isAdv ? advMarker : reqMarker;
            if(myM) myM.setLatLng([latitude, longitude]);
            
            dbDeal.ref(`kontrak_detail/${contractId}/tracking/${user.uid}`).set({lat:latitude, lng:longitude, ts:Date.now()});
            
            if(isAdv) checkProximity(latitude, longitude);
            
            if(activeTab === 'tab-map') recenterMap();
        });
        
        dbDeal.ref(`kontrak_detail/${contractId}/tracking`).on('value', snap => {
            snap.forEach(c => { 
                if(c.key !== user.uid) {
                    const partnerM = isAdv ? reqMarker : advMarker;
                    if(partnerM) partnerM.setLatLng([c.val().lat, c.val().lng]);
                }
            });

            if(destCoordsGlobal && advMarker && advMarker.getLatLng().lat !== 0) {
                mapPolyline.setLatLngs([ advMarker.getLatLng(), destCoordsGlobal ]);
            }
            if(activeTab === 'tab-map') recenterMap();
        });
    }
}
