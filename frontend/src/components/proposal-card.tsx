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
    onVote: (id: number, support: boolean) => Promise<void>;
    loading: boolean;
}) => {
    const { account } = useWallet();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    const [votingChoice, setVotingChoice] = useState<boolean | null>(null);
    const [voteSuccess, setVoteSuccess] = useState<boolean | null>(null);
    const [voteError, setVoteError] = useState<string | null>(null);

    const handleVote = async (support: boolean) => {
        setIsVoting(true);
        setVotingChoice(support);
        setVoteError(null);
        try {
            await onVote(proposal.id, support);
            setIsVoting(false);
            setVoteSuccess(support);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Erro ao votar:', error);
            setIsVoting(false);
            setVotingChoice(null);

            // Verifica se foi cancelamento do usuário
            if (error?.code === 4001 ||
                error?.code === 'ACTION_REJECTED' ||
                error?.reason === 'rejected' ||
                error?.message?.includes('user rejected') ||
                error?.message?.includes('User denied') ||
                error?.message?.includes('ethers-user-denied') ||
                error?.message?.includes('cancelled') ||
                error?.message?.includes('canceled')) {

                setVoteError('Você cancelou a confirmação na carteira.');
            } else {
                setVoteError('Erro ao processar a votação. Verifique sua conexão e tente novamente.');
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Reset todos os estados quando fechar
        setIsVoting(false);
        setVotingChoice(null);
        setVoteSuccess(null);
        setVoteError(null);
    };

    return (
        <>
            <div className="border border-neutral-800 rounded-md bg-gradient-to-b from-neutral-800/80 to-neutral-900 text-zinc-200 p-4 flex flex-col justify-between h-full shadow-sm">
                <div className="flex flex-col gap-3 text-left">
                    <div className="group relative">
                        <h2 className="text-lg font-semibold leading-tight line-clamp-2">
                            {proposal.title}
                        </h2>
                        <div className="absolute hidden group-hover:block z-10 w-full max-w-xs p-2 bg-neutral-800 border border-neutral-600 rounded-sm shadow-lg text-sm font-normal break-words">
                            {proposal.title}
                        </div>
                    </div>

                    <div className="group relative">
                        <p className="text-sm text-neutral-300 font-medium line-clamp-2 ">
                            {proposal.description}
                        </p>
                        <div className="absolute hidden group-hover:block z-10 w-full max-w-xs p-2 bg-neutral-800 border border-neutral-600 rounded-sm shadow-lg text-xs font-normal break-words">
                            {proposal.description}
                        </div>
                    </div>
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
                                disabled={loading || isVoting}
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

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/90 bg-opacity-60 z-50">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-md shadow-lg w-full max-w-md mx-4 p-6 text-neutral-200 relative">
                        {/* Botão X só aparece quando não está votando nem mostrando sucesso */}
                        {!isVoting && voteSuccess === null && voteError === null && (
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
                                aria-label="Fechar modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <div className="space-y-4">
                            <div className="pr-6">
                                <h3 className="text-xl font-semibold text-left">
                                    Proposta: {proposal.title}
                                </h3>
                                <p className="text-md text-neutral-400 mt-1 text-left">{proposal.description}</p>
                            </div>

                            {isVoting && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold">
                                            {votingChoice ? 'Votando a favor...' : 'Votando contra...'}
                                        </p>
                                        <p className="text-sm text-neutral-400 mt-1">
                                            Confirme a transação na carteira
                                        </p>
                                    </div>
                                </div>
                            )}

                            {voteSuccess !== null && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-green-400">
                                            Voto realizado com sucesso!
                                        </p>
                                        <p className="text-sm text-neutral-400 mt-1">
                                            Obrigado por participar da votação!
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCloseModal}
                                        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-sm transition-colors cursor-pointer"
                                    >
                                        Finalizar
                                    </button>
                                </div>
                            )}

                            {voteError && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-md">
                                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-md font-semibold text-red-400">
                                            {voteError}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setVoteError(null)}
                                        className="px-6 py-2 bg-neutral-600 hover:bg-neutral-700 text-white font-semibold rounded-sm transition-colors cursor-pointer"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            )}

                            {!isVoting && voteSuccess === null && voteError === null && (
                                <div className="flex flex-row justify-between gap-2 pt-4 border-t border-neutral-700">
                                    <button
                                        onClick={() => handleVote(false)}
                                        disabled={loading}
                                        className="w-full sm:w-auto text-lg flex-1 font-bold px-4 py-4 rounded-sm text-neutral-200 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-600 transition cursor-pointer disabled:opacity-50"
                                    >
                                        Votar contra
                                    </button>
                                    <button
                                        onClick={() => handleVote(true)}
                                        disabled={loading}
                                        className="w-full sm:w-auto text-lg flex-1 px-4 py-4 font-bold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer disabled:opacity-50"
                                    >
                                        Votar a favor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};