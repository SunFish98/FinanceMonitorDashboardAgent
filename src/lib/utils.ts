import { IndicatorStatus } from './types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}

export function getStatusColor(status: IndicatorStatus | undefined): string {
  switch (status) {
    case 'beat':
      return 'text-accent-green';
    case 'miss':
      return 'text-accent-red';
    case 'inline':
      return 'text-accent-yellow';
    case 'pending':
    default:
      return 'text-text-secondary';
  }
}

export function getStatusBg(status: IndicatorStatus | undefined): string {
  switch (status) {
    case 'beat':
      return 'bg-accent-green/10 border-accent-green/30';
    case 'miss':
      return 'bg-accent-red/10 border-accent-red/30';
    case 'inline':
      return 'bg-accent-yellow/10 border-accent-yellow/30';
    case 'pending':
    default:
      return 'bg-dashboard-card border-dashboard-border';
  }
}

export function getStatusLabel(status: IndicatorStatus | undefined): string {
  switch (status) {
    case 'beat':
      return '超预期';
    case 'miss':
      return '低于预期';
    case 'inline':
      return '符合预期';
    case 'pending':
    default:
      return '待发布';
  }
}

export function getImportanceStars(importance: number): string {
  return '★'.repeat(importance) + '☆'.repeat(5 - importance);
}

export function calculateChange(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
