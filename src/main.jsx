import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'


//Wagmi + rainbowkit imports
import {WagmiProvider, http} from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css'; // RainbowKit styles


// WalletConnect project ID from your .env file
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
console.log('PID', projectId);


// Configure wagmi (inject Base + Base Sepolia)
const config = getDefaultConfig({
  appName: 'Base Voting',
  projectId,
  chains: [baseSepolia, base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: false,
});


const queryClient = new QueryClient();


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} initialChain={baseSepolia}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)


