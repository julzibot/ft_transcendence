export default {
	reactStrictMode: false,
	images: {
		domains: [`${process.env.NEXT_PUBLIC_DOMAIN}`],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: `${process.env.NEXT_PUBLIC_DOMAIN}`,
				port: `${process.env.NEXT_PUBLIC_BACKEND_PORT}`,
			},
		],
	},
};
