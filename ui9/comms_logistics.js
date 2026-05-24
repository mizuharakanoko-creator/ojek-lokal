// ==========================================
// NOTA & SNAPSHOT (CRUD)
// ==========================================

function previewSnapshot(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        base64Snapshot = e.target.result;
        const img = document.getElementById('snap-preview');
        img.src = base64Snapshot;
        img.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function notaSave() {
    const name = document.getElementById('in-name').value;
    const price = parseInt(document.getElementById('in-price').value);
    if(!name || !price) {
        await sysAlert('ERROR', 'Lengkapi data nama dan harga nota!', true);
        return;
    }

    const payload = { nama: name, harga: price, ts: Date.now() };
    if(base64Snapshot !== "") payload.foto = base64Snapshot;

    if(dbDeal) {
        const ref = dbDeal.ref(`kontrak_detail/${contractId}/nota/items`);
        if(activeEditId) {
            ref.child(activeEditId).update(payload);
            activeEditId = null;
            document.getElementById('btn-nota-save').innerText = "SIMPAN";
        } else {
            ref.push(payload);
        }
    }
    
    document.getElementById('in-name').value = "";
    document.getElementById('in-price').value = "";
    document.getElementById('in-snap').value = "";
    document.getElementById('snap-preview').style.display = "none";
    base64Snapshot = "";
}

function syncNota() {
    if(!dbDeal) return;
    dbDeal.ref(`kontrak_detail/${contractId}/nota/items`).on('value', snap => {
        const list = document.getElementById('nota-list-ui');
        list.innerHTML = "";
        let total = 0;
        
        if (!initialNotaLoad && activeTab !== 'tab-nota') {
            document.getElementById('badge-nota').classList.add('show');
            playNotif();
            if(!isAdv) updateAI("Perhatian: Rincian biaya telah diperbarui mohon diperiksa.", "alert");
        }
        initialNotaLoad = false;

        snap.forEach(child => {
            const item = child.val();
            total += item.harga;
            
            const isNewClass = (!isAdv && activeTab !== 'tab-nota') ? 'new-item' : '';
            const hasImage = item.foto ? `<button class="btn-icon" style="color:var(--neon-yellow);" onclick="viewNotaImage('${child.key}')"><i class="fa-solid fa-image"></i></button>` : '';

            const imgData = item.foto ? `data-img="${item.foto}"` : '';

            list.innerHTML += `
                <div class="nota-item ${isNewClass}" id="nota-row-${child.key}" ${imgData}>
                    <div style="flex:1">
                        <div style="font-weight:bold;">${item.nama}</div>
                        <div style="font-size:10px; color:#999; font-family:var(--font-sans); margin-top:4px;">${new Date(item.ts).toLocaleTimeString()}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:900; font-size:15px; color:#1a1a1a;">Rp ${item.harga.toLocaleString()}</div>
                        <div class="nota-actions" style="margin-top:5px; justify-content:flex-end;">
                            ${hasImage}
                            ${isAdv ? `
                                <button class="btn-icon" style="color:#007bff;" onclick="prepareEditNota('${child.key}', '${item.nama}', ${item.harga})"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button class="btn-icon" style="color:#dc3545;" onclick="notaDelete('${child.key}')"><i class="fa-solid fa-trash-can"></i></button>
                            ` : ''}
                        </div>
                    </div>
                </div>`;
        });
        document.getElementById('nota-total-val').innerText = "Rp " + total.toLocaleString();
    });
}

function viewNotaImage(id) {
    playSfx();
    const row = document.getElementById(`nota-row-${id}`);
    if(row && row.dataset.img) {
        document.getElementById('img-viewer-src').src = row.dataset.img;
        document.getElementById('modalImgViewer').classList.add('show');
    }
}

function prepareEditNota(id, name, price) {
    playSfx();
    activeEditId = id;
    document.getElementById('in-name').value = name;
    document.getElementById('in-price').value = price;
    document.getElementById('btn-nota-save').innerText = "UPDATE";
    document.getElementById('in-name').focus();
}

async function notaDelete(id) {
    playSfx();
    if(await sysConfirm("HAPUS NOTA", "Hapus item ini dari nota logistik?", true)) {
        if(dbDeal) dbDeal.ref(`kontrak_detail/${contractId}/nota/items/${id}`).remove();
    }
}

// ==========================================
// COMMS & STT ENGINE
// ==========================================

function commsSend() {
    const inp = document.getElementById('comms-input');
    if(!inp.value.trim() || !dbDeal) return;
    dbDeal.ref(`kontrak_detail/${contractId}/chats`).push({ uid: user.uid, msg: inp.value, ts: Date.now() });
    inp.value = "";
}

function syncChat() {
    if(!dbDeal) return;
    dbDeal.ref(`kontrak_detail/${contractId}/chats`).on('child_added', snap => {
        const d = snap.val();
        const div = document.createElement('div');
        div.className = `bubble ${d.uid === user.uid ? 'me' : 'them'}`;
        div.innerText = d.msg;
        document.getElementById('comms-wall').appendChild(div);
        
        if(activeTab === 'tab-comms') {
            document.getElementById('comms-wall').scrollTop = document.getElementById('comms-wall').scrollHeight;
        } else if(!initialChatLoad && d.uid !== user.uid) {
            document.getElementById('badge-comms').classList.add('show');
            playNotif();
            updateAI("Pesan teks masuk dari partner.", "normal");
        }
    });
    setTimeout(() => { initialChatLoad = false; }, 1500);
}

function runVoiceToText() {
    playSfx();
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'id-ID';
    const mic = document.getElementById('stt-mic');
    
    recognition.onstart = () => mic.style.background = "var(--neon-purple)";
    recognition.onresult = (e) => {
        document.getElementById('comms-input').value = e.results[0][0].transcript;
        mic.style.background = "rgba(188,19,254,0.1)";
    };
    recognition.onerror = () => mic.style.background = "rgba(188,19,254,0.1)";
    recognition.start();
}

// ==========================================
// UTILS & TIMERS
// ==========================================

function toggleProfile() { playSfx(); document.getElementById('profile-drawer').classList.toggle('open'); }
function closeModal(id) { playSfx(); document.getElementById(id).classList.remove('show'); }

function startMissionTimer(startTime) {
    const timerVal = document.getElementById('timer-val');
    setInterval(() => {
        const diff = Date.now() - startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerVal.innerText = `${h}:${m}:${s}`;
    }, 1000);
}

function startRequesterEducation() {
    const tips = [
        "Gunakan fitur NOTA untuk melihat rincian biaya tagihan secara real-time.",
        "Status 'OTW' memberitahu Anda bahwa Adventurer sudah bergerak ke lokasi.",
        "Klik tab MAP untuk melacak posisi Adventurer di peta koordinat.",
        "Geser Slider KONTRAK di bawah jika misi sudah selesai dan berikan penilaian reputasi.",
        "Klik tombol WA di kanan bawah untuk komunikasi via whatsapp."
    ];
    const bilah = document.getElementById('edu-bilah');
    const text = document.getElementById('edu-text');
    
    if(bilah && text) {
        bilah.classList.remove('hide');
        setInterval(() => {
            text.style.opacity = 0;
            setTimeout(() => {
                text.innerText = tips[Math.floor(Math.random() * tips.length)];
                text.style.opacity = 1;
            }, 300);
        }, 8000);
        text.innerText = tips[0];
        text.style.transition = "opacity 0.3s";
    }
}

// ==========================================
// SLIDE TO CONFIRM & EVALUATION SYSTEM
// ==========================================

function initSliderAction() {
    const wrapper = document.getElementById('slider-wrapper');
    const thumb = document.getElementById('slider-thumb');
    const fill = document.getElementById('slider-fill');
    const text = document.getElementById('slider-text');
    if(!thumb) return;

    let isDragging = false;
    let startX = 0;
    let maxW = 0;

    const startDrag = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        maxW = wrapper.clientWidth - thumb.clientWidth - 6; 
        thumb.style.transition = "none";
        fill.style.transition = "none";
    };

    const moveDrag = (e) => {
        if(!isDragging) return;
        let curX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let move = curX - startX;
        if(move < 0) move = 0;
        if(move > maxW) move = maxW;
        
        thumb.style.transform = `translateX(${move}px)`;
        fill.style.width = `${move + 25}px`;
        text.style.opacity = 1 - (move / maxW);
    };

    const endDrag = (e) => {
        if(!isDragging) return;
        isDragging = false;
        let curX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
        let move = curX - startX;
        
        thumb.style.transition = "transform 0.3s";
        fill.style.transition = "width 0.3s";
        text.style.transition = "opacity 0.3s";

        if(move > maxW * 0.9) {
            thumb.style.transform = `translateX(${maxW}px)`;
            fill.style.width = `100%`;
            vibratePulse();
            setTimeout(() => openEvalAdv(), 400); 
        } else {
            thumb.style.transform = `translateX(0px)`;
            fill.style.width = `0px`;
            text.style.opacity = 1;
        }
    };

    thumb.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    thumb.addEventListener('touchstart', startDrag, {passive: true});
    document.addEventListener('touchmove', moveDrag, {passive: true});
    document.addEventListener('touchend', endDrag);
}

function openEvalAdv() {
    playSfx();
    const cats = ['keamanan', 'kecerdasan', 'kepercayaan', 'keramahan', 'penampilan', 'kejujuran'];
    const grp = document.getElementById('eval-star-group');
    grp.innerHTML = "";
    cats.forEach(c => {
        grp.innerHTML += `
            <div class="star-row">
                <span style="font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#ccc;">${c}</span>
                <div class="stars" id="star-${c}">
                    ${[1,2,3,4,5].map(i => `<i class="fa-solid fa-star" onclick="setStar('${c}', ${i})"></i>`).join('')}
                </div>
            </div>`;
    });
    document.getElementById('modalEvalAdv').classList.add('show');
}

function setStar(cat, val) {
    playSfx();
    ratings[cat] = val;
    const s = document.getElementById(`star-${cat}`).children;
    for(let i=0; i<5; i++) s[i].classList.toggle('on', i < val);
}

async function executeAdvFinal() {
    const elNick = document.getElementById('m-adv-nick');
    const targetNick = elNick ? elNick.innerText.trim().toLowerCase() : "";

    try {
        const r = (typeof ratings !== 'undefined') ? ratings : { keamanan:0, kecerdasan:0, kepercayaan:0, keramahan:0, penampilan:0, kejujuran:0 };

        if(!dbMaster) throw new Error("DB Master belum terhubung.");
        const snap = await dbMaster.ref('adventurer_index').once('value');
        let meta = null;
        snap.forEach(child => { if(child.val().nickname.toLowerCase() === targetNick) meta = child.val(); });

        if (!meta) {
            await sysAlert("ERROR", "Nickname pelaksana tidak ditemukan di database index!", true);
            return;
        }

        const shardId = meta.shard_id;
        const idAdv = meta.id_adv;
        const targetShard = typeof getTerminal !== 'undefined' ? getTerminal(shardId) : null;
        if(!targetShard) throw new Error("Terminal Shard tidak ditemukan.");

        const [expSnap, diagSnap] = await Promise.all([
            targetShard.ref(`adventurer_experience/${idAdv}`).once('value'),
            targetShard.ref(`adventurer_diagram/${idAdv}`).once('value')
        ]);

        let { exp: curExp = 0, level: curLvl = 1, max_exp: maxExp = 100 } = expSnap.val() || {};
        let newExp = curExp + (mission.rpg_reward?.exp || 0);
        let newLvl = curLvl;
        let newMaxExp = maxExp;
        while (newExp >= newMaxExp) {
            newExp -= newMaxExp;
            newLvl++;
            newMaxExp = newMaxExp * 3;
        }

        const p = {
            keamanan: r.keamanan || 0,
            kecerdasan: r.kecerdasan || 0,
            kepercayaan: r.kepercayaan || 0,
            keramahan: r.keramahan || 0,
            penampilan: r.penampilan || 0, 
            kejujuran: r.kejujuran || 0     
        };
        const totalPoinMisi = p.keamanan + p.kecerdasan + p.kepercayaan + p.keramahan + p.kejujuran + p.penampilan;

        let starField = "star_1";
        if (totalPoinMisi === 30) starField = "star_5";
        else if (totalPoinMisi > 24) starField = "star_4";
        else if (totalPoinMisi > 18) starField = "star_3";
        else if (totalPoinMisi > 12) starField = "star_2";

        const auditMsg = `--- AUDIT 6 PARAMETER ---\nTarget: ${targetNick.toUpperCase()}\n\n` +
        `[Experience]\nLevel: ${curLvl} -> ${newLvl}\n\n` +
        `[Diagram +]\nKeamanan: ${p.keamanan} | Kecerdasan: ${p.kecerdasan}\n` +
        `Kepercayaan: ${p.kepercayaan} | Keramahan: ${p.keramahan}\n` +
        `Kejujuran: ${p.kejujuran} | Penampilan: ${p.penampilan}\n` +
        `Total: ${totalPoinMisi} / 30\n\n` +
        `Sinkronkan ke Shard ${shardId}?`;

        if (!(await sysConfirm("KONFIRMASI AUDIT", auditMsg))) return;

        await Promise.all([
            targetShard.ref(`adventurer_profile/${idAdv}`).update({ level: newLvl }),
            targetShard.ref(`adventurer_experience/${idAdv}`).update({ exp: newExp, level: newLvl, max_exp: newMaxExp }),
            targetShard.ref(`adventurer_diagram/${idAdv}`).update({
                nilai_keamanan: firebase.database.ServerValue.increment(p.keamanan),
                nilai_kecerdasan: firebase.database.ServerValue.increment(p.kecerdasan),
                nilai_kepercayaan: firebase.database.ServerValue.increment(p.kepercayaan),
                nilai_keramahan: firebase.database.ServerValue.increment(p.keramahan),
                nilai_kejujuran: firebase.database.ServerValue.increment(p.kejujuran),
                nilai_penampilan: firebase.database.ServerValue.increment(p.penampilan)
            }),
            targetShard.ref(`adventurer_reputation/${idAdv}`).update({
                [starField]: firebase.database.ServerValue.increment(1),
                total_mission_completed: firebase.database.ServerValue.increment(1)
            }),
            targetShard.ref(`adventurer_coxin/${idAdv}/green_stone`).set(firebase.database.ServerValue.increment(mission.rpg_reward?.greenStone || 0)),
            dbDeal.ref(`kontrak_detail/${contractId}`).update({ status: 'completed_req' }),
            getTerminal('FB4_BOARD').ref(`kontrak_mission/${contractId}`).update({ status: 'completed_req' })
        ]);

        await sysAlert("BERHASIL", "Data Berhasil Disimpan ke Shard!");
        window.location.href = "index.html";

    } catch (err) {
        await sysAlert("SINKRONISASI GAGAL", err.message, true);
    }
}

function openEvalReq() {
    playSfx();
    const qs = [
        {k:'baik', q:'Apakah Klien memberi titik yg sesuai?'},
        {k:'tips', q:'Diberi reward tips tambahan?'},
        {k:'cash', q:'Pembayaran uang tunai sesuai dengan kesepakatan?'},
        {k:'extra', q:'Ada beban ekstra tanpa kompensasi?'}
    ];
    const grp = document.getElementById('eval-bool-group');
    grp.innerHTML = "";
    qs.forEach(o => {
        grp.innerHTML += `
            <div style="margin-top:20px; text-align:left; background:rgba(0,0,0,0.3); padding:15px; border-radius:12px; border:1px solid var(--glass-border);">
                <div style="font-size:13px; margin-bottom:12px; font-weight:bold; color:#ddd;">${o.q}</div>
                <div style="display:flex; gap:10px;">
                    <button onclick="setBool('${o.k}', true)" id="b-${o.k}-y" class="btn-main" style="background:rgba(255,255,255,0.05); color:#fff; border-color:#444;">YA</button>
                    <button onclick="setBool('${o.k}', false)" id="b-${o.k}-n" class="btn-main" style="background:rgba(255,255,255,0.05); color:#fff; border-color:#444;">TIDAK</button>
                </div>
            </div>`;
    });
    document.getElementById('modalEvalReq').classList.add('show');
}

function setBool(k, val) {
    playSfx();
    reports[k] = val;
    const btnY = document.getElementById(`b-${k}-y`);
    const btnN = document.getElementById(`b-${k}-n`);
    
    btnY.style.borderColor = val ? 'var(--neon-green)' : '#444';
    btnY.style.color = val ? 'var(--neon-green)' : '#000';
    btnY.style.background = val ? 'var(--neon-green)' : 'rgba(255,255,255,0.05)';
    
    btnN.style.borderColor = !val ? 'var(--neon-red)' : '#444';
    btnN.style.color = !val ? 'var(--neon-red)' : '#000';
    btnN.style.background = !val ? 'var(--neon-red)' : 'rgba(255,255,255,0.05)';
}

async function executeReqFinal() {
    const elClient = document.getElementById('m-client-name');
    const targetClient = elClient ? elClient.innerText.trim().toLowerCase() : "";

    if (targetClient === "stranger") {
        await sysAlert(
            "PERINGATAN SISTEM",
            "Requester berstatus STRANGER.\nTidak ada data penilaian yang akan disimpan ke database.\n\nSaran: Harap lebih berhati-hati dikemudian hari. Pahami bahwa pemesan ada yang terdaftar sebagai CITIZEN dan ada yang TIDAK TERDAFTAR.",
            true
        );

        if(typeof Clearchance !== 'undefined') Clearchance.clearActiveMission();
        
        if(dbDeal) {
            await Promise.all([
                dbDeal.ref(`kontrak_detail/${contractId}`).update({ status: 'completed_all' }),
                getTerminal('FB4_BOARD').ref(`kontrak_mission/${contractId}`).update({ status: 'completed_all' })
            ]);
        }
        return location.href = "index.html";
    }

    if (!targetClient || targetClient === "..." || targetClient === "loading") {
        await sysAlert("ERROR", "Sistem belum siap: Nama Requester belum muncul!", true);
        return;
    }

    try {
        if(!dbMaster) throw new Error("DB Master Offline.");
        const snap = await dbMaster.ref('requester_index').once('value');
        let meta = null;
        snap.forEach(child => { 
            if(child.val().nickname && child.val().nickname.toLowerCase() === targetClient) {
                meta = child.val(); 
            }
        });

        if (!meta) {
            await sysAlert("ERROR", `Data Requester [${targetClient}] tidak ditemukan!`, true);
            return;
        }

        const shardId = meta.shard_id;
        const idReq = meta.id_req;
        const targetShard = typeof getTerminal !== 'undefined' ? getTerminal(shardId) : null;
        
        const p = {
            sesuai: reports.baik ? 1 : 0,
            tidak_sesuai: reports.baik ? 0 : 1,
            tips: reports.tips ? 1 : 0,
            pas: reports.cash ? 1 : 0,
            kurang: reports.cash ? 0 : 1,
            ekstra: reports.extra ? 1 : 0
        };

        const auditMsg = `--- AUDIT EVALUASI CITIZEN ---\nTARGET: ${targetClient.toUpperCase()}\n\nLaporan ini akan disimpan permanen di Shard ${shardId}.\nLanjutkan?`;

        if (!(await sysConfirm("KONFIRMASI LAPORAN", auditMsg))) return;

        await Promise.all([
            targetShard.ref(`requester_diagram/${idReq}`).update({
                titik_kordinat_sesuai: firebase.database.ServerValue.increment(p.sesuai),
                titik_kordinat_tidak_sesuai: firebase.database.ServerValue.increment(p.tidak_sesuai),
                memberi_tips: firebase.database.ServerValue.increment(p.tips),
                memberi_tunai_pas: firebase.database.ServerValue.increment(p.pas),
                memberi_tunai_kurang: firebase.database.ServerValue.increment(p.kurang),
                minta_tambahan_kerja: firebase.database.ServerValue.increment(p.ekstra)
            }),
            targetShard.ref(`requester_reputation/${idReq}`).update({
                total_order: firebase.database.ServerValue.increment(1)
            }),
            dbDeal.ref(`kontrak_detail/${contractId}`).update({ status: 'completed_all' }),
            getTerminal('FB4_BOARD').ref(`kontrak_mission/${contractId}`).update({ status: 'completed_all' })
        ]);

        await sysAlert("BERHASIL", "Laporan Citizen terekam.");
        if(typeof Clearchance !== 'undefined') Clearchance.clearActiveMission();
        location.href = "index.html";

    } catch (err) {
        await sysAlert("GAGAL", err.message, true);
    }
}

// --- EMERGENCY PROTOCOL ---
function startEmergencyProtocol() {
    if (!isAdv) return; 

    const emZone = document.getElementById('emergency-zone');
    const emTimer = document.getElementById('em-timer');
    const sliderCont = document.getElementById('slider-container-em');
    const emSlider = document.getElementById('em-slider');

    if (!emZone) return;
    emZone.classList.remove('hide'); 

    let countdown = 10; 
    
    let emInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            emTimer.innerText = `TOMBOL SELESAI DARURAT AKAN MUNCUL DALAM ${countdown}S... GUNAKAN INI APABILA PEMESAN AFK TANPA MENGKONFIRMASI SELESAI`;
        } else {
            clearInterval(emInterval);
            emTimer.style.display = 'none';
            sliderCont.style.display = 'block';
            if(typeof updateAI === 'function') updateAI("Protokol Selesai Paksa (AFK) telah diaktifkan.", "alert");
        }
    }, 1000);

    emSlider.oninput = function() {
        if (this.value >= 98) {
            this.value = 100;
            executeEmergencyAction();
        }
    };
}

async function executeEmergencyAction() {
    vibratePulse();
    const yakin = await sysConfirm("SELESAI PAKSA", "AKTIFKAN SELESAI PAKSA?\n\nGunakan jika Requester tidak merespon/AFK. Anda akan diarahkan ke form laporan.", true);
    if (yakin) {
        openEvalReq(); 
    } else {
        document.getElementById('em-slider').value = 0;
    }
}
