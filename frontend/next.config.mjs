export default {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'django',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
  },
};
