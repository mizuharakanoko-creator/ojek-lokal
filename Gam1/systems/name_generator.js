// File: systems/name_generator.js
const NameGenerator = {
    firstNamesMale: ["Arthur", "Loran", "Cain", "Gareth", "Julian", "Rowan", "Balthazar", "Dorian", "Kaelen", "Valen"],
    firstNamesFemale: ["Elina", "Lyra", "Seraphina", "Valkyrie", "Aria", "Thalia", "Morgause", "Isolde", "Elena", "Selene"],
    lastNames: ["Windrunner", "Ironforge", "Blackwood", "Stormrider", "Silverleaf", "Vance", "Brightshield", "Shadowmere"],

    generate(forcedGender = null) {
        let gender = forcedGender || (Math.random() < 0.5 ? "Male" : "Female");
        let firstPool = gender === "Male" ? this.firstNamesMale : this.firstNamesFemale;
        
        let firstName = firstPool[Math.floor(Math.random() * firstPool.length)];
        let lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];

        return {
            id: "npc_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
            name: `${firstName} ${lastName}`,
            gender: gender,
            age: Math.floor(Math.random() * 15) + 18, // Usia 18 - 32 tahun
            spouseId: null,      // ID suami/istri jika menikah
            parents: [],         // [ID Ayah, ID Ibu]
            childrenIds: [],     // Daftar ID anak
            isAlive: true,
            occupation: "Warga / Petualang"
        };
    }
};
