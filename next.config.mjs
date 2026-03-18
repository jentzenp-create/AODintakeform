/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/march-madness',
                destination: '/march-madness.html',
            },
        ];
    },
};

export default nextConfig;
