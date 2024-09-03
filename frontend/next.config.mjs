// /** @type {import('next').NextConfig} */
// const nextConfig = {
  export default {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'backend',
          port: '8000',
        },
        {
          protocol: 'http',
          hostname: 'c2r4p5.42nice.fr',
        },
      ],
    },
  };

// export default nextConfig;
