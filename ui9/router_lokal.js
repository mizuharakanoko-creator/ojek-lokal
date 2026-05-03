// ==========================================
// ROUTER LOKAL: DATABASE WILAYAH & SHARDING
// ==========================================

// 1. Kamus Singkatan Kecamatan (Kunci Shard Database)
const ZONA_MAP = {
    "KNG": "Kuningan", 
    "KGD": "Kadugede",
    "CGR": "Cigugur", 
    "JLS": "Jalaksana",
    "KRA": "Kramatmulya",

    "CLM": "Cilimus",
    "DRM": "Darma",
    "CWG": "Ciawigebang", 
    "CBR": "Cibeureum", 
    "CBB": "Cibingbin",

    "CDH": "Cidahu",
    "CMK": "Cigandamekar",
    "LRG": "Luragung",
    "CLB": "Cilebak",
    "CMH": "Cimahi",

    "CNR": "Ciniru",
    "CPC": "Cipicung",
    "CWR": "Ciwaru",
    "GRW": "Garawangi",
    "HTR": "Hantara",

    "JPR": "Japara",
    "KLM": "Kalimanggis",
    "KRK": "Karangkancana",
    "LBW": "Lebakwangi",
    "MLB": "Maleber",

    "MDR": "Mandirancan",
    "NSH": "Nusaherang",
    "PCL": "Pancalang",
    "PSW": "Pasawahan",
    "SLJ": "Selajambe",

    "SDA": "Sindangagung",
    "SBG": "Subang"

    // Tambahkan singkatan lain jika perlu
};

// 2. Database Presisi (Data yang kamu berikan)
const LOKASI_DB = {
    "Cigugur": {
        lat: -6.960499, lng: 108.449936,
        desa: [
            { name: "Babakanmulya", lat: -6.973436, lng: 108.438999, diff: 1.3 },
            { name: "Cigadung", lat: -6.984945, lng: 108.464718, diff: 1.0 },
            { name: "Graha Alana", lat: -6.986932, lng: 108.473391, diff: 1.1 },
            { name: "Gubug Cigadung", lat: -6.985337, lng: 108.458607, diff: 1.0 },
            { name: "Cigugur", lat: -6.969728, lng: 108.456378, diff: 1.1 },
            { name: "Cileuleuy", lat: -6.980359, lng: 108.450340, diff: 1.1 },
            { name: "Cipari", lat: -6.962893, lng: 108.467001, diff: 1.1 },
            { name: "Cisantana", lat: -6.959070, lng: 108.450192, diff: 1.3 },
            { name: "Gunungkeling", lat: -6.950131, lng: 108.468031, diff: 1.2 },
            { name: "Puncak", lat: -6.970541, lng: 108.434405, diff: 1.4 },
            { name: "Mulya Asih", lat: -6.963687, lng: 108.425946, diff: 1.5 },
            { name: "Sukamulya", lat: -6.978258, lng: 108.459926, diff: 1.1 },
            { name: "Babakan Cigadung", lat: -6.989562, lng: 108.470261, diff: 1.0 },
            { name: "Palutungan", lat: -6.942973, lng: 108.441135, diff: 1.5 },
            { name: "Kamukten", lat: -6.981355, lng: 108.467490, diff: 1.0 },
            { name: "Dano Cisantana", lat: -6.960251, lng: 108.446321, diff: 1.3 },
            { name: "Sukamanah Cisantana", lat: -6.957812, lng: 108.446215, diff: 1.3 },
            { name: "Perum Quanta II", lat: -6.986356, lng: 108.449396, diff: 1.3 },
            { name: "Perum Pesona Alam", lat: -6.953115, lng: 108.465663, diff: 1.2 },
            { name: "Perum Korpri", lat: -6.960831, lng: 108.481004, diff: 1.1 },
            { name: "Perum Mulia Land", lat: -6.958914, lng: 108.477200, diff: 1.1 },
            { name: "Perum Pesona Anggrek", lat: -6.958168, lng: 108.475735, diff: 1.1 },
            { name: "Perum Taman Anggrek", lat: -6.958247, lng: 108.473830, diff: 1.1 },
            { name: "Perum Cigadung Regency", lat: -6.985609, lng: 108.450918, diff: 1.2 },
            { name: "Talaga Surian", lat: -6.952836, lng: 108.429474, diff: 1.5 },
            { name: "Lumbu", lat: -6.966740, lng: 108.452822, diff: 1.2 },
            { name: "Lumbu Kotaku", lat: -6.965970, lng: 108.451908, diff: 1.2 },
            { name: "Mayasih", lat: -6.969030, lng: 108.453074, diff: 1.1 },
            { name: "Perum Btn Cigugur", lat: -6.972149, lng: 108.462933, diff: 1.0 },
            { name: "Alun Alun Cigugur", lat: -6.968500, lng: 108.459604, diff: 1.0 },
            { name: "Rs Sekar Kamulyan", lat: -6.968761, lng: 108.455500, diff: 1.1 },
            { name: "Paseban Cigugur", lat: -6.969472, lng: 108.456558, diff: 1.0 },
            { name: "SMK Karya Nasional", lat: -6.954792, lng: 108.469258, diff: 1.1 },
            { name: "SMAN 1 Cigugur", lat: -6.983891, lng: 108.462551, diff: 1.0 },
            { name: "SMKN 1 Kuningan", lat: -6.975926, lng: 108.455348, diff: 1.1 },
            { name: "SMKN 2 Kuningan", lat: -6.980180, lng: 108.461465, diff: 1.0 },
            { name: "Winduherang", lat: -6.970923, lng: 108.472100, diff: 1.0 }
        ]
    },
    "Cibeureum": {
        lat: -7.083515, lng: 108.721566,
        desa: [
            { name: "Cibeureum", lat: -7.049924, lng: 108.723611, diff: 1.1 },
            { name: "Cimara", lat: -7.087659, lng: 108.707379, diff: 1.1 },
            { name: "Kawungsari", lat: -7.078340, lng: 108.722270, diff: 1.1 },
            { name: "Randusari", lat: -7.055894, lng: 108.708556, diff: 1.1 },
            { name: "Sukadana", lat: -7.037769, lng: 108.721279, diff: 1.1 },
            { name: "Sukarapih", lat: -7.082335, lng: 108.721310, diff: 1.1 },
            { name: "Sumurwiru", lat: -7.072859, lng: 108.729604, diff: 1.1 },
            { name: "Tarikolot", lat: -7.044098, lng: 108.729637, diff: 1.1 }
        ]
    },
    "Sindangagung": {
        lat: -6.976087, lng: 108.535782,
        desa: [
            { name: "Babakanreuma", lat: -6.963055, lng: 108.525078, diff: 1.0 },
            { name: "Balong", lat: -6.981504, lng: 108.546820, diff: 1.0 },
            { name: "Dukuhlor", lat: -6.955857, lng: 108.534926, diff: 1.0 },
            { name: "Kaduagung", lat: -6.981055, lng: 108.522600, diff: 1.0 },
            { name: "Kertaungaran", lat: -6.981292, lng: 108.533345, diff: 1.0 },
            { name: "Kertawangunan", lat: -6.972003, lng: 108.529484, diff: 1.0 },
            { name: "Kertayasa", lat: -6.972376, lng: 108.536116, diff: 1.0 },
            { name: "Mekarmukti", lat: -6.973369, lng: 108.541363, diff: 1.0 },
            { name: "Sindangagung", lat: -6.975617, lng: 108.533581, diff: 1.0 },
            { name: "Sindangsari", lat: -6.977708, lng: 108.514386, diff: 1.0 },
            { name: "Taraju", lat: -6.947969, lng: 108.533498, diff: 1.0 },
            { name: "Tirtawangunan", lat: -6.965853, lng: 108.531775, diff: 1.0 },
            { name: "Blok Cipetir Kertawangunan", lat: -6.970545, lng: 108.532176, diff: 1.0 },
            { name: "Pakarden Kertayasa", lat: -6.959878, lng: 108.538821, diff: 1.0 },
            { name: "Parenca", lat: -6.971868, lng: 108.523649, diff: 1.0 },
            { name: "Parenca Kulon", lat: -6.968556, lng: 108.523957, diff: 1.0 },
            { name: "Babayak Sindangagung", lat: -6.982392, lng: 108.542202, diff: 1.0 },
            { name: "Perum Kertamulya Residence", lat: -6.969822, lng: 108.542281, diff: 1.0 },
            { name: "Perum Griya Kuningan Permai", lat: -6.976427, lng: 108.530205, diff: 1.0 },
            { name: "Perum Brata Kertayasa", lat: -6.968620, lng: 108.537274, diff: 1.0 },
            { name: "Perum Griya Nuansa Lestari Kertaungaran", lat: -6.980536, lng: 108.527742, diff: 1.0 },
            { name: "Perum Babakanreuma Endah", lat: -6.962442, lng: 108.520974, diff: 1.0 },
            { name: "Perum Bima Agung Regency", lat: -6.978791, lng: 108.535141, diff: 1.0 },
            { name: "Bhumiland Babakanreuma", lat: -6.962769, lng: 108.527281, diff: 1.0 },
            { name: "Rs KMC", lat: -6.973641, lng: 108.526171, diff: 1.0 },
            { name: "Terminal Kertawangunan", lat: -6.972475, lng: 108.525658, diff: 1.0 }
        ]
    },
    "Ciawigebang": {
        lat: -6.9516992, lng: 108.5885916,
        desa: [
            { name: "Ciawilor", lat: -6.9649463, lng: 108.5784414, diff: 1.0 },
            { name: "Ciawigebang", lat: -6.9726675, lng: 108.5824775, diff: 1.0 },
            { name: "Cigarukgak", lat: -6.9451205, lng: 108.6040066, diff: 1.0 },
            { name: "Cihaur", lat: -6.9527343, lng: 108.5722791, diff: 1.0 },
            { name: "Cijagamulya", lat: -6.9732043, lng: 108.5541748, diff: 1.0 },
            { name: "Cikubangmulya", lat: -6.9354065, lng: 108.6241969, diff: 1.0 },
            { name: "Ciomas", lat: -6.9753229, lng: 108.5616471, diff: 1.0 },
            { name: "Ciputat", lat: -6.9813075, lng: 108.5830361, diff: 1.0 },
            { name: "Dukuhdalem", lat: -6.9689269, lng: 108.5635404, diff: 1.0 },
            { name: "Geresik", lat: -6.9869533, lng: 108.6057155, diff: 1.0 },
            { name: "Kadurama", lat: -6.9745505, lng: 108.5972957, diff: 1.0 },
            { name: "Kapandayan", lat: -6.9779613, lng: 108.5756399, diff: 1.0 },
            { name: "Karamatmulya", lat: -6.9979547, lng: 108.6043881, diff: 1.0 },
            { name: "Karangkamulyan", lat: -6.9604890, lng: 108.5848573, diff: 1.0 },
            { name: "Lebaksiuh", lat: -6.9911141, lng: 108.5909808, diff: 1.0 },
            { name: "Mekarjaya", lat: -6.9410588, lng: 108.5795277, diff: 1.0 },
            { name: "Padarama", lat: -6.9161333, lng: 108.5943842, diff: 1.0 },
            { name: "Pajawanlor", lat: -6.9884987, lng: 108.5794516, diff: 1.0 },
            { name: "Pamijahan", lat: -6.9643292, lng: 108.5931332, diff: 1.0 },
            { name: "Pangkalan", lat: -6.9666425, lng: 108.5692029, diff: 1.0 },
            { name: "Sidaraja", lat: -6.9848208, lng: 108.5714647, diff: 1.0 },
            { name: "Sukadana", lat: -6.9291923, lng: 108.6120519, diff: 1.0 },
            { name: "Sukaraja", lat: -6.9303236, lng: 108.5823762, diff: 1.0 },
            { name: "Cihirup", lat: -6.9284331, lng: 108.6303730, diff: 1.0 }
        ]
    },
    "Kramatmulya": {
        lat: -6.936329, lng: 108.486134,
        desa: [
            { name: "Bojong", lat: -6.945892, lng: 108.502855, diff: 1.0 },
            { name: "Cibentang", lat: -6.936788, lng: 108.475254, diff: 1.1 },
            { name: "Cikaso", lat: -6.931933, lng: 108.496606, diff: 1.0 },
            { name: "Cikubangsari", lat: -6.953463, lng: 108.520522, diff: 1.0 },
            { name: "Cilaja", lat: -6.946709, lng: 108.507233, diff: 1.0 },
            { name: "Cilowa", lat: -6.945522, lng: 108.499399, diff: 1.0 },
            { name: "Gandasoli", lat: -6.933596, lng: 108.472011, diff: 1.1 },
            { name: "Gereba", lat: -6.953186, lng: 108.504194, diff: 1.0 },
            { name: "Kalapagunung", lat: -6.931506, lng: 108.483145, diff: 1.0 },
            { name: "Karangmangu", lat: -6.928769, lng: 108.499622, diff: 1.0 },
            { name: "Kramatmulya", lat: -6.930850, lng: 108.489853, diff: 1.0 },
            { name: "Pajambon", lat: -6.937648, lng: 108.457466, diff: 1.3 },
            { name: "Ragawacana", lat: -6.941014, lng: 108.470252, diff: 1.2 },
            { name: "Widarasari", lat: -6.949706, lng: 108.521142, diff: 1.0 },
            { name: "Perum Bhumiland Asri Gereba", lat: -6.954127, lng: 108.504817, diff: 1.0 },
            { name: "Perum Kalapagunung Regency", lat: -6.933493, lng: 108.478587, diff: 1.1 },
            { name: "Perum Griya Karimah", lat: -6.944626, lng: 108.506422, diff: 1.0 },
            { name: "Perum Puri Pelangi", lat: -6.933610, lng: 108.477427, diff: 1.1 },
            { name: "Perum Tiga Raja Land", lat: -6.949553, lng: 108.509937, diff: 1.0 },
            { name: "Pasar Kalapagunung", lat: -6.931159, lng: 108.487265, diff: 1.0 },
            { name: "Pasar Kramatmulya", lat: -6.930915, lng: 108.487367, diff: 1.0 }
        ]
    },
    "Kuningan Kota": {
        lat: -6.977726, lng: 108.484035,
        desa: [
            { name: "Awirarangan", lat: -6.981092, lng: 108.489284, diff: 1.0 },
            { name: "Cibinuang", lat: -6.997718, lng: 108.473343, diff: 1.2 },
            { name: "Liang Panas", lat: -6.988631, lng: 108.477218, diff: 1.1 },
            { name: "Kuningan", lat: -6.981293, lng: 108.478192, diff: 1.0 },
            { name: "Purwawinangun", lat: -6.975116, lng: 108.483661, diff: 1.0 },
            { name: "Cijoho", lat: -6.969491, lng: 108.492858, diff: 1.0 },
            { name: "Kedungarum", lat: -6.961783, lng: 108.504872, diff: 1.0 },
            { name: "Ancaran", lat: -6.969168, lng: 108.515293, diff: 1.0 },
            { name: "Perum Griya Nuansa Lestari Ancaran", lat: -6.965006, lng: 108.517328, diff: 1.0 },
            { name: "Karangtawang", lat: -6.992422, lng: 108.509775, diff: 1.0 },
            { name: "Windusengkahan", lat: -6.980545, lng: 108.503170, diff: 1.0 },
            { name: "Citangtu", lat: -6.993843, lng: 108.486430, diff: 1.2 },
            { name: "Winduhaji", lat: -6.989036, lng: 108.496268, diff: 1.0 },
            { name: "Cigintung", lat: -6.962762, lng: 108.489363, diff: 1.1 },
            { name: "Cirendang", lat: -6.953527, lng: 108.482318, diff: 1.1 },
            { name: "Kasturi", lat: -6.949813, lng: 108.495826, diff: 1.1 },
            { name: "Padarek", lat: -6.957817, lng: 108.508563, diff: 1.1 },
            { name: "Perum Alam Asri", lat: -6.953921, lng: 108.499836, diff: 1.1 },
            { name: "Perum Pesona Mutiara Kasturi", lat: -6.952218, lng: 108.490591, diff: 1.1 },
            { name: "Perum Puri Asri 1", lat: -6.956957, lng: 108.493729, diff: 1.0 },
            { name: "Perum Puri Asri 2", lat: -6.955670, lng: 108.490611, diff: 1.0 },
            { name: "Perum Puri Asri 3", lat: -6.958452, lng: 108.491163, diff: 1.0 },
            { name: "Perum Harmony Regency Kulon", lat: -6.957196, lng: 108.493263, diff: 1.0 },
            { name: "Perum Harmony Regency Wetan", lat: -6.958205, lng: 108.494223, diff: 1.0 },
            { name: "Perum Bunga Lestari", lat: -6.961170, lng: 108.494103, diff: 1.0 },
            { name: "Perum Flower Resident", lat: -6.961267, lng: 108.492133, diff: 1.0 },
            { name: "Perum Taman Ciharendong Kencana", lat: -6.957690, lng: 108.487439, diff: 1.1 },
            { name: "Taman Cirendang", lat: -6.953294, lng: 108.488264, diff: 1.0 },
            { name: "Perum Kemuning", lat: -6.960193, lng: 108.490939, diff: 1.0 },
            { name: "Perum Grand Amelia", lat: -6.958560, lng: 108.503566, diff: 1.0 },
            { name: "Perum Grand Amelia 2", lat: -6.955647, lng: 108.502389, diff: 1.0 },
            { name: "Perum Taman Arumandari", lat: -6.959676, lng: 108.499096, diff: 1.0 },
            { name: "Perum Grand Kasturi 1", lat: -6.949631, lng: 108.490570, diff: 1.1 },
            { name: "Perum Grand Kasturi 2", lat: -6.949478, lng: 108.490197, diff: 1.1 },
            { name: "Perum Kasturi Perdana", lat: -6.950919, lng: 108.492151, diff: 1.1 },
            { name: "Rest Area Cirendang", lat: -6.955049, lng: 108.489190, diff: 1.0 },
            { name: "Perum Golden Rose Residence", lat: -6.952755, lng: 108.486296, diff: 1.0 },
            { name: "Perum Jananuraga", lat: -6.955786, lng: 108.479073, diff: 1.1 },
            { name: "Perum Griya Cigintung Indah", lat: -6.960566, lng: 108.482349, diff: 1.1 },
            { name: "Perum Panorama Asri", lat: -6.964589, lng: 108.483907, diff: 1.1 },
            { name: "Sidapurna Ramajaksa", lat: -6.971759, lng: 108.476496, diff: 1.0 },
            { name: "Bunderan Cijoho", lat: -6.968293, lng: 108.488384, diff: 1.0 },
            { name: "Ciarja", lat: -6.960203, lng: 108.492827, diff: 1.0 },
            { name: "Lebakburang", lat: -6.995951, lng: 108.490497, diff: 1.2 },
            { name: "Talahab", lat: -7.001056, lng: 108.494430, diff: 1.2 },
            { name: "Wangun", lat: -6.997177, lng: 108.497129, diff: 1.3 },
            { name: "Slahonje", lat: -7.002159, lng: 108.505404, diff: 1.4 },
            { name: "Cikopo", lat: -6.995392, lng: 108.482378, diff: 1.1 },
            { name: "Jatinunggal", lat: -6.990728, lng: 108.506216, diff: 1.0 },
            { name: "Bubulak Winduhaji", lat: -6.983810, lng: 108.499059, diff: 1.0 },
            { name: "Bojong Ancaran", lat: -6.965783, lng: 108.510051, diff: 1.0 },
            { name: "Bojong Awirarangan", lat: -6.985656, lng: 108.484079, diff: 1.0 },
            { name: "Ciharendong", lat: -6.956908, lng: 108.489335, diff: 1.1 },
            { name: "Lamepayung", lat: -6.976035, lng: 108.489196, diff: 1.0 },
            { name: "Stadion Masud", lat: -6.976462, lng: 108.485009, diff: 1.0 },
            { name: "Pramuka", lat: -6.975600, lng: 108.477299, diff: 1.0 },
            { name: "Perum Kuningan City View", lat: -6.964298, lng: 108.513304, diff: 1.0 },
            { name: "Perum Pesona Ancaran", lat: -6.964510, lng: 108.515641, diff: 1.0 },
            { name: "Perumnas Ciporang", lat: -6.968878, lng: 108.505392, diff: 1.0 },
            { name: "Rs Wijaya Kusuma", lat: -6.970163, lng: 108.505977, diff: 1.0 },
            { name: "Rs Juanda", lat: -6.972745, lng: 108.491225, diff: 1.0 },
            { name: "Rs Permata Kuningan", lat: -6.977174, lng: 108.501527, diff: 1.0 },
            { name: "Rs Umum 45", lat: -6.984107, lng: 108.481409, diff: 1.0 },
            { name: "Taman Kota Kuningan", lat: -6.983097, lng: 108.476529, diff: 1.0 },
            { name: "Kuningan Islamic Center", lat: -6.960617, lng: 108.476111, diff: 1.0 },
            { name: "Universitas Kuningan 1", lat: -6.975113, lng: 108.500637, diff: 1.0 },
            { name: "Universitas Kuningan jl pramuka", lat: -6.975710, lng: 108.477318, diff: 1.0 },
            { name: "Cijoho Landeuh", lat: -6.972012, lng: 108.503127, diff: 1.0 },
            { name: "Perum Kavling 1 Ancaran", lat: -6.970038, lng: 108.510954, diff: 1.0 },
            { name: "Perum Kavling 2 Ancaran", lat: -6.969557, lng: 108.509514, diff: 1.0 },
            { name: "Perum Kavling 3 Ancaran", lat: -6.969510, lng: 108.507930, diff: 1.0 },
            { name: "Perum Primadona Regency", lat: -6.968300, lng: 108.508557, diff: 1.0 },
            { name: "Perum Griya Martadinata Sarasi", lat: -6.971239, lng: 108.507742, diff: 1.0 },
            { name: "Perum Bumi Kuningan Emas", lat: -6.971339, lng: 108.505878, diff: 1.0 },
            { name: "Perum Platinum Residence", lat: -6.971308, lng: 108.508694, diff: 1.0 },
            { name: "Pasar Ancaran", lat: -6.971700, lng: 108.516944, diff: 1.0 },
            { name: "Pasar Baru Kuningan", lat: -6.982760, lng: 108.482406, diff: 1.0 },
            { name: "Pasar Kepuh", lat: -6.981691, lng: 108.479953, diff: 1.0 },
            { name: "Masjid Syiarul Islam", lat: -6.981453, lng: 108.476283, diff: 1.0 },
            { name: "Cluster Tovel Regency", lat: -6.973736, lng: 108.494129, diff: 1.0 },
            { name: "Perum Juanda Regency", lat: -6.971773, lng: 108.490541, diff: 1.0 },
            { name: "Perum Griya Hans Asri", lat: -6.973545, lng: 108.496444, diff: 1.0 },
            { name: "Pasapen 1", lat: -6.983347, lng: 108.474204, diff: 1.0 },
            { name: "Pasapen 2", lat: -6.982208, lng: 108.472263, diff: 1.0 },
            { name: "Pasapen 3", lat: -6.980690, lng: 108.470232, diff: 1.0 },
            { name: "Perum Griya Bojong Indah", lat: -6.985013, lng: 108.483209, diff: 1.0 },
            { name: "Perum Bumi Serang Indah", lat: -6.984876, lng: 108.482102, diff: 1.0 },
            { name: "Perum Kamuning Golden Residence", lat: -6.985207, lng: 108.484518, diff: 1.0 },
            { name: "Perum Balcony View Residence", lat: -6.987898, lng: 108.491699, diff: 1.0 },
            { name: "Perum Griya Lingga Asri", lat: -6.970662, lng: 108.495405, diff: 1.0 },
            { name: "Perum Griya Zaheer Valley Kuningan", lat: -6.958861, lng: 108.482013, diff: 1.1 },
            { name: "Ciporang", lat: -6.967887, lng: 108.502496, diff: 1.0 }
        ]
    }
    // ... sertakan semua kecamatan lain (Cilimus, Jalaksana, dll)
};

// 3. Fungsi: Mencari Kecamatan berdasarkan Nama Desa (Format Baru)
function getKecamatanDariDesa(namaDesa) {
    const searchName = namaDesa.toLowerCase();
    for (const [kecamatan, data] of Object.entries(LOKASI_DB)) {
        const found = data.desa.find(d => d.name.toLowerCase() === searchName);
        if (found) return kecamatan;
    }
    return "UNKNOWN";
}

// 4. Fungsi: Mendapatkan Shard ID (Singkatan) dari nama Kecamatan
function getShardDariKecamatan(namaKecamatan) {
    return Object.keys(ZONA_MAP).find(key => ZONA_MAP[key] === namaKecamatan) || "KNG";
}

// 5. Fungsi: Mengambil Data Koordinat & Difficulty Desa
function getDetailDesa(kecamatan, namaDesa) {
    if(!LOKASI_DB[kecamatan]) return null;
    const search = namaDesa.toLowerCase();
    return LOKASI_DB[kecamatan].desa.find(d => d.name === namaDesa);
}

