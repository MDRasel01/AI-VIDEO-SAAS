'use client';

import React from 'react';
import { EditorProvider } from '@/context/EditorContext';
import Workspace from '@/components/app-shell/Workspace';

export default function Home() {
  return (
    <EditorProvider>
      <Workspace />
    </EditorProvider>
  );
}
