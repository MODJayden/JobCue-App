export  const services = [
  // PLUMBING
  {
    name: "Plumber",
    category: "plumbing",
    description:
      "General plumbing services including leak repairs, pipe installation, toilet and sink fixes, water heater installation",
    icon: "🔧",
    image: "/images/services/plumber.jpg",
    basePriceRange: { min: 80, max: 500, currency: "GHS" },
    emergencySurcharge: 0.3,
    averageDuration: 90,
    isActive: true,
    tags: ["leak", "pipe", "water", "drain", "toilet", "sink", "tap"],
    commonIssues: [
      "Leaking tap/faucet",
      "Blocked drain",
      "Burst pipe",
      "Toilet not flushing",
      "Low water pressure",
      "Water heater problems",
      "Pipe installation",
    ],
    requiresCertification: false,
  },

  // ELECTRICAL
  {
    name: "Electrician",
    category: "electrical",
    description:
      "Electrical wiring, installations, repairs, circuit breakers, lighting, and power solutions",
    icon: "⚡",
    image: "/images/services/electrician.jpg",
    basePriceRange: { min: 100, max: 800, currency: "GHS" },
    emergencySurcharge: 0.4,
    averageDuration: 120,
    isActive: true,
    tags: ["wiring", "power", "lights", "socket", "electricity", "breaker"],
    commonIssues: [
      "Power outage in home",
      "Faulty light switch",
      "Socket not working",
      "Circuit breaker tripping",
      "New socket installation",
      "Ceiling fan installation",
      "Flickering lights",
      "Electrical rewiring",
    ],
    requiresCertification: true,
  },

  // CARPENTRY
  {
    name: "Carpenter",
    category: "construction",
    description:
      "Furniture making, repairs, door and window installation, custom woodwork",
    icon: "🪚",
    image: "/images/services/carpenter.jpg",
    basePriceRange: { min: 150, max: 1200, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 180,
    isActive: true,
    tags: ["furniture", "door", "window", "wood", "cabinet", "shelf"],
    commonIssues: [
      "Door repair",
      "Window installation",
      "Cabinet making",
      "Furniture repair",
      "Custom shelving",
      "Wardrobe installation",
      "Broken door hinges",
    ],
    requiresCertification: false,
  },

  // PAINTING
  {
    name: "Painter",
    category: "home_repair",
    description:
      "Interior and exterior painting, wall decoration, texture painting",
    icon: "🎨",
    image: "/images/services/painter.jpg",
    basePriceRange: { min: 200, max: 2000, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 240,
    isActive: true,
    tags: ["paint", "wall", "color", "interior", "exterior", "decoration"],
    commonIssues: [
      "Room painting",
      "Exterior wall painting",
      "Peeling paint repair",
      "Wall texture",
      "Color consultation",
      "Ceiling painting",
    ],
    requiresCertification: false,
  },

  // AC & REFRIGERATION
  {
    name: "AC Technician",
    category: "electrical",
    description:
      "Air conditioner installation, repair, servicing, and maintenance",
    icon: "❄️",
    image: "/images/services/ac-tech.jpg",
    basePriceRange: { min: 120, max: 800, currency: "GHS" },
    emergencySurcharge: 0.35,
    averageDuration: 90,
    isActive: true,
    tags: ["ac", "aircon", "cooling", "refrigerator", "cold"],
    commonIssues: [
      "AC not cooling",
      "AC making noise",
      "AC installation",
      "AC gas refill",
      "AC servicing",
      "Refrigerator repair",
      "Water leaking from AC",
    ],
    requiresCertification: true,
  },

  // MASONRY
  {
    name: "Mason",
    category: "construction",
    description: "Brickwork, plastering, tile installation, concrete work",
    icon: "🧱",
    image: "/images/services/mason.jpg",
    basePriceRange: { min: 200, max: 3000, currency: "GHS" },
    emergencySurcharge: 0.15,
    averageDuration: 300,
    isActive: true,
    tags: ["brick", "wall", "concrete", "plaster", "tile", "cement"],
    commonIssues: [
      "Wall plastering",
      "Tile installation",
      "Brick wall construction",
      "Concrete flooring",
      "Wall repair",
      "Foundation work",
    ],
    requiresCertification: false,
  },

  // ROOFING
  {
    name: "Roofing Specialist",
    category: "construction",
    description: "Roof installation, repairs, leak fixing, gutter work",
    icon: "🏠",
    image: "/images/services/roofer.jpg",
    basePriceRange: { min: 300, max: 5000, currency: "GHS" },
    emergencySurcharge: 0.5,
    averageDuration: 360,
    isActive: true,
    tags: ["roof", "leak", "gutter", "ceiling", "zinc", "tiles"],
    commonIssues: [
      "Roof leaking",
      "Gutter repair",
      "Roof installation",
      "Ceiling repair",
      "Roof tiles replacement",
      "Zinc roofing",
    ],
    requiresCertification: false,
  },

  // WELDING
  {
    name: "Welder",
    category: "construction",
    description:
      "Metal fabrication, gate installation, burglar proof, railings",
    icon: "🔥",
    image: "/images/services/welder.jpg",
    basePriceRange: { min: 150, max: 2500, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 180,
    isActive: true,
    tags: ["metal", "gate", "burglar proof", "railing", "iron", "steel"],
    commonIssues: [
      "Gate installation",
      "Burglar proof installation",
      "Metal railing",
      "Gate repair",
      "Metal door fabrication",
      "Window grills",
    ],
    requiresCertification: false,
  },

  // APPLIANCE REPAIR
  {
    name: "Appliance Repair Technician",
    category: "electrical",
    description:
      "Repair of washing machines, microwaves, ovens, and other home appliances",
    icon: "🔌",
    image: "/images/services/appliance.jpg",
    basePriceRange: { min: 80, max: 600, currency: "GHS" },
    emergencySurcharge: 0.25,
    averageDuration: 90,
    isActive: true,
    tags: ["washing machine", "microwave", "oven", "appliance", "repair"],
    commonIssues: [
      "Washing machine not spinning",
      "Microwave not heating",
      "Oven not working",
      "Refrigerator not cooling",
      "Dryer issues",
      "Dishwasher problems",
    ],
    requiresCertification: false,
  },

  // GENERATOR TECHNICIAN
  {
    name: "Generator Technician",
    category: "electrical",
    description: "Generator installation, repair, servicing, and maintenance",
    icon: "⚙️",
    image: "/images/services/generator.jpg",
    basePriceRange: { min: 150, max: 1000, currency: "GHS" },
    emergencySurcharge: 0.4,
    averageDuration: 120,
    isActive: true,
    tags: ["generator", "power", "backup", "fuel", "engine"],
    commonIssues: [
      "Generator not starting",
      "Generator installation",
      "Generator servicing",
      "Fuel system issues",
      "Generator making noise",
      "Low power output",
    ],
    requiresCertification: true,
  },

  // LOCKSMITH
  {
    name: "Locksmith",
    category: "home_repair",
    description:
      "Lock installation, repair, key duplication, emergency lockout services",
    icon: "🔑",
    image: "/images/services/locksmith.jpg",
    basePriceRange: { min: 50, max: 400, currency: "GHS" },
    emergencySurcharge: 0.5,
    averageDuration: 45,
    isActive: true,
    tags: ["lock", "key", "door", "security", "lockout"],
    commonIssues: [
      "Locked out of house",
      "Lock installation",
      "Key duplication",
      "Lock repair",
      "Broken key in lock",
      "Door lock replacement",
    ],
    requiresCertification: false,
  },

  // TILING
  {
    name: "Tiler",
    category: "construction",
    description:
      "Floor and wall tiling, ceramic, porcelain, marble installation",
    icon: "⬜",
    image: "/images/services/tiler.jpg",
    basePriceRange: { min: 180, max: 2500, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 240,
    isActive: true,
    tags: ["tile", "floor", "ceramic", "bathroom", "kitchen", "marble"],
    commonIssues: [
      "Floor tiling",
      "Bathroom tiling",
      "Kitchen backsplash",
      "Broken tile replacement",
      "Wall tiling",
      "Marble installation",
    ],
    requiresCertification: false,
  },

  // CLEANER
  {
    name: "House Cleaner",
    category: "cleaning",
    description:
      "General house cleaning, deep cleaning, move-in/move-out cleaning",
    icon: "🧹",
    image: "/images/services/cleaner.jpg",
    basePriceRange: { min: 60, max: 400, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 180,
    isActive: true,
    tags: ["clean", "cleaning", "house", "deep clean", "sanitize"],
    commonIssues: [
      "General house cleaning",
      "Deep cleaning",
      "Move-out cleaning",
      "Kitchen cleaning",
      "Bathroom cleaning",
      "Window cleaning",
    ],
    requiresCertification: false,
  },

  // PEST CONTROL
  {
    name: "Pest Control Specialist",
    category: "home_repair",
    description:
      "Fumigation, termite treatment, rodent control, insect extermination",
    icon: "🐛",
    image: "/images/services/pest-control.jpg",
    basePriceRange: { min: 120, max: 800, currency: "GHS" },
    emergencySurcharge: 0.3,
    averageDuration: 120,
    isActive: true,
    tags: ["fumigation", "pest", "termite", "rodent", "insect", "cockroach"],
    commonIssues: [
      "Cockroach infestation",
      "Termite treatment",
      "Rat/rodent control",
      "Bed bugs",
      "Mosquito control",
      "General fumigation",
    ],
    requiresCertification: true,
  },

  // GARDENER
  {
    name: "Gardener",
    category: "home_repair",
    description: "Lawn maintenance, landscaping, tree trimming, garden design",
    icon: "🌿",
    image: "/images/services/gardener.jpg",
    basePriceRange: { min: 80, max: 600, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 150,
    isActive: true,
    tags: ["garden", "lawn", "grass", "tree", "plant", "landscape"],
    commonIssues: [
      "Lawn mowing",
      "Tree trimming",
      "Garden maintenance",
      "Landscaping",
      "Weed removal",
      "Plant installation",
    ],
    requiresCertification: false,
  },

  // SATELLITE/DSTV INSTALLER
  {
    name: "Satellite TV Installer",
    category: "electrical",
    description:
      "DSTV, GoTV, StarTimes installation, decoder setup, dish alignment",
    icon: "📡",
    image: "/images/services/satellite.jpg",
    basePriceRange: { min: 80, max: 300, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 90,
    isActive: true,
    tags: ["dstv", "gotv", "satellite", "decoder", "tv", "installation"],
    commonIssues: [
      "DSTV installation",
      "Dish alignment",
      "Signal loss",
      "Decoder setup",
      "GoTV installation",
      "Extra decoder installation",
    ],
    requiresCertification: false,
  },

  // CCTV INSTALLER
  {
    name: "CCTV & Security Systems Installer",
    category: "electrical",
    description:
      "CCTV camera installation, security alarm systems, access control",
    icon: "📹",
    image: "/images/services/cctv.jpg",
    basePriceRange: { min: 200, max: 3000, currency: "GHS" },
    emergencySurcharge: 0.3,
    averageDuration: 180,
    isActive: true,
    tags: ["cctv", "camera", "security", "alarm", "surveillance"],
    commonIssues: [
      "CCTV installation",
      "Security alarm installation",
      "Camera not working",
      "DVR setup",
      "Remote viewing setup",
      "Additional cameras",
    ],
    requiresCertification: false,
  },

  // SOLAR INSTALLER
  {
    name: "Solar Panel Installer",
    category: "electrical",
    description:
      "Solar panel installation, inverter setup, battery systems, solar maintenance",
    icon: "☀️",
    image: "/images/services/solar.jpg",
    basePriceRange: { min: 500, max: 15000, currency: "GHS" },
    emergencySurcharge: 0.15,
    averageDuration: 360,
    isActive: true,
    tags: ["solar", "panel", "inverter", "battery", "renewable", "power"],
    commonIssues: [
      "Solar panel installation",
      "Inverter installation",
      "Battery replacement",
      "System not charging",
      "Panel cleaning",
      "System upgrade",
    ],
    requiresCertification: true,
  },

  // PHONE/LAPTOP REPAIR
  {
    name: "Phone & Laptop Repair Technician",
    category: "electrical",
    description:
      "Smartphone repair, laptop repair, screen replacement, software fixes",
    icon: "📱",
    image: "/images/services/phone-repair.jpg",
    basePriceRange: { min: 50, max: 800, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 60,
    isActive: true,
    tags: ["phone", "laptop", "screen", "repair", "software", "hardware"],
    commonIssues: [
      "Cracked screen",
      "Battery replacement",
      "Water damage",
      "Software issues",
      "Charging port repair",
      "Laptop not turning on",
    ],
    requiresCertification: false,
  },

  // UPHOLSTERY
  {
    name: "Upholstery Specialist",
    category: "home_repair",
    description:
      "Furniture upholstery, sofa repair, chair covering, cushion replacement",
    icon: "🛋️",
    image: "/images/services/upholstery.jpg",
    basePriceRange: { min: 150, max: 1500, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 180,
    isActive: true,
    tags: ["furniture", "sofa", "chair", "upholstery", "cushion", "fabric"],
    commonIssues: [
      "Sofa upholstery",
      "Chair covering",
      "Cushion replacement",
      "Furniture repair",
      "Leather repair",
      "Car seat upholstery",
    ],
    requiresCertification: false,
  },

  // BOREHOLE DRILLER
  {
    name: "Borehole Driller",
    category: "plumbing",
    description:
      "Borehole drilling, water pump installation, borehole maintenance",
    icon: "💧",
    image: "/images/services/borehole.jpg",
    basePriceRange: { min: 3000, max: 20000, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 720,
    isActive: true,
    tags: ["borehole", "water", "drilling", "pump", "well"],
    commonIssues: [
      "Borehole drilling",
      "Water pump installation",
      "Pump not working",
      "Borehole maintenance",
      "Low water yield",
      "Pump replacement",
    ],
    requiresCertification: true,
  },

  // ALUMINUM FABRICATOR
  {
    name: "Aluminum Fabricator",
    category: "construction",
    description:
      "Aluminum doors, windows, sliding doors, partitions, shop fronts",
    icon: "🪟",
    image: "/images/services/aluminum.jpg",
    basePriceRange: { min: 200, max: 5000, currency: "GHS" },
    emergencySurcharge: 0.15,
    averageDuration: 240,
    isActive: true,
    tags: ["aluminum", "window", "door", "sliding", "glass", "partition"],
    commonIssues: [
      "Aluminum window installation",
      "Sliding door installation",
      "Shop front fabrication",
      "Glass door installation",
      "Partition installation",
      "Window repair",
    ],
    requiresCertification: false,
  },

  // POP CEILING
  {
    name: "POP Ceiling Installer",
    category: "construction",
    description:
      "Plaster of Paris ceiling, false ceiling, ceiling decoration, cornices",
    icon: "⬜",
    image: "/images/services/pop-ceiling.jpg",
    basePriceRange: { min: 300, max: 3000, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 300,
    isActive: true,
    tags: ["ceiling", "pop", "plaster", "false ceiling", "decoration"],
    commonIssues: [
      "POP ceiling installation",
      "False ceiling",
      "Ceiling repair",
      "Cornice installation",
      "Ceiling decoration",
      "Ceiling painting",
    ],
    requiresCertification: false,
  },

  // SWIMMING POOL
  {
    name: "Swimming Pool Technician",
    category: "home_repair",
    description:
      "Pool construction, maintenance, cleaning, pump repair, chemical balancing",
    icon: "🏊",
    image: "/images/services/pool.jpg",
    basePriceRange: { min: 200, max: 50000, currency: "GHS" },
    emergencySurcharge: 0.2,
    averageDuration: 240,
    isActive: true,
    tags: ["pool", "swimming", "water", "pump", "cleaning", "maintenance"],
    commonIssues: [
      "Pool cleaning",
      "Pool maintenance",
      "Pump repair",
      "Green/cloudy water",
      "Leak repair",
      "Chemical balancing",
    ],
    requiresCertification: true,
  },

  // INTERIOR DECORATOR
  {
    name: "Interior Decorator",
    category: "home_repair",
    description:
      "Interior design, color consultation, furniture arrangement, home styling",
    icon: "🎨",
    image: "/images/services/interior.jpg",
    basePriceRange: { min: 500, max: 10000, currency: "GHS" },
    emergencySurcharge: 0.1,
    averageDuration: 300,
    isActive: true,
    tags: ["interior", "design", "decoration", "styling", "furniture"],
    commonIssues: [
      "Room makeover",
      "Color consultation",
      "Furniture arrangement",
      "Curtain installation",
      "Wall decoration",
      "Home staging",
    ],
    requiresCertification: false,
  },
];
