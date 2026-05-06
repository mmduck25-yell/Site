'use client';

import React, { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import { Spinner } from '@/components/ui/spinner';
import { SearchResult } from '@/lib/types';
import { extractTextFromBlocks } from '@/lib/data';
import { FileText, Home, Image, Search, User } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, loading } = useData();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const allResults: SearchResult[] = [];

    const matchesSearch = (text: string): boolean => {
      const lowerText = text.toLowerCase();
      return searchTerms.some((term) => lowerText.includes(term));
    };

    const createExcerpt = (text: string, maxLength: number = 150): string => {
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + '...';
    };

    const mainPageText = extractTextFromBlocks(data.mainPage.blocks);
    if (matchesSearch(mainPageText)) {
      allResults.push({
        type: 'main',
        id: 'main',
        title: '메인 페이지',
        excerpt: createExcerpt(mainPageText),
        url: '/',
      });
    }

    const profileText = extractTextFromBlocks(data.authorProfile.blocks);
    if (matchesSearch(profileText)) {
      allResults.push({
        type: 'profile',
        id: 'profile',
        title: '작가 프로필',
        excerpt: createExcerpt(profileText),
        url: '/profile',
      });
    }

    data.works.forEach((work) => {
      const workInfoText = extractTextFromBlocks(work.workInfo);
      const manuscriptsText = extractTextFromBlocks(work.manuscripts);
      const illustrationText = extractTextFromBlocks(work.illustrationBlocks ?? []);
      const manuscriptPagesText = (work.manuscriptPages ?? [])
        .map((page) => extractTextFromBlocks(page.blocks))
        .join(' ');
      const combinedText = `${work.title} ${work.description || ''} ${workInfoText} ${manuscriptsText} ${illustrationText} ${manuscriptPagesText}`;

      if (matchesSearch(combinedText)) {
        allResults.push({
          type: 'work',
          id: work.id,
          title: work.title,
          excerpt: createExcerpt(workInfoText || manuscriptsText || illustrationText || manuscriptPagesText),
          url: `/works/${work.id}`,
        });
      }
    });

    return allResults;
  }, [query, data]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'main':
        return <Home className="h-5 w-5" />;
      case 'profile':
        return <User className="h-5 w-5" />;
      case 'work':
        return <Image className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'main':
        return '메인';
      case 'profile':
        return '프로필';
      case 'work':
        return '작품';
      default:
        return '';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">검색 결과</h1>
          {query && (
            <p className="mt-2 text-muted-foreground">
              &quot;{query}&quot;에 대한 검색 결과 {results.length}건
            </p>
          )}
        </div>

        {!query ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">검색어를 입력해주세요.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.url}
                className="block rounded-lg border border-border bg-muted p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {getIcon(result.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {getTypeLabel(result.type)}
                      </span>
                      <h3 className={`text-foreground ${result.type === 'work' ? 'title-keep' : ''}`}>
                        {result.title}
                      </h3>
                    </div>
                    {result.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{result.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
