import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN')
}

export function calculateProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.round((current / target) * 100)
}

export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'text-green-600'
  if (progress >= 70) return 'text-blue-600'
  if (progress >= 40) return 'text-yellow-600'
  return 'text-red-600'
}
