import { useState, useCallback, useEffect, useContext } from 'react';
import type { Proposal } from '../types';
import { checkHasVoted, voteOnProposal } from '../services/voting-service';
import { useWallet } from '../contexts/wallet-context';
import { ProposalsContext } from '../contexts/proposals-context';

interface UseProposalsReturn {
  proposals: Proposal[];
  vote: (id: number, support: boolean) => Promise<void>;
  loadingProposals: boolean;
  loadingVote: boolean;
  errorProposals: string | null;
  errorVote: string | null;
  loadProposals: () => Promise<void>;
}

export const useProposals = (): UseProposalsReturn => {
  const { proposals, loadProposals, setProposals } = useContext(ProposalsContext)!; // usa contexto global
  const { signer, account } = useWallet();

  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [errorProposals, setErrorProposals] = useState<string | null>(null);
  const [errorVote, setErrorVote] = useState<string | null>(null);

  // Load proposals wrapper to set loading and error states locally, mas atualizar contexto global
  const loadProposalsWithStatus = useCallback(async () => {
    setLoadingProposals(true);
    setErrorProposals(null);
    try {
      await loadProposals(); // Carrega as propostas
      if (account) {
        const updatedProposals = await Promise.all(
          proposals.map(async (proposal) => {
            const hasVoted = await checkHasVoted(proposal.id, account);
            return { ...proposal, hasVoted };
          })
        );
        setProposals(updatedProposals); // Atualiza o contexto
      } else {
        console.log('Nenhuma conta conectada');
      }
    } catch (err) {
      console.error('Erro em loadProposalsWithStatus:', err);
      setErrorProposals('Erro ao carregar propostas');
    } finally {
      setLoadingProposals(false);
    }
  }, [loadProposals, account, setProposals]); 

  // Função votar
  const vote = useCallback(
    async (id: number, support: boolean) => {
      if (!signer) {
        setErrorVote('Wallet não conectada');
        return;
      }
      setLoadingVote(true);
      setErrorVote(null);
      try {
        await voteOnProposal(id, support);
        await loadProposalsWithStatus(); // atualiza lista após voto
      } catch (err) {
        console.error(err);
        setErrorVote('Erro ao votar');
      } finally {
        setLoadingVote(false);
      }
    },
    [signer, loadProposalsWithStatus]
  );

  // Ao montar, carrega propostas pela primeira vez
  useEffect(() => {
    loadProposalsWithStatus();
  }, [loadProposalsWithStatus]);

  return {
    proposals,
    vote,
    loadingProposals,
    loadingVote,
    errorProposals,
    errorVote,
    loadProposals: loadProposalsWithStatus,
  };
};
