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
            await loadProposals();
            onClose();
        } catch (err) {
            console.error(err);
            setError('Erro ao criar proposta. Tente novamente.');
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-white">Criar Proposta</h2>

                <input
                    className="w-full p-3 rounded bg-neutral-800 text-white mb-3"
                    placeholder="Título da proposta"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isCreating}
                />

                <textarea
                    className="w-full p-3 rounded bg-neutral-800 text-white resize-none"
                    rows={4}
                    placeholder="Descreva sua proposta"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isCreating}
                />

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="flex justify-end mt-4 gap-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                        onClick={onClose}
                        disabled={isCreating}
                    >
                        Cancelar
                    </button>

                    <button
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Criando...' : 'Criar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
