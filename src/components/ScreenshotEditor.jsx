import { useEffect, useMemo, useRef, useState } from 'react';
import CanvasStage from './CanvasStage';
import LayerPanel from './LayerPanel';
import ScreenshotThumbnail from './ScreenshotThumbnail';

function formatScreenshotNumber(index) {
  return String(index + 1).padStart(2, '0');
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

function GhostButton({ children, className = '', ...props }) {
  return (
    <button type="button" className={`btn btn-ghost ${className}`.trim()} {...props}>
      {children}
    </button>
  );
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
  onSelectScreenshot,
  onSetSelectedLayer,
  onBackgroundChange,
  onAddScreenshot,
  onDuplicateScreenshot,
  onDeleteScreenshot,
  onMoveScreenshot,
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

  if (!activeScreenshot) {
    return null;
  }

  const selectedTextLength = selectedLayer?.type === 'text' ? selectedLayer.text.length : 0;
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

  const coachingActions = buildCoachingActions({
    screenshot: activeScreenshot,
    onAddTextLayer,
    onAddDecorLayer,
    onAddMockupLayer,
    openFileDialog,
  });

  const leftPaneWidth = isFocusedMode ? '0px' : isLeftPanelCollapsed ? '52px' : '272px';
  const rightPaneWidth = isFocusedMode ? '0px' : isRightPanelCollapsed ? '52px' : '344px';

  return (
    <div className="app-shell">
      <header className="panel topbar mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">App Store Screenshot Engine</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Professional screenshot workflow for {devicePreset.label} publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button variant="ghost" onClick={onUndo} disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="ghost" onClick={onRedo} disabled={!canRedo}>
            Redo
          </Button>
          <Button variant="ghost" onClick={onSaveProject}>Save</Button>
          <Button variant="ghost" onClick={openProjectDialog}>Load</Button>
          <GhostButton
            onClick={() => setIsFocusedMode((prev) => !prev)}
            className={isFocusedMode ? 'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-200' : ''}
          >
            {isFocusedMode ? 'Exit Focus' : 'Focus Mode'}
          </Button>
          <Button variant="ghost" onClick={onToggleTheme}>{isDarkMode ? 'Light' : 'Dark'}</Button>
          <span className="tag">{devicePreset.width} x {devicePreset.height} px</span>
          <span className="tag">
            Screenshot {formatScreenshotNumber(activeScreenshotIndex)} · {activeScreenshot.layers.length} layers
          </span>
        </div>
      </header>

      <main
        className="workspace-layout"
        style={{ '--left-pane': leftPaneWidth, '--right-pane': rightPaneWidth }}
      >
        {!isFocusedMode && (
          <aside className="panel pane-width">
            {isLeftPanelCollapsed ? (
              <div className="collapse-rail">
                <GhostButton
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setIsLeftPanelCollapsed(false)}
                  aria-label="Expand screenshots panel"
                >
                  {'>'}
                </Button>
              </div>
            ) : (
              <div className="p-3">
                <div className="divider mb-3 flex items-center justify-between pb-3">
                  <div>
                    <h2 className="text-base font-semibold">Screenshots</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{screenshots.length} variants</p>
                  </div>
                  <GhostButton
                    className="h-8 w-8 p-0 text-xs"
                    onClick={() => setIsLeftPanelCollapsed(true)}
                    aria-label="Collapse screenshots panel"
                  >
                    {'<'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {screenshots.map((shot, index) => {
                    const isActive = shot.id === activeScreenshotId;

                    return (
                      <div
                        key={shot.id}
                        className={`grid grid-cols-[1fr_auto] items-start rounded-xl px-2 py-2 ${
                          isActive
                            ? 'bg-blue-50/70 dark:bg-blue-500/20'
                            : 'bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectScreenshot(shot.id)}
                          className="grid grid-cols-[74px_1fr] items-center gap-3 text-left"
                        >
                          <ScreenshotThumbnail screenshot={shot} devicePreset={devicePreset} width={72} />
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              Screenshot {formatScreenshotNumber(index)}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {shot.layers.length} layers · {shot.layers.some((layer) => layer.type === 'text') ? 'Text' : 'Visual'}
                            </div>
                          </div>
                        </button>
                        <div className="flex gap-1">
                          <Button variant="ghost" className="h-7 min-w-7 p-0 text-xs" onClick={() => onMoveScreenshot(shot.id, 'up')}>
                            ^
                          </Button>
                          <Button variant="ghost" className="h-7 min-w-7 p-0 text-xs" onClick={() => onMoveScreenshot(shot.id, 'down')}>
                            v
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="divider mt-3 pt-3" />
                <div className="grid gap-2">
                  <Button variant="ghost" onClick={onAddScreenshot}>Add Screenshot</Button>
                  <Button variant="ghost" onClick={onDuplicateScreenshot}>Duplicate</Button>
                  <Button variant="ghost" className="btn-danger" onClick={onDeleteScreenshot}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </aside>
        )}

        <section className="panel p-4">
          <div className="divider mb-4 grid gap-2 pb-4 xl:grid-cols-[auto_auto_auto_auto_auto_1fr] xl:items-center">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              Background
              <input
                type="color"
                value={activeScreenshot.backgroundColor}
                onChange={(event) => onBackgroundChange(event.target.value)}
                className="hairline h-8 w-10 rounded-md bg-white"
              />
            </label>

            <Button variant="ghost" onClick={openFileDialog}>Upload</Button>
            <Button variant="ghost" onClick={onAddTextLayer}>Add Text</Button>
            <GhostButton
              onClick={() => setIsCompareMode((prev) => !prev)}
              className={isCompareMode ? 'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-200' : ''}
            >
              Compare
            </Button>

            <GhostButton
              onClick={() => setShowSafeArea((prev) => !prev)}
              className={showSafeArea ? 'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-200' : ''}
            >
              Safe Area
            </Button>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <div ref={moreMenuRef} className="relative">
                <Button variant="ghost" onClick={() => setIsMoreMenuOpen((prev) => !prev)}>
                  More
                </Button>
                {isMoreMenuOpen && (
                  <div className="hairline absolute right-0 top-11 z-30 grid w-52 gap-1 rounded-xl bg-white p-2 shadow-sm dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        onAddDecorLayer('orb');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Add Orb
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddDecorLayer('ring');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Add Ring
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddDecorLayer('pill');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Add Pill
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddDecorLayer('glow');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Add Glow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddMockupLayer('realistic');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Mockup Realistic
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddMockupLayer('flat');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Mockup Flat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAddMockupLayer('rounded');
                        setIsMoreMenuOpen(false);
                      }}
                      className="btn btn-ghost justify-start text-left"
                    >
                      Mockup Rounded
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCenterGuides((prev) => !prev);
                      }}
                      className={`btn ${showCenterGuides ? 'btn-primary' : 'btn-ghost'} justify-start text-left`}
                    >
                      Center Guides
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMarginGrid((prev) => !prev);
                      }}
                      className={`btn ${showMarginGrid ? 'btn-primary' : 'btn-ghost'} justify-start text-left`}
                    >
                      Margin Grid
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isCompareMode && (
              <select
                value={compareScreenshotId || ''}
                onChange={(event) => setCompareScreenshotId(Number(event.target.value))}
                className="hairline rounded-lg px-2 py-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {compareOptions.map((shot) => {
                  const screenshotOrder = screenshots.findIndex((item) => item.id === shot.id);
                  return (
                    <option key={shot.id} value={shot.id}>
                      {`Variant ${formatScreenshotNumber(screenshotOrder)} - ${shot.layers.length} layers`}
                    </option>
                  );
                })}
              </select>
            )}

            <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
              {selectedLayer?.type === 'text'
                ? `Character count: ${selectedTextLength}`
                : 'Select a text layer to show character count'}
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/20 dark:text-red-200">
              <p className="text-xs font-semibold uppercase tracking-wide">Compliance warnings</p>
              <ul className="mt-1 space-y-1 text-xs">
                {warnings.map((warning, index) => (
                  <li key={`${warning.layerId}-${warning.type}-${index}`}>- {warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          {coachingActions.length > 0 && (
            <div className="mb-4 rounded-lg bg-blue-50/60 px-3 py-3 dark:bg-blue-500/15">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
                Quick Start Guidance
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {coachingActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="hairline rounded-lg bg-white px-3 py-3 text-left transition-colors hover:bg-zinc-50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{action.label}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{action.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isCompareMode && compareScreenshot ? (
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

          <div className="divider mt-4 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Active screenshot: {formatScreenshotNumber(activeScreenshotIndex)}
          </div>
        </section>

        {!isFocusedMode && (
          <aside className="panel pane-width">
            {isRightPanelCollapsed ? (
              <div className="collapse-rail">
                <GhostButton
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setIsRightPanelCollapsed(false)}
                  aria-label="Expand inspector panel"
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
          </aside>
        )}
      </main>
    </div>
  );
}
