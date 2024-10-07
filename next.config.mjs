// next.config.mjs
const nextConfig = {
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: "Access-Control-Allow-Credentials",
                        value: 'true',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: "PUT, POST, GET, DELETE, PATCH, OPTIONS",
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
