
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['pptxgenjs'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        https: false,
        http: false,
        child_process: false,
        crypto: false,
        stream: false,
        os: false,
        "node:fs": false,
        "node:path": false,
        "node:https": false,
        "node:http": false,
        "node:child_process": false,
        "node:crypto": false,
        "node:stream": false,
        "node:os": false,
        "node:net": false,
        "node:tls": false,
        "node:dns": false,
        "node:util": false,
        "node:url": false,
        "node:zlib": false,
        net: false,
        tls: false,
        dns: false,
      };

      config.resolve.alias = {
        ...config.resolve.alias,
        "node:fs": false,
        "node:path": false,
        "node:https": false,
        "node:http": false,
        "node:child_process": false,
        "node:crypto": false,
        "node:stream": false,
        "node:os": false,
        "node:net": false,
        "node:tls": false,
        "node:dns": false,
        "node:util": false,
        "node:url": false,
        "node:zlib": false,
      };
    }
    return config;
  },
};

export default nextConfig;
