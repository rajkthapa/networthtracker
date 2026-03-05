'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-surface-800 mb-2">Something went wrong</h2>
        <p className="text-sm text-surface-500 mb-4">{error.message}</p>
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
