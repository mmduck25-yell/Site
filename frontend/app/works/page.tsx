'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Image as ImageIcon, Trash2, Pencil, Check, X } from 'lucide-react';
import { Work } from '@/lib/types';

export default function WorksPage() {
  const { data, loading, addWork, deleteWork, updateWork } = useData();
  const { isAdmin, isVisitorMode } = useAuth();
  const canEdit = isAdmin && !isVisitorMode;

  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newWorkType, setNewWorkType] = useState<'webtoon' | 'illustration'>('webtoon');

  const handleAddWork = () => {
    if (!newWorkTitle.trim()) return;

    addWork(newWorkTitle.trim(), newWorkType);
    setNewWorkTitle('');
    setDialogOpen(false);
  };

  const startEditing = (work: Work) => {
    setEditingWorkId(work.id);
    setEditTitle(work.title);
  };

  const cancelEditing = () => {
    setEditingWorkId(null);
    setEditTitle('');
  };

  const saveEditing = (workId: string) => {
    if (!editTitle.trim()) return;

    updateWork(workId, {
      title: editTitle.trim(),
    });
    cancelEditing();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-lg md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">작품 목록</h1>

          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  새 작품 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 작품 추가</DialogTitle>
                  <DialogDescription>새 작품의 제목을 입력해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="작품 제목"
                    value={newWorkTitle}
                    onChange={(e) => setNewWorkTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWork()}
                    autoFocus
                  />
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">유형 선택</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewWorkType('webtoon')}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          newWorkType === 'webtoon'
                            ? 'border-black bg-black text-white'
                            : 'border-black/40 text-foreground hover:border-black'
                        }`}
                      >
                        웹툰
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewWorkType('illustration')}
                        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                          newWorkType === 'illustration'
                            ? 'border-black bg-black text-white'
                            : 'border-black/40 text-foreground hover:border-black'
                        }`}
                      >
                        일러스트
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleAddWork} className="w-full">
                    추가
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {canEdit && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            관리자 모드: 작품을 추가하고 수정 또는 삭제할 수 있습니다.
          </div>
        )}

        {data.works.length === 0 ? (
          <div className="flex h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <ImageIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">등록된 작품이 없습니다</h3>
            <p className="text-muted-foreground">
              {canEdit ? '새 작품을 추가해 포트폴리오를 구성해보세요.' : '곧 새로운 작품이 업데이트됩니다.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.works.map((work) => (
              <div
                key={work.id}
                className="group relative rounded-lg border border-border bg-muted p-3 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <Link href={`/works/${work.id}`} className="block">
                  <div className="aspect-[1/1.414] w-full overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-secondary/20">
                    {work.thumbnailImage ? (
                      <img
                        src={work.thumbnailImage}
                        alt={work.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </Link>

                <div className="mt-3">
                  {editingWorkId === work.id && canEdit ? (
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="작품 제목"
                        className="title-keep"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEditing(work.id)} className="gap-1">
                          <Check className="h-3 w-3" />
                          저장
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} className="gap-1">
                          <X className="h-3 w-3" />
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/works/${work.id}`}>
                      <h3 className="title-keep line-clamp-1 text-base text-foreground hover:text-primary">
                        {work.title}
                      </h3>
                    </Link>
                  )}
                </div>

                {canEdit && editingWorkId !== work.id && (
                  <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => startEditing(work)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>작품 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            정말로 '{work.title}' 작품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteWork(work.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
