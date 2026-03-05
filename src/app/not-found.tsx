import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-surface-800">Page Not Found</h2>
      <p className="text-sm text-surface-500">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
