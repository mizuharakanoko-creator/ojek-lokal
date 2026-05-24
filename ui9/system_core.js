// ==========================================
// SYSTEM CORE & GLOBAL VARIABLES
// ==========================================

var user = typeof Clearchance !== 'undefined' ? Clearchance.enforceIdentity() : {role: 'adventurer', uid: 'test-uid'};
var mission = JSON.parse(sessionStorage.getItem('current_mission_full') || "{}");
var contractId = sessionStorage.getItem('active_contract_id') || mission.id_misi || "TEST-ID";
var isAdv = user.role === 'adventurer';

var dbDeal = typeof getTerminal !== 'undefined' ? getTerminal('FB5_DEAL') : null;
var dbMaster = typeof getTerminal !== 'undefined' ? getTerminal('FB1_MASTER') : null;

// Global State
var map, advMarker, reqMarker, originMarker, destMarker, baseMarker, mapPolyline;
var destCoordsGlobal = null; 
var activeEditId = null;
var base64Snapshot = ""; 
var ratings = { keamanan:0, kecerdasan:0, kepercayaan:0, keramahan:0, penampilan:0, kejujuran:0 };
var reports = { baik:null, tips:null, cash:null, extra:null };
var activeTab = 'tab-hq';
var initialNotaLoad = true;
var initialChatLoad = true;

// ==========================================
// SYSTEM BOOTSTRAP
// ==========================================
window.onload = async () => {
    initUI();
    if(typeof initMap === 'function') initMap();
    
    if(dbDeal && dbMaster && typeof performDeepMining === 'function') {
        await performDeepMining(); 
        syncNota();
        syncChat();
        syncTracking();
        syncStatus();
    }
    
    if(typeof initSliderAction === 'function') initSliderAction();
    if(typeof startEmergencyProtocol === 'function') startEmergencyProtocol();

    // Destroy Loader smoothly
    setTimeout(() => {
        const loader = document.getElementById('master-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 400);
        }
    }, 1000);
};

// ==========================================
// SYSTEM ALERTS & MODALS (PROMISE-BASED)
// ==========================================
function sysAlert(title, msg, isDanger = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysModal');
        const box = document.getElementById('modalBox');
        const titleEl = document.getElementById('modalTitle');
        const msgEl = document.getElementById('modalMsg');
        const btnGroup = document.getElementById('modalBtnGroup');
        const inputField = document.getElementById('modalInput');

        modal.style.display = "flex";
        titleEl.innerText = title;
        msgEl.innerText = msg;
        box.className = isDanger ? "modal-box danger" : "modal-box";
        inputField.style.display = "none";
        btnGroup.innerHTML = "";

        const btnOk = document.createElement('button');
        btnOk.className = "btn-main";
        btnOk.innerText = "MENGERTI";
        if(isDanger) {
            btnOk.style.borderColor = "var(--neon-red)";
            btnOk.style.color = "var(--neon-red)";
            btnOk.style.background = "rgba(255,51,102,0.1)";
        }
        btnOk.onclick = () => {
            modal.style.display = "none";
            playSfx();
            resolve();
        };
        btnGroup.appendChild(btnOk);
    });
}

function sysConfirm(title, msg, isDanger = false, verifyWord = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('sysModal');
        const box = document.getElementById('modalBox');
        const titleEl = document.getElementById('modalTitle');
        const msgEl = document.getElementById('modalMsg');
        const btnGroup = document.getElementById('modalBtnGroup');
        const inputField = document.getElementById('modalInput');

        modal.style.display = "flex";
        titleEl.innerText = title;
        msgEl.innerText = msg;
        box.className = isDanger ? "modal-box danger" : "modal-box";
        btnGroup.innerHTML = "";

        if (verifyWord) {
            inputField.style.display = "block";
            inputField.placeholder = `KETIK '${verifyWord}'`;
            inputField.value = "";
        } else {
            inputField.style.display = "none";
        }

        const btnCancel = document.createElement('button');
        btnCancel.className = "btn-main";
        btnCancel.style.background = "rgba(255,255,255,0.05)";
        btnCancel.style.borderColor = "#444";
        btnCancel.style.color = "#ccc";
        btnCancel.innerText = "BATAL";
        btnCancel.onclick = () => {
            modal.style.display = "none";
            playSfx();
            resolve(false);
        };
        btnGroup.appendChild(btnCancel);

        const btnOk = document.createElement('button');
        btnOk.className = "btn-main";
        btnOk.innerText = "EKSEKUSI";
        if(isDanger) {
            btnOk.style.borderColor = "var(--neon-red)";
            btnOk.style.color = "var(--neon-red)";
            btnOk.style.background = "rgba(255,51,102,0.1)";
        }
        btnOk.onclick = () => {
            if (verifyWord && inputField.value !== verifyWord) {
                msgEl.innerHTML = `<span style="color:#ff4444">VERIFIKASI GAGAL!</span><br>${msg}`;
                inputField.style.borderColor = "var(--neon-red)";
                playSfx();
                return;
            }
            modal.style.display = "none";
            playSfx();
            resolve(true);
        };
        btnGroup.appendChild(btnOk);
    });
}

// ==========================================
// UI ENGINE & NAVIGATION
// ==========================================
function initUI() {
    document.getElementById('m-exp').innerText = (mission.rpg_reward?.exp || 0) + " EXP";
    document.getElementById('m-stone').innerText = (mission.rpg_reward?.greenStone || 0) + " STONES";
    document.getElementById('m-id-display').innerText = "ID: " + contractId;

    const area = document.getElementById('role-action-area');
    if(isAdv) {
        document.getElementById('adv-status-hub').classList.remove('hide');
        document.getElementById('nota-input-hub').classList.remove('hide');
        document.getElementById('action-drawer').classList.add('hide');
    } else {
        document.getElementById('requester-toggle-btn').classList.remove('hide');
        document.getElementById('action-slider-box').classList.remove('hide'); 
        
        const head = document.getElementById('global-header');
        if(!document.getElementById('arc-btn')){
            const arcBtn = document.createElement('button');
            arcBtn.id = "arc-btn";
            arcBtn.innerHTML = `<i class="fa-solid fa-gamepad"></i>`;
            arcBtn.style = "background:rgba(0,243,255,0.1); border:1px solid var(--neon-blue); color:var(--neon-blue); width:38px; height:38px; border-radius:50%; margin-right:15px; cursor:pointer; transition:0.3s; display:flex; align-items:center; justify-content:center;";
            arcBtn.onclick = () => { playSfx(); document.getElementById('modalArcade').classList.add('show'); };
            head.insertBefore(arcBtn, head.children[1]); 
        }
    }
}

function switchTab(id, el) {
    playSfx();
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(5);
    activeTab = id;

    document.querySelectorAll('.tab-pane').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.bubble-link').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
    
    if(id === 'tab-nota') document.getElementById('badge-nota').classList.remove('show');
    if(id === 'tab-comms') {
        document.getElementById('badge-comms').classList.remove('show');
        const wall = document.getElementById('comms-wall');
        wall.scrollTop = wall.scrollHeight;
    }
    if(id === 'tab-map' && map) {
        setTimeout(() => { 
            map.invalidateSize({ animate: true });
            if(typeof recenterMap === 'function') recenterMap(); 
        }, 400);
    }
}

function toggleActionDrawer() {
    playSfx();
    const drawer = document.getElementById('action-drawer');
    drawer.classList.toggle('open');
}

async function forceRefreshData() {
    playSfx();
    document.querySelector('.btn-refresh i').style.animation = "spin 1s linear infinite";
    if(typeof updateAI === 'function') updateAI("Memaksa re-sinkronisasi data dari Shard...", "normal");
    if(typeof performDeepMining !== 'undefined') await performDeepMining();
    setTimeout(() => {
        document.querySelector('.btn-refresh i').style.animation = "none";
    }, 1000);
}

// SFX Shortcuts
function playSfx() { document.getElementById('click-sfx').play().catch(()=>{}); }
function playNotif() { document.getElementById('notif-sfx').play().catch(()=>{}); }
function vibratePulse() { if(window.navigator && window.navigator.vibrate) window.navigator.vibrate([50, 100, 50]); }

// Debug Panel
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    const content = document.getElementById('debug-content');
    if (!panel) return;
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        content.innerHTML = `
            <p style="color:#00f2ff">>>> CORE NODE IDENTITY:</p>
            <pre style="background:#020408; padding:10px; border-radius:6px; margin:8px 0; border:1px solid #1e293b;">${JSON.stringify(user, null, 4)}</pre>
            <p style="color:#bc13fe; margin-top:10px;">>>> ACTIVE CONTRACT SHARD:</p>
            <div style="background:#020408; padding:10px; border-radius:6px; margin:4px 0; border:1px solid #1e293b; font-weight:bold;">${contractId}</div>
        `;
    } else {
        panel.style.display = 'none';
    }
}
