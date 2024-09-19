export default {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
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
