import { useWallet } from '../contexts/wallet-context';

export const ProposalHeader = ({ onOpenModal }: { onOpenModal: () => void }) => {
    const { account } = useWallet();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 w-full max-w-5xl mx-auto px-2">
            <h2 className="text-xl font-medium text-green-400">Propostas</h2>

            <div className='flex items-center justify-center'>
                {account ? (
                    <button
                        onClick={onOpenModal}
                        className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 transition text-white cursor-pointer"
                    >
                        Criar Proposta
                    </button>
                ) : (
                    <div className="px-3 py-2 transition text-zinc-300 border border-zinc-700 rounded-md">
                        Conecte sua carteira para criar uma proposta
                    </div>
                )}
            </div>
        </div>
    );
};
