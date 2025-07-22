import { useState, useCallback, useEffect, useContext } from 'react';
import type { Proposal } from '../types';
import { voteOnProposal } from '../services/voting-service';
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
  const { proposals, loadProposals } = useContext(ProposalsContext)!; // usa contexto global
  const { signer } = useWallet();

  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingVote, setLoadingVote] = useState(false);
  const [errorProposals, setErrorProposals] = useState<string | null>(null);
  const [errorVote, setErrorVote] = useState<string | null>(null);

  // Load proposals wrapper to set loading and error states locally, mas atualizar contexto global
  const loadProposalsWithStatus = useCallback(async () => {
    setLoadingProposals(true);
    setErrorProposals(null);
    try {
      await loadProposals(); // atualiza contexto global
    } catch (err) {
      console.error(err);
      setErrorProposals('Erro ao carregar propostas');
    } finally {
      setLoadingProposals(false);
    }
  }, [loadProposals]);

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
