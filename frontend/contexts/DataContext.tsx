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

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(defaultSiteData);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(DATA_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Remove the default greeting blocks if they exist to match the new design
        if (parsed.mainPage && parsed.mainPage.blocks) {
          parsed.mainPage.blocks = parsed.mainPage.blocks.filter(
            (b: Block) => b.content !== '환영합니다' && !b.content.includes('작가 포트폴리오 사이트입니다')
          );
        }
        
        setData(parsed);
      } catch {
        setData(defaultSiteData);
      }
    }
    setLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // Handle quota exceeded error - try to clear old data and retry
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing and retrying...');
          try {
            localStorage.removeItem(DATA_STORAGE_KEY);
            localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
          } catch {
            console.error('Failed to save data to localStorage');
          }
        }
      }
    }
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
