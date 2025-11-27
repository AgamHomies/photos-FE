# Click2Pic - Photo Gallery Management System

A modern web application for photographers to manage event galleries and share photos with guests using AI-powered face recognition.

## ✨ Features

- 🎨 **Modern Landing Page** - Beautiful, responsive design
- 📸 **Photographer Dashboard** - Manage events, upload photos, track analytics
- 🤖 **AI Face Recognition** - Guests find photos by uploading a selfie
- 🔐 **Supabase Authentication** - Google OAuth + Email/Password
- 🔗 **Shareable Gallery Links** - Unique links for each event
- 💧 **Watermarked Previews** - Protect your work
- 📱 **Mobile Responsive** - Works on all devices
- 🎯 **Dual Gallery Modes**:
  - **Guest Mode**: Upload selfie → AI finds your photos
  - **Full Mode**: View all event photos

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Backend API running (see `photos-BE/README.md`)

### Installation

1. **Install dependencies**

```bash
cd photos-FE
npm install
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Configure .env file**

```env
# Backend API
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Mode
REACT_APP_USE_MOCK=false
```

4. **Start the development server**

```bash
npm start
```

5. **Open your browser**

```
http://localhost:3000
```

## 🔐 Authentication

The app uses **Supabase** for authentication:

### Google OAuth

1. Click "Continue with Google"
2. Complete Google sign-in
3. Fill in photographer profile details

### Email/Password

1. Enter email and password
2. Click "Register" or "Login"
3. Complete profile if registering

## 📱 Application Routes

### Public Routes

- `/` - Landing page
- `/auth` - Login/Registration
- `/auth/callback` - OAuth callback
- `/gallery/:slug` - Guest gallery (selfie upload)
- `/gallery/:slug/full` - Full gallery (all photos)

### Protected Routes (Require Login)

- `/admin` - Photographer dashboard
- `/admin/create-event` - Create new event
- `/admin/event/:id` - Manage specific event

## 🏗️ Project Structure

```
photos-FE/
├── public/
├── src/
│   ├── features/
│   │   ├── admin/          # Dashboard, Event Management
│   │   ├── auth/           # Login/Registration
│   │   ├── gallery/        # Guest & Full Gallery Views
│   │   └── home/           # Landing Page
│   ├── hooks/
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── useData.ts      # Data fetching hooks
│   ├── services/
│   │   ├── backendService.ts    # Unified API service
│   │   ├── realApi.ts           # Real backend integration
│   │   ├── supabaseClient.ts    # Supabase client
│   │   └── supabaseAuthService.ts # Supabase auth
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── App.tsx             # Main app with routing
│   ├── config.ts           # Configuration
│   └── index.css           # Global styles
├── .env.example
├── package.json
└── README.md
```

## 🎯 Key Features

### Face Recognition

1. Guest uploads selfie
2. AI scans event photos
3. Returns matching photos
4. Download or share results

### Event Management

- Create events with details
- Upload multiple photos (batch)
- Set cover images
- Generate shareable links
- Track analytics (views, downloads)

### Photographer Profile

- Logo upload
- Portfolio images
- Social media links (Instagram, TikTok, Facebook)
- Contact information

## 🧪 Testing the Application

### As a Photographer:

1. Register/Login at `/auth`
2. Complete profile setup
3. Access dashboard at `/admin`
4. Create new event
5. Upload photos
6. Share gallery link with guests

### As a Guest:

1. Visit gallery link (e.g., `/gallery/event-slug`)
2. Upload a selfie
3. View matched photos
4. Download or share photos

## 🔄 Backend Integration

The frontend integrates with the backend API:

### API Calls

- Authentication: Login, Register, Profile
- Events: CRUD operations
- Photos: Upload, Download, Delete
- Face Search: Selfie upload → Find photos
- Analytics: Track views, downloads

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## 🛠️ Available Scripts

- `npm start` - Development mode with hot reload
- `npm test` - Run tests
- `npm run build` - Production build
- `npm run eject` - Eject from Create React App

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Supabase** - Authentication
- **Axios** - HTTP client

## 🔒 Security

- Supabase authentication
- JWT token management
- Secure API calls
- Environment variables
- CORS configuration

## 📖 Documentation

- **Supabase Setup**: See `SUPABASE_INTEGRATION.md` in backend
- **API Documentation**: http://localhost:8000/docs (when backend running)
- **Quick Setup**: See `QUICK_SETUP.md` in backend

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy

The `build` folder is ready for deployment to:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

## 🎉 Integration Status

✅ **All backend-frontend conflicts resolved!**

- Authentication with Supabase
- Event CRUD operations
- Photo upload/download with URLs
- Face search functionality
- Dashboard analytics
- Profile management

**Ready for local testing and production deployment!**

## 📄 License

This project is proprietary and confidential.

## 🤝 Support

For issues or questions, please contact the development team.
