# Click2Pic - Photo Gallery Management System

A modern web application for photographers to manage event galleries and share photos with guests using AI-powered face recognition.

## Features

- 🎨 **Modern Landing Page** - Beautiful, responsive design showcasing the platform
- 📸 **Photographer Dashboard** - Manage events, upload photos, and track analytics
- 🤖 **AI Face Recognition** - Guests can find their photos by uploading a selfie
- 🔗 **Shareable Gallery Links** - Unique links for each event (guest & couple views)
- 💧 **Watermarked Previews** - Protect your work with automatic watermarks
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎯 **Dual Gallery Modes**:
  - **Guest Mode**: Upload selfie → AI finds your photos
  - **Full Mode**: View all event photos (for couples/full access)

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Mock Backend**: LocalStorage-based MockS3Service

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd photos-fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Quick Start - Login as Photographer

To quickly test the photographer dashboard:

1. Navigate to `http://localhost:3000/auth`
2. Use these credentials:
   - **Email**: `user1@test.com`
   - **Password**: `password1`
3. Click "Login"
4. You'll be redirected to the photographer dashboard

**Or try the guest gallery:**
- Visit: `http://localhost:3000/gallery/evt-1`
- Upload any selfie image to see the AI face recognition demo

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Mock User Credentials

The application comes with pre-configured mock photographers for testing:

### Photographer 1: Ronny The Shooter
- **Email**: `user1@test.com`
- **Password**: `password1`
- **Phone**: 050-1111111
- **Instagram**: [@ronny_shooter](https://instagram.com/ronny_shooter)
- **Specialty**: Professional wedding photographer with 10 years of experience
- **Mock Events**: 
  - Wedding of Sarah & Tom (evt-1) - Active
  - Bar Mitzvah of David (evt-2) - Expired

### Photographer 2: Dana Clicks
- **Email**: `user2@test.com`
- **Password**: `password2`
- **Phone**: 050-2222222
- **Instagram**: [@dana_clicks](https://instagram.com/dana_clicks)
- **Specialty**: Capturing moments that last a lifetime. Specializing in events and portraits
- **Mock Events**: None yet

### Photographer 3: Yossi Focus
- **Email**: `user3@test.com`
- **Password**: `password3`
- **Phone**: 050-3333333
- **Instagram**: [@yossi_focus](https://instagram.com/yossi_focus)
- **Specialty**: Artistic photography for unique events
- **Mock Events**: None yet

### Photographer 4: Happy Guests Shira
- **Email**: `shira@happyguests.com`
- **Password**: `password4`
- **Phone**: 050-4444444
- **Instagram**: [@happy_shira](https://instagram.com/happy_shira)
- **Specialty**: Specializing in candid moments and happy guests
- **Mock Events**: None yet

## Application Routes

### Public Routes
- `/` - Landing page
- `/auth` - Login/Registration page
- `/gallery/:id` - Guest gallery (with selfie upload)
- `/gallery/:id/full` - Full gallery (all photos)

### Protected Routes (Require Login)
- `/admin` - Photographer dashboard
- `/admin/create-event` - Create new event
- `/admin/event/:id` - Manage specific event

## Testing the Application

### As a Guest:
1. Navigate to `http://localhost:3000`
2. Click on "PHOTOGRAPHERS" in the navigation
3. Login with any photographer credentials above
4. Create an event or use existing event ID: `evt-1`
5. Visit the guest gallery: `http://localhost:3000/gallery/evt-1`
6. Upload a selfie to simulate face recognition
7. View matched photos (randomly selected for demo)

### As a Couple (Full Access):
1. Login as a photographer
2. Go to Dashboard → Events
3. Click the ❤️ (Heart) icon next to an event
4. View all photos without face recognition

### As a Photographer:
1. Login with credentials above
2. Access the dashboard at `/admin`
3. View statistics and manage events
4. Create new events with `/admin/create-event`
5. Upload photos and manage event details

## Project Structure

```
photos-fe/
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
│   ├── layouts/
│   │   └── MainLayout.tsx  # Main app layout with navigation
│   ├── services/
│   │   ├── api.ts          # API service layer
│   │   └── mockS3.ts       # Mock backend (LocalStorage)
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── App.tsx             # Main app component with routing
│   └── index.css           # Global styles (Tailwind)
├── package.json
└── README.md
```

## Key Features Explained

### Face Recognition Simulation
The guest gallery simulates AI face recognition by:
1. Accepting a selfie upload
2. Showing a scanning animation (3 seconds)
3. Randomly selecting 30-50% of event photos as "matches"
4. Displaying matched photos with photographer watermark

### Watermarking
All preview images display the photographer's name as a diagonal watermark overlay. This is CSS-based for the demo. In production, watermarks would be applied server-side or via canvas manipulation before download.

### Dual Gallery Links
Each event has two access modes:
- **Guest Link** (`/gallery/:id`): Requires selfie upload, shows matched photos
- **Full Link** (`/gallery/:id/full`): Shows all photos immediately (for couples)

### Photo Actions
- **Download**: Individual photo download with watermark removal (simulated)
- **Share**: Native browser share API or clipboard copy fallback
- **Lightbox**: Full-screen view with download/share options

## Data Persistence

The application uses `localStorage` to persist data:
- **Storage Key**: `mock_s3_data_v2`
- **Current User**: `current_user_email`

To reset all data, clear your browser's localStorage or change the `STORAGE_KEY` in `src/services/mockS3.ts`.

## Future Enhancements

- Real backend integration (AWS S3, Firebase, etc.)
- Actual AI face recognition API
- Payment integration for photo purchases
- Email notifications for guests
- Advanced analytics dashboard
- Multi-language support (Hebrew/English toggle)
- Real watermarking with server-side processing

## Support

For issues or questions, please contact the development team.

## License

This project is proprietary and confidential.
