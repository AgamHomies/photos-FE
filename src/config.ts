export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  USE_MOCK: false,  // 🟢 Using REAL BACKEND

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
