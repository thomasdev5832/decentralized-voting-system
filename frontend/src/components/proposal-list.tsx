import type { Proposal } from '../types';
import { ProposalCard } from './proposal-card';

export const ProposalsList = ({
    proposals,
    onVote,
    loading,
}: {
    proposals: Proposal[];
    onVote: (id: number, support: boolean) => void;
    loading: boolean;
}) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} onVote={onVote} loading={loading} />
        ))}
    </div>
);
