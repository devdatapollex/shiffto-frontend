import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskEmail(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const maskedName = name.length <= 2 ? name[0] + '**' : name.slice(0, 2) + '••';
  const domainParts = domain.split('.');
  const maskedDomain =
    domainParts[0].length <= 2 ? domainParts[0][0] + '**' : domainParts[0].slice(0, 2) + '••';
  domainParts[0] = maskedDomain;
  return maskedName + '@' + domainParts.join('.');
}
