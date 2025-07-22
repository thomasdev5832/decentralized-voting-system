import type { Proposal } from '../types';
import { formatDeadline } from '../utils/format';
import { useWallet } from '../contexts/wallet-context';

export const ProposalCard = ({
    proposal,
    onVote,
    loading,
}: {
    proposal: Proposal;
    onVote: (id: number, support: boolean) => void;
    loading: boolean;
}) => {
    const { account } = useWallet();

    return (
        <div className="border border-zinc-600 p-4 rounded bg-neutral-900 text-zinc-300 w-xs max-w-md mx-auto">
            <div className="text-lg font-bold">Proposta {proposal.id}: {proposal.title}</div>
            <div className="text-sm mt-1">{proposal.description}</div>
            <div className='text-xs mt-2 font-semibold'>Prazo: {formatDeadline(proposal.deadline)}</div>

            <div className="flex justify-around mt-3 gap-2 text-xs rounded px-3 py-2">
                <div className="flex flex-col flex-1 items-center text-zinc-400 bg-zinc-800 px-4 py-2">
                    <span className="font-semibold">Votos a favor</span>
                    <span className="text-green-400 font-bold mt-1 text-xl">{proposal.votesFor}</span>
                </div>

                <div className="flex flex-col flex-1 items-center text-zinc-400 bg-zinc-800 px-4 py-2">
                    <span className="font-semibold">Votos contra</span>
                    <span className="text-red-400 font-bold mt-1 text-xl">{proposal.votesAgainst}</span>
                </div>
            </div>

            {account ? (
                <div className="mt-4 flex justify-center gap-2">
                    <button
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer"
                        onClick={() => onVote(proposal.id, true)}
                        disabled={loading}
                    >
                        Votar a favor
                    </button>
                    <button
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-500/50 transition cursor-pointer"
                        onClick={() => onVote(proposal.id, false)}
                        disabled={loading}
                    >
                        Votar contra
                    </button>
                </div>
            ) : (
                <div className="mt-4 text-zinc-400 text-xs font-semibold border rounded-md w-fit mx-auto px-2 py-1">
                    Conecte sua carteira para votar
                </div>
            )}
        </div>
    );
}
