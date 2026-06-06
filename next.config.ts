import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zlpnajlbasirxpitroao.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'bnojcvcydarypmwnxjog.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // ✅ Tambahkan ini
      {
        protocol: 'https',
        hostname: 'swlzfyuacyirkecabwop.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;