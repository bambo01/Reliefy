// src/contracts/contract.js
import ABI from './src/ABI/ReliefTrace.json';

export const CHAIN = {
  BASE: 8453,
  BASE_SEPOLIA: 84532,
};

// Prefer .env, but fall back to your provided address for Base Sepolia
export const CONTRACT_ADDRESSES = {
  [CHAIN.BASE_SEPOLIA]:
    import.meta.env.VITE_CONTRACT_BASE_SEPOLIA ||
    '0x0a9ba345b994214ACe3A3a9ea4CFA3bBB342B836',
  [CHAIN.BASE]:
    import.meta.env.VITE_CONTRACT_BASE_MAINNET || '',
};

export const RELIEFTRACE_ABI = ABI;

export function getContractAddress(chainId) {
  return (
    CONTRACT_ADDRESSES[String(chainId)] ||
    CONTRACT_ADDRESSES[chainId] ||
    ''
  );
}
