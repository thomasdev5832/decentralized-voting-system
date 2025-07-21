import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ETH_SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const ETH_SEPOLIA_CHAIN_ID = '0xaa36a7';
const CONTRACT_ADDRESS = '0xBB49Dfd518f8c0bcAc06cA95320ef516e820Aae2';
const ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'title', type: 'string' },
      { indexed: false, internalType: 'string', name: 'description', type: 'string' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'VoteReceived',
    type: 'event',
  },
  {
    inputs: [],
    name: 'VOTING_DURATION',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_title', type: 'string' },
      { internalType: 'string', name: '_description', type: 'string' },
    ],
    name: 'createProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getResult',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'proposalCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'proposals',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'votesFor', type: 'uint256' },
      { internalType: 'uint256', name: 'votesAgainst', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'enum VotingSystem.ResultType', name: 'result', type: 'uint8' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
      { internalType: 'bool', name: 'support', type: 'bool' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: string;
  votesAgainst: string;
  deadline: string;
  result: number;
}

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Public provider
  const rpcProvider = new ethers.JsonRpcProvider(ETH_SEPOLIA_RPC);
  // Read contract
  const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, rpcProvider);

  // Carrega propostas do contrato
  const loadProposals = async () => {
    setLoading(true);
    setError('');
    try {
      // recebe a quantidade de propostas
      const countBN = await readContract.proposalCount();
      const count = Number(countBN);

      // Verifica se há propostas
      if (count === 0) {
        setProposals([]);
        setError('Nenhuma proposta cadastrada no contrato.');
        setLoading(false);
        return;
      }

      // Cria um array para armazenar as propostas
      const proposals: Proposal[] = [];
      for (let i = 1; i <= count; i++) {
        try {
          // Lê a proposta do contrato
          const p = await readContract.proposals(i);
          // adiciona a proposta ao array de propostas
          proposals.push({
            id: Number(p.id),
            title: p.title || 'Sem título',
            description: p.description || 'Sem descrição',
            votesFor: p.votesFor.toString(),
            votesAgainst: p.votesAgainst.toString(),
            deadline: p.deadline.toString(),
            result: Number(p.result),
          });
        } catch (err) {
          console.warn(`Erro ao carregar proposta ${i}:`, err);
        }
      }

      setProposals(proposals);
      if (proposals.length === 0) {
        setError('Nenhuma proposta válida encontrada no contrato.');
      }
    } catch (err: any) {
      setError('Erro ao carregar propostas: ' + (err?.message || 'Erro desconhecido'));
      console.error('Erro geral ao carregar propostas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Connect to wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ETH_SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: ETH_SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Testnet',
                  nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
                  rpcUrls: [ETH_SEPOLIA_RPC],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } catch (addError) {
            setError('Erro ao adicionar a rede Sepolia.');
            console.error(addError);
            return;
          }
        } else {
          setError('Erro ao mudar para a rede Sepolia.');
          console.error(switchError);
          return;
        }
      }
      try {
        const prov = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await prov.getSigner();
        const address = await signer.getAddress();
        setProvider(prov);
        setSigner(signer);
        setAccount(address);
        setContract(new ethers.Contract(CONTRACT_ADDRESS, ABI, signer));
      } catch (err: any) {
        setError('Erro ao conectar a carteira: ' + (err?.message || 'Erro desconhecido'));
        console.error(err);
      }
    } else {
      setError('Carteira não detectada.');
    }
  };

  // Vota em uma proposta
  const vote = async (id: number, support: boolean) => {
    if (!contract) {
      setError('Carteira não conectada.');
      return;
    }
    setLoading(true);
    try {
      const tx = await contract.vote(id, support);
      await tx.wait();
      await loadProposals();
    } catch (err: any) {
      setError('Erro ao votar: ' + (err?.message || 'Erro desconhecido'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for ProposalCreated
  // useEffect(() => {
  //   if (contract) {
  //     contract.on('ProposalCreated', (id, title, description) => {
  //       console.log(`Nova proposta criada: ID=${id}, Título=${title}, Descrição=${description}`);
  //       loadProposals();
  //     });
  //     return () => {
  //       contract.removeAllListeners('ProposalCreated');
  //     };
  //   }
  //   // If contract is not defined, return undefined (no cleanup needed)
  //   return undefined;
  // }, [contract]);

  // Load proposals on component mount
  useEffect(() => {
    loadProposals();
  }, []);

  // Format deadline
  const formatDeadline = (deadline: string) => {
    const date = new Date(Number(deadline) * 1000);
    return date.toLocaleString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="max-w-5xl min-h-screen mx-auto flex flex-col items-center justify-start p-4 text-center bg-neutral-950">
      <h1 className="text-3xl font-semibold text-green-400">Sistema de Votação Descentralizado</h1>
      {!account ? (
        <button
          onClick={connectWallet}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'Conectando...' : 'Conectar carteira'}
        </button>
      ) : (
        <div className="mt-4 text-green-300">
          Conectado: {`${account.slice(0, 6)}...${account.slice(-4)}`}
        </div>
      )}
      <div className="mt-8 w-full">
        <h2 className="text-xl text-green-400 mb-4">Propostas</h2>
        {loading ? (
          <div className="text-gray-400">Carregando propostas...</div>
        ) : proposals.length === 0 ? (
          <div className="text-gray-400">Nenhuma proposta encontrada.</div>
        ) : (
          <div className="grid gap-4">
            {proposals.map((p, idx) => (
              <div key={idx} className="border p-4 rounded bg-neutral-900 text-zinc-300">
                <div className="text-lg font-bold">Proposta {p.id}: {p.title}</div>
                <div className="text-sm mt-1">{p.description}</div>
                <div className="mt-2">Votos a favor: {p.votesFor}</div>
                <div>Votos contra: {p.votesAgainst}</div>
                <div>Prazo: {formatDeadline(p.deadline)}</div>
                {account && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                      onClick={() => vote(p.id, true)}
                      disabled={loading}
                    >
                      {loading ? 'Votando...' : 'Votar a favor'}
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      onClick={() => vote(p.id, false)}
                      disabled={loading}
                    >
                      {loading ? 'Votando...' : 'Votar contra'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </div>
    </div>
  );
}

export default App;