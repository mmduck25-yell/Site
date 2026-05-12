'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteData, Block, Work, Activity, Banner } from '@/lib/types';
import { defaultSiteData, generateId } from '@/lib/data';

interface DataContextType {
  data: SiteData;
  loading: boolean;
  // Main page
  updateMainPageBlocks: (blocks: Block[]) => void;
  updateMainPageBanners: (banners: Banner[]) => void;
  // Author profile
  updateAuthorProfile: (blocks: Block[]) => void;
  // Works
  addWork: (title: string, type: Work['type']) => Work;
  updateWork: (workId: string, updates: Partial<Work>) => void;
  deleteWork: (workId: string) => void;
  // Activities
  addActivity: (title: string) => Activity;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DATA_STORAGE_KEY = 'portfolio_site_data';
const SITE_DATA_ENDPOINT = '/api/site-data';

function normalizeSiteData(input: Partial<SiteData> | null | undefined): SiteData {
  const source = input ?? {};
  const authorProfileBlocks = Array.isArray(source.authorProfile?.blocks)
    ? source.authorProfile!.blocks
    : defaultSiteData.authorProfile.blocks;
  const mainPageBlocks = Array.isArray(source.mainPage?.blocks)
    ? source.mainPage!.blocks.filter(
        (block: Block) => block.content !== '환영합니다' && !block.content.includes('작가 포트폴리오 사이트입니다')
      )
    : defaultSiteData.mainPage.blocks;

  return {
    authorProfile: {
      blocks: authorProfileBlocks,
      updatedAt: source.authorProfile?.updatedAt ?? defaultSiteData.authorProfile.updatedAt,
    },
    works: Array.isArray(source.works) ? source.works : defaultSiteData.works,
    activities: Array.isArray(source.activities) ? source.activities : defaultSiteData.activities,
    mainPage: {
      banners: Array.isArray(source.mainPage?.banners) ? source.mainPage!.banners : defaultSiteData.mainPage.banners,
      blocks: mainPageBlocks,
      updatedAt: source.mainPage?.updatedAt ?? defaultSiteData.mainPage.updatedAt,
    },
  };
}

async function loadSiteData(): Promise<SiteData | null> {
  try {
    const response = await fetch(SITE_DATA_ENDPOINT, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }

    const parsed = (await response.json()) as Partial<SiteData>;
    return normalizeSiteData(parsed);
  } catch {
    return null;
  }
}

async function saveSiteData(data: SiteData) {
  try {
    await fetch(SITE_DATA_ENDPOINT, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Failed to sync site data with backend:', error);
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const remoteData = await loadSiteData();

      if (remoteData) {
        if (!cancelled) {
          setData(remoteData);
          setLoading(false);
        }
        return;
      }

      try {
        const stored = localStorage.getItem(DATA_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<SiteData>;
          const normalized = normalizeSiteData(parsed);

          if (!cancelled) {
            setData(normalized);
            setLoading(false);
          }
          return;
        }
      } catch {
        // Fall through to the default state.
      }

      if (!cancelled) {
        setData(defaultSiteData);
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing and retrying...');
          try {
            localStorage.removeItem(DATA_STORAGE_KEY);
            localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
          } catch {
            console.error('Failed to save data to localStorage');
          }
        }
      }

      void saveSiteData(data);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [data, loading]);

  const updateMainPageBlocks = (blocks: Block[]) => {
    setData(prev => ({
      ...prev,
      mainPage: {
        ...prev.mainPage,
        blocks,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const updateMainPageBanners = (banners: Banner[]) => {
    setData(prev => ({
      ...prev,
      mainPage: {
        ...prev.mainPage,
        banners,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const updateAuthorProfile = (blocks: Block[]) => {
    setData(prev => ({
      ...prev,
      authorProfile: {
        blocks,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const addWork = (title: string, type: Work['type'] = 'webtoon'): Work => {
    const newWork: Work = {
      id: generateId(),
      title,
      description: '',
      thumbnailImage: '',
      type,
      workInfo: [
        { id: generateId(), type: 'heading', content: '작품 정보', order: 0 },
        { id: generateId(), type: 'text', content: '작품 정보를 입력해주세요.', order: 1 },
      ],
      manuscripts: [
        { id: generateId(), type: 'heading', content: '원고 및 결과물', order: 0 },
      ],
      illustrationBlocks: type === 'illustration' ? [] : undefined,
      manuscriptPages: type === 'webtoon' ? [] : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      works: [...prev.works, newWork],
    }));
    return newWork;
  };

  const updateWork = (workId: string, updates: Partial<Work>) => {
    setData(prev => ({
      ...prev,
      works: prev.works.map(work =>
        work.id === workId
          ? { ...work, ...updates, updatedAt: new Date().toISOString() }
          : work
      ),
    }));
  };

  const deleteWork = (workId: string) => {
    setData(prev => ({
      ...prev,
      works: prev.works.filter(work => work.id !== workId),
    }));
  };

  const addActivity = (title: string): Activity => {
    const newActivity: Activity = {
      id: generateId(),
      title,
      blocks: [
        { id: generateId(), type: 'heading', content: title, order: 0 },
        { id: generateId(), type: 'text', content: '활동 내용을 입력해주세요.', order: 1 },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
    return newActivity;
  };

  const updateActivity = (activityId: string, updates: Partial<Activity>) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.map(activity =>
        activity.id === activityId
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      ),
    }));
  };

  const deleteActivity = (activityId: string) => {
    setData(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== activityId),
    }));
  };

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        updateMainPageBlocks,
        updateMainPageBanners,
        updateAuthorProfile,
        addWork,
        updateWork,
        deleteWork,
        addActivity,
        updateActivity,
        deleteActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
