// Block types for the block editor
export type BlockType = 'text' | 'image' | 'heading';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  imageViewType?: 'webtoon' | 'illustration' | 'slide';
  images?: string[]; // Array of image URLs for slide view
  imageDisplayScale?: number; // Percent-based display scale for image blocks
  imageGap?: number; // Pixel gap between stacked image cards in image blocks
}

// Page/Post types
export interface PageContent {
  id: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

// Author profile
export interface AuthorProfile {
  blocks: Block[];
  updatedAt: string;
}

// Work/작품 types
export interface Work {
  id: string;
  title: string;
  description: string; // 간단 정보
  thumbnailImage: string;
  type?: 'webtoon' | 'illustration';
  workInfo: Block[];
  manuscripts: Block[];
  illustrationBlocks?: Block[];
  manuscriptPages?: ManuscriptPage[];
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptPage {
  id: string;
  title: string;
  blocks: Block[];
  order: number;
}

// Activity/그 외 활동 types
export interface Activity {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

// Main page banner
export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
}

export interface MainPageContent {
  banners: Banner[];
  blocks: Block[];
  updatedAt: string;
}

// Site data structure
export interface SiteData {
  authorProfile: AuthorProfile;
  works: Work[];
  activities: Activity[];
  mainPage: MainPageContent;
}

// Search result
export interface SearchResult {
  type: 'work' | 'activity' | 'profile' | 'main';
  id: string;
  title: string;
  excerpt: string;
  url: string;
}
