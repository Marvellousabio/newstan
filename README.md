# Maternal Emergency Locator 🏥

A production-ready GPS-based emergency locator app for maternal health facilities with real-time availability and transport integration.

## ✨ Features

### Core Functionality
- **GPS Emergency Locator**: Find nearest maternal health facilities in seconds
- **Real-time Availability**: See doctors/nurses status with live updates
- **Transport Integration**: Request ambulance, motorcycle, or tricycle instantly
- **Offline Mode**: PWA with cached essentials for rural areas
- **Multi-platform**: Web (Next.js) + Mobile (React Native ready)

### Advanced Features
- **Green-themed UI**: Professional animations with Framer Motion & React Spring
- **Google Maps Integration**: High-quality mapping with custom markers
- **Real-time Updates**: Socket.io for live availability changes
- **Authentication**: Firebase Auth with role-based access
- **PWA Support**: Offline-capable with service worker
- **Monetization Ready**: Subscription tiers and sponsorship support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Maps API key
- Firebase project (for auth)

### 1. Clone & Install
```bash
git clone <your-repo>
cd medical
npm install
cd server && npm install
```

### 2. Environment Setup
Create `.env.local` in the root:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Create `server/.env`:
```env
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
GOOGLE_APPLICATION_CREDENTIALS=../medical-8d62a-firebase-adminsdk-fbsvc-3999168c80.json
```

### 3. Start Development
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start web app
npm run dev
```

### 4. Access the App
- **Public Landing**: http://localhost:3000
- **Emergency Locator**: http://localhost:3000/emergency (requires sign-in)
- **App Dashboard**: http://localhost:3000/dashboard (requires sign-in)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Animations**: Framer Motion, React Spring, Lottie
- **Maps**: Google Maps API
- **Backend**: Node.js, Express, Socket.io
- **Database**: Firebase Firestore (MongoDB ready)
- **Auth**: Firebase Authentication
- **PWA**: next-pwa with offline support

### Project Structure
```
medical/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── (main)/         # Protected routes
│   │   │   ├── emergency/  # Emergency locator
│   │   │   ├── dashboard/  # Main dashboard
│   │   │   ├── patients/   # Patient management
│   │   │   └── messages/   # Messaging system
│   │   ├── api/            # API routes
│   │   └── globals.css     # Global styles
│   └── components/         # Reusable components
├── server/                 # Backend API
│   ├── index.js           # Express server
│   └── package.json       # Server dependencies
└── public/                # Static assets
```

## 🎯 Core Features Deep Dive

### Emergency Locator (`/emergency`)
- **GPS Detection**: Automatic location with fallback to Addis Ababa
- **Facility Search**: Haversine distance calculation with 25km radius
- **Real-time Availability**: Live doctor/nurse counts and status
- **Transport Requests**: One-click ambulance/motorcycle/tricycle booking
- **Custom Markers**: Color-coded by sponsorship (NGO/Government/Private)

### Authentication & Authorization
- **Firebase Auth**: Email/password with session cookies
- **Role-based Access**: Admin, Doctor, Nurse, Patient roles
- **Protected Routes**: Middleware enforces sign-in for app features
- **Public Landing**: Marketing page accessible without auth

### Real-time Features
- **Socket.io**: Live availability updates
- **WebSocket Rooms**: Per-facility availability broadcasting
- **Message System**: Thread-based messaging between users

### PWA & Offline Support
- **Service Worker**: Caches essential pages and API responses
- **Offline Page**: Graceful degradation when network unavailable
- **Background Sync**: Queues requests when offline

## 💰 Monetization Model

### Subscription Tiers
1. **Community** (Free)
   - Emergency locator
   - Offline access
   - Email support

2. **Clinic** ($29/month)
   - All Community features
   - Staff messaging
   - Priority support

3. **Hospital** (Custom)
   - All Clinic features
   - Analytics dashboard
   - SLA & onboarding

### Sponsorship Model
- **Government**: Free access for public facilities
- **NGO**: Subsidized rates for rural areas
- **Private**: Premium placement and analytics

## 🔧 Development

### Available Scripts
```bash
# Web App
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Backend
cd server
npm run dev          # Development with nodemon
npm start            # Production server
npm test             # Run tests
```

### API Endpoints

#### Facilities
- `GET /api/facilities/nearby?lat&lng&radius` - Find nearby facilities
- `GET /api/facilities/:id/availability` - Get facility availability

#### Transport
- `POST /api/transport/request` - Request emergency transport

#### Authentication
- `POST /api/session` - Create session from Firebase token
- `POST /api/session/logout` - Clear session

#### App Data
- `GET /api/patients` - List patients
- `GET /api/appointments` - List appointments
- `GET /api/messages` - List messages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_key
NEXT_PUBLIC_API_BASE=https://your-api-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 📱 Mobile App (React Native)

The mobile app is ready to be built with:
- Same API endpoints
- Google Maps integration
- Offline storage with AsyncStorage
- Push notifications via Firebase Cloud Messaging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@your-domain.com or create an issue in the repository.

---

**Built with ❤️ for maternal health accessibility**"# newstan" 
