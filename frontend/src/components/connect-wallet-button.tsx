import { useWallet } from '../contexts/wallet-context';

export const ConnectWalletButton = () => {
    const { account, connectWallet, disconnectWallet, loading } = useWallet();

    const maskAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <button
            onClick={account ? disconnectWallet : connectWallet}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition cursor-pointer"
        >
            {loading ? (
                'Connecting...'
            ) : account ? (
                maskAddress(account)
            ) : (
                'Connect Wallet'
            )}
        </button>
    );
};
