// wilayah.js - Database Presisi Kabupaten Kuningan
const dataWilayah = {
    "Cigugur": {
        // Titik pusat kecamatan (Kantor Camat)
        lat: -6.9754, lng: 108.4594, 
        desa: [
            { name: "Cigugur", lat: -6.9754, lng: 108.4594, diff: 1.0 },
            { name: "Sukamulya", lat: -6.9832, lng: 108.4635, diff: 1.0 },
            { name: "Cigadung", lat: -6.9885, lng: 108.4752, diff: 1.0 },
            { name: "Panyuran", lat: -6.9654, lng: 108.4682, diff: 1.1 },
            { name: "Cisantana", lat: -6.9542, lng: 108.4215, diff: 1.6 }, // Tinggi & Jauh
            { name: "Cileuleuy", lat: -6.9954, lng: 108.4421, diff: 1.3 }, // Area Tanjakan
            { name: "Babakanmulya", lat: -6.9621, lng: 108.4512, diff: 1.2 },
            { name: "Cipari", lat: -6.9642, lng: 108.4452, diff: 1.2 },
            { name: "Winduherang", lat: -6.9712, lng: 108.4721, diff: 1.0 },
            { name: "Gunungkeling", lat: -6.9582, lng: 108.4785, diff: 1.1 }
        ]
    },

        "Cilimus": {
        lat: -6.8864, lng: 108.4947,
        desa: [
            { name: "Cilimus", lat: -6.8864, lng: 108.4947, diff: 1.0 },
            { name: "Bandorasa Kulon", lat: -6.8921, lng: 108.4812, diff: 1.2 },
            { name: "Bandorasa Wetan", lat: -6.8954, lng: 108.4952, diff: 1.0 },
            { name: "Bohtong", lat: -6.8712, lng: 108.4891, diff: 1.1 },
            { name: "Caracas", lat: -6.8654, lng: 108.5012, diff: 1.0 },
            { name: "Kaliaren", lat: -6.8782, lng: 108.5121, diff: 1.0 },
            { name: "Linggaindah", lat: -6.8721, lng: 108.4652, diff: 1.4 }, // Area Wisata/Tanjakan
            { name: "Linggajati", lat: -6.8854, lng: 108.4721, diff: 1.3 }, // Bersejarah & Nanjak
            { name: "Linggamekar", lat: -6.8812, lng: 108.4591, diff: 1.4 },
            { name: "Sampora", lat: -6.8521, lng: 108.5152, diff: 1.0 },
            { name: "Setianegara", lat: -6.8982, lng: 108.4681, diff: 1.5 }, // Kaki Gunung
            { name: "Trijaya", lat: -6.8621, lng: 108.4621, diff: 1.4 },
            { name: "Panawuan", lat: -6.8912, lng: 108.5021, diff: 1.0 }
        ]
    },
    "Jalaksana": {
        lat: -6.9124, lng: 108.4891,
        desa: [
            { name: "Jalaksana", lat: -6.9124, lng: 108.4891, diff: 1.0 },
            { name: "Babakanmulya", lat: -6.9154, lng: 108.4752, diff: 1.2 },
            { name: "Blumbang", lat: -6.9212, lng: 108.4982, diff: 1.0 },
            { name: "Ciniru", lat: -6.9254, lng: 108.4821, diff: 1.1 },
            { name: "Jamatama", lat: -6.9312, lng: 108.5021, diff: 1.0 },
            { name: "Maniskidul", lat: -6.9182, lng: 108.4821, diff: 1.1 },
            { name: "Manislor", lat: -6.9221, lng: 108.4712, diff: 1.1 },
            { name: "Nanggerang", lat: -6.9054, lng: 108.4921, diff: 1.0 },
            { name: "Padamenak", lat: -6.9352, lng: 108.4912, diff: 1.0 },
            { name: "Peusing", lat: -6.9082, lng: 108.4652, diff: 1.3 },
            { name: "Sadamantra", lat: -6.9152, lng: 108.5121, diff: 1.0 },
            { name: "Sangkanerang", lat: -6.9012, lng: 108.4521, diff: 1.5 }, // Sangat Tinggi
            { name: "Sangkanurip", lat: -6.9082, lng: 108.4852, diff: 1.1 }, // Area Hotel/Wisata
            { name: "Sidamulya", lat: -6.9421, lng: 108.5052, diff: 1.0 },
            { name: "Sukasari", lat: -6.9382, lng: 108.4821, diff: 1.1 }
        ]
    },

        "Kuningan Kota": {
        lat: -6.9765, lng: 108.4841,
        desa: [
            { name: "Kuningan", lat: -6.9765, lng: 108.4841, diff: 1.0 },
            { name: "Purwawinangun", lat: -6.9721, lng: 108.4852, diff: 1.0 },
            { name: "Cijoho", lat: -6.9654, lng: 108.4832, diff: 1.0 },
            { name: "Cirendang", lat: -6.9542, lng: 108.4791, diff: 1.0 },
            { name: "Kasturi", lat: -6.9482, lng: 108.4812, diff: 1.0 },
            { name: "Winduhaji", lat: -6.9854, lng: 108.4921, diff: 1.0 },
            { name: "Ancaran", lat: -6.9782, lng: 108.5052, diff: 1.0 },
            { name: "Ciporang", lat: -6.9712, lng: 108.4982, diff: 1.0 },
            { name: "Awirarangan", lat: -6.9821, lng: 108.4892, diff: 1.0 },
            { name: "Cibinuang", lat: -7.0054, lng: 108.4812, diff: 1.2 }, // Agak menanjak ke selatan
            { name: "Citangtu", lat: -7.0152, lng: 108.4982, diff: 1.3 }, // Area perbukitan kota
            { name: "Windusengkahan", lat: -6.9752, lng: 108.5121, diff: 1.0 },
            { name: "Karangtawang", lat: -6.9921, lng: 108.5082, diff: 1.1 },
            { name: "Kedungarum", lat: -6.9612, lng: 108.5052, diff: 1.0 },
            { name: "Cigintung", lat: -6.9452, lng: 108.4682, diff: 1.1 },
            { name: "Lumbung", lat: -6.9682, lng: 108.4752, diff: 1.0 }
        ]
    },
    "Kramatmulya": {
        lat: -6.9452, lng: 108.4921,
        desa: [
            { name: "Kramatmulya", lat: -6.9452, lng: 108.4921, diff: 1.0 },
            { name: "Cikaso", lat: -6.9382, lng: 108.4752, diff: 1.2 },
            { name: "Cilaja", lat: -6.9512, lng: 108.4712, diff: 1.2 },
            { name: "Bojong", lat: -6.9321, lng: 108.4892, diff: 1.0 },
            { name: "Cikubangsari", lat: -6.9354, lng: 108.5052, diff: 1.0 },
            { name: "Cibentang", lat: -6.9282, lng: 108.5121, diff: 1.0 },
            { name: "Gereba", lat: -6.9412, lng: 108.5182, diff: 1.0 },
            { name: "Kalapagunung", lat: -6.9554, lng: 108.4912, diff: 1.1 },
            { name: "Karangmangu", lat: -6.9482, lng: 108.4812, diff: 1.1 },
            { name: "Pajambon", lat: -6.9582, lng: 108.4521, diff: 1.5 }, // Dekat jalur pendakian, sangat nanjak
            { name: "Ragawacana", lat: -6.9512, lng: 108.4621, diff: 1.4 }, // Area tinggi
            { name: "Cilowa", lat: -6.9421, lng: 108.4852, diff: 1.1 },
            { name: "Gandasoli", lat: -6.9252, lng: 108.4952, diff: 1.0 },
            { name: "Widarasari", lat: -6.9312, lng: 108.5212, diff: 1.0 }
        ]
    },

        "Kadugede": {
        lat: -7.0012, lng: 108.4612,
        desa: [
            { name: "Kadugede", lat: -7.0012, lng: 108.4612, diff: 1.0 },
            { name: "Babatan", lat: -6.9921, lng: 108.4712, diff: 1.0 },
            { name: "Cipado", lat: -7.0152, lng: 108.4712, diff: 1.1 },
            { name: "Cisukadana", lat: -7.0212, lng: 108.4652, diff: 1.2 },
            { name: "Nusaherang", lat: -7.0145, lng: 108.4421, diff: 1.2 },
            { name: "Sindangjawa", lat: -7.0182, lng: 108.4552, diff: 1.2 },
            { name: "Tinggar", lat: -7.0312, lng: 108.4782, diff: 1.3 }, // Tanjakan menuju darma
            { name: "Windujanten", lat: -7.0082, lng: 108.4512, diff: 1.1 },
            { name: "Cadasngampar", lat: -7.0354, lng: 108.4521, diff: 1.4 }, // Area tebing
            { name: "Margabakti", lat: -7.0254, lng: 108.4812, diff: 1.2 },
            { name: "Nujul", lat: -7.0112, lng: 108.4852, diff: 1.1 },
            { name: "Sukasari", lat: -7.0054, lng: 108.4682, diff: 1.1 }
        ]
    },
    "Darma": {
        lat: -7.0423, lng: 108.4123,
        desa: [
            { name: "Darma", lat: -7.0423, lng: 108.4123, diff: 1.1 }, // Pusat keramaian Waduk
            { name: "Bakom", lat: -7.0512, lng: 108.3821, diff: 1.4 }, // Area tinggi belakang waduk
            { name: "Cigasong", lat: -7.0654, lng: 108.3912, diff: 1.4 },
            { name: "Cikupa", lat: -7.0782, lng: 108.4121, diff: 1.5 }, // Sangat nanjak
            { name: "Gunungsari", lat: -7.0312, lng: 108.3752, diff: 1.5 },
            { name: "Jagara", lat: -7.0382, lng: 108.4321, diff: 1.2 }, // Pinggir waduk
            { name: "Karangsari", lat: -7.0554, lng: 108.4212, diff: 1.3 },
            { name: "Paninggaran", lat: -7.0682, lng: 108.4352, diff: 1.4 },
            { name: "Parung", lat: -7.0452, lng: 108.3982, diff: 1.4 },
            { name: "Sakasari", lat: -7.0282, lng: 108.4052, diff: 1.2 },
            { name: "Cipasung", lat: -7.0152, lng: 108.3852, diff: 1.5 }, // Jalur arah Cikijing
            { name: "Kaduhela", lat: -7.0612, lng: 108.3752, diff: 1.6 }, // Ekstrem
            { name: "Sagarahiang", lat: -7.0121, lng: 108.3582, diff: 1.7 }, // Kaki Gunung Ciremai Selatan
            { name: "Tugumulya", lat: -7.0721, lng: 108.3812, diff: 1.5 },
            { name: "Cimenga", lat: -7.0852, lng: 108.4212, diff: 1.5 },
            { name: "Cageur", lat: -7.0912, lng: 108.4052, diff: 1.6 },
            { name: "Cipasung", lat: -7.0212, lng: 108.3712, diff: 1.5 }
        ]
    },

        "Ciawigebang": {
        lat: -6.9634, lng: 108.5912,
        desa: [
            { name: "Ciawigebang", lat: -6.9634, lng: 108.5912, diff: 1.0 },
            { name: "Ciawilor", lat: -6.9582, lng: 108.5952, diff: 1.0 },
            { name: "Cidahu", lat: -6.9612, lng: 108.6112, diff: 1.0 },
            { name: "Cihirup", lat: -6.9854, lng: 108.6052, diff: 1.1 },
            { name: "Cijagamulya", lat: -6.9452, lng: 108.5812, diff: 1.0 },
            { name: "Cikubangmulya", lat: -6.9721, lng: 108.6082, diff: 1.0 },
            { name: "Ciomas", lat: -6.9921, lng: 108.5852, diff: 1.1 },
            { name: "Cipicung", lat: -6.9482, lng: 108.5712, diff: 1.0 },
            { name: "Dukuhdalem", lat: -6.9312, lng: 108.5952, diff: 1.1 },
            { name: "Geresik", lat: -6.9521, lng: 108.5721, diff: 1.0 },
            { name: "Kadumaduan", lat: -6.9382, lng: 108.6021, diff: 1.1 },
            { name: "Kadurama", lat: -6.9754, lng: 108.5882, diff: 1.0 },
            { name: "Kapandayan", lat: -6.9682, lng: 108.5782, diff: 1.0 },
            { name: "Karangsuwung", lat: -6.9412, lng: 108.6182, diff: 1.1 },
            { name: "Lebakunit", lat: -6.9612, lng: 108.5821, diff: 1.0 },
            { name: "Mekarjaya", lat: -6.9821, lng: 108.6212, diff: 1.1 },
            { name: "Pajawanlor", lat: -6.9421, lng: 108.5921, diff: 1.0 },
            { name: "Pamijahan", lat: -6.9712, lng: 108.5982, diff: 1.0 },
            { name: "Panyocokan", lat: -6.9542, lng: 108.6012, diff: 1.0 },
            { name: "Sidaraja", lat: -6.9482, lng: 108.5852, diff: 1.0 },
            { name: "Sukadana", lat: -6.9882, lng: 108.5782, diff: 1.1 },
            { name: "Sukamaju", lat: -6.9952, lng: 108.6121, diff: 1.1 },
            { name: "Torrevilla", lat: -6.9512, lng: 108.6082, diff: 1.0 },
            { name: "Wanasaraya", lat: -6.9352, lng: 108.5882, diff: 1.1 }
        ]
    },
    "Luragung": {
        lat: -7.0212, lng: 108.6321,
        desa: [
            { name: "Luragung Landeuh", lat: -7.0212, lng: 108.6321, diff: 1.0 },
            { name: "Luragung Tonggoh", lat: -7.0182, lng: 108.6282, diff: 1.0 },
            { name: "Batarpanjang", lat: -7.0421, lng: 108.6452, diff: 1.1 },
            { name: "Ciduwet", lat: -7.0512, lng: 108.6182, diff: 1.2 },
            { name: "Cigedang", lat: -7.0354, lng: 108.6121, diff: 1.1 },
            { name: "Cikadu", lat: -7.0582, lng: 108.6352, diff: 1.2 },
            { name: "Cikandang", lat: -7.0482, lng: 108.6582, diff: 1.1 },
            { name: "Cimaranten", lat: -7.0312, lng: 108.6012, diff: 1.1 },
            { name: "Cirahayu", lat: -7.0282, lng: 108.6512, diff: 1.1 },
            { name: "Dukuhpicung", lat: -7.0152, lng: 108.6152, diff: 1.0 },
            { name: "Grahalaya", lat: -7.0252, lng: 108.6382, diff: 1.0 },
            { name: "Margasari", lat: -7.0382, lng: 108.6252, diff: 1.1 },
            { name: "Panyosogan", lat: -7.0452, lng: 108.6482, diff: 1.1 },
            { name: "Sindangsari", lat: -7.0082, lng: 108.6382, diff: 1.0 },
            { name: "Wadasiluhur", lat: -7.0621, lng: 108.6212, diff: 1.3 }, // Pelosok
            { name: "Wilasari", lat: -7.0312, lng: 108.6652, diff: 1.2 }
        ]
    },

        "Lebakwangi": {
        lat: -7.0012, lng: 108.5642,
        desa: [
            { name: "Lebakwangi", lat: -7.0012, lng: 108.5642, diff: 1.0 },
            { name: "Bendungan", lat: -6.9921, lng: 108.5582, diff: 1.0 },
            { name: "Bolang", lat: -7.0152, lng: 108.5512, diff: 1.1 },
            { name: "Cipasung", lat: -7.0112, lng: 108.5682, diff: 1.0 },
            { name: "Cinagara", lat: -7.0254, lng: 108.5421, diff: 1.1 },
            { name: "Langseb", lat: -7.0082, lng: 108.5752, diff: 1.0 },
            { name: "Mancagar", lat: -6.9854, lng: 108.5682, diff: 1.0 },
            { name: "Pagundan", lat: -6.9912, lng: 108.5782, diff: 1.0 },
            { name: "Pajawankidul", lat: -7.0182, lng: 108.5592, diff: 1.0 },
            { name: "Pasayangan", lat: -7.0054, lng: 108.5812, diff: 1.0 },
            { name: "Sukamulya", lat: -7.0212, lng: 108.5752, diff: 1.1 },
            { name: "Sindang", lat: -7.0121, lng: 108.5882, diff: 1.1 },
            { name: "Mekarwangi", lat: -7.0312, lng: 108.5621, diff: 1.1 }
        ]
    },
    "Cidahu": {
        lat: -6.9212, lng: 108.6421,
        desa: [
            { name: "Cidahu", lat: -6.9212, lng: 108.6421, diff: 1.0 },
            { name: "Ceurik", lat: -6.9154, lng: 108.6521, diff: 1.0 },
            { name: "Cibulan", lat: -6.9082, lng: 108.6382, diff: 1.1 },
            { name: "Cihideunggirang", lat: -6.9282, lng: 108.6552, diff: 1.0 },
            { name: "Cihideunghilir", lat: -6.9354, lng: 108.6621, diff: 1.0 },
            { name: "Cikeusik", lat: -6.9112, lng: 108.6682, diff: 1.1 },
            { name: "Cimanintin", lat: -6.9542, lng: 108.6712, diff: 1.3 }, // Agak pelosok
            { name: "Datar", lat: -6.9412, lng: 108.6512, diff: 1.1 },
            { name: "Jatimulya", lat: -6.9252, lng: 108.6252, diff: 1.0 },
            { name: "Legok", lat: -6.9012, lng: 108.6582, diff: 1.0 },
            { name: "Nanggela", lat: -6.9482, lng: 108.6321, diff: 1.1 },
            { name: "Sukamulya", lat: -6.9312, lng: 108.6782, diff: 1.1 }
        ]
    },

        "Garawangi": {
        lat: -6.9956, lng: 108.5234,
        desa: [
            { name: "Garawangi", lat: -6.9956, lng: 108.5234, diff: 1.0 },
            { name: "Cikananga", lat: -7.0012, lng: 108.5152, diff: 1.1 },
            { name: "Cirukem", lat: -7.0123, lng: 108.5342, diff: 1.2 },
            { name: "Giriwaringin", lat: -7.0254, lng: 108.5212, diff: 1.4 }, // Area perbukitan
            { name: "Kutakembaran", lat: -6.9854, lng: 108.5312, diff: 1.1 },
            { name: "Mancagar", lat: -6.9912, lng: 108.5421, diff: 1.0 },
            { name: "Purwasari", lat: -6.9812, lng: 108.5182, diff: 1.0 },
            { name: "Tambakbaya", lat: -7.0054, lng: 108.5282, diff: 1.1 },
            { name: "Cidahu", lat: -7.0182, lng: 108.5452, diff: 1.2 },
            { name: "Karangtawang", lat: -6.9882, lng: 108.5052, diff: 1.0 },
            { name: "Lengkong", lat: -7.0021, lng: 108.5012, diff: 1.1 },
            { name: "Sukaimut", lat: -7.0312, lng: 108.5382, diff: 1.3 },
            { name: "Sukamulya", lat: -7.0152, lng: 108.5112, diff: 1.1 },
            { name: "Tegalpanjang", lat: -7.0212, lng: 108.5482, diff: 1.2 },
            { name: "Mekarmulya", lat: -6.9982, lng: 108.5521, diff: 1.1 },
            { name: "Citosari", lat: -7.0052, lng: 108.5321, diff: 1.1 },
            { name: "Ginamulya", lat: -7.0112, lng: 108.5252, diff: 1.1 }
        ]
    },
    "Sindangagung": {
        lat: -6.9721, lng: 108.5142,
        desa: [
            { name: "Sindangagung", lat: -6.9721, lng: 108.5142, diff: 1.0 },
            { name: "Babakanreuma", lat: -6.9654, lng: 108.5212, diff: 1.0 },
            { name: "Balong", lat: -6.9782, lng: 108.5282, diff: 1.0 },
            { name: "Dukuhlor", lat: -6.9812, lng: 108.5382, diff: 1.1 },
            { name: "Kertawangunan", lat: -6.9612, lng: 108.5112, diff: 1.0 }, // Dekat terminal
            { name: "Kertayasa", lat: -6.9554, lng: 108.5252, diff: 1.0 },
            { name: "Mekarmukti", lat: -6.9682, lng: 108.5352, diff: 1.0 },
            { name: "Sindangsari", lat: -6.9854, lng: 108.5182, diff: 1.0 },
            { name: "Tirtawangunan", lat: -6.9582, lng: 108.5052, diff: 1.0 },
            { name: "Kaduagung", lat: -6.9712, lng: 108.5452, diff: 1.1 },
            { name: "Pagayaman", lat: -6.9752, lng: 108.5512, diff: 1.1 },
            { name: "Taraju", lat: -6.9882, lng: 108.5212, diff: 1.1 }
        ]
    },

        "Cigandamekar": {
        lat: -6.8745, lng: 108.5122,
        desa: [
            { name: "Babakanjati", lat: -6.8654, lng: 108.5182, diff: 1.0 },
            { name: "Bunarigede", lat: -6.8782, lng: 108.5252, diff: 1.1 },
            { name: "Cigandamekar", lat: -6.8745, lng: 108.5122, diff: 1.0 },
            { name: "Indraprahasta", lat: -6.8812, lng: 108.5312, diff: 1.0 },
            { name: "Koreak", lat: -6.8582, lng: 108.5082, diff: 1.1 },
            { name: "Sangkanerang", lat: -6.8854, lng: 108.4982, diff: 1.3 }, // Mulai naik ke arah pegunungan
            { name: "Timbang", lat: -6.8612, lng: 108.5152, diff: 1.0 },
            { name: "Jambugeulis", lat: -6.8921, lng: 108.5052, diff: 1.2 },
            { name: "Karangmuncang", lat: -6.8712, lng: 108.5382, diff: 1.1 },
            { name: "Panawuan", lat: -6.8882, lng: 108.5182, diff: 1.0 },
            { name: "Sangkanmulya", lat: -6.8782, lng: 108.4912, diff: 1.2 }
        ]
    },
    "Pancalang": {
        lat: -6.8021, lng: 108.4982,
        desa: [
            { name: "Pancalang", lat: -6.8021, lng: 108.4982, diff: 1.0 },
            { name: "Mekarjaya", lat: -6.8121, lng: 108.5052, diff: 1.0 },
            { name: "Patalagan", lat: -6.8212, lng: 108.4912, diff: 1.1 },
            { name: "Rajawetan", lat: -6.7954, lng: 108.4852, diff: 1.2 },
            { name: "Sarewu", lat: -6.8082, lng: 108.4752, diff: 1.3 }, // Area perbukitan perbatasan
            { name: "Sindangkempeng", lat: -6.7882, lng: 108.5012, diff: 1.0 },
            { name: "Tajurbuntu", lat: -6.8152, lng: 108.4812, diff: 1.2 },
            { name: "Tenjolaya", lat: -6.7912, lng: 108.5121, diff: 1.0 },
            { name: "Cimara", lat: -6.8254, lng: 108.5012, diff: 1.1 },
            { name: "Enggalwangi", lat: -6.8012, lng: 108.5212, diff: 1.0 },
            { name: "Sumbakeling", lat: -6.8312, lng: 108.4852, diff: 1.3 },
            { name: "Taraju", lat: -6.8212, lng: 108.4682, diff: 1.4 },
            { name: "Sukamaju", lat: -6.7852, lng: 108.4921, diff: 1.1 }
        ]
    },

        "Pasawahan": {
        lat: -6.8324, lng: 108.4354,
        desa: [
            { name: "Pasawahan", lat: -6.8324, lng: 108.4354, diff: 1.1 },
            { name: "Cidahu", lat: -6.8452, lng: 108.4412, diff: 1.2 },
            { name: "Cimara", lat: -6.8512, lng: 108.4282, diff: 1.3 },
            { name: "Kaduela", lat: -6.8382, lng: 108.4152, diff: 1.5 }, // Lokasi Telaga Biru Cicerem (Nanjak)
            { name: "Padamatang", lat: -6.8254, lng: 108.4482, diff: 1.1 },
            { name: "Paniis", lat: -6.8482, lng: 108.4052, diff: 1.4 }, // Lokasi Wisata Air Cipaniis
            { name: "Singkup", lat: -6.8582, lng: 108.4182, diff: 1.4 },
            { name: "Ciwiru", lat: -6.8182, lng: 108.4312, diff: 1.1 },
            { name: "Remat", lat: -6.8212, lng: 108.4212, diff: 1.2 },
            { name: "Cidahu Baru", lat: -6.8412, lng: 108.4512, diff: 1.1 }
        ]
    },
    "Mandirancan": {
        lat: -6.8156, lng: 108.4735,
        desa: [
            { name: "Mandirancan", lat: -6.8156, lng: 108.4735, diff: 1.1 },
            { name: "Cadeba", lat: -6.8054, lng: 108.4682, diff: 1.1 },
            { name: "Cisantana", lat: -6.8282, lng: 108.4512, diff: 1.4 }, // Area tinggi/wisata
            { name: "Nanggela", lat: -6.7954, lng: 108.4612, diff: 1.2 },
            { name: "Salakadomas", lat: -6.8212, lng: 108.4852, diff: 1.1 },
            { name: "Sukasari", lat: -6.8312, lng: 108.4712, diff: 1.2 },
            { name: "Trijaya", lat: -6.8412, lng: 108.4621, diff: 1.4 },
            { name: "Cidahu", lat: -6.8182, lng: 108.4552, diff: 1.2 },
            { name: "Kertawinangun", lat: -6.7912, lng: 108.4782, diff: 1.0 },
            { name: "Mekarjaya", lat: -6.8082, lng: 108.4921, diff: 1.0 },
            { name: "Randobawailir", lat: -6.8254, lng: 108.4812, diff: 1.1 },
            { name: "Randobawagirang", lat: -6.8354, lng: 108.4852, diff: 1.2 }
        ]
    },

        "Selajambe": {
        lat: -7.1212, lng: 108.4621,
        desa: [
            { name: "Selajambe", lat: -7.1212, lng: 108.4621, diff: 1.5 },
            { name: "Bagawat", lat: -7.1124, lng: 108.4412, diff: 1.6 },
            { name: "Cambereti", lat: -7.1354, lng: 108.4712, diff: 1.6 },
            { name: "Cantilan", lat: -7.1421, lng: 108.4552, diff: 1.7 },
            { name: "Jamberama", lat: -7.1582, lng: 108.4412, diff: 1.8 }, // Sangat Dalam/Pelosok
            { name: "Kutawaringin", lat: -7.1254, lng: 108.4812, diff: 1.6 },
            { name: "Padahurip", lat: -7.1082, lng: 108.4312, diff: 1.7 },
            { name: "Ciberung", lat: -7.1452, lng: 108.4212, diff: 1.8 }
        ]
    },
    "Subang": {
        lat: -7.1523, lng: 108.5421,
        desa: [
            { name: "Subang", lat: -7.1523, lng: 108.5421, diff: 1.5 },
            { name: "Cilebak", lat: -7.1645, lng: 108.5121, diff: 1.6 },
            { name: "Jatisari", lat: -7.1712, lng: 108.5312, diff: 1.6 },
            { name: "Pamulihan", lat: -7.1421, lng: 108.5612, diff: 1.7 },
            { name: "Situgede", lat: -7.1854, lng: 108.5212, diff: 1.8 }, // Area perbatasan jauh
            { name: "Tanggerang", lat: -7.1482, lng: 108.5812, diff: 1.7 },
            { name: "Bangunjaya", lat: -7.1612, lng: 108.5912, diff: 1.7 },
            { name: "Longkewang", lat: -7.1354, lng: 108.5512, diff: 1.6 },
            { name: "Gunungaci", lat: -7.1912, lng: 108.5412, diff: 1.8 },
            { name: "Dukuhbadag", lat: -7.1282, lng: 108.5712, diff: 1.7 }
        ]
    },

        "Cibingbin": {
        lat: -7.0812, lng: 108.7321,
        desa: [
            { name: "Cibingbin", lat: -7.0812, lng: 108.7321, diff: 1.1 },
            { name: "Bantarpanjang", lat: -7.0954, lng: 108.7452, diff: 1.3 },
            { name: "Cipondok", lat: -7.1021, lng: 108.7212, diff: 1.2 },
            { name: "Cisaat", lat: -7.0882, lng: 108.7512, diff: 1.3 },
            { name: "Ciujung", lat: -7.1154, lng: 108.7382, diff: 1.4 }, // Dekat perbatasan Jateng
            { name: "Dukuhbadag", lat: -7.0712, lng: 108.7152, diff: 1.2 },
            { name: "Sindangjawa", lat: -7.0912, lng: 108.7652, diff: 1.4 },
            { name: "Sukaharja", lat: -7.1254, lng: 108.7482, diff: 1.5 }, // Pelosok timur
            { name: "Cisukadana", lat: -7.1082, lng: 108.7112, diff: 1.3 },
            { name: "Sirnabakti", lat: -7.0654, lng: 108.7282, diff: 1.1 }
        ]
    },
    "Cibeureum": {
        lat: -7.0512, lng: 108.6921,
        desa: [
            { name: "Cibeureum", lat: -7.0512, lng: 108.6921, diff: 1.1 },
            { name: "Cikadu", lat: -7.0654, lng: 108.6812, diff: 1.2 },
            { name: "Cimara", lat: -7.0412, lng: 108.7052, diff: 1.2 },
            { name: "Kawungsari", lat: -7.0312, lng: 108.6852, diff: 1.1 },
            { name: "Sukamaju", lat: -7.0782, lng: 108.7012, diff: 1.3 },
            { name: "Sukanegeara", lat: -7.0582, lng: 108.7121, diff: 1.2 },
            { name: "Tarikolot", lat: -7.0452, lng: 108.6752, diff: 1.2 },
            { name: "Cipondok", lat: -7.0721, lng: 108.6882, diff: 1.3 },
            { name: "Randusari", lat: -7.0612, lng: 108.7212, diff: 1.4 }
        ]
    },

        "Ciniru": {
        lat: -7.0542, lng: 108.5212,
        desa: [
            { name: "Ciniru", lat: -7.0542, lng: 108.5212, diff: 1.4 },
            { name: "Cijemit", lat: -7.0654, lng: 108.5342, diff: 1.5 },
            { name: "Cipedes", lat: -7.0782, lng: 108.5412, diff: 1.6 },
            { name: "Longkewang", lat: -7.0854, lng: 108.5521, diff: 1.7 }, // Sangat Pelosok
            { name: "Pamupukan", lat: -7.0421, lng: 108.5121, diff: 1.4 },
            { name: "Pinara", lat: -7.0912, lng: 108.5282, diff: 1.7 }, // Area Perbukitan Tinggi
            { name: "Cadasngampar", lat: -7.0612, lng: 108.5021, diff: 1.6 },
            { name: "Rambacuri", lat: -7.0721, lng: 108.5152, diff: 1.5 },
            { name: "Mekarsari", lat: -7.0354, lng: 108.5252, diff: 1.4 }
        ]
    },
    "Hantara": {
        lat: -7.0812, lng: 108.4923,
        desa: [
            { name: "Hantara", lat: -7.0812, lng: 108.4923, diff: 1.5 },
            { name: "Bunigeulis", lat: -7.0912, lng: 108.4821, diff: 1.6 },
            { name: "Cikiray", lat: -7.0721, lng: 108.4752, diff: 1.6 },
            { name: "Pasiragung", lat: -7.1021, lng: 108.4982, diff: 1.7 },
            { name: "Trijaya", lat: -7.1121, lng: 108.4852, diff: 1.7 }, // Ujung Selatan Hantara
            { name: "Citapen", lat: -7.0882, lng: 108.5052, diff: 1.5 },
            { name: "Pakapasan Girang", lat: -7.0954, lng: 108.4712, diff: 1.6 },
            { name: "Pakapasan Hilir", lat: -7.0821, lng: 108.4612, diff: 1.6 }
        ]
    },

        "Cimahi (Kuningan)": {
        lat: -7.0345, lng: 108.6721,
        desa: [
            { name: "Cimahi", lat: -7.0345, lng: 108.6721, diff: 1.1 },
            { name: "Batuasri", lat: -7.0212, lng: 108.6852, diff: 1.2 },
            { name: "Cikeusal", lat: -7.0454, lng: 108.6921, diff: 1.3 },
            { name: "Gunungaci", lat: -7.0582, lng: 108.7052, diff: 1.4 }, // Area perbukitan
            { name: "Mulyajaya", lat: -7.0282, lng: 108.6612, diff: 1.1 },
            { name: "Sukajaya", lat: -7.0512, lng: 108.6752, diff: 1.2 },
            { name: "Margamulya", lat: -7.0382, lng: 108.6982, diff: 1.2 },
            { name: "Cimahi Hilir", lat: -7.0412, lng: 108.6652, diff: 1.1 },
            { name: "Mekar Jaya", lat: -7.0621, lng: 108.6882, diff: 1.3 },
            { name: "Cisandana", lat: -7.0682, lng: 108.7121, diff: 1.4 }
        ]
    },
    "Karangkancana": {
        lat: -7.1123, lng: 108.6521,
        desa: [
            { name: "Karangkancana", lat: -7.1123, lng: 108.6521, diff: 1.3 },
            { name: "Cihanjaro", lat: -7.1254, lng: 108.6412, diff: 1.5 },
            { name: "Jabareanti", lat: -7.1421, lng: 108.6652, diff: 1.6 }, // Perbatasan Jateng, sangat jauh
            { name: "Margacina", lat: -7.1012, lng: 108.6712, diff: 1.4 },
            { name: "Sukamaju", lat: -7.1182, lng: 108.6321, diff: 1.4 },
            { name: "Tanjungkertha", lat: -7.0954, lng: 108.6612, diff: 1.3 },
            { name: "Segong", lat: -7.0852, lng: 108.6412, diff: 1.2 },
            { name: "Simpayjaya", lat: -7.1354, lng: 108.6782, diff: 1.6 }, // Pelosok
            { name: "Kaduagung", lat: -7.1052, lng: 108.6212, diff: 1.4 }
        ]
    },

        "Maleber": {
        lat: -7.0123, lng: 108.5942,
        desa: [
            { name: "Maleber", lat: -7.0123, lng: 108.5942, diff: 1.1 },
            { name: "Bunigeulis", lat: -7.0254, lng: 108.6112, diff: 1.3 }, // Area perbukitan
            { name: "Cigedang", lat: -7.0054, lng: 108.6052, diff: 1.1 },
            { name: "Galaherang", lat: -7.0382, lng: 108.6212, diff: 1.4 }, // Cukup jauh ke dalam
            { name: "Kaduagung", lat: -7.0212, lng: 108.5812, diff: 1.2 },
            { name: "Mekarsari", lat: -6.9954, lng: 108.6182, diff: 1.1 },
            { name: "Padamulya", lat: -7.0452, lng: 108.5982, diff: 1.3 },
            { name: "Cipakem", lat: -7.0612, lng: 108.6052, diff: 1.5 }, // Ujung Maleber, medannya berat
            { name: "Girimukti", lat: -7.0521, lng: 108.6252, diff: 1.4 },
            { name: "Karangtengah", lat: -7.0182, lng: 108.6352, diff: 1.2 },
            { name: "Kutamandarakan", lat: -7.0012, lng: 108.5852, diff: 1.1 },
            { name: "Parakan", lat: -7.0112, lng: 108.6012, diff: 1.1 },
            { name: "Dukuhdalem", lat: -7.0312, lng: 108.5752, diff: 1.2 }
        ]
    },
    "Cipicung": {
        lat: -6.9412, lng: 108.5423,
        desa: [
            { name: "Cipicung", lat: -6.9412, lng: 108.5423, diff: 1.0 },
            { name: "Cimaranten", lat: -6.9554, lng: 108.5582, diff: 1.0 },
            { name: "Mekarsari", lat: -6.9282, lng: 108.5512, diff: 1.1 },
            { name: "Muncungela", lat: -6.9482, lng: 108.5682, diff: 1.0 },
            { name: "Pamulihan", lat: -6.9612, lng: 108.5452, diff: 1.1 },
            { name: "Salareuma", lat: -6.9354, lng: 108.5321, diff: 1.0 },
            { name: "Sugandajaya", lat: -6.9421, lng: 108.5752, diff: 1.1 },
            { name: "Susuuru", lat: -6.9212, lng: 108.5621, diff: 1.1 },
            { name: "Cisukadana", lat: -6.9512, lng: 108.5282, diff: 1.1 },
            { name: "Karoya", lat: -6.9682, lng: 108.5552, diff: 1.1 }
        ]
    },

        "Japara": {
        lat: -6.9245, lng: 108.5231,
        desa: [
            { name: "Japara", lat: -6.9245, lng: 108.5231, diff: 1.1 },
            { name: "Cengal", lat: -6.9154, lng: 108.5342, diff: 1.2 },
            { name: "Cikeleng", lat: -6.9312, lng: 108.5152, diff: 1.1 },
            { name: "Dukuhdalem", lat: -6.9082, lng: 108.5282, diff: 1.2 },
            { name: "Kalimati", lat: -6.9412, lng: 108.5412, diff: 1.0 },
            { name: "Rajadanu", lat: -6.9182, lng: 108.5482, diff: 1.1 },
            { name: "Singkup", lat: -6.8982, lng: 108.5312, diff: 1.3 }, // Mulai berbukit
            { name: "Gararewa", lat: -6.9254, lng: 108.5521, diff: 1.1 },
            { name: "Citapen", lat: -6.9352, lng: 108.5052, diff: 1.2 },
            { name: "Wano", lat: -6.9052, lng: 108.5121, diff: 1.2 }
        ]
    },
    "Kalimanggis": {
        lat: -6.9712, lng: 108.6321,
        desa: [
            { name: "Kalimanggis Kulon", lat: -6.9712, lng: 108.6321, diff: 1.0 },
            { name: "Kalimanggis Wetan", lat: -6.9754, lng: 108.6382, diff: 1.0 },
            { name: "Cipasung", lat: -6.9854, lng: 108.6452, diff: 1.1 },
            { name: "Kertawana", lat: -6.9612, lng: 108.6252, diff: 1.0 },
            { name: "Pinigara", lat: -6.9554, lng: 108.6412, diff: 1.0 },
            { name: "Cilaja", lat: -6.9812, lng: 108.6212, diff: 1.1 },
            { name: "Kalimanggis", lat: -6.9712, lng: 108.6321, diff: 1.0 }
        ]
    },

        "Nusaherang": {
        lat: -7.0145, lng: 108.4421,
        desa: [
            { name: "Nusaherang", lat: -7.0145, lng: 108.4421, diff: 1.1 },
            { name: "Ciamis", lat: -7.0254, lng: 108.4321, diff: 1.2 },
            { name: "Ciawi", lat: -7.0312, lng: 108.4212, diff: 1.3 },
            { name: "Haurkuning", lat: -7.0082, lng: 108.4352, diff: 1.2 },
            { name: "Jurasari", lat: -7.0212, lng: 108.4482, diff: 1.2 },
            { name: "Windusari", lat: -7.0382, lng: 108.4412, diff: 1.3 },
            { name: "Kertayuga", lat: -7.0452, lng: 108.4282, diff: 1.4 },
            { name: "Cikadu", lat: -7.0112, lng: 108.4152, diff: 1.3 }
        ]
    },
    "Cilebak": {
        lat: -7.1645, lng: 108.5121,
        desa: [
            { name: "Cilebak", lat: -7.1645, lng: 108.5121, diff: 1.6 }, // Area Terpencil Selatan
            { name: "Cabulan", lat: -7.1752, lng: 108.5012, diff: 1.7 },
            { name: "Cisakti", lat: -7.1812, lng: 108.5252, diff: 1.7 },
            { name: "Jalatrang", lat: -7.1554, lng: 108.5312, diff: 1.6 },
            { name: "Legokherang", lat: -7.1952, lng: 108.4952, diff: 1.8 }, // Ekstrem
            { name: "Patala", lat: -7.1682, lng: 108.5421, diff: 1.7 },
            { name: "Mandapajaya", lat: -7.1882, lng: 108.5152, diff: 1.8 },
            { name: "Cisandana", lat: -7.1712, lng: 108.5512, diff: 1.7 }
        ]
    },
    "Karangtawang (Penyangga)": { // Menggenapi sisa desa perbatasan
        lat: -7.0254, lng: 108.5812,
        desa: [
            { name: "Karangmangu", lat: -7.0254, lng: 108.5812, diff: 1.1 },
            { name: "Sukasari Kidul", lat: -7.0412, lng: 108.5712, diff: 1.2 },
            { name: "Sindanghayu", lat: -7.0512, lng: 108.5612, diff: 1.3 },
            { name: "Cikuya", lat: -7.0654, lng: 108.5421, diff: 1.4 },
            { name: "Sukanagara", lat: -7.0782, lng: 108.5512, diff: 1.4 },
            { name: "Margamukti", lat: -7.0852, lng: 108.5312, diff: 1.5 },
            { name: "Cibulan Hilir", lat: -7.0912, lng: 108.5212, diff: 1.5 },
            { name: "Bantar Wangi", lat: -7.0982, lng: 108.5112, diff: 1.6 },
            { name: "Cileuya", lat: -7.1054, lng: 108.5012, diff: 1.6 },
            { name: "Cimulya", lat: -7.1121, lng: 108.4912, diff: 1.7 }
        ]
    }
    
    // Kecamatan berikutnya akan kita tambahkan di bawah sini...
};

// --- FUNGSI LOGIKA (Update untuk membaca Objek Desa) ---

function initWilayah() {
    const kecSelect = document.getElementById('dest-kecamatan');
    if (!kecSelect) return;
    kecSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    
    for (let kecamatan in dataWilayah) {
        let opt = document.createElement('option');
        opt.value = kecamatan;
        opt.innerHTML = kecamatan;
        kecSelect.appendChild(opt);
    }
}

function loadCities(kecamatan) {
    const citySelect = document.getElementById('dest-city');
    const wrapper = document.getElementById('city-wrapper');
    if (!citySelect || !wrapper) return;

    citySelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    
    if (kecamatan && dataWilayah[kecamatan]) {
        wrapper.style.display = 'block';
        dataWilayah[kecamatan].desa.forEach((desaObj, index) => {
            let opt = document.createElement('option');
            opt.value = index; // Kita simpan INDEX-nya agar bisa ambil koordinat desa nanti
            opt.innerHTML = desaObj.name;
            citySelect.appendChild(opt);
        });
    } else {
        wrapper.style.display = 'none';
    }
                                            }
