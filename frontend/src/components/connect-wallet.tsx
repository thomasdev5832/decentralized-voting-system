import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ETH_SEPOLIA_CHAIN_ID, ETH_SEPOLIA_RPC } from '../config/config';

interface Props {
    onConnected: (account: string, signer: ethers.Signer) => void;
}

export const ConnectWallet = ({ onConnected }: Props) => {
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState<string | null>(null);

    useEffect(() => {
        // Se já está conectado, recupera via Ethereum provider
        const checkConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            }
        };
        checkConnection();
    }, []);

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

            setAccount(address);
            onConnected(address, signer);
        } catch (err) {
            console.error('Wallet connection error:', err);
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        onConnected('', null);
    };

    const maskAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <>
            {!account ? (
                <button
                    onClick={connectWallet}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition cursor-pointer"
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition cursor-pointer"
                    title="Click to disconnect"
                >
                    {maskAddress(account)}
                </button>
            )}
        </>
    );
};
