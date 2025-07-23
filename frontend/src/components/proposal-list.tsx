import { useState, useEffect } from 'react';
import { ProposalCard } from './proposal-card';
import { useProposals } from '../hooks/use-proposals';

type ProposalsListProps = {
    filter?: string;
};

const ITEMS_PER_PAGE = 6;

export const ProposalsList = ({ filter = 'all' }: ProposalsListProps) => {
    const {
        proposals,
        vote,
        loadingProposals,
        loadingVote,
        errorProposals,
        errorVote,
    } = useProposals();

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const filteredProposals = proposals.filter((proposal) => {
        const now = Math.floor(Date.now() / 1000);
        const isActive = Number(proposal.deadline) > now;

        switch (filter) {
            case 'active':
                return isActive;
            case 'closed':
                return !isActive;
            default:
                return true;
        }
    }).reverse();

    useEffect(() => {
        const total = Math.ceil(filteredProposals.length / ITEMS_PER_PAGE);
        setTotalPages(total);
        setCurrentPage(1);
    }, [filteredProposals.length, filter]);

    const paginatedProposals = filteredProposals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getEmptyMessage = () => {
        switch (filter) {
            case 'active':
                return 'Nenhuma proposta ativa no momento.';
            case 'closed':
                return 'Nenhuma proposta encerrada.';
            default:
                return 'Nenhuma proposta encontrada.';
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    if (loadingProposals && proposals.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Carregando propostas...</p>
                </div>
            </div>
        );
    }

    if (errorProposals) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 mb-2">{errorProposals}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 text-sm bg-neutral-800 text-white rounded hover:bg-neutral-700 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (!loadingProposals && filteredProposals.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400">{getEmptyMessage()}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[80vh]">
            <main className="flex-grow">
                {errorVote && (
                    <div className="p-4 mb-4 text-center text-red-500 bg-red-500/10 rounded-lg">
                        {errorVote}
                    </div>
                )}

                {/* Overlay de loading durante atualizações */}
                <div className="relative">
                    {loadingProposals && proposals.length > 0 && (
                        <div className="absolute inset-0 rounded-lg bg-neutral-900 flex items-center justify-center z-10">
                            <div className="flex items-center gap-2 bg-neutral-900 px-4 py-2 rounded-lg">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm">Atualizando...</p>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
                        {paginatedProposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onVote={vote}
                                loading={loadingVote}
                            />
                        ))}
                    </div>
                </div>
            </main>

            {totalPages > 1 && (
                <footer className="bottom-0 py-4 bg-neutral-900 border-t border-neutral-800">
                    <div className="container max-w-5xl mx-auto">
                        <div className="flex items-center justify-between px-4">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-sm bg-neutral-800 text-neutral-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors cursor-pointer"
                                aria-label="Página anterior"
                            >
                                Anterior
                            </button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-md flex font-semibold items-center justify-center text-sm ${currentPage === page
                                                ? 'bg-gradient-to-b from-neutral-600 to-neutral-700 text-white'
                                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 cursor-pointer'
                                                } transition-colors`}
                                            aria-label={`Ir para página ${page}`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-sm bg-neutral-800 text-neutral-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors cursor-pointer"
                                aria-label="Próxima página"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};