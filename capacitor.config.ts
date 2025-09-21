import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.102917667bcc41c18170e286688b9f86',
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