// ─── AgroSense Mock Data ────────────────────────────────────────────────────

export const CROPS = [
  { id: 1, name: "Tomato", emoji: "🍅", category: "vegetable", price: 28, unit: "kg", trend: "up" },
  { id: 2, name: "Onion", emoji: "🧅", category: "vegetable", price: 22, unit: "kg", trend: "down" },
  { id: 3, name: "Potato", emoji: "🥔", category: "vegetable", price: 18, unit: "kg", trend: "stable" },
  { id: 4, name: "Chilli", emoji: "🌶️", category: "dry", price: 95, unit: "kg", trend: "up" },
  { id: 5, name: "Turmeric", emoji: "🟡", category: "dry", price: 120, unit: "kg", trend: "up" },
  { id: 6, name: "Rice", emoji: "🌾", category: "grain", price: 42, unit: "kg", trend: "stable" },
  { id: 7, name: "Wheat", emoji: "🌾", category: "grain", price: 38, unit: "kg", trend: "stable" },
  { id: 8, name: "Millet", emoji: "🌿", category: "grain", price: 55, unit: "kg", trend: "up" },
  { id: 9, name: "Pulses", emoji: "🫘", category: "dry", price: 85, unit: "kg", trend: "stable" },
  { id: 10, name: "Maize", emoji: "🌽", category: "grain", price: 25, unit: "kg", trend: "down" },
];

export const FARMERS = [
  { id: 1, name: "Ramesh Kumar", village: "Warangal", crop: "Tomato", variety: "Hybrid", area: 3.5, rating: 4.7, certified: "organic", avatar: "RK" },
  { id: 2, name: "Sunita Devi", village: "Karimnagar", crop: "Onion", variety: "Red Nashik", area: 2.0, rating: 4.3, certified: "gradeA", avatar: "SD" },
  { id: 3, name: "Prakash Rao", village: "Nizamabad", crop: "Chilli", variety: "Teja", area: 4.0, rating: 4.9, certified: "govt", avatar: "PR" },
  { id: 4, name: "Meena Bai", village: "Adilabad", crop: "Turmeric", variety: "Erode", area: 1.5, rating: 4.5, certified: "organic", avatar: "MB" },
  { id: 5, name: "Vijay Singh", village: "Khammam", crop: "Potato", variety: "Kufri", area: 5.0, rating: 4.1, certified: null, avatar: "VS" },
];

export const MARKETPLACE_LISTINGS = [
  { id: 1, farmerId: 1, crop: "Tomato", quantity: 5000, unit: "kg", price: 28, harvestDate: "2024-10-15", location: "Warangal", certified: "organic", image: "🍅", daysLeft: 7 },
  { id: 2, farmerId: 3, crop: "Chilli (Dry)", quantity: 800, unit: "kg", price: 95, harvestDate: "2024-10-20", location: "Nizamabad", certified: "govt", image: "🌶️", daysLeft: 12 },
  { id: 3, farmerId: 2, crop: "Onion", quantity: 3000, unit: "kg", price: 22, harvestDate: "2024-10-18", location: "Karimnagar", certified: "gradeA", image: "🧅", daysLeft: 10 },
  { id: 4, farmerId: 4, crop: "Turmeric", quantity: 1200, unit: "kg", price: 120, harvestDate: "2024-11-01", location: "Adilabad", certified: "organic", image: "🟡", daysLeft: 24 },
  { id: 5, farmerId: 5, crop: "Potato", quantity: 8000, unit: "kg", price: 18, harvestDate: "2024-10-25", location: "Khammam", certified: null, image: "🥔", daysLeft: 17 },
  { id: 6, farmerId: 1, crop: "Millet", quantity: 2500, unit: "kg", price: 55, harvestDate: "2024-11-05", location: "Warangal", certified: "gradeA", image: "🌿", daysLeft: 28 },
];

export const WEATHER_DATA = {
  current: { temp: 32, humidity: 68, wind: 12, rainfall: 0, condition: "Partly Cloudy", icon: "⛅" },
  forecast: [
    { day: "Today", high: 33, low: 24, rain: 10, icon: "⛅" },
    { day: "Tue", high: 30, low: 22, rain: 60, icon: "🌧️" },
    { day: "Wed", high: 28, low: 21, rain: 80, icon: "⛈️" },
    { day: "Thu", high: 29, low: 22, rain: 40, icon: "🌦️" },
    { day: "Fri", high: 32, low: 23, rain: 15, icon: "🌤️" },
  ],
  alerts: [
    { type: "warning", message: "Heavy rainfall expected in 2 days. Consider early harvest for ripe crops.", icon: "⚠️" },
  ],
  sunrise: "06:12 AM",
  sunset: "06:34 PM",
};

export const DEMAND_TREND_DATA = [
  { month: "Oct", tomato: 4200, onion: 3800, chilli: 1200, turmeric: 900, potato: 5500 },
  { month: "Nov", tomato: 4800, onion: 3200, chilli: 1400, turmeric: 1100, potato: 4800 },
  { month: "Dec", tomato: 5200, onion: 4100, chilli: 1800, turmeric: 1300, potato: 5200 },
  { month: "Jan", tomato: 4600, onion: 4500, chilli: 2100, turmeric: 1500, potato: 6000 },
  { month: "Feb", tomato: 3900, onion: 3900, chilli: 1900, turmeric: 1200, potato: 5100 },
  { month: "Mar", tomato: 3200, onion: 3100, chilli: 1600, turmeric: 1000, potato: 4200 },
];

export const PRICE_FORECAST = [
  { crop: "Tomato", current: 28, predicted: 35, change: 25 },
  { crop: "Onion", current: 22, predicted: 19, change: -13 },
  { crop: "Chilli", current: 95, predicted: 110, change: 16 },
  { crop: "Turmeric", current: 120, predicted: 135, change: 12 },
  { crop: "Potato", current: 18, predicted: 16, change: -11 },
  { crop: "Millet", current: 55, predicted: 62, change: 13 },
];

export const SUPPLY_HEATMAP = [
  { district: "Warangal", tomato: 85, onion: 40, chilli: 20, potato: 60, turmeric: 10 },
  { district: "Karimnagar", tomato: 30, onion: 90, chilli: 15, potato: 45, turmeric: 25 },
  { district: "Nizamabad", tomato: 20, onion: 35, chilli: 95, potato: 30, turmeric: 80 },
  { district: "Adilabad", tomato: 15, onion: 20, chilli: 40, potato: 25, turmeric: 92 },
  { district: "Khammam", tomato: 50, onion: 60, chilli: 30, potato: 88, turmeric: 15 },
];

export const VEHICLES = [
  { id: 1, owner: "Ajay Transport", type: "Mini Truck", capacity: "3 Ton", location: "Warangal", routes: ["Warangal→Hyderabad"], status: "available", rating: 4.6 },
  { id: 2, owner: "Ravi Logistics", type: "Large Truck", capacity: "10 Ton", location: "Karimnagar", routes: ["Karimnagar→Hyderabad", "Karimnagar→Chennai"], status: "booked", rating: 4.8 },
  { id: 3, owner: "Cold Chain Co.", type: "Refrigerated", capacity: "5 Ton", location: "Nizamabad", routes: ["Nizamabad→Hyderabad"], status: "available", rating: 4.9 },
  { id: 4, owner: "Fast Freight", type: "Mini Truck", capacity: "2 Ton", location: "Khammam", routes: ["Khammam→Vijayawada"], status: "available", rating: 4.3 },
];

export const STORAGE_UNITS = [
  { id: 1, name: "AgroStore Warangal", type: "Cold Storage", capacity: 500, used: 320, location: "Warangal", temp: "2-8°C", price: 8 },
  { id: 2, name: "FarmSafe Karimnagar", type: "Warehouse", capacity: 2000, used: 850, location: "Karimnagar", temp: "Ambient", price: 3 },
  { id: 3, name: "ChillVault Hyderabad", type: "Cold Storage", capacity: 1000, used: 780, location: "Hyderabad", temp: "0-4°C", price: 12 },
  { id: 4, name: "GrainStore Nizamabad", type: "Silo", capacity: 5000, used: 1200, location: "Nizamabad", temp: "Controlled", price: 2 },
];

export const WASTE_DATA = [
  { month: "May", waste: 420, converted: 280 },
  { month: "Jun", waste: 380, converted: 310 },
  { month: "Jul", waste: 510, converted: 340 },
  { month: "Aug", waste: 460, converted: 380 },
  { month: "Sep", waste: 390, converted: 360 },
  { month: "Oct", waste: 310, converted: 290 },
];

export const WASTE_BY_CROP = [
  { name: "Tomato", value: 38 },
  { name: "Onion", value: 22 },
  { name: "Potato", value: 18 },
  { name: "Leafy Veg", value: 15 },
  { name: "Others", value: 7 },
];

export const LOANS = [
  { id: 1, farmer: "Ramesh Kumar", amount: 80000, type: "Crop Loan", status: "approved", score: 87, collateral: "Pre-orders" },
  { id: 2, farmer: "Sunita Devi", amount: 45000, type: "Kisan Credit", status: "pending", score: 72, collateral: "Yield Estimate" },
  { id: 3, farmer: "Prakash Rao", amount: 150000, type: "Farm Equipment", status: "approved", score: 94, collateral: "Pre-orders + KYC" },
  { id: 4, farmer: "Meena Bai", amount: 35000, type: "Crop Loan", status: "review", score: 65, collateral: "Yield Estimate" },
];

export const GOVT_SCHEMES = [
  { name: "PM-KISAN", desc: "₹6,000/year direct income support to farmer families", icon: "🏛️", eligible: true, link: "#" },
  { name: "Pradhan Mantri Fasal Bima", desc: "Crop insurance against natural calamities", icon: "🛡️", eligible: true, link: "#" },
  { name: "PM Krishi Sinchai Yojana", desc: "Irrigation infrastructure & water efficiency", icon: "💧", eligible: false, link: "#" },
  { name: "Kisan Credit Card", desc: "Easy credit up to ₹3 lakh at 4% interest", icon: "💳", eligible: true, link: "#" },
  { name: "e-NAM", desc: "National Agriculture Market — online trading platform", icon: "📊", eligible: true, link: "#" },
  { name: "Fertilizer Subsidy", desc: "Subsidised urea and DAP for small farmers", icon: "🌱", eligible: true, link: "#" },
];

export const CERTIFICATIONS = [
  { id: 1, farmer: "Ramesh Kumar", crop: "Tomato", type: "Organic Certified", issuedBy: "AO Warangal", date: "2024-09-15", valid: "2025-09-15", status: "active" },
  { id: 2, farmer: "Prakash Rao", crop: "Chilli", type: "Grade A Quality", issuedBy: "AO Nizamabad", date: "2024-09-20", valid: "2025-09-20", status: "active" },
  { id: 3, farmer: "Meena Bai", crop: "Turmeric", type: "Government Verified", issuedBy: "AO Adilabad", date: "2024-08-10", valid: "2025-08-10", status: "active" },
  { id: 4, farmer: "Vijay Singh", crop: "Potato", type: "Grade A Quality", issuedBy: "AO Khammam", date: "2024-07-01", valid: "2024-07-01", status: "expired" },
];

export const ADMIN_STATS = {
  totalFarmers: 12847,
  cropsListed: 3241,
  transactions: 8923,
  totalRevenue: 42500000,
  activeVehicles: 486,
  storageBooked: 68,
  wasteConverted: 73,
  loansApproved: 1204,
};

export const AI_RECOMMENDATIONS = [
  { id: 1, type: "harvest", text: "Best harvest date for your Tomato crop: October 15, 2024", confidence: 92, icon: "🌾" },
  { id: 2, type: "market", text: "High demand expected in Hyderabad market next week. Price may rise to ₹35/kg", confidence: 88, icon: "📈" },
  { id: 3, type: "spoilage", text: "Spoilage risk MEDIUM — harvest within 5 days to avoid 18% loss", confidence: 85, icon: "⚠️" },
  { id: 4, type: "transport", text: "Share transport load with Sunita Devi (Karimnagar) — saves ₹1,200", confidence: 78, icon: "🚚" },
];

export const TRANSACTIONS = [
  { id: "TXN001", buyer: "BigMart Superstore", farmer: "Ramesh Kumar", crop: "Tomato", amount: 140000, status: "released", date: "2024-10-02" },
  { id: "TXN002", buyer: "Hotel Taj Residency", farmer: "Prakash Rao", crop: "Chilli", amount: 76000, status: "in_escrow", date: "2024-10-05" },
  { id: "TXN003", buyer: "FreshMart Apartments", farmer: "Sunita Devi", crop: "Onion", amount: 66000, status: "shipped", date: "2024-10-08" },
  { id: "TXN004", buyer: "SpiceWorld Exports", farmer: "Meena Bai", crop: "Turmeric", amount: 144000, status: "pending", date: "2024-10-10" },
];

export const CROP_CLUSTER_ALERTS = [
  { district: "Warangal", crop: "Tomato", supply: "OVERSUPPLY", severity: "high", farmerCount: 234, message: "234 farmers harvesting Tomato simultaneously — flood risk in local market" },
  { district: "Karimnagar", crop: "Onion", supply: "NORMAL", severity: "low", farmerCount: 156, message: "Normal supply levels — market equilibrium expected" },
  { district: "Nizamabad", crop: "Chilli", supply: "SHORTAGE", severity: "medium", farmerCount: 89, message: "Supply shortage expected — good time to sell at premium" },
];

export const REGIONAL_PRODUCTION = [
  { month: "Jul", warangal: 1200, karimnagar: 980, nizamabad: 740, adilabad: 520, khammam: 860 },
  { month: "Aug", warangal: 1400, karimnagar: 1050, nizamabad: 820, adilabad: 610, khammam: 940 },
  { month: "Sep", warangal: 1650, karimnagar: 1200, nizamabad: 950, adilabad: 700, khammam: 1100 },
  { month: "Oct", warangal: 1800, karimnagar: 1380, nizamabad: 1050, adilabad: 780, khammam: 1250 },
  { month: "Nov", warangal: 1600, karimnagar: 1250, nizamabad: 980, adilabad: 720, khammam: 1150 },
  { month: "Dec", warangal: 1350, karimnagar: 1100, nizamabad: 860, adilabad: 640, khammam: 980 },
];

export const USER_ROLES = [
  { id: "farmer", label: "Farmer", icon: "👨‍🌾", path: "/farmer", color: "agro-green" },
  { id: "buyer", label: "Buyer / Market", icon: "🛒", path: "/marketplace", color: "agro-sky" },
  { id: "transport", label: "Transport", icon: "🚚", path: "/transport", color: "agro-brown" },
  { id: "storage", label: "Storage", icon: "🏪", path: "/storage", color: "agro-amber" },
  { id: "finance", label: "Finance / Loan", icon: "💰", path: "/finance", color: "agro-brown" },
  { id: "waste", label: "Waste Mgmt", icon: "♻️", path: "/waste", color: "agro-green" },
  { id: "analytics", label: "Analytics", icon: "📊", path: "/analytics", color: "agro-sky" },
  { id: "fpo", label: "FPO / Agri Officer", icon: "🏛️", path: "/fpo", color: "agro-brown" },
  { id: "admin", label: "Admin", icon: "⚙️", path: "/admin", color: "agro-red" },
];
