import { Product, Therapy, Therapist } from "./types";

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Madu Gurah Asy-Syifa",
    description: "Formula madu hutan murni dengan ekstrak daun Srigunggu, jahe merah, kencur, dan mint. Sangat efektif melunakkan dahak, melegakan tenggorokan gatal, serta melancarkan saluran pernapasan atas.",
    price: 65000,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
    category: "madu",
    rating: 4.9,
    reviews: 124,
    stock: 45,
    benefits: [
      "Mengencerkan dahak menyumbat",
      "Melegakan tenggorokan serak & gatal",
      "Membantu meredakan batuk & gejala asma",
      "Menjadikan suara vokal lebih nyaring dan bersih"
    ]
  },
  {
    id: "prod-2",
    name: "Kapsul Habbatussauda Premium",
    description: "Jintan Hitam murni (Nigella Sativa) berkualitas tinggi dalam bentuk kapsul softgel minyak untuk penyerapan optimal. Mengandung Thymoquinone sebagai pelindung sel dan penguat imunitas alami.",
    price: 85000,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400",
    category: "herbal",
    rating: 4.8,
    reviews: 98,
    stock: 60,
    benefits: [
      "Meningkatkan imunitas tubuh secara signifikan",
      "Membantu menstabilkan tekanan darah & kolesterol",
      "Kaya akan antioksidan penangkal radikal bebas",
      "Mengatasi kelelahan kronis dan meningkatkan stamina"
    ]
  },
  {
    id: "prod-3",
    name: "Minyak Herba Sinergi (MHS)",
    description: "Minyak gosok tradisional multiguna yang diramu dari puluhan jenis tanaman obat pilihan, kelapa murni (VCO), dan minyak zaitun. Menghasilkan rasa hangat yang meresap mendalam ke sendi dan otot.",
    price: 45000,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400",
    category: "minyak",
    rating: 4.9,
    reviews: 245,
    stock: 80,
    benefits: [
      "Meredakan pegal-pegal, linu, dan nyeri sendi",
      "Sangat baik sebagai minyak pelumas pijat terapi",
      "Meredakan bengkak akibat benturan atau gigitan serangga",
      "Membantu mempercepat penyembuhan luka gores ringan"
    ]
  },
  {
    id: "prod-4",
    name: "Minyak Zaitun Ruqyah Al-Afiat",
    description: "Minyak zaitun Extra Virgin bermutu tinggi yang diproses dingin (cold pressed) untuk menjaga khasiatnya, serta telah dibacakan ayat-ayat syifa ruqyah syar'iyyah untuk membantu kesembuhan lahir dan batin.",
    price: 50000,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400",
    category: "minyak",
    rating: 4.9,
    reviews: 112,
    stock: 35,
    benefits: [
      "Pelumas bekam yang steril, anti-inflamasi, dan menutrisi kulit",
      "Menghaluskan dan menjaga kelembapan kulit sensitif",
      "Dapat dikonsumsi untuk melancarkan pencernaan",
      "Digunakan sebagai sarana ikhtiar terapi ruqyah mandiri"
    ]
  },
  {
    id: "prod-5",
    name: "Teh Daun Kelor Organik",
    description: "Teh herbal murni dari daun kelor (Moringa Oleifera) organik pilihan. Dikeringkan di bawah suhu terkontrol untuk mengunci nutrisi kalsium, besi, potasium, dan multivitamin di dalamnya.",
    price: 35000,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400",
    category: "teh",
    rating: 4.7,
    reviews: 76,
    stock: 50,
    benefits: [
      "Membantu menurunkan kadar gula darah (diabetes)",
      "Detoksifikasi racun sisa metabolisme dalam ginjal & hati",
      "Sumber nutrisi kalsium tinggi bagi kekuatan tulang",
      "Melancarkan produksi ASI bagi ibu menyusui"
    ]
  },
  {
    id: "prod-6",
    name: "Madu Hitam Pahit Mahoni",
    description: "Madu liar murni yang diperoleh lebah dari nektar bunga pohon mahoni. Memiliki rasa pahit khas dengan kandungan alkaloid alami tinggi yang sangat baik untuk pencernaan dan regulasi gula.",
    price: 95000,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=400",
    category: "madu",
    rating: 4.8,
    reviews: 132,
    stock: 25,
    benefits: [
      "Mengontrol kadar gula darah bagi penderita diabetes",
      "Meredakan peradangan lambung (gerd & maag kronis)",
      "Meningkatkan vitalitas dan memulihkan kebugaran tubuh",
      "Membantu menetralkan asam urat berlebih"
    ]
  }
];

export const therapies: Therapy[] = [
  {
    id: "ther-bekam",
    name: "Bekam Basah Medis (Steril & Higienis)",
    description: "Terapi bekam basah (wet cupping) profesional yang memadukan kaidah sunnah dengan standar medis modern steril. Menggunakan alat kop bebas BPA, jarum pemantik sekali pakai (disposable needle), serta disinfeksi antiseptik standar rumah sakit guna mengeluarkan darah kotor statis dari bawah kulit.",
    duration: 60,
    price: 200000,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=600",
    benefits: [
      "Mengeluarkan endapan racun/toksin dan kolesterol dari darah",
      "Meringankan sakit kepala menahun, migrain, dan pusing vertigo",
      "Membantu menormalkan hipertensi dan melancarkan sirkulasi darah",
      "Mengurangi ketegangan dan kaku otot pada leher, bahu, dan punggung"
    ],
    process: [
      "Pemeriksaan vital (tensi darah, nadi, riwayat medis) sebelum terapi",
      "Relaksasi otot punggung menggunakan Minyak Herba hangat",
      "Pemasangan kop bekam pertama (Bekam Kering) untuk mengumpulkan darah kotor",
      "Penyayatan halus (micro-puncture) steril memakai pen bekam otomatis sekali pakai",
      "Pemasangan kop bekam kedua untuk mengisap darah statis secara higienis",
      "Pembersihan area bekam dengan antiseptik dan penutupan dengan Minyak Zaitun Ruqyah"
    ]
  },
  {
    id: "ther-gurah",
    name: "Gurah Pernapasan & Suara Tradisional",
    description: "Terapi gurah hidung tradisional menggunakan tetesan ekstrak herbal alami tanaman Srigunggu (Clerodendrum serratum). Berguna merangsang selaput lendir untuk mengeluarkan tumpukan dahak kotor, lendir berlebih, nikotin, serta bakteri jahat dari saluran sinus, paru-paru, dan tenggorokan secara alami.",
    duration: 45,
    price: 200000,
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600",
    benefits: [
      "Membersihkan endapan lendir/sinus penyumbat napas",
      "Meredakan sinusitis, asma, alergi debu, dan batuk berdahak kronis",
      "Menghilangkan bau mulut tidak sedap akibat lendir lambung/hidung",
      "Membuat pita suara lebih bersih, nyaring, dan memperpanjang napas (bagus untuk Qori/Penyanyi)"
    ],
    process: [
      "Konsultasi awal dan pembersihan rongga hidung bagian luar",
      "Pasien berbaring telentang dalam suasana santai dan membaca doa ketenangan",
      "Penetesan ramuan herbal Srigunggu steril ke dalam lubang hidung",
      "Pasien dipandu berbalik tengkurap di bantal khusus beralas wadah steril",
      "Lendir, dahak, dan nikotin akan mengalir keluar secara alami selama 30-45 menit",
      "Pemijatan lembut pada area leher, belikat, dan kepala untuk melancarkan sisa pengeluaran",
      "Terapi diakhiri dengan istirahat dan meminum teh madu hangat khusus pasca gurah"
    ]
  },
  {
    id: "ther-pijat",
    name: "Pijat Kebubaran & Totok Acupressure",
    description: "Kombinasi pijat urut tradisional nusantara dengan stimulasi acupressure pada titik-titik meridian tubuh. Menggunakan kombinasi teknik usapan (effleurage), tekanan jempol (petrissage), dan totok wajah untuk memulihkan aliran energi tubuh yang tersumbat akibat kelelahan fisik maupun pikiran.",
    duration: 75,
    price: 200000,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600",
    benefits: [
      "Mengatasi sindrom kelelahan ekstrem dan kaku otot",
      "Meredakan insomnia dan mengembalikan pola tidur nyenyak alami",
      "Totok wajah melancarkan peredaran darah wajah dan meredakan ketegangan mata",
      "Mengurangi tingkat stres, kecemasan, dan kelelahan mental"
    ],
    process: [
      "Pasien memilih jenis minyak herba (Minyak Sinergi / Aromaterapi Kelapa)",
      "Pemijatan refleksi di telapak kaki untuk merangsang saraf organ dalam",
      "Pengurutan mendalam di seluruh tubuh (kaki, paha, punggung, lengan)",
      "Tekanan acupressure khusus pada belikat dan pinggang yang sering kaku",
      "Totok saraf wajah dan pijat kepala untuk menenangkan sistem saraf",
      "Stretching (peregangan sendi) pasif ringan dan pembersihan tubuh dengan handuk hangat"
    ]
  }
];

export const therapists: Therapist[] = [
  {
    id: "therapist-1",
    name: "Ustadz Achmad Fauzi, S.Kep.",
    role: "Terapis Utama & Tenaga Medis (Bekam & Gurah)",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    rating: 4.9,
    experience: "8 Tahun Pengalaman",
    specialty: ["Bekam Basah Medis", "Gurah Srigunggu Pernapasan", "Totok Meridian Saraf"],
    gender: "L"
  },
  {
    id: "therapist-2",
    name: "Ibu Siti Rahmawati",
    role: "Spesialis Terapis Wanita & Ibu Hamil",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    rating: 4.9,
    experience: "10 Tahun Pengalaman",
    specialty: ["Pijat Khusus Wanita/Pregnancy", "Bekam Estetika Wajah Wanita", "Totok Wajah Relaksasi"],
    gender: "P"
  },
  {
    id: "therapist-3",
    name: "Mas Danang Wijaya, A.Md.Ft.",
    role: "Fisioterapis & Pijat Relaksasi Olahraga",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    rating: 4.8,
    experience: "6 Tahun Pengalaman",
    specialty: ["Pijat Deep Tissue", "Fisioterapi Cedera Olahraga", "Refleksologi"],
    gender: "L"
  },
  {
    id: "therapist-4",
    name: "Ustadzah Aminah Nurhayati",
    role: "Terapis Gurah & Bekam Wanita",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    rating: 4.8,
    experience: "5 Tahun Pengalaman",
    specialty: ["Gurah Suara & Napas Wanita", "Bekam Basah Wanita", "Refleksologi Tangan & Kaki"],
    gender: "P"
  }
];
