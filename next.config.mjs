/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "canva-clone-ali.vercel.app",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      stream: false,
    };

    // Handle ES modules
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/build/pdf.js';

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["jsdom"],
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
};

export default nextConfig;
