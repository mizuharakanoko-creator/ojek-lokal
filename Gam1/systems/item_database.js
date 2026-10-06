// Database Peralatan & Item (Bebas ditambah kapan saja)
const ItemDatabase = {
    registry: {
        "sword_iron": { name: "Pedang Besi", type: "weapon", slot: "weapon", str: 3, price: 50, desc: "Pedang standar pandai besi." },
        "sword_flame": { name: "Pedang Api", type: "weapon", slot: "weapon", str: 8, price: 300, desc: "Memancarkan hawa panas." },
        "armor_leather": { name: "Armor Kulit", type: "armor", slot: "armor", agi: 2, price: 40, desc: "Ringan dan fleksibel." },
        "potion_heal": { name: "Ramuan Pemulih", type: "consumable", price: 15, desc: "Menyegarkan tubuh." }
    },

    createItem(itemId) {
        let blueprint = this.registry[itemId];
        if (!blueprint) return null;
        return {
            uid: "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            ...blueprint
        };
    }
};

// Sistem Pengatur Inventory (Kapasitas maks 20)
const ItemSystem = {
    addItem(player, itemId) {
        if (player.inventory.length >= 20) {
            return false; // Tas Penuh
        }
        let newItem = ItemDatabase.createItem(itemId);
        if (newItem) {
            player.inventory.push(newItem);
            return true;
        }
        return false;
    },

    useItem(index) {
        let player = GameEngine.player;
        let item = player.inventory[index];
        if (!item) return;

        if (item.type === 'weapon' || item.type === 'armor') {
            let slotName = item.slot;
            let oldItem = player.equipment[slotName];

            // Pasang item baru, kembalikan item lama ke tas (jika ada)
            player.equipment[slotName] = item;
            player.inventory.splice(index, 1);

            if (oldItem) {
                player.inventory.push(oldItem);
            }

            // Tambah status stat
            if (item.str) player.str += item.str;
            if (item.agi) player.agi += item.agi;

            GameEngine.log(`Kamu mengenakan ${item.name}.`);
            GameEngine.updateUI();
        }
    }
};
