import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
    account: string | null;
    signer: ethers.Signer | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    loading: boolean;
    isInitialized: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'wallet_connected';
const TARGET_CHAIN_ID = '0x13882'; // Polygon Amoy Testnet (80002 em decimal)
const TARGET_CHAIN_ID_DECIMAL = 80002;

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const addAmoyNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: TARGET_CHAIN_ID,
                    chainName: 'Polygon Amoy Testnet',
                    nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18
                    },
                    rpcUrls: ['https://rpc-amoy.polygon.technology'],
                    blockExplorerUrls: ['https://amoy.polygonscan.com/']
                }]
            });
        } catch (addError) {
            console.error('Failed to add Amoy network:', addError);
            throw addError;
        }
    };

    const checkWalletConnection = async (): Promise<boolean> => {
        try {
            if (!window.ethereum) return false;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length === 0) return false;

            const network = await provider.getNetwork();

            if (Number(network.chainId) !== TARGET_CHAIN_ID_DECIMAL) {
                console.log('Wrong network detected. Expected:', TARGET_CHAIN_ID_DECIMAL, 'Got:', Number(network.chainId));
                return false;
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setAccount(address);
            setSigner(signer);
            return true;
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            return false;
        }
    };

    const connectWallet = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) throw new Error('No wallet found');

            // Primeiro tenta trocar para a rede Amoy
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: TARGET_CHAIN_ID }],
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await addAmoyNetwork();
                } else {
                    console.error('Failed to switch network:', switchError);
                    throw switchError;
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);

            const network = await provider.getNetwork();
            if (Number(network.chainId) !== TARGET_CHAIN_ID_DECIMAL) {
                throw new Error(`Please switch to Polygon Amoy Testnet. Current network: ${Number(network.chainId)}`);
            }

            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setAccount(address);
            setSigner(signer);

            localStorage.setItem(WALLET_STORAGE_KEY, 'true');
            console.log('Wallet connected successfully:', address);

        } catch (err) {
            console.error('Failed to connect wallet:', err);
            setAccount(null);
            setSigner(null);
            localStorage.removeItem(WALLET_STORAGE_KEY);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
        localStorage.removeItem(WALLET_STORAGE_KEY);
        console.log('Wallet disconnected');
    };

    const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        if (accounts.length === 0) {
            disconnectWallet();
        } else if (accounts[0] !== account) {
            setAccount(accounts[0]);
            if (localStorage.getItem(WALLET_STORAGE_KEY)) {
                checkWalletConnection();
            }
        }
    };

    const handleChainChanged = (chainId: string) => {
        console.log('Chain changed to:', chainId);
        const chainIdDecimal = parseInt(chainId, 16);

        if (chainIdDecimal !== TARGET_CHAIN_ID_DECIMAL) {
            console.log('Network changed to unsupported network:', chainIdDecimal);
            // Para desenvolvimento, vamos desconectar se mudar de rede
            if (account) {
                alert('Please switch back to Polygon Amoy Testnet');
                // Opcionalmente desconectar
                // disconnectWallet();
            }
        } else {
            console.log('Network changed back to Amoy');
            if (localStorage.getItem(WALLET_STORAGE_KEY)) {
                checkWalletConnection();
            }
        }
    };

    useEffect(() => {
        const initializeWallet = async () => {
            const wasConnected = localStorage.getItem(WALLET_STORAGE_KEY);

            if (wasConnected && window.ethereum) {
                setLoading(true);
                try {
                    const connected = await checkWalletConnection();
                    if (!connected) {
                        console.log('Could not restore wallet connection');
                        localStorage.removeItem(WALLET_STORAGE_KEY);
                    }
                } catch (error) {
                    console.error('Failed to restore wallet connection:', error);
                    localStorage.removeItem(WALLET_STORAGE_KEY);
                } finally {
                    setLoading(false);
                }
            }
            setIsInitialized(true);
        };

        initializeWallet();
    }, []);

    useEffect(() => {
        if (!window.ethereum) return;

        const ethereum = window.ethereum;

        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('disconnect', () => {
            console.log('Wallet disconnected by user');
            disconnectWallet();
        });

        return () => {
            if (ethereum.removeListener) {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
                ethereum.removeListener('chainChanged', handleChainChanged);
                ethereum.removeListener('disconnect', disconnectWallet);
            }
        };
    }, [account]);

    return (
        <WalletContext.Provider
            value={{
                account,
                signer,
                connectWallet,
                disconnectWallet,
                loading,
                isInitialized
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) throw new Error('useWallet must be used within a WalletProvider');
    return context;
};