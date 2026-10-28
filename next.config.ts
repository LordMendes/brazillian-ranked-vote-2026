import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "geoip-lite",
    "@prisma/orm-postgres",
    "pg",
    "@prisma/composer",
    "@prisma/composer-prisma-cloud",
    "arktype",
  ],
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
