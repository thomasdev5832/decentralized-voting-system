import { ConnectWalletButton } from '../components/connect-wallet-button';
import { ProposalsList } from '../components/proposal-list';

export const Home = () => {

    return (
        <div className="max-w-5xl min-h-screen mx-auto flex flex-col items-center justify-start p-2 text-center bg-neutral-950 text-white">
            <header className="w-full flex flex-row items-center justify-between">
                <h1 className="text-sm font-semibold uppercase text-zinc-100">Sistema de Votação Descentralizado</h1>
                <ConnectWalletButton />
            </header>

            <div className="mt-8 w-full">
                <h2 className="text-xl font-medium text-green-400 mb-4">Propostas</h2>
                <ProposalsList />
            </div>
        </div>
    );
};
