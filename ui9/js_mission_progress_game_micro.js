/**
 * js_mission_progress_game_micro.js
 * PUSAT MINI GAME MIKRO: "MATRIX DECRYPTION TERMINAL"
 */

window.initMicroGameEngine = function() {
    const gameBtn = document.getElementById('btn-decrypt-game');
    if (!gameBtn) return;

    gameBtn.onclick = function() {
        if (navigator.vibrate) navigator.vibrate(20);
        openMatrixDecryptionModal();
    };
};

function openMatrixDecryptionModal() {
    // Bangkitkan kombinasi target rahasia 3 digit acak (rentang angka 1-6)
    const secretCode = Array.from({length: 3}, () => Math.floor(Math.random() * 6) + 1).join('');
    let attemptsLeft = 4;

    // Suntikkan modal visual game bertema Cyber langsung ke dalam dokumen induk
    const gameOverlay = document.createElement('div');
    gameOverlay.id = 'micro-game-overlay';
    gameOverlay.style = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(3,5,10,0.96); display:flex; justify-content:center; align-items:center; z-index:99999; backdrop-filter:blur(6px); font-family:\'JetBrains Mono\', monospace; padding:20px; box-sizing:border-box;';

    gameOverlay.innerHTML = `
        <div style="border: 1px solid #00f2ff; background:#070a14; padding:20px; width:100%; max-width:320px; text-align:center; box-shadow:0 0 30px rgba(0,242,255,0.15); border-radius:12px;">
            <div style="font-size:11px; color:#00f2ff; letter-spacing:2px; font-weight:700; margin-bottom:4px;">TERMINAL DECRYPTION SUB-MODULE</div>
            <div style="font-size:8px; color:#557; margin-bottom:15px;">BRUTEFORCE THE ENCRYPTION PASSPHRASE</div>
            
            <div style="background:#020408; padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.02); margin-bottom:15px;">
                <div id="game-status-monitor" style="font-size:11px; color:#fff; line-height:1.4;">Tebak Kombinasi <b style="color:#00f2ff">3 Digit Angka</b> (Rentang Nilai 1-6)</div>
                <div id="game-attempts" style="font-size:9px; color:#ff0055; margin-top:6px; font-weight:700;">CHIP SECURITY ATTEMPTS: 4/4</div>
            </div>

            <div style="display:flex; justify-content:center; gap:10px; margin-bottom:20px;">
                <input type="text" id="decrypt-input" maxlength="3" placeholder="***" style="width:100px; height:40px; background:#000; border:1.5px solid #334155; color:#00f2ff; font-size:20px; text-align:center; font-family:inherit; outline:none; border-radius:6px; font-weight:700;">
            </div>

            <div style="display:flex; gap:8px;">
                <button id="btn-game-abort" style="flex:1; padding:10px; background:#1e293b; color:#94a3b8; border:none; font-size:10px; font-weight:700; border-radius:6px; cursor:pointer;">ABORT LINK</button>
                <button id="btn-game-submit" style="flex:1; padding:10px; background:#00f2ff; color:#000; border:none; font-size:10px; font-weight:900; border-radius:6px; cursor:pointer; text-transform:uppercase;">INJECT CODE</button>
            </div>
        </div>
    `;

    document.body.appendChild(gameOverlay);
    
    const inputField = document.getElementById('decrypt-input');
    inputField.focus();

    // Event Handler Batal/Keluar Game
    document.getElementById('btn-game-abort').onclick = function() {
        if (navigator.vibrate) navigator.vibrate(10);
        gameOverlay.remove();
    };

    // Event Handler Eksekusi Tebakan Angka Enkripsi
    document.getElementById('btn-game-submit').onclick = function() {
        const guess = inputField.value.trim();
        const monitor = document.getElementById('game-status-monitor');
        const attDisplay = document.getElementById('game-attempts');

        if (guess.length !== 3 || !/^[1-6]+$/.test(guess)) {
            if (navigator.vibrate) navigator.vibrate([40, 40]);
            monitor.innerHTML = "<span style='color:#ff0055'>ERROR:</span> Input harus berupa 3 angka antara 1-6!";
            return;
        }

        if (navigator.vibrate) navigator.vibrate(20);
        attemptsLeft--;

        if (guess === secretCode) {
            // MENANG
            if (navigator.vibrate) navigator.vibrate([20, 50, 80]);
            monitor.innerHTML = "<span style='color:#00ff88; font-weight:700;'>ACCESS GRANTED!</span><br>Dekripsi Shard Berhasil Menembus Firewall.";
            attDisplay.style.color = "#00ff88";
            attDisplay.innerText = "OVERRIDE CRACK SUCCESSFUL";
            
            document.getElementById('btn-game-submit').style.display = 'none';
            document.getElementById('btn-game-abort').innerText = "CLOSE CORE";
            document.getElementById('btn-game-abort').style.background = "#00ff88";
            document.getElementById('btn-game-abort').style.color = "#000";

            // Modifikasi teks asisten utama di HQ secara lokal sebagai reward pujian imersif
            const aiText = document.getElementById('ai-text');
            const asisName = document.getElementById('asisName').innerText;
            if (aiText) aiText.innerText = `Luar biasa! Kemampuan peretasan gelombang Anda terkonfirmasi berhasil menembus node pengamanan bypass regional.`;
            
            const gameTxt = document.getElementById('game-btn-txt');
            if (gameTxt) gameTxt.innerText = "CHIP ENCRYPTION DECRYPTED ✓";
        } else {
            // TEBAKAN SALAH - HITUNG FEEDBACK CLUES (Bulls & Cows style)
            if (attemptsLeft <= 0) {
                // KALAH
                if (navigator.vibrate) navigator.vibrate([100, 100]);
                monitor.innerHTML = `<span style='color:#ff0055; font-weight:700;'>LOCKOUT EFFECTED!</span><br>Kombinasi Asli: <b style='color:#00f2ff'>${secretCode}</b>`;
                attDisplay.innerText = "SECURITY BLOCK OUT: MALWARE LOCKED";
                document.getElementById('btn-game-submit').style.display = 'none';
                document.getElementById('btn-game-abort').innerText = "EXIT COMPONENT";
            } else {
                // Sisa Nyawa - Berikan Hint Petunjuk
                let correctPos = 0;
                for (let x = 0; x < 3; x++) {
                    if (guess[x] === secretCode[x]) correctPos++;
                }
                monitor.innerHTML = `Injeksi gagal. Feedback kode:<br><b style='color:#ffaa00'>${correctPos} Angka</b> di Posisi yang Benar.`;
                attDisplay.innerText = `CHIP SECURITY ATTEMPTS: ${attemptsLeft}/4`;
                inputField.value = "";
                inputField.focus();
            }
        }
    };
}
