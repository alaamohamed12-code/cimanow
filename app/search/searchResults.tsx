"use client";

import { useSearchParams } from 'next/navigation';
import ContentGrid from '@/components/ContentGrid';
import { Content } from '@/lib/mockData';
import { useEffect, useState } from 'react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Content[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotalPages(1);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim(), page: String(page) });
        const response = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        setResults(Array.isArray(data.items) ? data.items : []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  const buildPageButtons = (): number[] => {
    const windowStart = Math.max(1, page - 2);
    const windowEnd = Math.min(totalPages, page + 2);
    const pages = new Set<number>([1, totalPages]);
    for (let current = windowStart; current <= windowEnd; current++) {
      pages.add(current);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };
  const pageButtons = buildPageButtons();

  return (
    <div className="app-shell min-h-screen">
      {/* Page Header */}
      <section className="mx-auto max-w-[1680px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,#1a1830_0%,#121022_58%,#0f0f19_100%)] px-7 py-8 shadow-[0_20px_46px_rgba(0,0,0,0.42)] sm:px-12 sm:py-10 lg:px-16">
          <div className="pointer-events-none absolute -right-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(246,201,14,0.2),transparent_68%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(109,77,255,0.18),transparent_70%)]" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-4 text-center font-[family-name:var(--font-cairo)]">
            <span className="inline-flex min-h-[42px] min-w-[172px] items-center justify-center rounded-[14px] border border-[#ffe88a]/80 bg-[linear-gradient(180deg,#ffe98d_0%,#f6c90e_52%,#d6a10a_100%)] px-6 py-2 text-[15px] font-black leading-none tracking-[-0.02em] text-[#2b1f00] shadow-[0_10px_24px_rgba(246,201,14,0.3)]">
              نتائج البحث
            </span>
            <h1 className="text-[clamp(38px,5.6vw,76px)] font-black leading-[0.92] tracking-[-0.03em] text-white [text-shadow:0_8px_28px_rgba(0,0,0,0.55)]">
              استكشاف النتائج
            </h1>
            <p className="text-[15px] sm:text-[17px] font-semibold text-white/80">
              البحث عن:
              <span className="mr-2 rounded-lg border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[#f6c90e]">&quot;{query}&quot;</span>
            </p>
            <span className="inline-flex items-center rounded-full border border-[#f6c90e]/30 bg-[#f6c90e]/10 px-5 py-1.5 text-[13px] font-bold text-[#f6c90e] shadow-[0_6px_18px_rgba(246,201,14,0.18)]">
              {results.length} نتيجة متطابقة
            </span>
          </div>
        </div>
      </section>
      {/* Content Grid */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-300" />
          </div>
        ) : results.length > 0 ? (
          <>
            <ContentGrid items={results} itemsPerPage={20} />
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-[#18181c]/80 px-2.5 py-2 shadow-[0_8px_26px_rgba(0,0,0,0.35)]">
                  <button
                    className="h-10 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 transition-all"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1}
                  >
                    السابق
                  </button>
                  {pageButtons.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold leading-none tabular-nums transition-all ${
                        pageNumber === page
                          ? 'border-[#f6c90e]/65 bg-[#f6c90e]/15 text-[#f6c90e] shadow-[0_0_18px_rgba(246,201,14,0.22)]'
                          : 'border-white/15 text-white/75 hover:bg-white/[0.06] hover:text-white'
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    className="h-10 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/75 hover:bg-white/[0.06] hover:text-white disabled:opacity-30 transition-all"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                  >
                    التالي
                  </button>
                </div>
                <span className="rounded-full border border-[#f6c90e]/25 bg-[#f6c90e]/8 px-5 py-1.5 text-xs font-semibold tracking-wide text-[#f6c90e]/90 tabular-nums">
                  صفحة {page} / {totalPages}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">لا توجد نتائج مطابقة</p>
            <p className="text-gray-500 text-sm mt-2">حاول البحث بكلمات مختلفة</p>
          </div>
        )}
      </section>
    </div>
  );
}