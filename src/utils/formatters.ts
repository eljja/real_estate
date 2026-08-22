export const formatManWon = (value: number): string => {
  if (value === 0) return '0원';
  
  const uk = Math.floor(value / 10000);
  const man = value % 10000;
  
  let result = '';
  if (uk > 0) {
    result += `${uk}억 `;
  }
  if (man > 0) {
    result += `${man.toLocaleString()}만원`;
  } else if (uk > 0) {
    result += '원'; // 1억 원
  }
  
  return result.trim();
};

export const formatManWonCompact = (value: number): string => {
  if (value === 0) return '0';
  if (value >= 10000) {
    const uk = value / 10000;
    return uk % 1 === 0 ? `${uk}억` : `${uk.toFixed(1)}억`;
  }
  return `${value.toLocaleString()}만`;
};

export const formatPercent = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const formatWon = (value: number): string => {
  return `${value.toLocaleString()}원`;
};
