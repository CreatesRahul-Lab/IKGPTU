import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Academic year starts in July (month 6)
  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export function calculateAttendancePercentage(
  present: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 100) / 100; // Round to 2 decimals
}

export function getAttendanceStatus(percentage: number): {
  status: 'Excellent' | 'Good' | 'Average' | 'Low' | 'Critical';
  color: string;
} {
  if (percentage >= 90) {
    return { status: 'Excellent', color: 'text-green-600' };
  } else if (percentage >= 75) {
    return { status: 'Good', color: 'text-blue-600' };
  } else if (percentage >= 65) {
    return { status: 'Average', color: 'text-yellow-600' };
  } else if (percentage >= 50) {
    return { status: 'Low', color: 'text-orange-600' };
  } else {
    return { status: 'Critical', color: 'text-red-600' };
  }
}

export function generateRollNo(branch: string, year: number, serial: number): string {
  // Format: BTCS-2023-001
  return `${branch}-${year}-${String(serial).padStart(3, '0')}`;
}

export function getBranchName(code: string): string {
  const branches: Record<string, string> = {
    BTCS: 'B.Tech Computer Science',
    BTES: 'B.Tech Electronics',
    BTAM: 'B.Tech Applied Mathematics',
    BTOE: 'B.Tech Open Elective',
    BBA: 'Bachelor of Business Administration',
    BCA: 'Bachelor of Computer Applications',
  };
  return branches[code] || code;
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
