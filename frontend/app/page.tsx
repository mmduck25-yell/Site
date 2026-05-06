'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { generateId } from '@/lib/data';
import { Spinner } from '@/components/ui/spinner';
import chalkboardImage from '@/src/assets/1.jpg';

type MainImageSlot = {
  id: string;
  order: number;
  imageUrl: string;
};

export default function HomePage() {
  const { data, loading, updateMainPageBanners } = useData();
  const { isAdmin, isVisitorMode } = useAuth();
  const canEditSlots = isAdmin && !isVisitorMode;

  const imageSlots = React.useMemo<MainImageSlot[]>(() => {
    const sortedBanners = [...data.mainPage.banners].sort((a, b) => a.order - b.order);

    return Array.from({ length: 3 }, (_, index) => {
      const banner = sortedBanners.find((item) => item.order === index);
      return {
        id: banner?.id ?? `slot-${index}`,
        order: index,
        imageUrl: banner?.imageUrl ?? '',
      };
    });
  }, [data.mainPage.banners]);

  const updateSlotImage = (order: number, imageUrl: string) => {
    const nextBanners = [...data.mainPage.banners];
    const targetIndex = nextBanners.findIndex((banner) => banner.order === order);

    if (targetIndex >= 0) {
      nextBanners[targetIndex] = {
        ...nextBanners[targetIndex],
        imageUrl,
      };
    } else {
      nextBanners.push({
        id: generateId(),
        order,
        imageUrl,
      });
    }

    updateMainPageBanners(nextBanners);
  };

  const handleSlotUpload = (order: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        updateSlotImage(order, event.target.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const clearSlotImage = (order: number) => {
    updateSlotImage(order, '');
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-6rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35 grayscale"
          style={{
            backgroundImage: `url('${chalkboardImage.src}')`,
          }}
        />
      </div>

      <section className="mx-auto flex w-full max-w-5xl items-start px-5 pb-8 pt-36 md:pb-10 md:pt-44">
        <div className="bulletin-panel flex w-full flex-col items-center rounded-xl px-6 py-10 text-center md:px-12 md:py-14">
          <div className="medieval-divider my-6 w-full text-center">
            <span className="font-display text-xs tracking-[0.35em] text-primary/75">ARCHIVE OF CREATION</span>
          </div>

          <h1 className="title-keep mx-auto text-center font-display text-4xl italic leading-tight text-foreground md:text-6xl lg:text-7xl">
            HONXXEE
          </h1>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/profile" className="bulletin-button">
              작가 소개
            </Link>
            <Link href="/works" className="bulletin-button">
              작품 보러가기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 pb-16 md:pb-20">
        <div className="bulletin-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {imageSlots.map((slot, index) => (
            <div
              key={slot.id}
              className={`bulletin-card ${slot.imageUrl ? 'overflow-hidden' : ''}`}
            >
              <div
                className={`relative overflow-hidden rounded-sm ${
                  slot.imageUrl
                    ? ''
                    : 'flex aspect-[4/3] items-center justify-center border border-dashed border-border/70 bg-background/80'
                }`}
              >
                {slot.imageUrl ? (
                  <img
                    src={slot.imageUrl}
                    alt={`메인 이미지 ${index + 1}`}
                    className="block h-auto w-full"
                  />
                ) : (
                  <span className="bulletin-empty text-sm">이미지 공간 {index + 1}</span>
                )}

                {canEditSlots && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/55 px-2 py-2">
                    <label className="cursor-pointer rounded-sm border border-white/35 bg-white/15 px-2 py-1 text-xs text-white transition-colors hover:bg-white/25">
                      {slot.imageUrl ? '이미지 변경' : '이미지 추가'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleSlotUpload(slot.order, e.target.files);
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>

                    {slot.imageUrl && (
                      <button
                        type="button"
                        className="rounded-sm border border-white/35 bg-white/15 px-2 py-1 text-xs text-white transition-colors hover:bg-white/25"
                        onClick={() => clearSlotImage(slot.order)}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
