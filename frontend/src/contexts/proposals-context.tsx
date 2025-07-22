import { createContext, useState, useCallback } from 'react';
import { fetchProposals } from '../services/voting-service';
import type { Proposal } from '../types';

interface ProposalsContextType {
    proposals: Proposal[];
    loadProposals: () => Promise<void>;
    setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export const ProposalsProvider = ({ children }: { children: React.ReactNode }) => {
    const [proposals, setProposals] = useState<Proposal[]>([]);

    const loadProposals = useCallback(async () => {
        const result = await fetchProposals();
        setProposals(result);
    }, []);

    return (
        <ProposalsContext.Provider value={{ proposals, loadProposals, setProposals }}>
            {children}
        </ProposalsContext.Provider>
    );
};
