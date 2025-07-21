import { useState } from 'react';
import { ethers } from 'ethers';
import { ETH_SEPOLIA_CHAIN_ID, ETH_SEPOLIA_RPC } from '../config/config';

export const ConnectWallet = ({ onConnected }: { onConnected: (account: string, signer: ethers.Signer) => void }) => {
    const [loading, setLoading] = useState(false);

    const connectWallet = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) throw new Error('No wallet found');

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ETH_SEPOLIA_CHAIN_ID }],
            });

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            onConnected(address, signer);
        } catch (err) {
            console.error('Wallet connection error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={connectWallet}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={loading}
        >
            {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
    );
};
