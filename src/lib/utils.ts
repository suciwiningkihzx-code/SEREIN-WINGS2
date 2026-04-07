import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function getCyclePhase(dayInCycle: number, cycleLength: number, periodDuration: number) {
  if (dayInCycle <= periodDuration) return 'Menstruasi';
  if (dayInCycle <= cycleLength - 14 - 3) return 'Folikular';
  if (dayInCycle <= cycleLength - 14 + 3) return 'Ovulasi';
  return 'Luteal';
}
