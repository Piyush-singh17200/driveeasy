import { Car, CarFilters } from '../types';

const RAW_FALLBACK_CARS: Omit<Car, 'views' | 'createdAt'>[] = [
  {
    _id: 'car-maruti-swift',
    owner: {
      _id: 'owner-1',
      name: 'Piyush Singh',
      email: 'owner@demo.com',
      role: 'owner',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Maruti Suzuki Swift ZXi+',
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi+',
    year: 2023,
    category: 'Hatchback',
    transmission: 'Manual',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 1200,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Bandra West, Mumbai',
      coordinates: { lat: 19.0596, lng: 72.8295 }
    },
    images: [{ url: '/cars/maruti-swift.jpg', isPrimary: true }],
    features: ['AC', 'Bluetooth', 'Reverse Camera', 'Power Windows', 'ABS', 'Apple CarPlay'],
    description: 'Brand new Swift — perfect city car with excellent mileage of 22 kmpl and smooth handling.',
    isAvailable: true,
    isApproved: true,
    mileage: '22 kmpl',
    rating: { average: 4.8, count: 24 }
  },
  {
    _id: 'car-hyundai-creta',
    owner: {
      _id: 'owner-2',
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      role: 'owner',
      phone: '+91 98111 22233',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Hyundai Creta SX (O)',
    brand: 'Hyundai',
    model: 'Creta SX',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 2800,
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Koramangala, Bangalore',
      coordinates: { lat: 12.9352, lng: 77.6245 }
    },
    images: [{ url: '/cars/hyundai-creta.jpg', isPrimary: true }],
    features: ['Panoramic Sunroof', 'Ventilated Seats', 'BOSE Sound', 'BlueLink', 'Wireless Charger'],
    description: 'Top-spec Creta with panoramic sunroof, plush interiors, and highway cruise control.',
    isAvailable: true,
    isApproved: true,
    mileage: '16 kmpl',
    rating: { average: 4.9, count: 38 }
  },
  {
    _id: 'car-mahindra-thar',
    owner: {
      _id: 'owner-3',
      name: 'Vikas Patel',
      email: 'vikas@demo.com',
      role: 'owner',
      phone: '+91 99887 76655',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Mahindra Thar LX 4x4 Hard Top',
    brand: 'Mahindra',
    model: 'Thar LX',
    year: 2023,
    category: 'SUV',
    transmission: 'Manual',
    fuel: 'Diesel',
    seats: 4,
    pricePerDay: 3200,
    location: {
      city: 'Goa',
      state: 'Goa',
      address: 'Panjim, Goa',
      coordinates: { lat: 15.4909, lng: 73.8278 }
    },
    images: [{ url: '/cars/mahindra-thar.jpg', isPrimary: true }],
    features: ['4x4 Drive', 'Touchscreen Infotainment', 'Convertible Hard Top', 'Off-road Tires'],
    description: 'Iconic 4x4 Thar — made for scenic coastal drives and off-road thrills across Goa.',
    isAvailable: true,
    isApproved: true,
    mileage: '15 kmpl',
    rating: { average: 4.9, count: 52 }
  },
  {
    _id: 'car-bmw-5-series',
    owner: {
      _id: 'owner-4',
      name: 'Ananya Roy',
      email: 'ananya@demo.com',
      role: 'owner',
      phone: '+91 91234 56789',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'BMW 5 Series 530d M Sport',
    brand: 'BMW',
    model: '530d M Sport',
    year: 2022,
    category: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 5,
    pricePerDay: 8500,
    location: {
      city: 'Delhi',
      state: 'Delhi',
      address: 'Connaught Place, New Delhi',
      coordinates: { lat: 28.6315, lng: 77.2167 }
    },
    images: [{ url: '/cars/bmw-5-series.jpg', isPrimary: true }],
    features: ['Dakota Leather', 'Harman Kardon Sound', 'Heads-Up Display', 'Parking Assistant Plus'],
    description: 'Executive luxury sedan with effortless highway performance, prestige, and supreme comfort.',
    isAvailable: true,
    isApproved: true,
    mileage: '17 kmpl',
    rating: { average: 5.0, count: 18 }
  },
  {
    _id: 'car-tata-nexon-ev',
    owner: {
      _id: 'owner-1',
      name: 'Piyush Singh',
      email: 'owner@demo.com',
      role: 'owner',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Tata Nexon EV Max Long Range',
    brand: 'Tata',
    model: 'Nexon EV Max',
    year: 2023,
    category: 'Electric',
    transmission: 'Automatic',
    fuel: 'Electric',
    seats: 5,
    pricePerDay: 2200,
    location: {
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Wakad, Pune',
      coordinates: { lat: 18.5987, lng: 73.7656 }
    },
    images: [{ url: '/cars/tata-nexon-ev.jpg', isPrimary: true }],
    features: ['453km Range', 'Fast Charging (CCS2)', 'Ventilated Seats', 'Harman Audio', 'Auto Hold'],
    description: 'Eco-friendly, fast, and quiet EV with genuine 400+ km real-world range for weekend trips.',
    isAvailable: true,
    isApproved: true,
    mileage: '453 km/charge',
    rating: { average: 4.7, count: 29 }
  },
  {
    _id: 'car-toyota-innova-crysta',
    owner: {
      _id: 'owner-2',
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      role: 'owner',
      phone: '+91 98111 22233',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Toyota Innova Crysta ZX 7-Seater',
    brand: 'Toyota',
    model: 'Innova Crysta ZX',
    year: 2022,
    category: 'Van',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    pricePerDay: 3500,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Andheri East, Mumbai',
      coordinates: { lat: 19.1136, lng: 72.8697 }
    },
    images: [{ url: '/cars/toyota-innova-crysta.jpg', isPrimary: true }],
    features: ['Captain Seats', 'Dual Climate AC', 'Touchscreen Display', 'Cruise Control'],
    description: 'The undefeated king of long distance comfort. Unmatched reliability for family holidays.',
    isAvailable: true,
    isApproved: true,
    mileage: '14 kmpl',
    rating: { average: 4.8, count: 64 }
  },
  {
    _id: 'car-audi-a4',
    owner: {
      _id: 'owner-4',
      name: 'Ananya Roy',
      email: 'ananya@demo.com',
      role: 'owner',
      phone: '+91 91234 56789',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Audi A4 Premium Plus 40 TFSI',
    brand: 'Audi',
    model: 'A4 Premium Plus',
    year: 2022,
    category: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 9000,
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Indiranagar, Bangalore',
      coordinates: { lat: 12.9784, lng: 77.6408 }
    },
    images: [{ url: '/cars/audi-a4.jpg', isPrimary: true }],
    features: ['Virtual Cockpit', 'MMI Navigation Plus', 'Bang & Olufsen 3D Sound', 'Matrix LED'],
    description: 'Sophisticated German engineering with cutting-edge digital cockpit and smooth acceleration.',
    isAvailable: true,
    isApproved: true,
    mileage: '14 kmpl',
    rating: { average: 4.9, count: 21 }
  },
  {
    _id: 'car-mercedes-c-class',
    owner: {
      _id: 'owner-4',
      name: 'Ananya Roy',
      email: 'ananya@demo.com',
      role: 'owner',
      phone: '+91 91234 56789',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Mercedes-Benz C 200 AMG Line',
    brand: 'Mercedes-Benz',
    model: 'C 200',
    year: 2023,
    category: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 9500,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Worli Seaface, Mumbai',
      coordinates: { lat: 19.0144, lng: 72.8184 }
    },
    images: [{ url: '/cars/mercedes-c-class.jpg', isPrimary: true }],
    features: ['MBUX Multimedia', 'Burmester Surround Sound', 'Active Brake Assist', 'Ambient Lighting'],
    description: 'Modern luxury icon — seamless poise, AMG body styling, and unparalleled ride sophistication.',
    isAvailable: true,
    isApproved: true,
    mileage: '13 kmpl',
    rating: { average: 5.0, count: 15 }
  },
  {
    _id: 'car-toyota-fortuner',
    owner: {
      _id: 'owner-3',
      name: 'Vikas Patel',
      email: 'vikas@demo.com',
      role: 'owner',
      phone: '+91 99887 76655',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Toyota Fortuner Legender 4x4',
    brand: 'Toyota',
    model: 'Fortuner Legender',
    year: 2022,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    pricePerDay: 5500,
    location: {
      city: 'Delhi',
      state: 'Delhi',
      address: 'Dwarka, New Delhi',
      coordinates: { lat: 28.5921, lng: 77.0460 }
    },
    images: [{ url: '/cars/toyota-fortuner-legender.jpg', isPrimary: true }],
    features: ['4x4 Drive', 'JBL 11-Speaker Audio', 'Panoramic View Monitor', 'Wireless Charger'],
    description: 'Dominating road presence and relentless 4x4 power for both highway cruising and tough terrains.',
    isAvailable: true,
    isApproved: true,
    mileage: '14 kmpl',
    rating: { average: 4.8, count: 43 }
  },
  {
    _id: 'car-hyundai-verna',
    owner: {
      _id: 'owner-1',
      name: 'Piyush Singh',
      email: 'owner@demo.com',
      role: 'owner',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Hyundai Verna SX Turbo DCT',
    brand: 'Hyundai',
    model: 'Verna SX Turbo',
    year: 2023,
    category: 'Sedan',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 2000,
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'OMR, Chennai',
      coordinates: { lat: 12.9716, lng: 80.2458 }
    },
    images: [{ url: '/cars/hyundai-verna.jpg', isPrimary: true }],
    features: ['160PS Turbo Engine', 'Level 2 ADAS', 'Bose 8-Speaker System', 'Ventilated & Heated Seats'],
    description: 'Futuristic fastback styling with 160 horsepower turbo performance and ADAS safety features.',
    isAvailable: true,
    isApproved: true,
    mileage: '20 kmpl',
    rating: { average: 4.6, count: 27 }
  },
  {
    _id: 'car-mahindra-scorpio-n',
    owner: {
      _id: 'owner-3',
      name: 'Vikas Patel',
      email: 'vikas@demo.com',
      role: 'owner',
      phone: '+91 99887 76655',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Mahindra Scorpio-N Z8L 4xplor',
    brand: 'Mahindra',
    model: 'Scorpio-N Z8L',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 7,
    pricePerDay: 4000,
    location: {
      city: 'Jaipur',
      state: 'Rajasthan',
      address: 'Malviya Nagar, Jaipur',
      coordinates: { lat: 26.8530, lng: 75.8202 }
    },
    images: [{ url: '/cars/mahindra-scorpio-n.jpg', isPrimary: true }],
    features: ['Sony 12-Speaker 3D Audio', 'AdrenoX AI', 'Wireless Apple CarPlay', 'Dual Zone FATC'],
    description: 'The Big Daddy of SUVs — towering seating stance, refined diesel engine, and rugged capabilities.',
    isAvailable: true,
    isApproved: true,
    mileage: '15 kmpl',
    rating: { average: 4.7, count: 33 }
  },
  {
    _id: 'car-porsche-cayenne',
    owner: {
      _id: 'owner-4',
      name: 'Ananya Roy',
      email: 'ananya@demo.com',
      role: 'owner',
      phone: '+91 91234 56789',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Porsche Cayenne S V6 Twin-Turbo',
    brand: 'Porsche',
    model: 'Cayenne S',
    year: 2022,
    category: 'Sports',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 18000,
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Juhu Tara Road, Mumbai',
      coordinates: { lat: 19.0988, lng: 72.8267 }
    },
    images: [{ url: '/cars/porsche-cayenne.jpg', isPrimary: true }],
    features: ['Sport Chrono Package', 'Adaptive Air Suspension', 'Bose Surround', 'Panoramic Roof'],
    description: 'Pure sports car DNA in an ultra-luxurious SUV chassis. 440 horsepower exhilarating thrill.',
    isAvailable: true,
    isApproved: true,
    mileage: '10 kmpl',
    rating: { average: 5.0, count: 12 }
  },
  {
    _id: 'car-kia-seltos',
    owner: {
      _id: 'owner-2',
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      role: 'owner',
      phone: '+91 98111 22233',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Kia Seltos Facelift GTX+ DCT',
    brand: 'Kia',
    model: 'Seltos GTX+',
    year: 2023,
    category: 'SUV',
    transmission: 'Automatic',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 2400,
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Madhapur, Hitech City, Hyderabad',
      coordinates: { lat: 17.4483, lng: 78.3915 }
    },
    images: [{ url: '/cars/kia-seltos.jpg', isPrimary: true }],
    features: ['Panoramic Sunroof', 'Dual 10.25-inch Screens', 'Bose 8 Speakers', 'Level 2 ADAS'],
    description: 'Sharp aesthetics, connected car technology, and punchy turbo engine for daily city commutes.',
    isAvailable: true,
    isApproved: true,
    mileage: '16 kmpl',
    rating: { average: 4.7, count: 35 }
  },
  {
    _id: 'car-honda-city',
    owner: {
      _id: 'owner-1',
      name: 'Piyush Singh',
      email: 'owner@demo.com',
      role: 'owner',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Honda City 5th Gen ZX i-VTEC',
    brand: 'Honda',
    model: 'City 5th Gen',
    year: 2022,
    category: 'Sedan',
    transmission: 'CVT',
    fuel: 'Petrol',
    seats: 5,
    pricePerDay: 1800,
    location: {
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'Anna Nagar, Chennai',
      coordinates: { lat: 13.0850, lng: 80.2101 }
    },
    images: [{ url: '/cars/honda-city.jpg', isPrimary: true }],
    features: ['Honda Sensing ADAS', 'LaneWatch Camera', 'Electric Sunroof', 'Leather Upholstery'],
    description: 'Smooth i-VTEC engine, class-leading rear legroom, and effortless automatic CVT transmission.',
    isAvailable: true,
    isApproved: true,
    mileage: '18 kmpl',
    rating: { average: 4.6, count: 41 }
  },
  {
    _id: 'car-tata-punch-ev',
    owner: {
      _id: 'owner-1',
      name: 'Piyush Singh',
      email: 'owner@demo.com',
      role: 'owner',
      phone: '+91 98765 43210',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Tata Punch EV Empowered Plus',
    brand: 'Tata',
    model: 'Punch EV Empowered',
    year: 2024,
    category: 'Electric',
    transmission: 'Automatic',
    fuel: 'Electric',
    seats: 5,
    pricePerDay: 1600,
    location: {
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Whitefield, Bangalore',
      coordinates: { lat: 12.9698, lng: 77.7500 }
    },
    images: [{ url: '/cars/tata-punch-ev.jpg', isPrimary: true }],
    features: ['421km Range', '360 Camera', 'Voice Assisted Sunroof', 'Air Purifier', 'Paddle Shifters for Regen'],
    description: 'Zippy city electric compact SUV with quick acceleration, 5-star safety rating, and ultra-low run costs.',
    isAvailable: true,
    isApproved: true,
    mileage: '421 km/charge',
    rating: { average: 4.8, count: 19 }
  },
  {
    _id: 'car-range-rover-sport',
    owner: {
      _id: 'owner-4',
      name: 'Ananya Roy',
      email: 'ananya@demo.com',
      role: 'owner',
      phone: '+91 91234 56789',
      isVerified: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    name: 'Range Rover Sport Dynamic SE',
    brand: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2023,
    category: 'Luxury',
    transmission: 'Automatic',
    fuel: 'Diesel',
    seats: 5,
    pricePerDay: 15000,
    location: {
      city: 'Delhi',
      state: 'Delhi',
      address: 'South Extension, New Delhi',
      coordinates: { lat: 28.5729, lng: 77.2219 }
    },
    images: [{ url: '/cars/range-rover-sport.jpg', isPrimary: true }],
    features: ['Terrain Response 2', 'Meridian 3D Sound', 'Pixel LED Headlights', 'Dynamic Air Suspension'],
    description: 'The pinnacle of presence, comfort, and unmatched British craftsmanship for high-profile journeys.',
    isAvailable: true,
    isApproved: true,
    mileage: '12 kmpl',
    rating: { average: 5.0, count: 14 }
  }
];

export const FALLBACK_CARS: Car[] = RAW_FALLBACK_CARS.map(car => ({
  ...car,
  views: 180,
  createdAt: '2024-01-01T00:00:00.000Z',
}));

export function getFallbackCarsResponse(params?: CarFilters & { search?: string; sortBy?: string; order?: string }) {
  let filtered = [...FALLBACK_CARS];

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      c => c.name.toLowerCase().includes(q) ||
           c.brand.toLowerCase().includes(q) ||
           c.model.toLowerCase().includes(q) ||
           c.location.city.toLowerCase().includes(q)
    );
  }

  if (params?.city) {
    filtered = filtered.filter(c => c.location.city.toLowerCase().includes(params.city!.toLowerCase()));
  }

  if (params?.category) {
    filtered = filtered.filter(c => c.category === params.category);
  }

  if (params?.fuel) {
    filtered = filtered.filter(c => c.fuel === params.fuel);
  }

  if (params?.transmission) {
    filtered = filtered.filter(c => c.transmission === params.transmission);
  }

  if (params?.seats) {
    filtered = filtered.filter(c => c.seats >= Number(params.seats));
  }

  if (params?.minPrice) {
    filtered = filtered.filter(c => c.pricePerDay >= Number(params.minPrice));
  }

  if (params?.maxPrice) {
    filtered = filtered.filter(c => c.pricePerDay <= Number(params.maxPrice));
  }

  if (params?.available !== undefined) {
    filtered = filtered.filter(c => c.isAvailable === params.available);
  }

  // Sort
  const sortBy = params?.sortBy || 'rating.average';
  const order = params?.order || 'desc';
  filtered.sort((a, b) => {
    let valA: any = a;
    let valB: any = b;
    if (sortBy === 'pricePerDay') {
      valA = a.pricePerDay;
      valB = b.pricePerDay;
    } else if (sortBy === 'rating.average') {
      valA = a.rating.average;
      valB = b.rating.average;
    } else {
      valA = a.name;
      valB = b.name;
    }
    if (order === 'asc') return valA > valB ? 1 : -1;
    return valA < valB ? 1 : -1;
  });

  const page = Number(params?.page) || 1;
  const limit = Number(params?.limit) || 12;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginatedCars = filtered.slice(start, start + limit);

  return {
    success: true,
    cars: paginatedCars,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  };
}

export function getFallbackCarById(id: string): Car | undefined {
  return FALLBACK_CARS.find(c => c._id === id) || FALLBACK_CARS[0];
}
