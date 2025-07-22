import type { Proposal } from '../types';
import { formatDeadline } from '../utils/format';
import { useWallet } from '../contexts/wallet-context';
import { useState } from 'react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleVote = (support: boolean) => {
        onVote(proposal.id, support);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="border border-neutral-800 rounded-md bg-gradient-to-b from-neutral-800/80 to-neutral-900 text-zinc-200 p-4 flex flex-col justify-between h-full shadow-sm">
                <div className="flex flex-col gap-3 text-left">
                    <h2 className="text-lg font-semibold leading-tight line-clamp-1">
                        {proposal.title}
                    </h2>
                    <p className="text-sm text-neutral-300 font-medium line-clamp-2">
                        {proposal.description}
                    </p>
                    <div className="flex flex-col text-sm">
                        <span className="text-neutral-400">Prazo</span>
                        <span className="font-medium text-neutral-100">
                            {formatDeadline(proposal.deadline)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-neutral-800 rounded-sm py-3 flex flex-col items-center justify-center">
                            <span className="text-sm text-zinc-400 font-medium">A favor</span>
                            <span className="text-green-400 text-lg font-bold">{proposal.votesFor}</span>
                        </div>
                        <div className="bg-neutral-800 rounded-sm py-3 flex flex-col items-center justify-center">
                            <span className="text-sm text-zinc-400 font-medium">Contra</span>
                            <span className="text-red-400 text-lg font-bold">{proposal.votesAgainst}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    {account ? (
                        proposal.hasVoted ? (
                            <div className="text-center text-sm text-neutral-400 border border-neutral-700 rounded-md py-2 px-3 font-medium">
                                Você já votou nesta proposta
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                disabled={loading}
                                className="w-full font-semibold bg-gradient-to-t from-neutral-300 to-neutral-200 hover:from-neutral-400 hover:to-neutral-300 text-neutral-950 py-2 px-4 rounded-sm transition duration-200 disabled:opacity-50 cursor-pointer shadow-md"
                            >
                                Votar
                            </button>
                        )
                    ) : (
                        <div className="text-center text-xs text-neutral-400 border border-neutral-700 rounded-md py-2 px-3 font-medium">
                            Conecte sua carteira para votar
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de votação */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-md shadow-lg w-full max-w-md p-6 text-neutral-200">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-left">
                                    Proposta: {proposal.title}
                                </h3>
                                <p className="text-md text-neutral-400 mt-1 text-left">{proposal.description}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-neutral-700">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full sm:w-auto text-sm px-4 py-2 rounded-sm border font-medium border-neutral-700 hover:bg-neutral-800 transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <div className="flex flex-row gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleVote(false)}
                                        disabled={loading}
                                        className="w-full sm:w-auto text-sm font-bold px-4 py-2 rounded-sm text-neutral-200 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-600 transition cursor-pointer"
                                    >
                                        Contra
                                    </button>
                                    <button
                                        onClick={() => handleVote(true)}
                                        disabled={loading}
                                        className="w-full sm:w-auto text-sm px-4 py-2 font-bold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer"
                                    >
                                        A favor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};