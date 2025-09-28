import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.securevault',
  appName: 'SecureVault Password Manager',
  webDir: 'dist',
  server: {
    url: 'https://10291766-7bcc-41c1-8170-e286688b9f86.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Storage: {
      androidScheme: 'https'
    }
  }
};

export default config;