# 🎨 Frontend — Face Recognition Attendance System

Kiosk-style web application built with **React + Vite** for a face recognition-based attendance system. Provides the user-facing interface for clock-in/clock-out via face recognition, user registration, and an admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 5 |
| Routing | React Router v7 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| UI Components | Lucide React icons, shadcn/ui |
| Camera | Custom `useCamera` hook (WebRTC) |
| Input | react-simple-keyboard (virtual keyboard) |

## Project Structure

```
frontend-facerecognition/
├── public/                 # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   ├── pose_guide.png      # Face registration guide image
│   ├── logo/               # Company logos
│   └── poses/              # Pose direction images (Atas, Bawah, Depan, etc.)
├── src/
│   ├── pages/              # Page components
│   │   ├── InferencingPage.jsx      # Main clock-in/clock-out (face recognition)
│   │   ├── AdminLoginPage.jsx       # Admin authentication
│   │   ├── PinCodePage.jsx          # PIN-based access
│   │   ├── AdminDashboardPage.jsx   # Attendance dashboard & reports
│   │   ├── RegisterUserPage.jsx     # New user registration
│   │   └── RegisterFacePage.jsx     # Face capture for registration
│   ├── components/ui/      # Reusable UI components (shadcn/ui)
│   ├── hooks/              # Custom React hooks
│   │   └── useCamera.js    # WebRTC camera management
│   ├── lib/                # Utility functions
│   ├── apiConfig.js        # API base URL config (via env vars)
│   ├── App.jsx             # Root component & routing
│   ├── App.css             # Global styles
│   ├── index.css           # Tailwind directives
│   └── main.jsx            # Entry point
├── .env.example            # Environment variable template
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── deploy.ps1              # PowerShell deployment script
```

## Features

- **Face Recognition Clock-In/Out** — real-time camera capture with live face detection
- **Multi-Pose Face Registration** — guided multi-angle face capture (front, left, right, up, down)
- **Admin Dashboard** — view attendance records, statistics, and export reports
- **Virtual Keyboard** — on-screen keyboard for kiosk/touch-screen usage
- **PIN Code Access** — alternative authentication method
- **Responsive Design** — optimized for kiosk displays

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### Configuration

Edit `.env` with your backend API URL and key:
```env
VITE_API_BASE=https://your-api-domain.com
VITE_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Inferencing | Main face recognition clock-in/out |
| `/admin-login` | Admin Login | Admin authentication |
| `/pin-code` | PIN Code | PIN-based user access |
| `/admin-dashboard` | Dashboard | Attendance records & reports |
| `/register-user` | Register User | New user registration form |
| `/register-face` | Register Face | Multi-pose face capture |

## Related Services

- [**Backend**](https://github.com/cenjaa/backend-facerecognition) — Go REST API service
- [**ML Service**](https://github.com/cenjaa/ml-service) — RPCA + PCA + SVM face recognition pipeline
