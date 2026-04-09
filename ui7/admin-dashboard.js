// Logika simpel untuk tombol Approve di Admin
async function processApproval(nick, dbMaster) {
    const pendingRef = dbMaster.ref(`pendaftaran_pending/${nick}`);
    const snap = await pendingRef.get();
    
    if(snap.exists()){
        const data = snap.val();
        // Masukkan ke Registry agar Router bisa membaca Shard ID-nya
        await dbMaster.ref(`users_registry/${nick}`).set({
            password: data.password,
            shard_id: data.shard_id,
            role: "adventurer"
        });
        // Hapus dari pending
        await pendingRef.remove();
        return true;
    }
    return false;
}
