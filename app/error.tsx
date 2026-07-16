'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { env } from '@/config/env.config';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error using our custom logger
    logger.error('Unhandled Runtime Error', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="p-4 rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Something went wrong!
      </h2>

      <p className="mt-4 text-base text-muted-foreground max-w-md">
        An unexpected error occurred. We&apos;ve been notified and are working to fix it.
      </p>

      {/* Dev Mode Error Details */}
      {env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-muted rounded-lg text-left max-w-2xl w-full overflow-auto border border-border">
          <p className="font-mono text-sm font-bold text-destructive mb-2 uppercase tracking-wider">
            Development Error Info:
          </p>
          <pre className="font-mono text-xs whitespace-pre-wrap break-all text-muted-foreground">
            {error.message || 'No message available'}
            {error.stack && `\n\nStack Trace:\n${error.stack}`}
          </pre>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={() => reset()} variant="default" size="lg" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Try again
        </Button>
        <Button onClick={() => (window.location.href = '/')} variant="outline" size="lg">
          Go to Homepage
        </Button>
      </div>
    </div>
  );
}
