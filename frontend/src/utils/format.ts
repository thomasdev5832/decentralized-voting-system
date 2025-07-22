export const formatDeadline = (deadline: string) => {
  const date = new Date(Number(deadline) * 1000);
  return date.toLocaleString('pt-BR', { 
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', ' •');
};