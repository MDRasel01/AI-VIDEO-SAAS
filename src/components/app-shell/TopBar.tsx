'use client';

import React, { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Play,
  HelpCircle,
  Bell,
  ChevronDown,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
} from 'lucide-react';
import IdBadge from '@/components/ui/IdBadge';

export default function TopBar() {
  const {
    activeTab,
    setActiveTab,
    setIsExportOpen,
    totalErrorsCount,
    totalWarningsCount,
    tabIssues,
  } = useEditor();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks: { label: string; tab: 'media' | 'templates' | 'projects' | 'export' | 'create' }[] = [
    { label: 'Create', tab: 'create' },
    { label: 'Templates', tab: 'templates' },
    { label: 'Projects', tab: 'projects' },
    { label: 'Media', tab: 'media' },
    { label: 'Export', tab: 'export' },
  ];

  const [activeNav, setActiveNav] = useState<'create' | 'templates' | 'projects' | 'media' | 'export'>('create');

  const handleNavClick = (nav: typeof activeNav) => {
    setActiveNav(nav);
    if (nav === 'export') {
      setIsExportOpen(true);
    } else if (nav === 'create') {
      setActiveTab('media');
    } else {
      setActiveTab(nav as any);
    }
  };

  return (
    <header id="box-topbar" className="h-16 bg-[#080B11] border-b border-white/[0.08] px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* LEFT: Logo & Brand */}
      <div id="topbar-brand-container" className="flex items-center gap-3">
        <div id="topbar-brand-logo" className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] via-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
        <div id="topbar-brand-text-group" className="flex items-center gap-2">
          <span id="topbar-brand-title" className="font-bold text-lg text-white tracking-tight font-poppins">
            VideoPro AI
          </span>
          <IdBadge id="box-topbar" />
        </div>
      </div>

      {/* CENTER: Navigation Pills */}
      <nav id="topbar-nav-pills" className="flex items-center gap-1 bg-[#0E131F]/80 p-1 rounded-xl border border-white/[0.06]">
        {navLinks.map((link) => {
          const isActive = activeNav === link.tab;
          return (
            <button
              key={link.tab}
              id={`topbar-nav-tab-${link.tab}`}
              onClick={() => handleNavClick(link.tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#1E293B] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Help, Notifications, User Profile */}
      <div id="topbar-right-actions-group" className="flex items-center gap-4">
        {/* Help Icon */}
        <button
          id="btn-topbar-help"
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          title="Help & Guides"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition relative"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notification Bell */}
        <div id="topbar-notification-wrapper" className="relative">
          <button
            id="btn-topbar-notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition relative"
          >
            <Bell className="w-5 h-5" />
            {totalErrorsCount > 0 ? (
              <span id="notif-badge-error" className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-[#080B11] animate-pulse" />
            ) : totalWarningsCount > 0 ? (
              <span id="notif-badge-warning" className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full ring-2 ring-[#080B11]" />
            ) : (
              <span id="notif-badge-info" className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-[#080B11]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div id="topbar-notifications-dropdown" className="absolute right-0 mt-2 w-80 bg-[#0E131F] border border-white/[0.12] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div id="notif-dropdown-header" className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2">
                <span id="notif-dropdown-title" className="text-xs font-bold text-white uppercase tracking-wider">
                  Diagnostics & Updates
                </span>
                <span id="notif-dropdown-count" className="text-[10px] text-[#94A3B8]">
                  {tabIssues.length} item(s)
                </span>
              </div>
              <div id="notif-items-list" className="space-y-2 max-h-60 overflow-y-auto">
                {tabIssues.length > 0 ? (
                  tabIssues.map((issue) => (
                    <div
                      key={issue.id}
                      id={`notif-item-${issue.id}`}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-left"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <AlertCircle className="w-3.5 h-3.5 text-[#3B82F6]" />
                        <span>{issue.title}</span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mt-1">{issue.message}</p>
                    </div>
                  ))
                ) : (
                  <div id="notif-empty-state" className="text-xs text-[#94A3B8] py-4 text-center">
                    All AI systems and video composition pipelines are optimal.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div id="topbar-user-profile-wrapper" className="relative">
          <button
            id="btn-topbar-user-profile"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5 transition border border-white/[0.05]"
          >
            <div id="topbar-user-avatar" className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#3B82F6]/50 bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
              <img
                id="topbar-user-avatar-img"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Rasel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span id="topbar-username-label" className="text-xs font-semibold text-white">Rasel</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {isUserMenuOpen && (
            <div id="topbar-user-dropdown-menu" className="absolute right-0 mt-2 w-48 bg-[#0E131F] border border-white/[0.12] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div id="user-menu-profile-card" className="px-3 py-2 border-b border-white/[0.08] mb-1">
                <p id="user-display-name" className="text-xs font-bold text-white">Rasel Islam</p>
                <p id="user-plan-badge" className="text-[10px] text-[#94A3B8]">Pro Plan Active</p>
              </div>
              <button
                id="btn-user-settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
              >
                Workspace Settings
              </button>
              <button
                id="btn-user-billing"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition"
              >
                Billing & Storage
              </button>
              <button
                id="btn-user-logout"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
