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
    <div className="grid gap-4">
        {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} onVote={onVote} loading={loading} />
        ))}
    </div>
);
