import { useEffect, useState, useCallback } from 'react';
import type { Proposal } from '../types';
import { fetchProposals, voteOnProposal } from '../services/voting-service';
import { useWallet } from '../contexts/wallet-context';

export const useProposals = () => {
  const { signer } = useWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProposals();
      setProposals(result);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar propostas');
    } finally {
      setLoading(false);
    }
  }, []);

  const vote = useCallback(
    async (id: number, support: boolean) => {
      if (!signer) return;
      setLoading(true);
      try {
        await voteOnProposal(id, support);
        await loadProposals(); 
      } catch (err) {
        console.error(err);
        setError('Erro ao votar');
      } finally {
        setLoading(false);
      }
    },
    [signer, loadProposals]
  );

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  return { proposals, vote, loading, error };
};
