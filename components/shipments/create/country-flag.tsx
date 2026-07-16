'use client';

import * as Flags from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

interface CountryFlagProps {
  code?: string;
  className?: string;
}

export function CountryFlag({ code, className }: CountryFlagProps) {
  if (!code) return null;

  const FlagComponent = (Flags as Record<string, React.ComponentType<{ className?: string }>>)[
    code.toUpperCase()
  ];

  if (!FlagComponent) {
    return <span className={cn('text-base', className)}>🌍</span>;
  }

  return (
    <FlagComponent className={cn('rounded-sm object-cover inline-block shrink-0', className)} />
  );
}
