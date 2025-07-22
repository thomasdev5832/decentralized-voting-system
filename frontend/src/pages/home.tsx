import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectWalletButton } from '../components/connect-wallet-button';
import { ProposalsList } from '../components/proposal-list';
import { getReadContract, getWriteContract } from '../contracts/contract';
import type { Proposal } from '../types';

export const Home = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [signer, setSigner] = useState<ethers.Signer | null>(null);

    // Load proposals from the blockchain
    const loadProposals = async () => {
        setLoading(true);
        setError('');
        try {
            const contract = getReadContract();
            const count = Number(await contract.proposalCount());

            const props: Proposal[] = [];
            for (let i = 1; i <= count; i++) {
                try {
                    const p = await contract.proposals(i);
                    props.push({
                        id: Number(p.id),
                        title: p.title,
                        description: p.description,
                        votesFor: p.votesFor.toString(),
                        votesAgainst: p.votesAgainst.toString(),
                        deadline: p.deadline.toString(),
                        result: Number(p.result),
                    });
                } catch {
                    console.warn(`Erro lendo proposta ${i}`);
                }
            }

            setProposals(props);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle voting on a proposal
    const vote = async (id: number, support: boolean) => {
        if (!signer) return;
        setLoading(true);
        try {
            const contract = await getWriteContract();
            const tx = await contract.vote(id, support);
            await tx.wait();
            await loadProposals();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProposals();
    }, []);

    return (
        <div className="max-w-5xl min-h-screen mx-auto flex flex-col items-center justify-start p-2 text-center bg-neutral-950 text-white">
            <header className="w-full flex flex-row items-center justify-between">
                <h1 className="text-sm font-semibold uppercase text-zinc-100">Sistema de Votação Descentralizado</h1>
                <ConnectWalletButton />
            </header>

            <div className="mt-8 w-full">
                <h2 className="text-xl font-medium text-green-400 mb-4">Propostas</h2>
                {loading ? (
                    <div>Carregando propostas...</div>
                ) : proposals.length === 0 ? (
                    <div>Nenhuma proposta encontrada.</div>
                ) : (
                    <ProposalsList proposals={proposals} onVote={vote} loading={loading} />
                )}
                {error && <div className="text-green-400 mt-4">{error}</div>}
            </div>
        </div>
    );
};
