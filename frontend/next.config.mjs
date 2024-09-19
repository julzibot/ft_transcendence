export default {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'django',
        port: '8001',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};
