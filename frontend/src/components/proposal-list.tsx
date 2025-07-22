import { ProposalCard } from './proposal-card';
import { useProposals } from '../hooks/use-proposals';

export const ProposalsList = () => {
    const {
        proposals,
        vote,
        loadingProposals,
        loadingVote,
        errorProposals,
        errorVote,
    } = useProposals();

    if (loadingProposals) {
        return <div className="text-center text-gray-400">Carregando propostas...</div>;
    }

    if (errorProposals) {
        return <div className="text-center text-red-500">{errorProposals}</div>;
    }

    if (proposals.length === 0) {
        return <div className="text-center text-gray-400">Nenhuma proposta encontrada.</div>;
    }

    return (
        <>
            {errorVote && (
                <div className="text-center text-red-500 mb-4">
                    {errorVote}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {proposals.map((p) => (
                    <ProposalCard
                        key={p.id}
                        proposal={p}
                        onVote={vote}
                        loading={loadingVote}
                    />
                ))}
            </div>
        </>
    );
};
