import type { Proposal } from '../types';
import { getReadContract, getWriteContract } from '../contracts/contract';

export const fetchProposals = async (): Promise<Proposal[]> => {
  const contract = getReadContract();
  const count = Number(await contract.proposalCount());

  const proposals: Proposal[] = [];
  for (let i = 1; i <= count; i++) {
    try {
      const p = await contract.proposals(i);
      proposals.push({
        id: Number(p.id),
        title: p.title,
        description: p.description,
        votesFor: p.votesFor.toString(),
        votesAgainst: p.votesAgainst.toString(),
        deadline: p.deadline.toString(),
        result: Number(p.result),
      });
    } catch (err) {
      console.warn(`Erro lendo proposta ${i}`, err);
    }
  }

  return proposals;
};

export const voteOnProposal = async (id: number, support: boolean) => {
  const contract = await getWriteContract(); // já usa signer de window.ethereum
  const tx = await contract.vote(id, support);
  await tx.wait();
};

export const createProposal = async (title: string, description: string) => {
  const contract = await getWriteContract();
  const tx = await contract.createProposal(title, description);
  await tx.wait();
};

export const checkHasVoted = async (proposalId: number, voterAddress: string): Promise<boolean> => {
  const contract = getReadContract();
  const voted: boolean = await contract.hasVoted(proposalId, voterAddress);
  return voted;
};