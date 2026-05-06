'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, LogOut, Menu, X, Eye, EyeOff, FileText } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const navigation = [
  { name: '작가 소개', href: '/profile' },
  { name: '작품 목록', href: '/works' },
];

export default function Header() {
  const pathname = usePathname();
  const { data } = useData();
  const { isAdmin, isVisitorMode, login, logout, toggleVisitorMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setLoginOpen(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('비밀번호가 올바르지 않습니다.');
    }
  };

  const isHome = pathname === '/';
  const activeSection = pathname.startsWith('/works')
    ? 'works'
    : pathname.startsWith('/profile')
      ? 'profile'
      : null;

  const getHeadingId = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return undefined;

    return trimmed
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const profileHeadings = data.authorProfile.blocks
    .filter((block) => block.type === 'heading' && block.content.trim())
    .map((block) => ({
      title: block.content,
      id: getHeadingId(block.content) ?? '',
    }))
    .filter((item) => item.id);

  const workLinks = [...data.works]
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, 7);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.page = isHome ? 'home' : 'inner';
    }
  }, [isHome]);

  useEffect(() => {
    setIsSidebarOpen(!isHome);
  }, [isHome]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.sidebar = isSidebarOpen ? 'open' : 'closed';
    }
  }, [isSidebarOpen]);

  return (
    <header className="relative z-50 w-full">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4">
        {!isHome && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className={`fixed left-4 top-24 z-50 hidden h-10 w-10 items-center justify-center rounded-full border border-black/50 bg-white/60 text-black shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-colors hover:bg-black hover:text-white md:flex ${isSidebarOpen ? 'md:hidden' : ''}`}
            aria-label="플로팅 바 열기"
          >
            <FileText className="h-4 w-4" />
          </button>
        )}
        
        {/* Desktop Navigation - Floating left bar */}
        <nav className={`fixed left-4 top-4 z-50 hidden h-[calc(100vh-2rem)] w-64 flex-col rounded-[2rem] border border-black/50 bg-white/60 px-4 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur md:flex ${isHome || !isSidebarOpen ? 'md:hidden' : ''}`}>
          <div className="mb-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/50 text-black transition-colors hover:bg-black hover:text-white"
              aria-label="플로팅 바 닫기"
            >
              <FileText className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {navigation.map(item => (
              <div key={item.href} className="flex items-center gap-2">
                <Link
                  href={item.href}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium tracking-wide transition-colors ${
                    pathname === item.href || pathname.startsWith(item.href)
                      ? 'border-black bg-black text-white'
                      : 'border-transparent text-black hover:border-black hover:bg-black hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>

          {activeSection === 'profile' && profileHeadings.length > 0 && (
            <div className="mt-4 border-t border-black/20 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-black/70">개요</p>
              <div className="space-y-1">
                {profileHeadings.map((item) => (
                  <Link
                    key={item.id}
                    href={`/profile#${item.id}`}
                    className="block rounded-lg px-2 py-1 text-xs text-black/80 transition-colors hover:bg-black hover:text-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'works' && workLinks.length > 0 && (
            <div className="mt-4 border-t border-black/20 pt-4">
              <div className="space-y-1">
                {workLinks.map((work) => (
                  <Link
                    key={work.id}
                    href={`/works/${work.id}`}
                    className="block truncate rounded-lg px-2 py-1 text-xs text-black/80 transition-colors hover:bg-black hover:text-white"
                  >
                    {work.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-2">
            {isAdmin ? (
              <>
                <Button
                  variant={isVisitorMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleVisitorMode}
                  className="w-full justify-start gap-2 border-black/70 bg-white/80 text-xs text-foreground hover:bg-black hover:text-white"
                  title={isVisitorMode ? '관리자 모드로 전환' : '방문자 모드로 전환'}
                >
                  {isVisitorMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{isVisitorMode ? '방문자 모드' : '관리자 모드'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start gap-2 border-black/70 bg-white/80 text-xs text-foreground hover:bg-black hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 border-black/70 bg-white/80 text-xs text-foreground hover:bg-black hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    관리자 로그인
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[340px]">
                  <DialogHeader>
                    <DialogTitle>관리자 로그인</DialogTitle>
                    <DialogDescription>
                      관리자 비밀번호를 입력하여 로그인하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoFocus
                      />
                      {loginError && (
                        <p className="mt-2 text-sm text-destructive">{loginError}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full">
                      로그인
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </nav>

        {/* Site name centered */}
        <Link href="/" className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
          <span className="title-keep font-display whitespace-nowrap text-[0.75rem] italic tracking-[0.08em] text-foreground sm:text-sm md:text-base">HONXXEE</span>
        </Link>
        
        {/* Search and Auth */}
        <div className={`flex items-center gap-2 ${isHome ? 'lg:justify-end' : ''}`}>
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden items-center sm:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
              <Input
                type="search"
                placeholder="장르/키워드"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-[180px] border-black/70 bg-white/80 pl-8 text-foreground placeholder:text-foreground/60 focus-visible:ring-black/40 lg:w-[240px]"
              />
            </div>
          </form>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background pb-4 md:hidden">
          <nav className="flex flex-col p-4">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mb-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {isAdmin && (
              <Button 
                variant={isVisitorMode ? "default" : "outline"} 
                size="sm" 
                onClick={() => {
                  toggleVisitorMode();
                  setMobileMenuOpen(false);
                }} 
                className="mt-2 justify-start gap-2"
              >
                {isVisitorMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {isVisitorMode ? '관리자 모드로 전환' : '방문자 모드로 전환'}
              </Button>
            )}
          </nav>
          
          <form onSubmit={handleSearch} className="px-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="장르/키워드"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8"
              />
            </div>
          </form>
        </div>
      )}

    </header>
  );
}
