
import { Suspense } from 'react';
import SearchResults from './searchResults';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16">جاري التحميل...</div>}>
      <SearchResults />
    </Suspense>
  );
}

