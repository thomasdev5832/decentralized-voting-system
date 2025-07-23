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
const TARGET_CHAIN_ID = '0xaa36a7'; // Sepolia testnet

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const checkWalletConnection = async (): Promise<boolean> => {
        try {
            if (!window.ethereum) return false;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();

            if (accounts.length === 0) return false;

            const network = await provider.getNetwork();
            if (network.chainId.toString(16) !== TARGET_CHAIN_ID.slice(2)) {
                console.log('Wrong network detected');
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

    // Função para conectar a wallet
    const connectWallet = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) throw new Error('No wallet found');

            // Tenta trocar para a rede correta
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: TARGET_CHAIN_ID }],
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (switchError: any) {
                console.error('Failed to switch network:', switchError);
                throw switchError;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setAccount(address);
            setSigner(signer);

            // Salva no localStorage que o usuário conectou
            localStorage.setItem(WALLET_STORAGE_KEY, 'true');
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

    // Função para desconectar a wallet
    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
        localStorage.removeItem(WALLET_STORAGE_KEY);
    };

    // Função para lidar com mudanças de conta
    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            // Usuário desconectou a wallet
            disconnectWallet();
        } else if (accounts[0] !== account) {
            // Usuário trocou de conta
            setAccount(accounts[0]);
            // Reconecta para atualizar o signer
            if (localStorage.getItem(WALLET_STORAGE_KEY)) {
                checkWalletConnection();
            }
        }
    };

    // Função para lidar com mudanças de rede
    const handleChainChanged = (chainId: string) => {
        if (chainId !== TARGET_CHAIN_ID) {
            console.log('Network changed to unsupported network');
            // Opcionalmente desconectar se mudou para rede não suportada
            // disconnectWallet();
        } else {
            // Reconecta se voltou para a rede correta
            if (localStorage.getItem(WALLET_STORAGE_KEY)) {
                checkWalletConnection();
            }
        }
    };

    // Inicializa a conexão da wallet
    useEffect(() => {
        const initializeWallet = async () => {
            const wasConnected = localStorage.getItem(WALLET_STORAGE_KEY);

            if (wasConnected && window.ethereum) {
                setLoading(true);
                try {
                    await checkWalletConnection();
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

    // listeners para mudanças na wallet
    useEffect(() => {
        if (!window.ethereum) return;

        const ethereum = window.ethereum;

        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);
        ethereum.on('disconnect', () => {
            disconnectWallet();
        });

        // Cleanup
        return () => {
            if (ethereum.removeListener) {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
                ethereum.removeListener('chainChanged', handleChainChanged);
                ethereum.removeListener('disconnect', disconnectWallet);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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