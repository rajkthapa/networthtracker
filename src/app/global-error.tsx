'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Something went wrong</h2>
          <p style={{ color: '#666' }}>{error.message}</p>
          <button onClick={reset} style={{ padding: '8px 24px', borderRadius: '12px', background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
