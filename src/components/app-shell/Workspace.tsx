'use client';

import React from 'react';
import { useEditor } from '@/context/EditorContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import UploadVideosCard from '@/components/media/UploadVideosCard';
import PreviewCard from '@/components/preview/PreviewCard';
import Timeline from '@/components/timeline/Timeline';
import InspectorPanel from '@/components/inspector/InspectorPanel';
import AutoComposeModal from '@/components/compose/AutoComposeModal';
import ExportModal from '@/components/export/ExportModal';
import SaveTemplateModal from '@/components/templates/SaveTemplateModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import PerformanceTelemetryModal from '@/components/media/PerformanceTelemetryModal';
import IdBadge from '@/components/ui/IdBadge';
import { X } from 'lucide-react';

// Library Panels
import MediaPanel from '@/components/media/MediaPanel';
import TemplatePanel from '@/components/templates/TemplatePanel';
import TransitionsPanel from '@/components/library/TransitionsPanel';
import EffectsPanel from '@/components/library/EffectsPanel';
import TextPanel from '@/components/library/TextPanel';
import TranscriptPanel from '@/components/library/TranscriptPanel';
import AudioPanel from '@/components/library/AudioPanel';
import ProjectsPanel from '@/components/projects/ProjectsPanel';
import SettingsPanel from '@/components/library/SettingsPanel';

export default function Workspace() {
  const { activeTab, setActiveTab, confirmDialog, closeConfirmDialog } = useEditor();

  const isDrawerOpen = Boolean(activeTab && activeTab !== 'create');

  const closeDrawer = () => {
    setActiveTab('create' as any);
  };

  return (
    <div id="app-root-container" className="flex flex-col h-screen w-screen bg-[#080B11] text-[#F8FAFC] overflow-hidden select-none font-sans">
      {/* Top Navigation Bar */}
      <div id="panel-topbar-wrapper">
        <TopBar />
      </div>

      {/* Main App Workspace */}
      <div id="workspace-main-container" className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Sidebar */}
        <div id="panel-sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Center Main Creative Workspace */}
        <main id="center-creative-workspace" className="flex-1 flex flex-col min-w-0 bg-[#080B11] overflow-hidden">
          {/* Upper Area: Grid of cards strictly above the timeline */}
          <div id="box-upper-workspace-grid" className="flex-1 p-3.5 grid grid-cols-1 lg:grid-cols-3 gap-3.5 overflow-hidden min-h-0">
            {isDrawerOpen ? (
              <>
                {/* 1. Left Box: Active Sidebar Tab Panel (Templates, Transitions, Effects, Text, etc.) */}
                <div
                  id="box-sidebar-tab-panel-container"
                  className="h-full min-h-0 lg:col-span-1 bg-[#0E131F] border border-white/[0.08] rounded-2xl flex flex-col overflow-hidden shadow-sm select-none"
                >
                  {/* Panel Header Bar */}
                  <div id="drawer-header-bar" className="h-11 bg-[#080B11] border-b border-white/[0.08] px-3.5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span id="drawer-title-label" className="text-xs font-bold text-white uppercase tracking-wider truncate">
                        {activeTab === 'transitions'
                          ? 'Transitions'
                          : activeTab === 'templates'
                          ? 'Templates Library'
                          : activeTab === 'media'
                          ? 'Media Library'
                          : activeTab === 'projects'
                          ? 'My Projects'
                          : activeTab === 'effects'
                          ? 'Visual Effects'
                          : activeTab === 'audio'
                          ? 'Audio & Music'
                          : activeTab === 'text'
                          ? 'Typography'
                          : activeTab === 'transcript'
                          ? 'Voice Transcript'
                          : activeTab === 'settings'
                          ? 'AI Settings'
                          : 'Library'}
                      </span>
                      <IdBadge id="box-sidebar-tab-panel" />
                    </div>
                    <button
                      id="btn-close-drawer"
                      onClick={closeDrawer}
                      title="Close panel"
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Panel Body Content */}
                  <div id="drawer-body-content" className="flex-1 overflow-y-auto">
                    {activeTab === 'templates' && <TemplatePanel />}
                    {activeTab === 'media' && <MediaPanel />}
                    {activeTab === 'transitions' && <TransitionsPanel />}
                    {activeTab === 'effects' && <EffectsPanel />}
                    {activeTab === 'text' && <TextPanel />}
                    {activeTab === 'transcript' && <TranscriptPanel />}
                    {activeTab === 'audio' && <AudioPanel />}
                    {activeTab === 'projects' && <ProjectsPanel />}
                    {activeTab === 'settings' && <SettingsPanel />}
                  </div>
                </div>

                {/* 2. Middle Box: Upload Your Videos Card */}
                <div id="box-upload-panel-container" className="h-full min-h-0 lg:col-span-1">
                  <UploadVideosCard />
                </div>

                {/* 3. Right Box: Preview Card */}
                <div id="box-preview-panel-container" className="h-full min-h-0 lg:col-span-1">
                  <PreviewCard />
                </div>
              </>
            ) : (
              <>
                {/* When no sidebar tab is active, Upload Videos takes 2 columns spanning up to Preview */}
                <div id="box-upload-panel-container" className="h-full min-h-0 lg:col-span-2">
                  <UploadVideosCard />
                </div>

                {/* Preview Panel */}
                <div id="box-preview-panel-container" className="h-full min-h-0 lg:col-span-1">
                  <PreviewCard />
                </div>
              </>
            )}
          </div>

          {/* Bottom Multi-Track Timeline (Full Width Under ALL Upper Boxes) */}
          <div id="box-timeline-container" className="shrink-0">
            <Timeline />
          </div>
        </main>

        {/* Right Inspector (Edit & Customize + Composition Overview) */}
        <div id="box-inspector-container" className="shrink-0">
          <InspectorPanel />
        </div>
      </div>

      {/* Global Modals */}
      <AutoComposeModal />
      <ExportModal />
      <SaveTemplateModal />
      <PerformanceTelemetryModal />

      {/* Global Confirmation Modal */}
      <ConfirmationModal config={confirmDialog} onClose={closeConfirmDialog} />
    </div>
  );
}
