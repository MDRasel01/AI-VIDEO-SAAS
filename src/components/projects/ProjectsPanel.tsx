'use client';

import React, { useState } from 'react';
import { MOCK_PROJECTS } from '@/data/mockData';
import { useEditor } from '@/context/EditorContext';
import TabErrorAlertBox from '@/components/ui/TabErrorAlertBox';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  Copy,
  Trash2,
  Clock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Project } from '@/types';

export default function ProjectsPanel() {
  const {
    setProjectName,
    setActiveTab,
    resetProject,
    currentTabIssues,
    handleQuickFix,
    dismissIssue,
  } = useEditor();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

  const filteredProjects = projects
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const handleOpenProject = (project: Project) => {
    setProjectName(project.name);
    setActiveTab('media');
  };

  const handleDuplicate = (project: Project) => {
    const copy: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copy)`,
      lastEdited: 'Just now',
    };
    setProjects([copy, ...projects]);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleNewProject = () => {
    resetProject();
    setProjectName('New Automated Video Project');
    setActiveTab('media');
  };

  return (
    <div id="box-tab-projects-panel" className="h-full flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>My Projects</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9CA3AF]">
              {projects.length}
            </span>
          </h2>
          <p className="text-[11px] text-[#667085]">
            Manage, duplicate and reopen existing compositions
          </p>
        </div>

        <button
          onClick={handleNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C5CFF] hover:bg-[#8A6CFF] text-white text-xs font-semibold shadow-lg shadow-[#7C5CFF]/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Dynamic Red Error / Warning Alert Box */}
      <TabErrorAlertBox
        issues={currentTabIssues}
        onQuickFix={handleQuickFix}
        onDismiss={dismissIssue}
      />

      {/* Search & Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0F14] border border-white/[0.08] text-white text-xs pl-8 pr-3 py-2 rounded-lg outline-none focus:border-[#7C5CFF] transition placeholder-[#667085]"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-[#0D0F14] border border-white/[0.08] text-[#9CA3AF] text-xs px-2.5 py-2 rounded-lg outline-none"
        >
          <option value="recent">Recent</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-xl bg-[#11141A] hover:bg-[#151820] border border-white/[0.08] hover:border-[#7C5CFF]/40 overflow-hidden flex flex-col transition-all duration-200"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-[16/9] bg-black overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141A] via-transparent to-transparent" />

              {/* Format Badge */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-mono border border-white/10 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-[#7C5CFF]" />
                <span>{project.format}</span>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                {project.duration}s
              </div>
            </div>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#7C5CFF] transition truncate">
                  {project.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{project.lastEdited}</span>
                  <span>•</span>
                  <span>{project.clipsCount} clips</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => handleOpenProject(project)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#7C5CFF]/15 hover:bg-[#7C5CFF] text-[#7C5CFF] hover:text-white text-xs font-semibold border border-[#7C5CFF]/30 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(project)}
                    title="Duplicate"
                    className="p-1.5 rounded-lg text-[#667085] hover:text-white hover:bg-white/5 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-[#667085] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
