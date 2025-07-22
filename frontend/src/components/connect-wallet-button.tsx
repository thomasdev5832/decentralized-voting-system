import { useWallet } from '../contexts/wallet-context';

export const ConnectWalletButton = () => {
    const { account, connectWallet, disconnectWallet, loading } = useWallet();

    const maskAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    return (
        <button
            onClick={account ? disconnectWallet : connectWallet}
            disabled={loading}
            className="px-3 py-2 font-semibold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer"
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
