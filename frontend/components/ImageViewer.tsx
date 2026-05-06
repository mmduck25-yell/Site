'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ImageViewerProps {
  images: string[];
  viewType: 'webtoon' | 'illustration' | 'slide';
  onRemove?: (index: number) => void;
  imageDisplayScale?: number;
  imageGap?: number;
}

export default function ImageViewer({
  images,
  viewType,
  onRemove,
  imageDisplayScale = 100,
  imageGap = 16,
}: ImageViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
        이미지가 없습니다.
      </div>
    );
  }

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevFullscreen = () => {
    setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextFullscreen = () => {
    setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const renderImageCard = (image: string, index: number) => (
    <div key={index} className="group rounded-md shadow-sm">
      <div className="flex justify-center rounded-sm border border-border/70 bg-card/95 p-1">
        <div className="relative inline-block" style={{ width: `${imageDisplayScale}%` }}>
          <img
            src={image}
            alt={`이미지 ${index + 1}`}
            className="block h-auto w-auto cursor-pointer"
            onClick={() => openFullscreen(index)}
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/55 px-2 py-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              className="rounded-sm border border-white/35 bg-white/15 px-2 py-1 text-xs text-white transition-colors hover:bg-white/25"
              onClick={() => openFullscreen(index)}
            >
              전체보기
            </button>
            {onRemove && (
              <button
                type="button"
                className="rounded-sm border border-white/35 bg-white/15 px-2 py-1 text-xs text-white transition-colors hover:bg-white/25"
                onClick={() => onRemove(index)}
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (viewType === 'slide') {
    return (
      <div className="space-y-4">
        <div className="relative">
          {renderImageCard(images[currentSlide], currentSlide)}

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full"
                onClick={nextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}

        <FullscreenDialog
          open={fullscreenOpen}
          onOpenChange={setFullscreenOpen}
          images={images}
          currentIndex={fullscreenIndex}
          onPrev={prevFullscreen}
          onNext={nextFullscreen}
        />
      </div>
    );
  }

  const containerClass = viewType === 'illustration'
    ? 'flex flex-wrap justify-center'
    : 'flex flex-col items-center';

  return (
    <div className={containerClass} style={viewType === 'illustration' ? { gap: `${imageGap}px` } : { rowGap: `${imageGap}px` }}>
      {images.map((image, index) => renderImageCard(image, index))}
      <FullscreenDialog
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
        images={images}
        currentIndex={fullscreenIndex}
        onPrev={prevFullscreen}
        onNext={nextFullscreen}
      />
    </div>
  );
}

// Fullscreen dialog component
interface FullscreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: string[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

function FullscreenDialog({
  open,
  onOpenChange,
  images,
  currentIndex,
  onPrev,
  onNext,
}: FullscreenDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-[95vw] overflow-hidden border-0 bg-black/95 p-0">
        <VisuallyHidden>
          <DialogTitle>이미지 전체화면 보기</DialogTitle>
          <DialogDescription>
            좌우 화살표 버튼으로 이미지를 탐색할 수 있습니다.
          </DialogDescription>
        </VisuallyHidden>
        <div className="relative flex h-[90vh] w-full items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`이미지 ${currentIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full"
                onClick={onPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
