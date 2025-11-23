// Dummy Artisans Data - matches your Mongoose schema
export const dummyArtisans = [
  {
    _id: "artisan001",
    userId: {
      _id: "user001",
      name: "Kwame Mensah",
      email: "kwame.mensah@example.com",
      phone: "+233 24 123 4567",
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-123456789-0",
      frontImage: "https://example.com/id-front.jpg",
      backImage: "https://example.com/id-back.jpg",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-01-15")
    },
    services: ["plumber"],
    skills: ["Pipe Installation", "Leak Repairs", "Water Heater", "Drain Cleaning", "Bathroom Fixtures"],
    experience: 8,
    certifications: [
      {
        name: "Master Plumber License",
        issuingOrg: "Ghana Plumbers Association",
        year: 2018,
        certificateFile: "cert001.pdf"
      }
    ],
    businessName: "Kwame Plumbing Solutions",
    serviceAreas: ["East Legon", "Airport Residential", "Cantonments", "Labone"],
    tools: ["Pipe wrench", "Snake drain", "Pressure tester", "Welding kit"],
    languages: ["English", "Twi", "Ga"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "saturday", slots: [{ start: "09:00", end: "14:00" }] }
      ],
      emergencyAvailable: true,
      isAvailable: true
    },
    rating: {
      average: 4.9,
      count: 127,
      breakdown: {
        quality: 4.9,
        punctuality: 4.8,
        pricing: 4.9,
        professionalism: 5.0
      }
    },
    earnings: {
      total: 45000,
      pending: 2500,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "quick_response", "emergency_expert", "verified"]
  },
  {
    _id: "artisan002",
    userId: {
      _id: "user002",
      name: "Akosua Darko",
      email: "akosua.darko@example.com",
      phone: "+233 27 234 5678",
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-234567890-1",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-02-10")
    },
    services: ["electrician"],
    skills: ["Wiring", "Circuit Installation", "Generator Setup", "Lighting", "Electrical Repairs"],
    experience: 6,
    certifications: [
      {
        name: "Certified Electrician",
        issuingOrg: "Electrical Contractors Association",
        year: 2020
      }
    ],
    businessName: "Akosua Electric Works",
    serviceAreas: ["Spintex", "Tema", "Ashaiman", "Michel Camp"],
    tools: ["Multimeter", "Wire stripper", "Voltage tester", "Cable puller"],
    languages: ["English", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "tuesday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "wednesday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "thursday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "friday", slots: [{ start: "07:00", end: "18:00" }] }
      ],
      emergencyAvailable: true,
      isAvailable: true
    },
    rating: {
      average: 4.8,
      count: 98,
      breakdown: {
        quality: 4.8,
        punctuality: 4.9,
        pricing: 4.7,
        professionalism: 4.8
      }
    },
    earnings: {
      total: 38500,
      pending: 1800,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "emergency_expert", "verified"]
  },
  {
    _id: "artisan003",
    userId: {
      _id: "user003",
      name: "Kofi Asante",
      email: "kofi.asante@example.com",
      phone: "+233 20 345 6789",
      profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-345678901-2",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-01-20")
    },
    services: ["carpenter"],
    skills: ["Custom Furniture", "Kitchen Cabinets", "Door Installation", "Roofing", "Wooden Repairs"],
    experience: 12,
    certifications: [
      {
        name: "Master Carpenter",
        issuingOrg: "Ghana Carpenters Union",
        year: 2015
      }
    ],
    businessName: "Kofi Woodworks Ltd",
    serviceAreas: ["Achimota", "Tesano", "Dzorwulu", "Roman Ridge"],
    tools: ["Circular saw", "Router", "Drill press", "Hand planes"],
    languages: ["English", "Twi", "Ewe"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "saturday", slots: [{ start: "08:00", end: "13:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.9,
      count: 156,
      breakdown: {
        quality: 5.0,
        punctuality: 4.8,
        pricing: 4.9,
        professionalism: 4.9
      }
    },
    earnings: {
      total: 62000,
      pending: 3200,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "verified"]
  },
  {
    _id: "artisan004",
    userId: {
      _id: "user004",
      name: "Ama Owusu",
      email: "ama.owusu@example.com",
      phone: "+233 24 456 7890",
      profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-456789012-3",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-03-05")
    },
    services: ["painter"],
    skills: ["Interior Painting", "Exterior Painting", "Wall Texturing", "Color Consulting", "Decorative Finishes"],
    experience: 5,
    certifications: [],
    businessName: "Ama's Paint Perfect",
    serviceAreas: ["Madina", "Adenta", "Atomic", "Haatso"],
    tools: ["Spray gun", "Paint rollers", "Brushes", "Scrapers"],
    languages: ["English", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "08:00", end: "17:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.7,
      count: 84,
      breakdown: {
        quality: 4.8,
        punctuality: 4.7,
        pricing: 4.6,
        professionalism: 4.7
      }
    },
    earnings: {
      total: 28000,
      pending: 1500,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "verified"]
  },
  {
    _id: "artisan005",
    userId: {
      _id: "user005",
      name: "Yaw Boateng",
      email: "yaw.boateng@example.com",
      phone: "+233 26 567 8901",
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-567890123-4",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-02-25")
    },
    services: ["welder"],
    skills: ["Gate Fabrication", "Burglar Proof", "Metal Doors", "Structural Welding", "Stainless Works"],
    experience: 10,
    certifications: [
      {
        name: "Certified Welder",
        issuingOrg: "Ghana Welders Association",
        year: 2017
      }
    ],
    businessName: "Yaw Metal Works",
    serviceAreas: ["Dansoman", "Mamprobi", "Korle Bu", "Abossey Okai"],
    tools: ["MIG welder", "TIG welder", "Angle grinder", "Plasma cutter"],
    languages: ["English", "Ga", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "tuesday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "wednesday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "thursday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "friday", slots: [{ start: "07:00", end: "18:00" }] },
        { day: "saturday", slots: [{ start: "08:00", end: "15:00" }] }
      ],
      emergencyAvailable: true,
      isAvailable: true
    },
    rating: {
      average: 4.8,
      count: 112,
      breakdown: {
        quality: 4.9,
        punctuality: 4.7,
        pricing: 4.8,
        professionalism: 4.8
      }
    },
    earnings: {
      total: 52000,
      pending: 2800,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "quick_response", "verified"]
  },
  {
    _id: "artisan006",
    userId: {
      _id: "user006",
      name: "Abena Adjei",
      email: "abena.adjei@example.com",
      phone: "+233 23 678 9012",
      profilePicture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-678901234-5",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-01-30")
    },
    services: ["ac_tech"],
    skills: ["AC Installation", "AC Repairs", "Refrigerator Repairs", "AC Servicing", "HVAC Systems"],
    experience: 7,
    certifications: [
      {
        name: "HVAC Technician",
        issuingOrg: "Technical Institute Ghana",
        year: 2019
      }
    ],
    businessName: "Cool Breeze Services",
    serviceAreas: ["Osu", "Ridge", "Airport Residential", "Ringway Estates"],
    tools: ["Vacuum pump", "Refrigerant gauges", "Leak detector", "Multimeter"],
    languages: ["English", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "08:00", end: "18:00" }] },
        { day: "tuesday", slots: [{ start: "08:00", end: "18:00" }] },
        { day: "wednesday", slots: [{ start: "08:00", end: "18:00" }] },
        { day: "thursday", slots: [{ start: "08:00", end: "18:00" }] },
        { day: "friday", slots: [{ start: "08:00", end: "18:00" }] },
        { day: "saturday", slots: [{ start: "09:00", end: "14:00" }] }
      ],
      emergencyAvailable: true,
      isAvailable: true
    },
    rating: {
      average: 4.9,
      count: 143,
      breakdown: {
        quality: 4.9,
        punctuality: 5.0,
        pricing: 4.8,
        professionalism: 4.9
      }
    },
    earnings: {
      total: 48000,
      pending: 2200,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "quick_response", "emergency_expert", "verified"]
  },
  {
    _id: "artisan007",
    userId: {
      _id: "user007",
      name: "Kwabena Osei",
      email: "kwabena.osei@example.com",
      phone: "+233 25 789 0123",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-789012345-6",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-03-10")
    },
    services: ["tiler"],
    skills: ["Floor Tiling", "Wall Tiling", "Bathroom Tiling", "Marble Installation", "Tile Repairs"],
    experience: 9,
    certifications: [],
    businessName: "Kwabena Tiles & Floors",
    serviceAreas: ["Taifa", "Dome", "Kwabenya", "Ashongman"],
    tools: ["Tile cutter", "Trowel", "Level", "Grout float"],
    languages: ["English", "Twi", "Ga"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "07:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "07:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "07:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "07:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "07:00", end: "17:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.6,
      count: 76,
      breakdown: {
        quality: 4.7,
        punctuality: 4.5,
        pricing: 4.6,
        professionalism: 4.6
      }
    },
    earnings: {
      total: 32000,
      pending: 1700,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["verified"]
  },
  {
    _id: "artisan008",
    userId: {
      _id: "user008",
      name: "Efua Ansah",
      email: "efua.ansah@example.com",
      phone: "+233 24 890 1234",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-890123456-7",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-02-15")
    },
    services: ["cleaner"],
    skills: ["Deep Cleaning", "Office Cleaning", "Carpet Cleaning", "Window Cleaning", "Move-out Cleaning"],
    experience: 4,
    certifications: [],
    businessName: "Sparkle Clean Services",
    serviceAreas: ["Legon", "Okponglo", "Shiashie", "East Legon"],
    tools: ["Vacuum cleaner", "Steam cleaner", "Cleaning solutions", "Mops"],
    languages: ["English", "Twi", "Ewe"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "08:00", end: "17:00" }] },
        { day: "saturday", slots: [{ start: "09:00", end: "15:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.8,
      count: 92,
      breakdown: {
        quality: 4.9,
        punctuality: 4.8,
        pricing: 4.7,
        professionalism: 4.8
      }
    },
    earnings: {
      total: 24000,
      pending: 1200,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "quick_response", "verified"]
  },
  {
    _id: "artisan009",
    userId: {
      _id: "user009",
      name: "Samuel Nkrumah",
      email: "samuel.nkrumah@example.com",
      phone: "+233 27 901 2345",
      profilePicture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-901234567-8",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-03-01")
    },
    services: ["mason"],
    skills: ["Block Laying", "Plastering", "Foundation Work", "Wall Construction", "Concrete Works"],
    experience: 15,
    certifications: [
      {
        name: "Master Mason",
        issuingOrg: "Ghana Masons Guild",
        year: 2012
      }
    ],
    businessName: "Nkrumah Construction",
    serviceAreas: ["Tema", "Community 1", "Community 25", "Sakumono"],
    tools: ["Trowel", "Spirit level", "Mixer", "Wheelbarrow"],
    languages: ["English", "Ga", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "06:00", end: "17:00" }] },
        { day: "tuesday", slots: [{ start: "06:00", end: "17:00" }] },
        { day: "wednesday", slots: [{ start: "06:00", end: "17:00" }] },
        { day: "thursday", slots: [{ start: "06:00", end: "17:00" }] },
        { day: "friday", slots: [{ start: "06:00", end: "17:00" }] },
        { day: "saturday", slots: [{ start: "07:00", end: "14:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.9,
      count: 189,
      breakdown: {
        quality: 5.0,
        punctuality: 4.8,
        pricing: 4.9,
        professionalism: 4.9
      }
    },
    earnings: {
      total: 78000,
      pending: 4200,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["top_rated", "verified"]
  },
  {
    _id: "artisan010",
    userId: {
      _id: "user010",
      name: "Jennifer Appiah",
      email: "jennifer.appiah@example.com",
      phone: "+233 20 012 3456",
      profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop"
    },
    ghanaCard: {
      number: "GHA-012345678-9",
      verified: true
    },
    backgroundCheck: {
      status: "approved",
      checkedAt: new Date("2024-02-20")
    },
    services: ["gardener"],
    skills: ["Lawn Maintenance", "Garden Design", "Tree Pruning", "Irrigation Systems", "Landscaping"],
    experience: 6,
    certifications: [
      {
        name: "Certified Horticulturist",
        issuingOrg: "Ghana Horticultural Society",
        year: 2020
      }
    ],
    businessName: "Green Fingers Gardens",
    serviceAreas: ["Trasacco", "East Legon", "Airport Hills", "Villagio"],
    tools: ["Lawn mower", "Hedge trimmer", "Pruning shears", "Sprinkler system"],
    languages: ["English", "Twi"],
    availability: {
      regular: [
        { day: "monday", slots: [{ start: "07:00", end: "16:00" }] },
        { day: "tuesday", slots: [{ start: "07:00", end: "16:00" }] },
        { day: "wednesday", slots: [{ start: "07:00", end: "16:00" }] },
        { day: "thursday", slots: [{ start: "07:00", end: "16:00" }] },
        { day: "friday", slots: [{ start: "07:00", end: "16:00" }] },
        { day: "saturday", slots: [{ start: "08:00", end: "13:00" }] }
      ],
      emergencyAvailable: false,
      isAvailable: true
    },
    rating: {
      average: 4.7,
      count: 68,
      breakdown: {
        quality: 4.8,
        punctuality: 4.7,
        pricing: 4.6,
        professionalism: 4.7
      }
    },
    earnings: {
      total: 26000,
      pending: 1400,
      commissionRate: 0.1
    },
    status: "approved",
    probation: false,
    badges: ["verified", "quick_response"]
  }
];

// You can use this in your component like:
// 
// Then use it instead of fetching from API during development