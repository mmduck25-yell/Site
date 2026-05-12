'use client';

import React, { useState, useCallback } from 'react';
import { Block } from '@/lib/types';
import { generateId } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GripVertical,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  Heading,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import ImageViewer from './ImageViewer';

const MIN_IMAGE_DISPLAY_SCALE = 40;
const MAX_IMAGE_DISPLAY_SCALE = 150;
const IMAGE_DISPLAY_STEP = 10;
const MIN_IMAGE_GAP = 0;
const MAX_IMAGE_GAP = 48;
const IMAGE_GAP_STEP = 4;

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export default function BlockEditor({ blocks, onChange, readOnly = false }: BlockEditorProps) {
  const { isAdmin, isVisitorMode } = useAuth();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const canEdit = isAdmin && !isVisitorMode && !readOnly;

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const getHeadingId = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return undefined;

    return trimmed
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      order: blocks.length,
      images: [],
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    onChange(
      blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId: string) => {
    const filtered = blocks.filter(block => block.id !== blockId);
    // Re-order remaining blocks
    const reordered = filtered.map((block, index) => ({
      ...block,
      order: index,
    }));
    onChange(reordered);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = sortedBlocks.findIndex(b => b.id === blockId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedBlocks.length) return;
    
    const newBlocks = [...sortedBlocks];
    const [movedBlock] = newBlocks.splice(currentIndex, 1);
    newBlocks.splice(newIndex, 0, movedBlock);
    
    onChange(newBlocks.map((block, index) => ({ ...block, order: index })));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...sortedBlocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    
    onChange(newBlocks.map((block, i) => ({ ...block, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageUpload = useCallback(async (blockId: string, files: FileList) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newImages: string[] = [...(block.images || [])];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      await new Promise<void>((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    updateBlock(blockId, { images: newImages, content: newImages[0] || '' });
  }, [blocks]);

  const removeImage = (blockId: string, imageIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.images) return;
    
    const newImages = block.images.filter((_, i) => i !== imageIndex);
    updateBlock(blockId, { images: newImages, content: newImages[0] || '' });
  };

  const getImageDisplayScale = (block: Block) => {
    const scale = block.imageDisplayScale ?? 100;
    return Math.min(MAX_IMAGE_DISPLAY_SCALE, Math.max(MIN_IMAGE_DISPLAY_SCALE, scale));
  };

  const adjustImageDisplayScale = (blockId: string, currentScale: number, delta: number) => {
    const nextScale = Math.min(
      MAX_IMAGE_DISPLAY_SCALE,
      Math.max(MIN_IMAGE_DISPLAY_SCALE, currentScale + delta)
    );
    updateBlock(blockId, { imageDisplayScale: nextScale });
  };

  const getImageGap = (block: Block) => {
    const gap = block.imageGap ?? 0;
    return Math.min(MAX_IMAGE_GAP, Math.max(MIN_IMAGE_GAP, gap));
  };

  const adjustImageGap = (blockId: string, currentGap: number, delta: number) => {
    const nextGap = Math.min(MAX_IMAGE_GAP, Math.max(MIN_IMAGE_GAP, currentGap + delta));
    updateBlock(blockId, { imageGap: nextGap });
  };

  return (
    <div className="space-y-0">
      {sortedBlocks.map((block, index) => (
        <div
          key={block.id}
          draggable={canEdit}
          onDragStart={() => canEdit && handleDragStart(index)}
          onDragOver={(e) => canEdit && handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group relative rounded-lg bg-card p-4 transition-all ${
            canEdit ? 'cursor-move' : ''
          } ${draggedIndex === index ? 'opacity-50' : ''}`}
        >
          {canEdit && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          {/* Block Content */}
          {block.type === 'heading' && (
            canEdit ? (
              <Input
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="?�목???�력?�세??.."
                className="border-0 bg-transparent text-xl font-bold focus-visible:ring-0"
              />
            ) : (
              <h2 id={getHeadingId(block.content)} className="text-xl font-bold">
                {block.content}
              </h2>
            )
          )}

          {block.type === 'text' && (
            canEdit ? (
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                placeholder="?�스?��? ?�력?�세??.."
                className="min-h-[100px] resize-y border-0 bg-transparent focus-visible:ring-0"
              />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{block.content}</p>
            )
          )}

          {block.type === 'image' && (
            <div className="space-y-4">
              {canEdit && (
                <div className="flex flex-wrap items-center gap-4">
                  <Select
                    value={block.imageViewType || 'illustration'}
                    onValueChange={(value) => updateBlock(block.id, { 
                      imageViewType: value as Block['imageViewType'] 
                    })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="보기 형태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webtoon">웹툰</SelectItem>
                      <SelectItem value="illustration">일러스트</SelectItem>
                      <SelectItem value="slide">슬라이드</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          handleImageUpload(block.id, e.target.files);
                        }
                      }}
                      className="max-w-[200px]"
                    />
                    <span className="text-xs text-muted-foreground">
                      {block.imageViewType === 'webtoon' && '750x8000px'}
                      {block.imageViewType === 'illustration' && 'A4 사이즈'}
                      {block.imageViewType === 'slide' && 'A4 사이즈(슬라이드)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/80 px-2 py-1">
                    <span className="text-xs text-muted-foreground">표시 크기</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        adjustImageDisplayScale(
                          block.id,
                          getImageDisplayScale(block),
                          -IMAGE_DISPLAY_STEP
                        )
                      }
                      disabled={getImageDisplayScale(block) <= MIN_IMAGE_DISPLAY_SCALE}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-xs font-medium">
                      {getImageDisplayScale(block)}%
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        adjustImageDisplayScale(
                          block.id,
                          getImageDisplayScale(block),
                          IMAGE_DISPLAY_STEP
                        )
                      }
                      disabled={getImageDisplayScale(block) >= MAX_IMAGE_DISPLAY_SCALE}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/80 px-2 py-1">
                    <span className="text-xs text-muted-foreground">이미지 간격</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        adjustImageGap(
                          block.id,
                          getImageGap(block),
                          -IMAGE_GAP_STEP
                        )
                      }
                      disabled={getImageGap(block) <= MIN_IMAGE_GAP}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-xs font-medium">
                      {getImageGap(block)}px
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        adjustImageGap(
                          block.id,
                          getImageGap(block),
                          IMAGE_GAP_STEP
                        )
                      }
                      disabled={getImageGap(block) >= MAX_IMAGE_GAP}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {block.images && block.images.length > 0 && (
                <ImageViewer
                  images={block.images}
                  viewType={block.imageViewType || 'illustration'}
                  onRemove={canEdit ? (index) => removeImage(block.id, index) : undefined}
                  imageDisplayScale={getImageDisplayScale(block)}
                  imageGap={getImageGap(block)}
                />
              )}
            </div>
          )}

          {/* Block Actions */}
          {canEdit && (
            <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveBlock(block.id, 'up')}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => moveBlock(block.id, 'down')}
                disabled={index === sortedBlocks.length - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Add Block Buttons */}
      {canEdit && (
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-dashed border-border p-4">
          <Button variant="outline" size="sm" onClick={() => addBlock('heading')} className="gap-2">
            <Heading className="h-4 w-4" />
            제목 추가
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2">
            <Type className="h-4 w-4" />
            텍스트 추가
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('image')} className="gap-2">
            <ImageIcon className="h-4 w-4" />
            이미지 추가
          </Button>
        </div>
      )}

      {blocks.length === 0 && !canEdit && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          ?�직 ?�용???�습?�다.
        </div>
      )}
    </div>
  );
}
