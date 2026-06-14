import { Suspense } from 'react';
import SearchResultsClient from '@/components/search-results-client';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-lg text-slate-600">Loading results…</div>}>
      <SearchResultsClient />
    </Suspense>
  );
}
