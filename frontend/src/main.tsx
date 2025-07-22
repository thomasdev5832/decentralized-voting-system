import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WalletProvider } from './contexts/wallet-context.tsx'
import { ProposalsProvider } from './contexts/proposals-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <ProposalsProvider>
        <App />
      </ProposalsProvider>
    </WalletProvider>
  </StrictMode>,
)
