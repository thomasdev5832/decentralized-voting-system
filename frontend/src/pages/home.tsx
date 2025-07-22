import { useState } from 'react';
import { ConnectWalletButton } from '../components/connect-wallet-button';
import { ProposalsList } from '../components/proposal-list';
import { CreateProposalModal } from '../components/create-proposal-modal';
import { ProposalHeader } from '../components/proposal-header';

export const Home = () => {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <div className="max-w-5xl min-h-screen mx-auto flex flex-col items-center justify-start p-2 text-center bg-neutral-950 text-white">
            <header className="w-full flex flex-row items-center justify-between">
                <h1 className="text-sm font-semibold uppercase text-zinc-100">Sistema de Votação Descentralizado</h1>
                <ConnectWalletButton />
            </header>

            <div className="mt-8 w-full">
                <ProposalHeader onOpenModal={() => setModalOpen(true)} />
                <ProposalsList />
            </div>

            <CreateProposalModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </div>
    );
};
