import { useWallet } from '../contexts/wallet-context';

type ProposalHeaderProps = {
    onOpenModal: () => void;
    filter: string;
    setFilter: (filter: string) => void;
};

export const ProposalHeader = ({ onOpenModal, filter, setFilter }: ProposalHeaderProps) => {
    const { account } = useWallet();

    return (
        <div className="flex flex-row md:items-center justify-between mb-4 gap-4 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-neutral-300">Propostas</h2>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                    <option value="all">Todas</option>
                    <option value="active">Ativas</option>
                    <option value="closed">Encerradas</option>
                </select>
            </div>

            <div className='flex items-center justify-center'>
                {account ? (
                    <button
                        onClick={onOpenModal}
                        className="px-3 py-2 font-semibold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer"
                    >
                        Criar Proposta
                    </button>
                ) : (
                    <div className="px-3 py-2 transition text-zinc-400 border border-neutral-700 rounded-md text-xs sm:text-sm font-medium">
                        Conecte sua carteira para criar uma proposta
                    </div>
                )}
            </div>
        </div>
    );
};