import { createContext, useState, useCallback, useRef } from 'react';
import { fetchProposals } from '../services/voting-service';
import type { Proposal } from '../types';

interface ProposalsContextType {
    proposals: Proposal[];
    loadProposals: () => Promise<void>;
    setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
    isLoading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export const ProposalsProvider = ({ children }: { children: React.ReactNode }) => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const loadingRef = useRef(false);

    const loadProposals = useCallback(async () => {
        // Evita chamadas simultâneas
        if (loadingRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);

        try {
            const result = await fetchProposals();
            setProposals(result);
        } catch (error) {
            console.error('Erro ao carregar propostas:', error);
            throw error;
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    }, []);

    return (
        <ProposalsContext.Provider value={{
            proposals,
            loadProposals,
            setProposals,
            isLoading
        }}>
            {children}
        </ProposalsContext.Provider>
    );
};