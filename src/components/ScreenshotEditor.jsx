import { useEffect, useMemo, useRef, useState } from 'react';
import CanvasStage from './CanvasStage';
import LayerPanel from './LayerPanel';
import ScreenshotThumbnail from './ScreenshotThumbnail';
import Button from './ui/Button';
import Card from './ui/Card';
import { Select } from './ui/Input';
import { BACKGROUND_TYPES } from '../constants';
import { resolveBackgroundConfig } from '../utils/backgroundUtils';

function formatScreenshotNumber(index) {
  return String(index + 1).padStart(2, '0');
}

const DESKTOP_LEFT_PANEL_WIDTH = 218;
const DESKTOP_RIGHT_PANEL_WIDTH = 275;

function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton-block ${className}`.trim()} />;
}

function EditorSkeleton({ label = 'Loading editor...' }) {
  return (
    <div className="app-shell app-shell-modern">
      <div className="app-content-shell">
        <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <SkeletonBlock className="mb-3 h-7 w-64" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_275px]">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <SkeletonBlock className="mb-3 h-6 w-44" />
            <SkeletonBlock className="mb-3 h-[420px] w-full" />
            <p className="type-meta">{label}</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-3">
            <SkeletonBlock className="mb-3 h-5 w-28" />
            <SkeletonBlock className="mb-2 h-9 w-full" />
            <SkeletonBlock className="mb-2 h-9 w-full" />
            <SkeletonBlock className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TopbarGroup({ label, children }) {
  return (
    <div className="topbar-group">
      <span className="topbar-group__label">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

function buildCoachingActions({ screenshot, onAddTextLayer, onAddDecorLayer, onAddMockupLayer, openFileDialog }) {
  const layers = screenshot?.layers || [];
  const hasText = layers.some((layer) => layer.type === 'text');
  const hasImage = layers.some((layer) => layer.type === 'image');
  const hasMockup = layers.some((layer) => layer.type === 'mockup');

  if (!layers.length) {
    return [
      {
        id: 'headline',
        label: 'Once Baslik Ekle',
        hint: 'Mesajinizi ilk 2 saniyede okutun.',
        onClick: onAddTextLayer,
      },
      {
        id: 'visual',
        label: 'Urun Gorseli Yukle',
        hint: 'Ekran goruntusu veya app mockup kullanin.',
        onClick: openFileDialog,
      },
      {
        id: 'depth',
        label: 'Arka Plan Derinligi',
        hint: 'Orb ile hizli kontrast ve odak olusturun.',
        onClick: () => onAddDecorLayer('orb'),
      },
    ];
  }

  if (hasImage && !hasText) {
    return [
      {
        id: 'headline',
        label: 'Baslik Ekleyin',
        hint: 'Gorselin anlattigini metinle netlestirin.',
        onClick: onAddTextLayer,
      },
      {
        id: 'mockup',
        label: 'Mockup Cercevesi',
        hint: 'Store vitrini icin daha premium sunum.',
        onClick: () => onAddMockupLayer('realistic'),
      },
    ];
  }

  if (hasText && !hasImage && !hasMockup) {
    return [
      {
        id: 'visual',
        label: 'Gorsel Yukleyin',
        hint: 'Sadece metin yerine urun baglami gosterin.',
        onClick: openFileDialog,
      },
      {
        id: 'support',
        label: 'Destekleyici Sekil',
        hint: 'Glow/Pill ile hiyerarsi guclenir.',
        onClick: () => onAddDecorLayer('glow'),
      },
    ];
  }

  if (hasText && hasImage && !hasMockup) {
    return [
      {
        id: 'mockup',
        label: 'Mockup Ekle',
        hint: 'Final sunuma daha yakin bir onizleme alin.',
        onClick: () => onAddMockupLayer('realistic'),
      },
    ];
  }

  return [];
}

export default function ScreenshotEditor({
  devicePreset,
  screenshots,
  activeScreenshot,
  activeScreenshotId,
  activeScreenshotIndex,
  selectedLayer,
  selectedLayerId,
  warnings,
  isExporting,
  exportProgress,
  isDarkMode,
  autosaveLabel,
  autosaveError,
  onSelectScreenshot,
  onSetSelectedLayer,
  onBackgroundChange,
  onBackgroundSecondaryChange,
  onBackgroundTypeChange,
  onBackgroundAngleChange,
  onApplyBackgroundPreset,
  backgroundPresets,
  stylePackages,
  onApplyStylePackage,
  onAddScreenshot,
  onDuplicateScreenshot,
  onDeleteScreenshot,
  onReorderScreenshot,
  onCyclePrevScreenshot,
  onCycleNextScreenshot,
  onAddTextLayer,
  onAddDecorLayer,
  onAddMockupLayer,
  onAddImageLayers,
  onLayerUpdate,
  onMockupScreenUpload,
  onLayerDelete,
  onLayerVisibility,
  onLayerLockToggle,
  onDuplicateLayer,
  onAlignLayer,
  onMoveLayer,
  onExportSingle,
  onExportAll,
  onCancelExport,
  onSaveProject,
  onLoadProject,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleTheme,
  isBootstrapping,
  isProcessingImages,
  isLoadingProject,
  uiError,
  onDismissUiError,
}) {
  const fileInputRef = useRef(null);
  const projectInputRef = useRef(null);
  const moreMenuRef = useRef(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareScreenshotId, setCompareScreenshotId] = useState(null);
  const [isFocusedMode, setIsFocusedMode] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showCenterGuides, setShowCenterGuides] = useState(false);
  const [showMarginGrid, setShowMarginGrid] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [dragScreenshotId, setDragScreenshotId] = useState(null);
  const [dropScreenshotId, setDropScreenshotId] = useState(null);
  const compareOptions = useMemo(
    () => screenshots.filter((shot) => shot.id !== activeScreenshotId),
    [activeScreenshotId, screenshots],
  );

  useEffect(() => {
    if (!compareOptions.length) {
      setCompareScreenshotId(null);
      return;
    }

    const isValid = compareOptions.some((shot) => shot.id === compareScreenshotId);
    if (isValid) {
      return;
    }

    const fallbackPrevious = screenshots[activeScreenshotIndex - 1];
    const fallback =
      (fallbackPrevious && fallbackPrevious.id !== activeScreenshotId && fallbackPrevious) ||
      compareOptions[0];
    setCompareScreenshotId(fallback.id);
  }, [activeScreenshotId, activeScreenshotIndex, compareOptions, compareScreenshotId, screenshots]);

  const compareScreenshot = useMemo(
    () => screenshots.find((shot) => shot.id === compareScreenshotId) || null,
    [compareScreenshotId, screenshots],
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openProjectDialog = () => {
    projectInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (files && files.length) {
      await onAddImageLayers(files);
    }

    event.target.value = '';
  };

  const handleProjectSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await onLoadProject(file);
    }
    event.target.value = '';
  };

  useEffect(() => {
    const handleKeydown = (event) => {
      const target = event.target;
      const isTypingContext =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (isTypingContext || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setIsFocusedMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (!isMoreMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreMenuOpen]);

  if (isBootstrapping) {
    return <EditorSkeleton label="Preparing workspace..." />;
  }

  if (!activeScreenshot) {
    return (
      <div className="app-shell app-shell-modern">
        <div className="app-content-shell">
          <Card className="p-6">
            <h2 className="type-subheading mb-2">No Screenshots Yet</h2>
            <p className="type-meta mb-4">
              Create your first screenshot to start building the App Store set.
            </p>
            <Button variant="primary" onClick={onAddScreenshot}>Create Screenshot</Button>
          </Card>
        </div>
      </div>
    );
  }

  const background = resolveBackgroundConfig(activeScreenshot);
  const selectedTextLength = selectedLayer?.type === 'text' ? selectedLayer.text.length : 0;

  const coachingActions = buildCoachingActions({
    screenshot: activeScreenshot,
    onAddTextLayer,
    onAddDecorLayer,
    onAddMockupLayer,
    openFileDialog,
  });

  const leftPaneWidth = isFocusedMode
    ? '0px'
    : isLeftPanelCollapsed
      ? '52px'
      : `${DESKTOP_LEFT_PANEL_WIDTH}px`;
  const rightPaneWidth = isFocusedMode
    ? '0px'
    : isRightPanelCollapsed
      ? '52px'
      : `${DESKTOP_RIGHT_PANEL_WIDTH}px`;

  return (
    <div className="app-shell">
      {uiError && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-400/40 dark:bg-red-950/35 dark:text-red-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="type-subheading text-red-700 dark:text-red-100">{uiError.title || 'Something went wrong'}</p>
              <p className="type-meta mt-1 text-red-600 dark:text-red-100/80">{uiError.message}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onDismissUiError}>Dismiss</Button>
          </div>
        </div>
      )}

      <div className="app-shell-modern app-shell-unified" style={{ '--left-pane': leftPaneWidth }}>
      {!isFocusedMode && (
        <Card as="aside" className="pane-width left-sidebar-shell shell-pane shell-pane--left">
          <div className={`collapse-rail ${isLeftPanelCollapsed ? 'collapse-rail--visible' : ''}`}>
              <Button variant="ghost"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setIsLeftPanelCollapsed(false)}
                aria-label="Expand screenshots panel"
                title="Expand screenshots panel"
              >
                {'>'}
              </Button>
          </div>

          <div className={`sidebar-panel-body p-3 ${isLeftPanelCollapsed ? 'sidebar-panel-body--hidden' : ''}`}>
              <div className="divider mb-3 flex items-center justify-between pb-3">
                <div>
                  <h2 className="type-subheading">Screenshots</h2>
                  <p className="type-meta">{screenshots.length} variants</p>
                </div>
                <Button variant="ghost"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setIsLeftPanelCollapsed(true)}
                  aria-label="Collapse screenshots panel"
                  title="Collapse screenshots panel"
                >
                  {'<'}
                </Button>
              </div>

              <div className="space-y-2">
                {screenshots.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[var(--line)] px-3 py-4">
                    <p className="type-subheading mb-1">Empty Project</p>
                    <p className="type-meta">Add a screenshot to start editing.</p>
                  </div>
                )}
                {screenshots.map((shot, index) => {
                  const isActive = shot.id === activeScreenshotId;
                  const isDropTarget = dropScreenshotId === shot.id && dragScreenshotId !== shot.id;

                  return (
                    <div
                      key={shot.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        event.dataTransfer.setData('text/plain', String(shot.id));
                        setDragScreenshotId(shot.id);
                        setDropScreenshotId(null);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'move';
                        if (dragScreenshotId !== shot.id) {
                          setDropScreenshotId(shot.id);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const draggedId = Number(event.dataTransfer.getData('text/plain')) || dragScreenshotId;
                        if (draggedId && draggedId !== shot.id) {
                          onReorderScreenshot(draggedId, shot.id);
                        }
                        setDragScreenshotId(null);
                        setDropScreenshotId(null);
                      }}
                      onDragEnd={() => {
                        setDragScreenshotId(null);
                        setDropScreenshotId(null);
                      }}
                      className={`interactive-card items-start rounded-xl px-2 py-2 ${
                        isActive
                          ? 'bg-blue-50/70 dark:bg-blue-500/24'
                          : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-white/5'
                      } ${isDropTarget ? 'ring-2 ring-blue-300 dark:ring-blue-500/60' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectScreenshot(shot.id)}
                        className="grid grid-cols-[66px_1fr] items-center gap-3 text-left"
                      >
                        <ScreenshotThumbnail screenshot={shot} devicePreset={devicePreset} width={64} />
                        <div>
                          <div className="type-subheading text-zinc-900 dark:text-zinc-50">
                            Screenshot {formatScreenshotNumber(index)}
                          </div>
                          <div className="type-meta">
                            {shot.layers.length} layers · {shot.layers.some((layer) => layer.type === 'text') ? 'Text' : 'Visual'} · Drag to reorder
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="divider mt-3 pt-3" />
              <div className="grid gap-2">
                <Button variant="ghost" onClick={onAddScreenshot}>Add Screenshot</Button>
                <Button variant="ghost" onClick={onDuplicateScreenshot}>Duplicate</Button>
                <Button variant="danger" onClick={onDeleteScreenshot}>
                  Delete
                </Button>
              </div>
            </div>
        </Card>
      )}

      <div className="app-content-shell panel workspace-unified shell-pane shell-pane--main">
        <header
          className={`topbar topbar-modern topbar-modern--embedded ${
            !isFocusedMode && !isLeftPanelCollapsed ? 'topbar-modern--stacked' : ''
          }`}
        >
        <div className="topbar-modern__identity">
          <span className="topbar-eyebrow">Creative Workflow</span>
          <h1 className="type-heading">App Store Screenshot Engine</h1>
          <p className="type-meta mt-1">
            Professional screenshot workflow for {devicePreset.label} publishing.
          </p>
        </div>

        <div className="topbar-modern__controls">
          <TopbarGroup label="Edit">
            <Button variant="ghost" size="sm" className="topbar-btn" onClick={onUndo} disabled={!canUndo} title="Undo (Cmd/Ctrl+Z)">
              Undo
            </Button>
            <Button variant="ghost" size="sm" className="topbar-btn" onClick={onRedo} disabled={!canRedo} title="Redo (Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y)">
              Redo
            </Button>
          </TopbarGroup>

          <TopbarGroup label="Project">
            <Button variant="ghost" size="sm" className="topbar-btn" onClick={onSaveProject}>Save</Button>
            <Button variant="ghost" size="sm" className="topbar-btn" onClick={openProjectDialog}>Load</Button>
          </TopbarGroup>

          <TopbarGroup label="View">
            <Button variant="ghost"
              size="sm"
              onClick={() => setIsFocusedMode((prev) => !prev)}
              className={`topbar-btn ${isFocusedMode ? 'topbar-focus-active' : ''}`}
              title="Focus Mode (F)"
            >
              {isFocusedMode ? 'Exit Focus' : 'Focus Mode'}
            </Button>
            <Button variant="ghost" size="sm" className="topbar-btn" onClick={onToggleTheme}>
              {isDarkMode ? 'Light' : 'Dark'}
            </Button>
          </TopbarGroup>

          <TopbarGroup label="Export">
            <Button
              variant="ghost"
              size="sm"
              className="topbar-btn"
              onClick={onExportSingle}
              disabled={isExporting}
              loading={isExporting && exportProgress?.mode === 'single'}
              loadingLabel="Exporting..."
            >
              Export PNG
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="topbar-btn"
              onClick={onExportAll}
              disabled={isExporting}
              loading={isExporting && exportProgress?.mode === 'batch'}
              loadingLabel="Building ZIP..."
            >
              Export All
            </Button>
            {isExporting && (
              <Button variant="danger" size="sm" className="topbar-btn" onClick={onCancelExport}>
                Cancel
              </Button>
            )}
          </TopbarGroup>

          <div className="topbar-status-wrap">
            <span className="topbar-status">{devicePreset.width} x {devicePreset.height} px</span>
            <span className="topbar-status">
            Screenshot {formatScreenshotNumber(activeScreenshotIndex)} · {activeScreenshot.layers.length} layers
            </span>
            <span className="topbar-status">{autosaveLabel}</span>
            {autosaveError && (
              <span className="topbar-status topbar-status--error text-red-600 dark:text-red-300" title={autosaveError}>
                {autosaveError}
              </span>
            )}
          </div>
        </div>
        </header>

        <main
          className="workspace-layout workspace-layout-unified"
          style={{ '--right-pane': rightPaneWidth }}
        >

        <section className="workspace-primary p-3">
          <div className="divider mb-3 grid gap-1.5 pb-3 xl:grid-cols-[auto_auto_auto_auto_auto_1fr] xl:items-center">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="type-meta uppercase text-zinc-600 dark:text-zinc-200">Background</span>
              <Select
                value={background.type}
                onChange={(event) => onBackgroundTypeChange(event.target.value)}
                className="h-7 min-w-[88px] px-2 py-0 text-xs"
              >
                {BACKGROUND_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
              <input
                type="color"
                value={background.color}
                onChange={(event) => onBackgroundChange(event.target.value)}
                className="hairline h-7 w-9 rounded-md bg-white"
                title="Primary background color"
              />
              {background.type !== 'solid' && (
                <>
                  <input
                    type="color"
                    value={background.color2}
                    onChange={(event) => onBackgroundSecondaryChange(event.target.value)}
                    className="hairline h-7 w-9 rounded-md bg-white"
                    title="Secondary background color"
                  />
                  {background.type === 'linear' && (
                    <label className="type-meta flex items-center gap-1.5">
                      Angle
                      <input
                        type="range"
                        min={0}
                        max={360}
                        step={5}
                        value={background.angle}
                        onChange={(event) => onBackgroundAngleChange(Number(event.target.value))}
                        className="w-20"
                      />
                      <span className="mono text-[11px]">{background.angle}deg</span>
                    </label>
                  )}
                </>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={openFileDialog}>Upload</Button>
            <Button variant="ghost" size="sm" onClick={onAddTextLayer}>Add Text</Button>
            <Button variant="ghost"
              size="sm"
              onClick={() => setIsCompareMode((prev) => !prev)}
              className={isCompareMode ? 'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/24 dark:text-blue-100' : ''}
            >
              Compare
            </Button>

            <Button variant="ghost"
              size="sm"
              onClick={() => setShowSafeArea((prev) => !prev)}
              className={showSafeArea ? 'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/24 dark:text-blue-100' : ''}
            >
              Safe Area
            </Button>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
              <div ref={moreMenuRef} className="relative">
                <Button variant="ghost" size="sm" onClick={() => setIsMoreMenuOpen((prev) => !prev)}>
                  More
                </Button>
                {isMoreMenuOpen && (
                  <div className="surface-popover hairline absolute right-0 top-11 z-30 grid w-60 gap-1 rounded-xl bg-white p-2 shadow-sm dark:bg-black">
                    <div className="type-meta px-2 py-1 uppercase text-zinc-500 dark:text-zinc-400">
                      Style Packages
                    </div>
                    {stylePackages.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="ghost"
                        onClick={() => {
                          onApplyStylePackage(preset.id);
                          setIsMoreMenuOpen(false);
                        }}
                        className="justify-start text-left"
                      >
                        {preset.label}
                      </Button>
                    ))}

                    <div className="divider my-1" />

                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddDecorLayer('orb');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Add Orb
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddDecorLayer('ring');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Add Ring
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddDecorLayer('pill');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Add Pill
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddDecorLayer('glow');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Add Glow
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddMockupLayer('realistic');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Mockup Realistic
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddMockupLayer('flat');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Mockup Flat
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        onAddMockupLayer('rounded');
                        setIsMoreMenuOpen(false);
                      }}
                      className="justify-start text-left"
                    >
                      Mockup Rounded
                    </Button>
                    <Button
                      variant={showCenterGuides ? 'primary' : 'ghost'}
                      onClick={() => {
                        setShowCenterGuides((prev) => !prev);
                      }}
                      className="justify-start text-left"
                    >
                      Center Guides
                    </Button>
                    <Button
                      variant={showMarginGrid ? 'primary' : 'ghost'}
                      onClick={() => {
                        setShowMarginGrid((prev) => !prev);
                      }}
                      className="justify-start text-left"
                    >
                      Margin Grid
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isCompareMode && (
              <Select
                value={compareScreenshotId || ''}
                onChange={(event) => setCompareScreenshotId(Number(event.target.value))}
                className="type-meta py-2 text-zinc-700 dark:text-zinc-100"
              >
                {compareOptions.map((shot) => {
                  const screenshotOrder = screenshots.findIndex((item) => item.id === shot.id);
                  return (
                    <option key={shot.id} value={shot.id}>
                      {`Variant ${formatScreenshotNumber(screenshotOrder)} - ${shot.layers.length} layers`}
                    </option>
                  );
                })}
              </Select>
            )}

            <div className="type-meta text-right">
              {selectedLayer?.type === 'text'
                ? `Character count: ${selectedTextLength}`
                : 'Select a text layer to show character count'}
            </div>

            <div className="xl:col-span-6 flex flex-wrap gap-2">
              {backgroundPresets.map((preset) => {
                const isActive =
                  preset.type === background.type &&
                  preset.color.toLowerCase() === background.color.toLowerCase() &&
                  preset.color2.toLowerCase() === background.color2.toLowerCase() &&
                  Math.round(preset.angle) === Math.round(background.angle);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyBackgroundPreset(preset)}
                    className={`hairline inline-flex items-center gap-2 rounded-md px-2 py-1 text-left transition ${
                      isActive
                        ? 'border-blue-300 bg-blue-50/70 text-blue-700 dark:border-blue-400/60 dark:bg-blue-500/24 dark:text-blue-100'
                        : 'bg-white hover:bg-zinc-50 dark:bg-black dark:hover:bg-white/5'
                    }`}
                    title={`${preset.label} (${preset.type})`}
                  >
                    <span
                      className="h-4 w-4 rounded-sm border border-black/10"
                      style={{
                        background:
                          preset.type === 'solid'
                            ? preset.color
                            : `linear-gradient(135deg, ${preset.color}, ${preset.color2})`,
                      }}
                    />
                    <span className="type-meta leading-none text-[11px]">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/30 dark:text-red-100">
              <p className="type-meta uppercase text-zinc-700 dark:text-zinc-100">Compliance warnings</p>
              <ul className="type-meta mt-1 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={`${warning.layerId}-${warning.type}-${index}`}>- {warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          {coachingActions.length > 0 && (
            <div className="mb-4 rounded-lg bg-blue-50/60 px-3 py-3 dark:bg-blue-950/30">
              <p className="type-meta uppercase text-blue-700 dark:text-blue-100">
                Quick Start Guidance
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {coachingActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="ghost"
                    onClick={action.onClick}
                    className="interactive-card hairline w-full rounded-lg bg-white px-3 py-3 text-left transition-colors hover:bg-zinc-50 dark:bg-black dark:hover:bg-white/5"
                  >
                    <p className="type-subheading text-zinc-900 dark:text-zinc-50">{action.label}</p>
                    <p className="type-meta mt-1">{action.hint}</p>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isLoadingProject || isProcessingImages ? (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
              <SkeletonBlock className="mb-3 h-6 w-40" />
              <SkeletonBlock className="mb-3 h-[360px] w-full" />
              <p className="type-meta">
                {isLoadingProject ? 'Loading project...' : 'Processing images...'}
              </p>
            </div>
          ) : isCompareMode && compareScreenshot ? (
            <div className="grid gap-3 xl:grid-cols-2">
              <CanvasStage
                screenshot={activeScreenshot}
                devicePreset={devicePreset}
                selectedLayerId={selectedLayerId}
                onSelectLayer={onSetSelectedLayer}
                onLayerUpdate={onLayerUpdate}
                onAddImageLayers={onAddImageLayers}
                onCyclePrevScreenshot={onCyclePrevScreenshot}
                onCycleNextScreenshot={onCycleNextScreenshot}
                label="Current"
                showSafeArea={showSafeArea}
                showCenterGuides={showCenterGuides}
                showMarginGrid={showMarginGrid}
              />
              <CanvasStage
                screenshot={compareScreenshot}
                devicePreset={devicePreset}
                selectedLayerId={null}
                onSelectLayer={() => {}}
                onLayerUpdate={() => {}}
                onAddImageLayers={null}
                onCyclePrevScreenshot={null}
                onCycleNextScreenshot={null}
                readOnly
                label="Compare Variant"
                showSafeArea={showSafeArea}
                showCenterGuides={showCenterGuides}
                showMarginGrid={showMarginGrid}
              />
            </div>
          ) : (
            <CanvasStage
              screenshot={activeScreenshot}
              devicePreset={devicePreset}
              selectedLayerId={selectedLayerId}
              onSelectLayer={onSetSelectedLayer}
              onLayerUpdate={onLayerUpdate}
              onAddImageLayers={onAddImageLayers}
              onCyclePrevScreenshot={onCyclePrevScreenshot}
              onCycleNextScreenshot={onCycleNextScreenshot}
              showSafeArea={showSafeArea}
              showCenterGuides={showCenterGuides}
              showMarginGrid={showMarginGrid}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={projectInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleProjectSelect}
            className="hidden"
          />

          <div className="divider type-meta mt-4 pt-3">
            Active screenshot: {formatScreenshotNumber(activeScreenshotIndex)}
          </div>
        </section>

        {!isFocusedMode && (
          <Card as="aside" className="pane-width inspector-shell">
            {isRightPanelCollapsed ? (
              <div className="collapse-rail">
                <Button variant="ghost"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setIsRightPanelCollapsed(false)}
                  aria-label="Expand inspector panel"
                  title="Expand inspector panel"
                >
                  {'<'}
                </Button>
              </div>
            ) : (
              <LayerPanel
                screenshot={activeScreenshot}
                selectedLayer={selectedLayer}
                selectedLayerId={selectedLayerId}
                isExporting={isExporting}
                exportProgress={exportProgress}
                warnings={warnings}
                onSelectLayer={onSetSelectedLayer}
                onLayerUpdate={onLayerUpdate}
                onMockupScreenUpload={onMockupScreenUpload}
                onLayerDelete={onLayerDelete}
                onLayerVisibility={onLayerVisibility}
                onLayerLockToggle={onLayerLockToggle}
                onDuplicateLayer={onDuplicateLayer}
                onAlignLayer={onAlignLayer}
                onMoveLayer={onMoveLayer}
                onExportSingle={onExportSingle}
                onExportAll={onExportAll}
                onCancelExport={onCancelExport}
                onCollapse={() => setIsRightPanelCollapsed(true)}
              />
            )}
          </Card>
        )}
        </main>
      </div>
      </div>
    </div>
  );
}
