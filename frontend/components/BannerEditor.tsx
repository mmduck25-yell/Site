'use client';

import React, { useState } from 'react';
import { Banner } from '@/lib/types';
import { generateId } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface BannerEditorProps {
  banners: Banner[];
  onChange: (banners: Banner[]) => void;
}

export default function BannerEditor({ banners, onChange }: BannerEditorProps) {
  const { isAdmin, isVisitorMode } = useAuth();
  const canEdit = isAdmin && !isVisitorMode;
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  const addBanner = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newBanner: Banner = {
              id: generateId(),
              imageUrl: e.target.result as string,
              order: banners.length,
            };
            onChange([...banners, newBanner]);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const updateBannerLink = (bannerId: string, linkUrl: string) => {
    onChange(
      banners.map((banner) =>
        banner.id === bannerId ? { ...banner, linkUrl } : banner
      )
    );
  };

  const deleteBanner = (bannerId: string) => {
    const filtered = banners.filter((banner) => banner.id !== bannerId);
    onChange(filtered.map((banner, index) => ({ ...banner, order: index })));
    if (currentIndex >= filtered.length && filtered.length > 0) {
      setCurrentIndex(filtered.length - 1);
    }
  };

  const prevBanner = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? sortedBanners.length - 1 : prev - 1
    );
  };

  const nextBanner = () => {
    setCurrentIndex((prev) =>
      prev === sortedBanners.length - 1 ? 0 : prev + 1
    );
  };

  if (sortedBanners.length === 0) {
    if (canEdit) {
      return (
        <div className="mb-8">
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-8">
            <Button onClick={addBanner} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              배너 추�?
            </Button>
          </div>
        </div>
      );
    }
    return null;
  }

  const currentBanner = sortedBanners[currentIndex];

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden rounded-xl">
        <div
          className="relative aspect-[21/9] w-full cursor-pointer bg-muted"
          onClick={() => {
            if (currentBanner.linkUrl) {
              window.open(currentBanner.linkUrl, '_blank');
            }
          }}
        >
          <img
            src={currentBanner.imageUrl}
            alt={`배너 ${currentIndex + 1}`}
            className="h-full w-full object-cover"
          />

          {/* Navigation */}
          {sortedBanners.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  prevBanner();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  nextBanner();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Indicators */}
        {sortedBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {sortedBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-8 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`배너 ${index + 1}�??�동`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Admin controls */}
      {canEdit && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="배너 링크 URL (?�택)"
              value={currentBanner.linkUrl || ''}
              onChange={(e) => updateBannerLink(currentBanner.id, e.target.value)}
              className="w-[300px]"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addBanner} variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              배너 추�?
            </Button>
            <Button
              onClick={() => deleteBanner(currentBanner.id)}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              ?�재 배너 ??��
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
