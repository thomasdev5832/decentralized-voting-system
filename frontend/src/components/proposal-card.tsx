import type { Proposal } from '../types';
import { formatDeadline } from '../utils/format';

export const ProposalCard = ({
    proposal,
    onVote,
    loading,
}: {
    proposal: Proposal;
    onVote: (id: number, support: boolean) => void;
    loading: boolean;
}) => (
    <div className="border p-4 rounded bg-neutral-900 text-zinc-300">
        <div className="text-lg font-bold">Proposta {proposal.id}: {proposal.title}</div>
        <div className="text-sm mt-1">{proposal.description}</div>
        <div className="mt-2">Votos a favor: {proposal.votesFor}</div>
        <div>Votos contra: {proposal.votesAgainst}</div>
        <div>Prazo: {formatDeadline(proposal.deadline)}</div>
        <div className="mt-4 flex justify-center gap-2">
            <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => onVote(proposal.id, true)}
                disabled={loading}
            >
                Votar a favor
            </button>
            <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => onVote(proposal.id, false)}
                disabled={loading}
            >
                Votar contra
            </button>
        </div>
    </div>
);
