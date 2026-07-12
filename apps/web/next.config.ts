import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@stellar-starter-kit/ui',
    '@stellar-starter-kit/wallets',
    '@stellar-starter-kit/contracts',
  ],
  webpack: (config: any) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@stellar-starter-kit/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@stellar-starter-kit/wallets': path.resolve(__dirname, '../../packages/wallets/src'),
      '@stellar-starter-kit/contracts': path.resolve(__dirname, '../../packages/contracts/src'),
      'stellar-sdk$': require.resolve('stellar-sdk'),
      '@stellar/stellar-sdk$': require.resolve('stellar-sdk'),
    };
    return config;
  },
};

export default nextConfig;
