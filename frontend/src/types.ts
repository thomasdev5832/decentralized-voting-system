export interface Proposal {
  id: number;
  title: string;
  description: string;
  votesFor: string;
  votesAgainst: string;
  deadline: string;
  result: number;
}
