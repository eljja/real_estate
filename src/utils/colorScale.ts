export const getCrashRiskColor = (score: number): string => {
  if (score < 20) return '#22c55e'; // green
  if (score < 40) return '#84cc16'; // light green
  if (score < 60) return '#eab308'; // yellow
  if (score < 80) return '#f97316'; // orange
  return '#ef4444'; // red
};

export const getHsiColor = (hsi: number): string => {
  if (hsi < 0.3) return '#22c55e'; // green
  if (hsi < 0.5) return '#eab308'; // yellow
  if (hsi < 0.7) return '#f97316'; // orange
  if (hsi < 1.0) return '#ef4444'; // red
  return '#991b1b'; // dark red
};

export const getCrashRiskLabel = (score: number): string => {
  if (score < 20) return '매우 안전';
  if (score < 40) return '안전';
  if (score < 60) return '보통';
  if (score < 80) return '위험';
  return '매우 위험';
};

export const getHsiLabel = (hsi: number): string => {
  if (hsi < 0.3) return '안정적 (여유)';
  if (hsi < 0.5) return '경계 (주의 요망)';
  if (hsi < 0.7) return '위험 (현금흐름 악화)';
  if (hsi < 1.0) return '고위험 (파산 우려)';
  return '한계 초과 (파산)';
};
