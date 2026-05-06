'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import BlockEditor from '@/components/BlockEditor';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

interface ManuscriptPageProps {
  params: Promise<{ id: string; pageId: string }>;
}

export default function ManuscriptPage({ params }: ManuscriptPageProps) {
  const resolvedParams = use(params);
  const { data, loading, updateWork } = useData();
  const { isAdmin, isVisitorMode } = useAuth();
  const canEdit = isAdmin && !isVisitorMode;
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');

  const work = data.works.find((w) => w.id === resolvedParams.id);
  const page = work?.manuscriptPages?.find((p) => p.id === resolvedParams.pageId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!work || !page) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">원고를 찾을 수 없습니다</h1>
          <p className="mb-6 text-muted-foreground">요청하신 원고 페이지가 존재하지 않습니다.</p>
          <Link href="/works">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              작품 목록으로
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleTitleSave = () => {
    if (!title.trim()) return;

    const nextPages = (work.manuscriptPages ?? []).map((p) =>
      p.id === page.id ? { ...p, title: title.trim() } : p
    );

    updateWork(work.id, { manuscriptPages: nextPages });
    setEditingTitle(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/works/${work.id}`}
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          작품으로 돌아가기
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-lg md:p-8">
        {editingTitle && canEdit ? (
          <div className="mb-6 flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-keep text-xl"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
            <Button size="icon" onClick={handleTitleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <h1
            className={`title-keep mb-6 text-xl ${canEdit ? 'cursor-pointer hover:text-primary' : ''}`}
            onClick={() => {
              if (canEdit) {
                setTitle(page.title);
                setEditingTitle(true);
              }
            }}
          >
            {page.title}
          </h1>
        )}

        <BlockEditor
          blocks={page.blocks}
          onChange={(blocks) => {
            const nextPages = (work.manuscriptPages ?? []).map((p) =>
              p.id === page.id ? { ...p, blocks } : p
            );
            updateWork(work.id, { manuscriptPages: nextPages });
          }}
        />
      </div>
    </div>
  );
}
