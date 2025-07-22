import { useWallet } from '../contexts/wallet-context';

export const ProposalHeader = ({ onOpenModal }: { onOpenModal: () => void }) => {
    const { account } = useWallet();

    return (
        <div className="flex flex-row items-center justify-between mb-4 gap-4 w-full max-w-5xl mx-auto px-2">
            <h2 className="text-lg font-semibold text-neutral-300">Propostas</h2>

            <div className='flex items-center justify-center'>
                {account ? (
                    <button
                        onClick={onOpenModal}
                        className="px-3 py-2 font-semibold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer"
                    >
                        Criar Proposta
                    </button>
                ) : (
                    <div className="px-3 py-2 transition text-zinc-400 border border-neutral-700 rounded-md text-sm font-medium">
                        Conecte sua carteira para criar uma proposta
                    </div>
                )}
            </div>
        </div>
    );
};
