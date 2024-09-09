// /** @type {import('next').NextConfig} */
// const nextConfig = {
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};

// export default nextConfig;
