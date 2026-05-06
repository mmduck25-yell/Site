'use client';

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import BlockEditor from '@/components/BlockEditor';
import { Spinner } from '@/components/ui/spinner';

export default function ProfilePage() {
  const { data, loading, updateAuthorProfile } = useData();
  const { isAdmin, isVisitorMode } = useAuth();
  const canEdit = isAdmin && !isVisitorMode;

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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">작가 소개</h1>
        </div>

        {canEdit && (
          <div className="mb-6 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            관리자 모드: 내용을 자유롭게 편집할 수 있습니다.
          </div>
        )}

        <BlockEditor
          blocks={data.authorProfile.blocks}
          onChange={updateAuthorProfile}
        />
      </div>
    </div>
  );
}
