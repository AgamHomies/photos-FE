// Detect if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Get API URL from environment or use defaults
const getApiUrl = () => {
  // If explicitly set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // In production, we require the environment variable to be set.
  if (isProduction) {
    throw new Error('REACT_APP_API_URL is not defined! Please set this in your environment configuration.');
  }

  // Development: use dynamic hostname to allow LAN access (mobile testing)
  // This allows accessing via http://192.168.1.x:5173 and hitting API at http://192.168.1.x:8000
  const hostname = window.location.hostname;
  return `http://${hostname}:8000/api/v1`;
};

export const CONFIG = {
  // API Configuration
  API_BASE_URL: getApiUrl(),
  USE_MOCK: false,  // 🟢 Using REAL BACKEND
  IS_PRODUCTION: isProduction,

  // Log the current mode
  get MODE() {
    const mode = this.USE_MOCK ? 'MOCK (localStorage)' : `REAL BACKEND (${this.API_BASE_URL})`;
    console.log(`🔧 App Mode: ${mode}`);
    return mode;
  },

  // Mock settings (for development without backend)
  ADMIN_PASSWORD: "123456",
  API_DELAY_MS: {
    PROFILE: 500,
    GALLERY: 800,
    UPLOAD: 1500,
    UPDATE: 1000,
  },
  MOCK_DATA: {
    PROFILE_NAME: "Blackmailer The Photographer",
    PROFILE_BIO: "Capturing light, darkness, and everything in between.",
    CONTACT_EMAIL: "Blackmailers@Click2Pic.com",
  }
};
