'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  PlusCircle,
  LayoutGrid,
  Folder,
  Image,
  Type,
  Mic,
  ArrowLeftRight,
  Sparkles,
  Headphones,
  Download,
} from 'lucide-react';
import { ActiveTab } from '@/context/EditorContext';
import IdBadge from '@/components/ui/IdBadge';

interface SidebarItem {
  id: string;
  tab?: ActiveTab;
  label: string;
  icon: React.ElementType;
  action?: () => void;
}

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    resetProject,
    setIsExportOpen,
  } = useEditor();

  const menuItems: SidebarItem[] = [
    {
      id: 'templates',
      tab: 'templates',
      label: 'Templates',
      icon: LayoutGrid,
    },
    {
      id: 'projects',
      tab: 'projects',
      label: 'My Projects',
      icon: Folder,
    },
    {
      id: 'media',
      tab: 'media',
      label: 'Media Library',
      icon: Image,
    },
    {
      id: 'text',
      tab: 'text',
      label: 'Text',
      icon: Type,
    },
    {
      id: 'transcript',
      tab: 'transcript',
      label: 'Voice Transcript',
      icon: Mic,
    },
    {
      id: 'transitions',
      tab: 'transitions',
      label: 'Transitions',
      icon: ArrowLeftRight,
    },
    {
      id: 'effects',
      tab: 'effects',
      label: 'Effects',
      icon: Sparkles,
    },
    {
      id: 'audio',
      tab: 'audio',
      label: 'Audio',
      icon: Headphones,
    },
    {
      id: 'settings',
      tab: 'settings',
      label: 'AI Settings',
      icon: LayoutGrid,
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: () => setIsExportOpen(true),
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.action) {
      item.action();
    } else if (item.tab) {
      if (activeTab === item.tab) {
        setActiveTab('create' as any);
      } else {
        setActiveTab(item.tab);
      }
    }
  };

  return (
    <aside id="box-sidebar" className="w-52 bg-[#080B11] border-r border-white/[0.08] flex flex-col p-4 shrink-0 select-none z-20">
      {/* Top Action: + New Project */}
      <button
        id="btn-sidebar-new-project"
        onClick={resetProject}
        className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-[#1D4ED8] hover:to-[#6D28D9] text-white font-medium text-xs flex items-center justify-start gap-2.5 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all mb-3 group"
      >
        <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
        <span className="tracking-wide">New Project</span>
      </button>

      {/* Visible Box ID Badge */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">NAV MENU</span>
        <IdBadge id="box-sidebar" />
      </div>

      {/* Navigation List */}
      <nav id="sidebar-nav-list" className="space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const isActive = item.tab === activeTab;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`btn-sidebar-tab-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/10 text-white font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-[#94A3B8]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
