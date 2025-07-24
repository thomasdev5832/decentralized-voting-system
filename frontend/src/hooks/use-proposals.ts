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
  const context = useContext(ProposalsContext);
  if (!context) {
    throw new Error('useProposals deve ser usado dentro de ProposalsProvider');
  }
  
  const { proposals, loadProposals, setProposals, isLoading: contextLoading } = context;
  const { signer, account } = useWallet();

  const [loadingVote, setLoadingVote] = useState(false);
  const [errorProposals, setErrorProposals] = useState<string | null>(null);
  const [errorVote, setErrorVote] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // verifica votos dos usuários
  const checkUserVotes = useCallback(async (proposalsList: Proposal[]) => {
    if (!account || proposalsList.length === 0) return proposalsList;
    
    try {
      const updatedProposals = await Promise.all(
        proposalsList.map(async (proposal) => {
          const hasVoted = await checkHasVoted(proposal.id, account);
          return { ...proposal, hasVoted };
        })
      );
      return updatedProposals;
    } catch (err) {
      console.error('Erro ao verificar votos:', err);
      return proposalsList;
    }
  }, [account]);

  const loadProposalsWithStatus = useCallback(async () => {
    setErrorProposals(null);
    try {
      await loadProposals();
    } catch (err) {
      console.error('Erro em loadProposalsWithStatus:', err);
      setErrorProposals('Erro ao carregar propostas');
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [loadProposals, isInitialLoad]);

  // verifica votos quando as propostas ou conta mudam
  useEffect(() => {
    const updateVoteStatus = async () => {
      if (proposals.length > 0) {
        const updatedProposals = await checkUserVotes(proposals);
        if (JSON.stringify(updatedProposals) !== JSON.stringify(proposals)) {
          setProposals(updatedProposals);
        }
      }
    };

    updateVoteStatus();
  }, [proposals, checkUserVotes, setProposals, account]);

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
        // Recarrega as propostas após votar
        await loadProposalsWithStatus();
      } catch (err) {
        console.error(err);
        setErrorVote('Erro ao votar');
        throw err; // Re-throw
      } finally {
        setLoadingVote(false);
      }
    },
    [signer, loadProposalsWithStatus]
  );

  // Ao montar, carrega propostas pela primeira vez
  useEffect(() => {
    if (isInitialLoad) {
      loadProposalsWithStatus();
    }
  }, [loadProposalsWithStatus, isInitialLoad]);

  return {
    proposals,
    vote,
    loadingProposals: contextLoading || isInitialLoad, // Combina ambos os loadings
    loadingVote,
    errorProposals,
    errorVote,
    loadProposals: loadProposalsWithStatus,
  };
};