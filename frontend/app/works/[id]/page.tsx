'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import BlockEditor from '@/components/BlockEditor';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-react';
import { generateId } from '@/lib/data';

interface WorkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkDetailPage({ params }: WorkDetailPageProps) {
  const resolvedParams = use(params);
  const { data, loading, updateWork } = useData();
  const { isAdmin, isVisitorMode } = useAuth();
  const canEdit = isAdmin && !isVisitorMode;
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');

  const work = data.works.find((w) => w.id === resolvedParams.id);
  const workType = work?.type ?? 'webtoon';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!work) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="mb-4 text-2xl font-bold">작품을 찾을 수 없습니다</h1>
          <p className="mb-6 text-muted-foreground">요청하신 작품이 존재하지 않거나 삭제되었습니다.</p>
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
    if (title.trim()) {
      updateWork(work.id, { title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          updateWork(work.id, { thumbnailImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addManuscriptPage = () => {
    const trimmed = newPageTitle.trim();
    if (!trimmed) return;

    const nextPages = [...(work.manuscriptPages ?? [])];
    nextPages.push({
      id: generateId(),
      title: trimmed,
      blocks: [],
      order: nextPages.length,
    });

    updateWork(work.id, { manuscriptPages: nextPages });
    setNewPageTitle('');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/works"
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          작품 목록으로
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-lg md:p-8">
        {/* Header with title and thumbnail */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          {/* Thumbnail */}
          <div className="shrink-0">
            <div className="relative h-48 w-36 overflow-hidden rounded-lg border border-border bg-muted md:h-64 md:w-48">
              {work.thumbnailImage ? (
                <img
                  src={work.thumbnailImage}
                  alt={work.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
              {canEdit && (
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <span className="text-sm text-white">대표 이미지 변경</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title and info */}
          <div className="flex-1">
            {editingTitle && canEdit ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="title-keep text-2xl"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                />
                <Button size="icon" onClick={handleTitleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h1
                className={`title-keep text-2xl md:text-3xl ${
                  canEdit ? 'cursor-pointer hover:text-primary' : ''
                }`}
                onClick={() => {
                  if (canEdit) {
                    setTitle(work.title);
                    setEditingTitle(true);
                  }
                }}
              >
                {work.title}
              </h1>
            )}
            {canEdit && (
              <p className="mt-4 text-sm text-primary">
                제목을 클릭하여 수정하거나, 대표 이미지 위에 마우스를 올려 변경할 수 있습니다.
              </p>
            )}
          </div>
        </div>

        {workType === 'illustration' ? (
          <BlockEditor
            blocks={work.illustrationBlocks ?? []}
            onChange={(blocks) => updateWork(work.id, { illustrationBlocks: blocks })}
          />
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="info" className="flex-1 sm:flex-none">
                작품 정보
              </TabsTrigger>
              <TabsTrigger value="manuscripts" className="flex-1 sm:flex-none">
                원고
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <BlockEditor
                blocks={work.workInfo}
                onChange={(blocks) => updateWork(work.id, { workInfo: blocks })}
              />
            </TabsContent>

            <TabsContent value="manuscripts">
              <div className="space-y-4">
                {canEdit && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      placeholder="원고 제목"
                      className="max-w-xs"
                    />
                    <Button type="button" onClick={addManuscriptPage}>
                      + 추가
                    </Button>
                  </div>
                )}

                {(work.manuscriptPages ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">원고 페이지가 없습니다.</p>
                ) : (
                  <div className="grid gap-2">
                    {[...(work.manuscriptPages ?? [])]
                      .sort((a, b) => b.order - a.order)
                      .map((page, index, list) => (
                        <Link
                          key={page.id}
                          href={`/works/${work.id}/manuscripts/${page.id}`}
                          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/50"
                        >
                          {list.length - index} {page.title}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
