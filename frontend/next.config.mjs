import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.intra.42.fr', 't4.ftcdn.net']
  }
};

export default withNextIntl(nextConfig);
