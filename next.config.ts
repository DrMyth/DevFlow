import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  return [
      {
        source: '/projects/:username',
        destination: '/',
      },
      {
        source: '/projects/:username/:path*',
        destination: '/:path*',
      },
    ];
};

export default nextConfig;
