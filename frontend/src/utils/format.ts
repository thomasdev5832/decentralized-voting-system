export const formatDeadline = (deadline: string) => {
  const date = new Date(Number(deadline) * 1000);
  return date.toLocaleString('pt-BR', { timeZone: 'UTC' });
};