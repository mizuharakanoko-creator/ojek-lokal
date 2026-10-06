// File: systems/inventory_system.js
const InventorySystem = {
    addItem(player, item) {
        if (player.inventory.length >= 20) {
            return false; // Tas Penuh!
        }
        player.inventory.push(item);
        return true;
    },

    useItem(player, index, log) {
        let item = player.inventory[index];
        if (!item) return;

        // Jika tipe item adalah Equipment (Senjata/Armor)
        if (item.type === 'weapon' || item.type === 'armor') {
            let oldItem = player.equipment[item.type];
            
            // Masukkan item lama kembali ke inventory jika ada (jika tas muat)
            if (oldItem) {
                player.equipment[item.type] = item;
                player.inventory[index] = oldItem; // Swap
                log(`Kamu mengganti ${oldItem.name} dengan ${item.name}.`);
            } else {
                player.equipment[item.type] = item;
                player.inventory.splice(index, 1); // Hapus dari tas karena dipakai
                log(`Kamu mengenakan ${item.name}.`);
            }
            
            // Terapkan stat bonus item
            if(item.str) player.str += item.str;
            if(item.agi) player.agi += item.agi;
        } 
        else if (item.type === 'potion') {
            // Logika pakai potion (misal nambah HP/Stat)
            player.inventory.splice(index, 1);
            log(`Kamu meminum ${item.name}. Tubuhmu terasa segar.`);
        }
    }
};
