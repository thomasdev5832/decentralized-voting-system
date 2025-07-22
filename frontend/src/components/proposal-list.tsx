import { ProposalCard } from './proposal-card';
import { useProposals } from '../hooks/use-proposals';

export const ProposalsList = () => {
    const { proposals, vote, loading } = useProposals();

    if (loading) {
        return <div className="text-center text-gray-400">Carregando propostas...</div>;
    }

    if (proposals.length === 0) {
        return <div className="text-center text-gray-400">Nenhuma proposta encontrada.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((p) => (
                <ProposalCard
                    key={p.id}
                    proposal={p}
                    onVote={vote}
                    loading={loading}
                />
            ))}
        </div>
    );
};
