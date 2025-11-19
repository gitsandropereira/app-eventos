
export const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  // If it matches YYYY-MM-DD exactly, force local parsing
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
  }
  // Otherwise fall back to standard Date parsing (handles ISO strings with time)
  return new Date(dateStr);
};

export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? parseDate(date) : date;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateShort = (date: string | Date): string => {
    const d = typeof date === 'string' ? parseDate(date) : date;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatDateLong = (date: string | Date): string => {
    const d = typeof date === 'string' ? parseDate(date) : date;
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
};
