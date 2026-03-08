
# AgroSense – Full Platform Implementation Plan

## Overview
A hackathon-ready, full-stack agriculture SaaS platform with all pages, realistic mock data, simulated AI recommendations, role-based dashboards, and a modern Stripe/Notion-style UI. Built with React + Tailwind + Recharts.

---

## Design System
- **Primary**: Green `#2E7D32` with Tailwind custom config
- **Secondary**: Earth brown `#795548`
- **Accent**: Amber/Yellow `#F59E0B` for warnings
- **Background**: Soft light gray `#F8FAF5`
- **Typography**: Clean sans-serif, dashboard card layout
- **Components**: Cards, charts, badges, progress bars, heatmaps, data tables, AI recommendation boxes

---

## Page Structure (10 pages + shared nav/sidebar)

### 1. Landing Page (`/`)
- Hero section with tagline and animated stats (farmers connected, crops monitored, wastage reduced)
- Role selector cards: Farmer, Buyer, Transport, Admin, FPO/AO
- Features overview with icons
- Government scheme highlights
- CTA buttons leading to role-specific dashboards

### 2. Farmer Dashboard (`/farmer`)
- **Farm Registration Panel**: Name, village, crop type, variety, area, sowing/harvest dates
- **Harvest Readiness Score**: 0–100 progress bar with green/yellow/red zones
- **Weather Intelligence Widget**: Temp, rainfall, humidity, wind, sunrise/sunset + alerts
- **Crop Stats Cards**: Growth status, expected yield, predicted market price, demand forecast, spoilage risk
- **AI Recommendation Box**: "Best harvest date: Oct 15" style cards with Gemini icon
- **Quick Actions**: List crop, book transport, apply loan, upload image
- **SMS Data Entry**: Input field simulating SMS commands like "CROP TOMATO 2ACRE HARVEST OCT10"

### 3. Buyer Marketplace (`/marketplace`)
- **Crop Listings Grid**: Cards with crop photo, farmer name, location, quantity, harvest date, price, certification badge
- **Filters**: Crop type, region, harvest date range, certification
- **Pre-booking Modal**: Quantity selector, negotiation field, escrow payment preview
- **Dry Vegetables / Grains Section**: Separate tab for dried chilli, turmeric, pulses, millets
- **Market Trends**: Small sparkline charts showing price trends per crop

### 4. Transport Dashboard (`/transport`)
- **Vehicle Registration Panel**: Type, capacity, location, routes
- **Available Vehicles Map**: Visual grid map showing vehicles by region
- **Booking Requests**: Table of pending farmer transport requests
- **Load Sharing**: "Nearby farmers with similar routes" cards
- **Delivery Tracking**: Status timeline for active deliveries

### 5. Storage Dashboard (`/storage`)
- **Warehouse Listing**: Cards showing cold storage / warehouse with availability %
- **My Storage Bookings**: Crops stored, duration, alert badges for crops nearing expiry
- **Inventory Tracker**: Table of crop quantities per facility
- **Spoilage Risk Meter**: LOW / MEDIUM / HIGH gauge per stored batch

### 6. Waste Management (`/waste`)
- **Waste Tracker**: Input quantities of spoiled/excess crops
- **Conversion Options Panel**: Compost, Animal Feed, Biofuel, Processed Food — with profit estimates
- **Waste Stats**: Total waste quantity, conversion rate, earnings from waste
- **Recharts Bar/Donut**: Waste by crop type, monthly waste trends

### 7. Loan & Finance (`/finance`)
- **Loan Eligibility Score**: Based on pre-orders + yield + rating — displayed as gauge
- **Pre-booking Based Loan Apply**: Form + eligibility check
- **KYC Panel**: Upload Aadhaar, Farmer ID, Bank Details — with verification status badges
- **Government Schemes**: PM Kisan, crop insurance, fertilizer subsidy cards with "Check Eligibility" CTA
- **Escrow Payment Timeline**: Active transaction status cards

### 8. Analytics Dashboard (`/analytics`)
- **Crop Demand Trends**: Multi-line Recharts chart (next 6 months)
- **Price Forecast Chart**: Bar chart per crop
- **Regional Supply Heatmap**: Grid-based heatmap (village/district vs crop) using Recharts
- **Area-wise Crop Intelligence**: Village-wise crop variation bar chart + harvest calendar table
- **Wastage Statistics**: Donut chart + monthly bar chart
- **Crop Clustering Alerts**: Badge cards showing oversupply warnings by region

### 9. FPO & Agricultural Officer Portal (`/fpo`)
- **Crop Cluster Monitor**: Table of crop clusters by village + status
- **Regional Production Tracker**: Recharts area chart per region
- **Certification Issuance**: Form to issue digital certificate (Organic / Grade A / Govt Verified)
- **Active Certifications Table**: With status badges
- **Advisory Board**: Post regional advisories / alerts
- **Farmer KYC Approval**: List of pending verifications

### 10. Admin Panel (`/admin`)
- **Platform Stats**: Total farmers, crops listed, transactions, vehicles, revenue — KPI cards
- **User Management Table**: All users with role, status, last active, actions
- **All Transactions**: Full escrow payment table
- **Loan Approvals**: Pending loan requests
- **System Alerts**: Flagged issues
- **Reports Export**: Download buttons

---

## Shared Components

### Navigation / Sidebar
- Role-switcher dropdown at top (for demo: Farmer / Buyer / Transport / FPO / Admin)
- Sidebar with icons and labels per role
- Mobile hamburger menu

### AI Recommendation Box
- Reusable card with green gradient border, robot/leaf icon, "AI Insight" badge
- Shows text recommendation + confidence score

### Spoilage Risk Meter
- Circular gauge with LOW (green) / MEDIUM (amber) / HIGH (red)

### Harvest Readiness Score
- Animated progress bar 0–100 with color zones
- Breakdown of contributing factors

### Weather Widget
- 5-day forecast strip with icons, temp, rain chance
- Alert banner for weather warnings

### AI Voice Assistant
- Floating microphone button (bottom right)
- Chat bubble popup with sample Q&A (simulated responses)

### Rating Component
- Star ratings for farmers, products, transport

---

## Data & AI Simulation
- All data uses realistic mock constants (crop prices, weather forecasts, yield estimates)
- AI scores calculated from weighted formula using mock inputs
- Price predictions shown as Recharts charts with trend lines
- Harvest readiness = function of days-to-harvest + weather score + market demand

---

## Routing
```
/ → Landing
/farmer → Farmer Dashboard
/marketplace → Buyer Marketplace
/transport → Transport Dashboard
/storage → Storage Dashboard
/waste → Waste Management
/finance → Loan & Finance
/analytics → Analytics Dashboard
/fpo → FPO & AO Portal
/admin → Admin Panel
```
