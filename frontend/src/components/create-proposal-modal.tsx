import { useState } from 'react';
import { createProposal } from '../services/voting-service';
import { useWallet } from '../contexts/wallet-context';
import { useProposals } from '../hooks/use-proposals';

export const CreateProposalModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { signer } = useWallet();
    const { loadProposals } = useProposals();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!signer) {
            setError('Conecte a carteira para criar uma proposta.');
            return;
        }
        if (!title.trim() || !description.trim()) {
            setError('Título e descrição são obrigatórios.');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            await createProposal(title, description);
            setTitle('');
            setDescription('');
            onClose();
            // Aguarda um pequeno delay para garantir que a transação foi processada
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Recarregar as propostas
            await loadProposals();
        } catch (err) {
            console.error(err);
            setError('Erro ao criar proposta. Tente novamente.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        if (!isCreating) {
            setTitle('');
            setDescription('');
            setError(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-white">Criar Proposta</h2>

                <input
                    className="w-full p-3 rounded bg-neutral-800 text-white mb-3 outline-none focus:ring-1 focus:ring-neutral-500"
                    placeholder="Título da proposta"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isCreating}
                />

                <textarea
                    className="w-full p-3 rounded bg-neutral-800 text-white resize-none outline-none focus:ring-1 focus:ring-neutral-500"
                    rows={4}
                    placeholder="Descreva sua proposta"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isCreating}
                />

                <p className='mt-2 text-sm'>Sua proposta termina em <span className="font-semibold">1 semana</span></p>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end mt-4 gap-2">
                    <button
                        className="px-3 py-2 font-semibold rounded-sm bg-gradient-to-b from-neutral-700 to-neutral-800 hover:from-neutral-700 hover:to-neutral-700 transition cursor-pointer disabled:opacity-50"
                        onClick={handleClose}
                        disabled={isCreating}
                    >
                        Cancelar
                    </button>

                    <button
                        className="px-3 py-2 font-semibold rounded-sm bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-600 transition cursor-pointer disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Criando proposta...' : 'Criar proposta'}
                    </button>
                </div>
            </div>
        </div>
    );
};