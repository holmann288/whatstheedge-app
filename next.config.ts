import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect old app subdomain to root domain
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'app.whatstheedge.com' }],
        destination: 'https://whatstheedge.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
