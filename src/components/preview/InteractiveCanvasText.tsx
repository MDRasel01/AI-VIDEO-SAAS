'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '@/context/EditorContext';
import {
  Maximize2,
  Minimize2,
  AlignCenter,
  Move,
  Edit3,
  Check,
  LayoutGrid,
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';

interface InteractiveCanvasTextProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function InteractiveCanvasText({ containerRef }: InteractiveCanvasTextProps) {
  const {
    timelineText,
    updateText,
    selectedTextId,
    setSelectedTextId,
    clearSelection,
    deleteSelectedElement,
    duplicateSelectedElement,
    pushSnapshot,
    undo,
    redo,
  } = useEditor();

  // ONLY show selection (handles, borders, toolbar) when explicitly selected by clicking!
  const isSelected = Boolean(
    selectedTextId &&
      (selectedTextId === 'text-1' ||
        selectedTextId === 'text-2' ||
        selectedTextId === timelineText?.id)
  );

  const isLocked = Boolean(timelineText?.locked);

  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [inlineValue, setInlineValue] = useState(timelineText?.text || 'Explore');
  const [inlineSubValue, setInlineSubValue] = useState(timelineText?.subText || 'THE WORLD');

  // Smart Alignment Guides
  const [showSnapGuideX, setShowSnapGuideX] = useState(false);
  const [showSnapGuideY, setShowSnapGuideY] = useState(false);
  const [snapBadge, setSnapBadge] = useState<string | null>(null);
  const [liveRotationAngle, setLiveRotationAngle] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const textElementRef = useRef<HTMLDivElement>(null);

  // Drag Tracking Ref
  const dragRef = useRef<{
    isDown: boolean;
    isDragging: boolean;
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
  }>({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPosX: 50,
    initialPosY: 50,
  });

  // Transform / Resize / Rotate Tracking Ref
  const transformRef = useRef<{
    isDown: boolean;
    startX: number;
    startY: number;
    initialSize: number;
    initialWidth: number;
    initialHeight: number;
    initialCustomWidth: number;
    initialRotation: number;
    handle: string | null;
    centerX: number;
    centerY: number;
  }>({
    isDown: false,
    startX: 0,
    startY: 0,
    initialSize: 72,
    initialWidth: 200,
    initialHeight: 80,
    initialCustomWidth: 200,
    initialRotation: 0,
    handle: null,
    centerX: 0,
    centerY: 0,
  });

  useEffect(() => {
    if (timelineText?.text) {
      setInlineValue(timelineText.text);
    }
    if (timelineText?.subText) {
      setInlineSubValue(timelineText.subText);
    }
  }, [timelineText?.text, timelineText?.subText]);

  // 1. CLICK OUTSIDE TO DESELECT
  useEffect(() => {
    const handlePointerDownOutside = (e: PointerEvent) => {
      if (
        textElementRef.current &&
        !textElementRef.current.contains(e.target as Node)
      ) {
        clearSelection();
        setIsEditingInline(false);
        setShowPresetsMenu(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [clearSelection]);

  // Helper to get active container rect
  const getContainerRect = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current.getBoundingClientRect();
    }
    if (wrapperRef.current) {
      return wrapperRef.current.getBoundingClientRect();
    }
    return { width: 300, height: 533, left: 0, top: 0 };
  }, [containerRef]);

  // 2. DRAG MOVE START
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Left mouse button only
    if (isEditingInline) return;
    if (isLocked) {
      setSelectedTextId('text-1');
      return;
    }

    e.stopPropagation();
    setSelectedTextId('text-1');

    pushSnapshot(); // 1 undo step for drag

    const currentX = timelineText?.positionX ?? 50;
    const currentY = timelineText?.positionY ?? 50;

    dragRef.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: currentX,
      initialPosY: currentY,
    };
  };

  // 3. TRANSFORM / RESIZE / ROTATE HANDLE START
  const handleTransformStart = (e: React.PointerEvent, handle: string) => {
    if (e.button !== 0) return;
    if (isLocked) return;
    e.stopPropagation();

    pushSnapshot(); // 1 undo step for transform

    setSelectedTextId('text-1');
    setActiveHandle(handle);

    const elRect = textElementRef.current?.getBoundingClientRect();
    const cX = elRect ? elRect.left + elRect.width / 2 : e.clientX;
    const cY = elRect ? elRect.top + elRect.height / 2 : e.clientY;

    const currentElemWidth = textElementRef.current ? textElementRef.current.offsetWidth : 200;

    transformRef.current = {
      isDown: true,
      startX: e.clientX,
      startY: e.clientY,
      initialSize: timelineText?.size || 72,
      initialWidth: currentElemWidth,
      initialHeight: textElementRef.current ? textElementRef.current.offsetHeight : 80,
      initialCustomWidth: timelineText?.width || currentElemWidth,
      initialRotation: timelineText?.rotation || 0,
      handle,
      centerX: cX,
      centerY: cY,
    };

    if (handle === 'rot') {
      setLiveRotationAngle(timelineText?.rotation || 0);
    }
  };

  // 4. GLOBAL POINTER MOVE & UP
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // If mouse button is not pressed, immediately cancel drag / transform
      if ((e.buttons & 1) === 0) {
        if (dragRef.current.isDown || transformRef.current.isDown) {
          dragRef.current.isDown = false;
          dragRef.current.isDragging = false;
          transformRef.current.isDown = false;
          transformRef.current.handle = null;
          setIsDragging(false);
          setActiveHandle(null);
          setShowSnapGuideX(false);
          setShowSnapGuideY(false);
          setSnapBadge(null);
          setLiveRotationAngle(null);
        }
        return;
      }

      const containerRect = getContainerRect();
      if (!containerRect.width || !containerRect.height) return;

      // ============================================
      // A. DRAGGING / MOVING ELEMENT
      // ============================================
      if (dragRef.current.isDown) {
        const deltaPixelX = e.clientX - dragRef.current.startX;
        const deltaPixelY = e.clientY - dragRef.current.startY;
        const distance = Math.hypot(deltaPixelX, deltaPixelY);

        // Movement Threshold (4px) to prevent accidental nudges on click
        if (!dragRef.current.isDragging) {
          if (distance > 4) {
            dragRef.current.isDragging = true;
            setIsDragging(true);
          } else {
            return;
          }
        }

        const deltaPercentX = (deltaPixelX / containerRect.width) * 100;
        const deltaPercentY = (deltaPixelY / containerRect.height) * 100;

        let newX = dragRef.current.initialPosX + deltaPercentX;
        let newY = dragRef.current.initialPosY + deltaPercentY;

        let snappedX = false;
        let snappedY = false;

        // Smart Center Snapping X (Horizontal Center: 50%)
        if (Math.abs(newX - 50) < 1.8) {
          newX = 50;
          snappedX = true;
          setShowSnapGuideX(true);
        } else {
          setShowSnapGuideX(false);
        }

        // Smart Center Snapping Y (Vertical Center: 50%)
        if (Math.abs(newY - 50) < 1.8) {
          newY = 50;
          snappedY = true;
          setShowSnapGuideY(true);
        } else {
          setShowSnapGuideY(false);
        }

        if (snappedX && snappedY) {
          setSnapBadge('Center (50%, 50%)');
        } else if (snappedX) {
          setSnapBadge('Center X (50%)');
        } else if (snappedY) {
          setSnapBadge('Center Y (50%)');
        } else {
          setSnapBadge(null);
        }

        // Keep within reasonable viewport boundaries
        const clampedX = Math.max(0, Math.min(100, parseFloat(newX.toFixed(1))));
        const clampedY = Math.max(0, Math.min(100, parseFloat(newY.toFixed(1))));

        updateText({
          positionX: clampedX,
          positionY: clampedY,
        });
      }

      // ============================================
      // B. TRANSFORMING / RESIZING / ROTATING
      // ============================================
      else if (transformRef.current.isDown && transformRef.current.handle) {
        const handle = transformRef.current.handle;
        const currentRotation = transformRef.current.initialRotation;

        // 1. ROTATION HANDLE
        if (handle === 'rot') {
          const cX = transformRef.current.centerX;
          const cY = transformRef.current.centerY;
          const radians = Math.atan2(e.clientY - cY, e.clientX - cX);
          let degrees = Math.round(radians * (180 / Math.PI)) + 90; // Top is 0 deg
          if (degrees > 180) degrees -= 360;
          if (degrees < -180) degrees += 360;

          // Smart Snapping Angles (0°, 45°, 90°, 135°, 180°, -45°, -90°, -135°, -180°)
          const snapAngles = [0, 45, 90, 135, 180, -45, -90, -135, -180];
          for (const angle of snapAngles) {
            if (Math.abs(degrees - angle) <= 3.5) {
              degrees = angle;
              break;
            }
          }

          setLiveRotationAngle(degrees);
          updateText({ rotation: degrees });
          return;
        }

        // 2. CORNER & EDGE HANDLES WITH ROTATION 2D MATRIX PROJECTION
        // Delta in screen coordinates
        const deltaX = e.clientX - transformRef.current.startX;
        const deltaY = e.clientY - transformRef.current.startY;

        // Convert screen delta to the element's local coordinate frame
        const rad = -(currentRotation * Math.PI) / 180;
        const localDx = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
        const localDy = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);

        // ========================================================
        // SIDE LEFT & RIGHT HANDLES ('e' = East/Right, 'w' = West/Left)
        // Adjusts text box WIDTH ONLY, WITHOUT CHANGING FONT SIZE (NO ZOOM)!
        // ========================================================
        if (handle === 'e' || handle === 'w') {
          const mult = handle === 'e' ? 2 : -2; // Since transform origin is center (translate -50%, -50%)
          const baseW = transformRef.current.initialCustomWidth || transformRef.current.initialWidth || 200;
          const newWidth = Math.round(baseW + localDx * mult);
          const clampedWidth = Math.max(60, Math.min(containerRect.width * 0.96, newWidth));

          updateText({ width: clampedWidth });
          return;
        }

        // SIDE TOP & BOTTOM HANDLES ('s' = South/Bottom, 'n' = North/Top)
        if (handle === 's' || handle === 'n') {
          return;
        }

        // ========================================================
        // 4 CORNER HANDLES ('se', 'nw', 'ne', 'sw') - Proportional Font Scaling
        // ========================================================
        let scaleDelta = 0;
        if (handle === 'se') {
          scaleDelta = (localDx + localDy) * 0.5;
        } else if (handle === 'nw') {
          scaleDelta = (-localDx - localDy) * 0.5;
        } else if (handle === 'ne') {
          scaleDelta = (localDx - localDy) * 0.5;
        } else if (handle === 'sw') {
          scaleDelta = (-localDx + localDy) * 0.5;
        }

        const calculatedSize = Math.round(
          transformRef.current.initialSize + scaleDelta * 0.55
        );
        const clampedSize = Math.max(16, Math.min(180, calculatedSize));

        // If a custom width is active, also scale the box width proportionally
        if (transformRef.current.initialCustomWidth) {
          const ratio = clampedSize / transformRef.current.initialSize;
          const scaledWidth = Math.max(60, Math.round(transformRef.current.initialCustomWidth * ratio));
          updateText({ size: clampedSize, width: scaledWidth });
        } else {
          updateText({ size: clampedSize });
        }
      }
    };

    const handleGlobalPointerUp = () => {
      dragRef.current.isDown = false;
      dragRef.current.isDragging = false;
      transformRef.current.isDown = false;
      transformRef.current.handle = null;
      setIsDragging(false);
      setActiveHandle(null);
      setShowSnapGuideX(false);
      setShowSnapGuideY(false);
      setSnapBadge(null);
      setLiveRotationAngle(null);
    };

    window.addEventListener('pointermove', handleGlobalPointerMove, { passive: false });
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('blur', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('blur', handleGlobalPointerUp);
    };
  }, [getContainerRect, updateText]);

  // 5. KEYBOARD ARROW KEYS NUDGING & SHORTCUTS
  useEffect(() => {
    if (!isSelected || isEditingInline) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Deselect with Escape
      if (e.key === 'Escape') {
        clearSelection();
        return;
      }

      // Delete with Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElement();
        return;
      }

      // Duplicate with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      // Arrow keys nudging
      if (isLocked) return;

      const step = e.shiftKey ? 5 : 1;
      const currentX = timelineText?.positionX ?? 50;
      const currentY = timelineText?.positionY ?? 50;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateText({ positionX: Math.max(0, currentX - step) });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateText({ positionX: Math.min(100, currentX + step) });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateText({ positionY: Math.max(0, currentY - step) });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateText({ positionY: Math.min(100, currentY + step) });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSelected,
    isEditingInline,
    isLocked,
    timelineText?.positionX,
    timelineText?.positionY,
    updateText,
    clearSelection,
    deleteSelectedElement,
    duplicateSelectedElement,
  ]);

  // 6. MOUSE WHEEL SCALING
  const handleWheel = (e: React.WheelEvent) => {
    if (isSelected && !isLocked) {
      e.stopPropagation();
      e.preventDefault();
      const currentSize = timelineText?.size || 72;
      const delta = e.deltaY < 0 ? 3 : -3;
      const newSize = Math.max(16, Math.min(180, currentSize + delta));
      updateText({ size: newSize });
    }
  };

  // 7. INLINE TEXT SUBMIT
  const handleInlineSubmit = () => {
    setIsEditingInline(false);
    updateText({
      text: inlineValue.trim() || 'Explore',
      subText: inlineSubValue.trim() || 'THE WORLD',
    });
  };

  if (!timelineText) return null;

  const posX = timelineText.positionX ?? 50;
  const posY = timelineText.positionY ?? 50;
  const fontSize = timelineText.size || 72;
  const rotation = timelineText.rotation || 0;

  // Smart floating toolbar auto-flip: If element is near top (<20%), position toolbar below element!
  const isNearTop = posY < 20;

  const computedFontFamily = timelineText.font
    ? `"${timelineText.font}", 'Inter', sans-serif`
    : "'Inter', sans-serif";

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-20 select-none"
    >
      {/* Smart Center Snapping Alignment Guides */}
      {isSelected && showSnapGuideX && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1.5px] bg-[#3B82F6] shadow-[0_0_12px_#3B82F6] z-10 pointer-events-none animate-in fade-in duration-100" />
      )}
      {isSelected && showSnapGuideY && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-[#3B82F6] shadow-[0_0_12px_#3B82F6] z-10 pointer-events-none animate-in fade-in duration-100" />
      )}

      {/* Floating Center Snap Pill Badge */}
      {isSelected && snapBadge && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-[#090D16]/90 border border-[#3B82F6] text-white text-[10px] font-mono font-bold shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
          {snapBadge}
        </div>
      )}

      {/* Main Element Container */}
      <div
        ref={textElementRef}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setSelectedTextId('text-1');
          if (!isLocked) setIsEditingInline(true);
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTextId('text-1');
        }}
        style={{
          left: `${posX}%`,
          top: `${posY}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          touchAction: 'none',
          width: timelineText.width ? `${timelineText.width}px` : 'max-content',
          maxWidth: '96%',
        }}
        className={`absolute pointer-events-auto inline-flex flex-col items-center justify-center cursor-pointer transition-transform duration-75 ${
          isDragging ? 'cursor-grabbing scale-[1.01] z-50' : ''
        }`}
      >
        {/* Canva/Figma-Style Selection Bounding Box */}
        <div
          className={`relative w-full p-2.5 rounded-xl flex flex-col items-center justify-center transition-all duration-150 ${
            isSelected
              ? 'border-[1.5px] border-[#2563EB] bg-blue-500/[0.08] shadow-[0_0_24px_rgba(37,99,235,0.35)] backdrop-blur-[0.5px]'
              : 'border-[1.5px] border-transparent'
          }`}
        >
          {/* FLOATING CONTEXTUAL TOOLBAR (Canva / CapCut Style) */}
          {isSelected && (
            <div
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                transform: `rotate(${-rotation}deg)`,
                top: isNearTop ? 'calc(100% + 14px)' : '-48px',
              }}
              className="absolute left-1/2 -translate-x-1/2 bg-[#090D16]/95 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-2xl text-[10px] text-white font-mono z-50 animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap"
            >
              {/* Drag Indicator & Coordinates / Size */}
              <div
                title="Position (Drag element to move)"
                className="flex items-center gap-1 text-slate-300 px-1 cursor-grab"
              >
                <Move className="w-3 h-3 text-[#60A5FA]" />
                <span className="font-bold text-[#60A5FA]">{fontSize}px</span>
              </div>

              {/* Box Width Reset button if custom width set */}
              {timelineText.width && (
                <>
                  <button
                    onClick={() => updateText({ width: undefined })}
                    title={`Custom Width: ${timelineText.width}px (Click to Auto-Fit)`}
                    className="p-1 hover:bg-white/20 rounded-full text-[#60A5FA] hover:text-white transition active:scale-90 flex items-center gap-0.5"
                  >
                    <span className="text-[9px] font-bold">W:{timelineText.width}px</span>
                  </button>
                </>
              )}

              <div className="w-[1px] h-3 bg-white/20" />

              {/* Decrease Size Button */}
              <button
                onClick={() => updateText({ size: Math.max(16, fontSize - 6) })}
                disabled={isLocked}
                title="Decrease Size"
                className="p-1 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition active:scale-90 disabled:opacity-40"
              >
                <Minimize2 className="w-3 h-3" />
              </button>

              {/* Increase Size Button */}
              <button
                onClick={() => updateText({ size: Math.min(180, fontSize + 6) })}
                disabled={isLocked}
                title="Increase Size"
                className="p-1 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition active:scale-90 disabled:opacity-40"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              <div className="w-[1px] h-3 bg-white/20" />

              {/* Live Rotation readout and 0° Reset */}
              {rotation !== 0 && (
                <>
                  <button
                    onClick={() => updateText({ rotation: 0 })}
                    title="Reset Rotation to 0°"
                    className="p-1 hover:bg-white/20 rounded-full text-[#60A5FA] hover:text-white transition active:scale-90 flex items-center gap-0.5"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span className="text-[9px] font-bold">{rotation}°</span>
                  </button>
                  <div className="w-[1px] h-3 bg-white/20" />
                </>
              )}

              {/* 9-Grid Position Presets Flyout */}
              <div className="relative">
                <button
                  onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                  title="Position Presets (Top, Center, Lower Third, etc.)"
                  className="p-1 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition active:scale-90"
                >
                  <LayoutGrid className="w-3 h-3" />
                </button>

                {showPresetsMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#090D16] border border-white/20 p-1.5 rounded-xl shadow-2xl grid grid-cols-3 gap-1 z-50 animate-in fade-in zoom-in-95"
                  >
                    <button
                      onClick={() => {
                        updateText({ positionX: 18, positionY: 15 });
                        setShowPresetsMenu(false);
                      }}
                      title="Top Left"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↖
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 50, positionY: 15 });
                        setShowPresetsMenu(false);
                      }}
                      title="Top Center"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 82, positionY: 15 });
                        setShowPresetsMenu(false);
                      }}
                      title="Top Right"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↗
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 18, positionY: 50 });
                        setShowPresetsMenu(false);
                      }}
                      title="Center Left"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 50, positionY: 50 });
                        setShowPresetsMenu(false);
                      }}
                      title="Center (50%, 50%)"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px] font-bold"
                    >
                      •
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 82, positionY: 50 });
                        setShowPresetsMenu(false);
                      }}
                      title="Center Right"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      →
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 18, positionY: 82 });
                        setShowPresetsMenu(false);
                      }}
                      title="Bottom Left"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↙
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 50, positionY: 82 });
                        setShowPresetsMenu(false);
                      }}
                      title="Lower Third"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        updateText({ positionX: 82, positionY: 82 });
                        setShowPresetsMenu(false);
                      }}
                      title="Bottom Right"
                      className="w-5 h-5 rounded bg-white/10 hover:bg-[#3B82F6] flex items-center justify-center text-[8px]"
                    >
                      ↘
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Text Inline Button */}
              <button
                onClick={() => setIsEditingInline(!isEditingInline)}
                title="Edit Text Content (Double-click)"
                className="p-1 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition active:scale-90"
              >
                <Edit3 className="w-3 h-3" />
              </button>

              {/* Duplicate Button */}
              <button
                onClick={duplicateSelectedElement}
                title="Duplicate Element (Ctrl+D)"
                className="p-1 hover:bg-white/20 rounded-full text-emerald-300 hover:text-emerald-200 transition active:scale-90"
              >
                <Copy className="w-3 h-3" />
              </button>

              {/* Lock Toggle */}
              <button
                onClick={() => updateText({ locked: !isLocked })}
                title={isLocked ? 'Unlock Element' : 'Lock Element'}
                className="p-1 hover:bg-white/20 rounded-full text-amber-300 hover:text-amber-200 transition active:scale-90"
              >
                {isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 opacity-70" />}
              </button>

              {/* Delete Button */}
              <button
                onClick={deleteSelectedElement}
                title="Delete Element (Delete)"
                className="p-1 hover:bg-red-500/30 rounded-full text-red-400 hover:text-red-300 transition active:scale-90"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* 4 CORNER RESIZE HANDLES (With Large 28px Hit Area + Sleek 9px Visual Circle) */}
          {isSelected && !isLocked && !isEditingInline && (
            <>
              {/* NW: Top-Left Handle */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'nw')}
                title="Drag to Scale (Proportional)"
                className="absolute -top-3.5 -left-3.5 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-50 group/handle touch-none"
              >
                <div className="w-[9px] h-[9px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* NE: Top-Right Handle */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'ne')}
                title="Drag to Scale (Proportional)"
                className="absolute -top-3.5 -right-3.5 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-50 group/handle touch-none"
              >
                <div className="w-[9px] h-[9px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* SW: Bottom-Left Handle */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'sw')}
                title="Drag to Scale (Proportional)"
                className="absolute -bottom-3.5 -left-3.5 w-7 h-7 flex items-center justify-center cursor-nesw-resize z-50 group/handle touch-none"
              >
                <div className="w-[9px] h-[9px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* SE: Bottom-Right Handle */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'se')}
                title="Drag to Scale (Proportional)"
                className="absolute -bottom-3.5 -right-3.5 w-7 h-7 flex items-center justify-center cursor-nwse-resize z-50 group/handle touch-none"
              >
                <div className="w-[9px] h-[9px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* 4 SIDE / MIDPOINT HANDLES (Sleek Pills) */}
              {/* North Edge */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'n')}
                title="Adjust Height (Top Edge)"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 flex items-center justify-center cursor-ns-resize z-50 group/handle touch-none"
              >
                <div className="w-3.5 h-[5px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* South Edge */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 's')}
                title="Adjust Height (Bottom Edge)"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-6 flex items-center justify-center cursor-ns-resize z-50 group/handle touch-none"
              >
                <div className="w-3.5 h-[5px] rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* West Edge */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'w')}
                title="Adjust Width (Left Edge)"
                className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center cursor-ew-resize z-50 group/handle touch-none"
              >
                <div className="w-[5px] h-3.5 rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* East Edge */}
              <div
                onPointerDown={(e) => handleTransformStart(e, 'e')}
                title="Adjust Width (Right Edge)"
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center cursor-ew-resize z-50 group/handle touch-none"
              >
                <div className="w-[5px] h-3.5 rounded-full bg-white ring-[1.5px] ring-[#2563EB] shadow-md group-hover/handle:scale-125 transition-transform" />
              </div>

              {/* TOP ROTATION HANDLE & STEM */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto z-50 touch-none">
                <div
                  onPointerDown={(e) => handleTransformStart(e, 'rot')}
                  title="Drag to Rotate (Snaps to 0°, 45°, 90°)"
                  className="w-7 h-7 flex items-center justify-center cursor-grab active:cursor-grabbing group/rot"
                >
                  <div className="w-3 h-3 rounded-full bg-[#2563EB] ring-2 ring-white shadow-lg group-hover/rot:scale-125 transition-transform" />
                </div>
                {/* Connecting Line Stem */}
                <div className="w-[1.5px] h-3.5 bg-[#2563EB]" />

                {/* Live Degree Angle Badge when rotating */}
                {liveRotationAngle !== null && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/90 border border-[#3B82F6] text-[#60A5FA] font-mono text-[9px] font-bold shadow-xl whitespace-nowrap">
                    {liveRotationAngle}°
                  </div>
                )}
              </div>
            </>
          )}

          {/* Locked Badge Indicator */}
          {isSelected && isLocked && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-[9px] font-bold flex items-center gap-1 shadow-lg">
              <Lock className="w-2.5 h-2.5" />
              <span>Locked</span>
            </div>
          )}

          {/* TEXT CONTENT OR INLINE DIRECT EDITING FORM */}
          {isEditingInline ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-2 p-2 bg-black/90 backdrop-blur-xl border border-[#3B82F6] rounded-2xl shadow-2xl z-50 min-w-[240px]"
            >
              <span className="text-[10px] text-[#60A5FA] font-bold uppercase tracking-wider">
                Direct Text Editor
              </span>
              <input
                type="text"
                value={inlineValue}
                onChange={(e) => setInlineValue(e.target.value)}
                placeholder="Main Title..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleInlineSubmit()}
                className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-1.5 text-center text-white text-sm font-bold outline-none focus:border-[#3B82F6]"
              />
              <input
                type="text"
                value={inlineSubValue}
                onChange={(e) => setInlineSubValue(e.target.value)}
                placeholder="Subtitle (Optional)..."
                onKeyDown={(e) => e.key === 'Enter' && handleInlineSubmit()}
                className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-1 text-center text-slate-200 text-xs font-semibold uppercase tracking-widest outline-none focus:border-[#3B82F6]"
              />
              <button
                onClick={handleInlineSubmit}
                className="w-full py-1 bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md mt-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Text</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: timelineText.backgroundColor || 'transparent',
                padding: timelineText.backgroundColor ? '6px 16px' : '0',
                borderRadius: timelineText.backgroundColor ? '9999px' : '0',
                width: '100%',
              }}
              className="flex flex-col items-center pointer-events-none select-none w-full"
            >
              {/* Main Title Styled */}
              <span
                style={{
                  fontFamily: computedFontFamily,
                  color: timelineText.color || '#FFFFFF',
                  fontSize: `${Math.max(14, Math.min(140, fontSize * 0.58))}px`,
                  fontWeight:
                    timelineText.weight === '800' || timelineText.weight === '900'
                      ? 800
                      : timelineText.isBold || timelineText.weight === '700'
                      ? 700
                      : 600,
                  fontStyle: timelineText.isItalic ? 'italic' : 'normal',
                  letterSpacing: timelineText.letterSpacing
                    ? `${timelineText.letterSpacing}px`
                    : 'normal',
                  textShadow:
                    '0 2px 14px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7), 0 0 10px rgba(0,0,0,0.9)',
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  display: 'block',
                  width: '100%',
                  textAlign: timelineText.alignment || 'center',
                }}
                className="drop-shadow-2xl transition-all"
              >
                {timelineText.text || 'Explore'}
              </span>

              {/* Subtitle / Subtext */}
              {timelineText.subText && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: `${Math.max(8, Math.min(28, fontSize * 0.16))}px`,
                    fontWeight: 800,
                    letterSpacing: '0.3em',
                    color: timelineText.backgroundColor ? '#F1F5F9' : '#E2E8F0',
                    textShadow: '0 2px 10px rgba(0,0,0,0.95)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    display: 'block',
                    width: '100%',
                    textAlign: timelineText.alignment || 'center',
                  }}
                  className="uppercase mt-0.5 tracking-widest"
                >
                  {timelineText.subText}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
