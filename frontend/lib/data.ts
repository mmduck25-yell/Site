import { SiteData, Block, Work, Activity } from './types';

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Default site data
export const defaultSiteData: SiteData = {
  authorProfile: {
    blocks: [
      {
        id: 'profile-1',
        type: 'heading',
        content: '작가 소개',
        order: 0,
      },
      {
        id: 'profile-2',
        type: 'text',
        content: '작가 프로필을 입력해주세요. 관리자로 로그인하여 수정할 수 있습니다.',
        order: 1,
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  works: [],
  activities: [],
  mainPage: {
    banners: [],
    blocks: [],
    updatedAt: new Date().toISOString(),
  },
};

// Create a new block
export function createBlock(type: Block['type'], content: string = '', order: number = 0): Block {
  return {
    id: generateId(),
    type,
    content,
    order,
    images: [],
  };
}

// Create a new work
export function createWork(title: string, type: Work['type'] = 'webtoon'): Work {
  return {
    id: generateId(),
    title,
    thumbnailImage: '',
    type,
    workInfo: [
      {
        id: generateId(),
        type: 'heading',
        content: '작품 정보',
        order: 0,
      },
      {
        id: generateId(),
        type: 'text',
        content: '작품 정보를 입력해주세요.',
        order: 1,
      },
    ],
    manuscripts: [
      {
        id: generateId(),
        type: 'heading',
        content: '원고 및 결과물',
        order: 0,
      },
    ],
    illustrationBlocks: type === 'illustration' ? [] : undefined,
    manuscriptPages: type === 'webtoon' ? [] : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Create a new activity
export function createActivity(title: string): Activity {
  return {
    id: generateId(),
    title,
    blocks: [
      {
        id: generateId(),
        type: 'heading',
        content: title,
        order: 0,
      },
      {
        id: generateId(),
        type: 'text',
        content: '활동 내용을 입력해주세요.',
        order: 1,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Extract text from blocks for search
export function extractTextFromBlocks(blocks: Block[]): string {
  return blocks
    .filter(block => block.type === 'text' || block.type === 'heading')
    .map(block => block.content)
    .join(' ');
}
