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
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareScreenshotId, setCompareScreenshotId] = useState(null);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showCenterGuides, setShowCenterGuides] = useState(false);
  const [showMarginGrid, setShowMarginGrid] = useState(false);

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
    const fallback = (fallbackPrevious && fallbackPrevious.id !== activeScreenshotId && fallbackPrevious)
      || compareOptions[0];
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

  const coachingActions = buildCoachingActions({
    screenshot: activeScreenshot,
    onAddTextLayer,
    onAddDecorLayer,
    onAddMockupLayer,
    openFileDialog,
  });

  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-5">
      <header className="panel mb-4 grid gap-2 border p-4 md:grid-cols-[1fr_auto] md:items-center animate-reveal">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">App Store Screenshot Engine</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Multi-screenshot publishing utility for {devicePreset.label} export. Ready for App Store QA 🚀
          </p>
        </div>
        <div className="flex items-center gap-2 md:justify-end">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="mono border border-line px-2 py-1 text-xs uppercase tracking-wider hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="mono border border-line px-2 py-1 text-xs uppercase tracking-wider hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={onSaveProject}
            className="mono border border-line px-2 py-1 text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Save Project
          </button>
          <button
            type="button"
            onClick={openProjectDialog}
            className="mono border border-line px-2 py-1 text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Load Project
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="mono border border-line px-2 py-1 text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {isDarkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="mono text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {devicePreset.width} x {devicePreset.height} px
          </div>
        </div>
      </header>

      <main className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_320px]">
        <aside className="panel animate-reveal border p-3" style={{ animationDelay: '80ms' }}>
          <div className="mb-3 flex items-center justify-between border-b border-line pb-2">
            <h2 className="mono text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Screenshots</h2>
            <span className="mono text-xs text-zinc-500 dark:text-zinc-400">{screenshots.length}</span>
          </div>

          <div className="space-y-2">
            {screenshots.map((shot, index) => {
              const isActive = shot.id === activeScreenshotId;

              return (
                <div
                  key={shot.id}
                  className={`grid grid-cols-[1fr_auto] items-center border px-2 py-2 ${
                    isActive ? 'border-accent bg-blue-50/40 dark:bg-blue-500/20' : 'border-line'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectScreenshot(shot.id)}
                    className="grid grid-cols-[56px_1fr] items-center gap-2 text-left"
                  >
                    <ScreenshotThumbnail
                      screenshot={shot}
                      devicePreset={devicePreset}
                      width={54}
                    />
                    <div>
                      <div className="mono text-sm font-medium">{formatScreenshotNumber(index)}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{shot.layers.length} layers</div>
                    </div>
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveScreenshot(shot.id, 'up')}
                      className="mono border border-line px-1.5 py-0.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveScreenshot(shot.id, 'down')}
                      className="mono border border-line px-1.5 py-0.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={onAddScreenshot}
              className="mono border border-line px-2 py-1.5 text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Screenshot
            </button>
            <button
              type="button"
              onClick={onDuplicateScreenshot}
              className="mono border border-line px-2 py-1.5 text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={onDeleteScreenshot}
              className="mono border border-line px-2 py-1.5 text-xs uppercase tracking-wider text-alert hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </aside>

        <section className="panel animate-reveal border p-3" style={{ animationDelay: '140ms' }}>
          <div className="mb-3 grid gap-2 border-b border-line pb-3 md:grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto_auto_auto_1fr] md:items-center">
            <label className="mono flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
              BG
              <input
                type="color"
                value={activeScreenshot.backgroundColor}
                onChange={(event) => onBackgroundChange(event.target.value)}
                className="h-7 w-10 border border-line"
              />
            </label>

            <button
              type="button"
              onClick={openFileDialog}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Upload PNG/JPG
            </button>

            <button
              type="button"
              onClick={() => setShowSafeArea((prev) => !prev)}
              className={`mono border px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showSafeArea ? 'border-accent text-accent' : 'border-line'
              }`}
            >
              Safe Area
            </button>

            <button
              type="button"
              onClick={() => setShowCenterGuides((prev) => !prev)}
              className={`mono border px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showCenterGuides ? 'border-accent text-accent' : 'border-line'
              }`}
            >
              Center
            </button>

            <button
              type="button"
              onClick={() => setShowMarginGrid((prev) => !prev)}
              className={`mono border px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                showMarginGrid ? 'border-accent text-accent' : 'border-line'
              }`}
            >
              Margin Grid
            </button>

            <button
              type="button"
              onClick={onAddTextLayer}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Text
            </button>

            <button
              type="button"
              onClick={() => onAddDecorLayer('orb')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Orb
            </button>

            <button
              type="button"
              onClick={() => onAddDecorLayer('ring')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Ring
            </button>

            <button
              type="button"
              onClick={() => onAddDecorLayer('pill')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Pill
            </button>

            <button
              type="button"
              onClick={() => onAddDecorLayer('glow')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Add Glow
            </button>

            <button
              type="button"
              onClick={() => setIsCompareMode((prev) => !prev)}
              className={`mono border px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isCompareMode ? 'border-accent text-accent' : 'border-line'
              }`}
            >
              Compare
            </button>

            {isCompareMode && (
              <select
                value={compareScreenshotId || ''}
                onChange={(event) => setCompareScreenshotId(Number(event.target.value))}
                className="mono border border-line px-2 py-1.5 text-xs uppercase tracking-wide"
              >
                {compareOptions.map((shot) => {
                  const screenshotOrder = screenshots.findIndex((item) => item.id === shot.id);
                  return (
                    <option key={shot.id} value={shot.id}>
                      {`Variant ${formatScreenshotNumber(screenshotOrder)} • ${shot.layers.length} layers`}
                    </option>
                  );
                })}
              </select>
            )}

            <button
              type="button"
              onClick={() => onAddMockupLayer('realistic')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Mockup Realistic
            </button>

            <button
              type="button"
              onClick={() => onAddMockupLayer('flat')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Mockup Flat
            </button>

            <button
              type="button"
              onClick={() => onAddMockupLayer('rounded')}
              className="mono border border-line px-3 py-1.5 text-xs uppercase tracking-wide hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Mockup Rounded
            </button>

            <div className="mono text-xs text-zinc-500 dark:text-zinc-400 md:text-right">
              {selectedLayer?.type === 'text' ? `Chars: ${selectedTextLength}` : 'Select a text layer to count'}
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="mb-3 border border-alert/40 bg-red-50 px-3 py-2 dark:bg-red-900/20">
              <p className="mono mb-1 text-xs uppercase tracking-wide text-alert">Compliance warnings</p>
              <ul className="space-y-1 text-xs text-alert">
                {warnings.map((warning, index) => (
                  <li key={`${warning.layerId}-${warning.type}-${index}`}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          )}

          {coachingActions.length > 0 && (
            <div className="mb-3 border border-accent/30 bg-blue-50/50 px-3 py-2 dark:bg-blue-900/20">
              <p className="mono mb-1 text-xs uppercase tracking-wide text-accent">Quick Start Guidance</p>
              <div className="grid gap-2 md:grid-cols-2">
                {coachingActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.onClick}
                    className="text-left border border-line bg-white/80 px-2 py-2 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-800"
                  >
                    <p className="mono text-xs uppercase tracking-wide text-zinc-800 dark:text-zinc-100">
                      {action.label}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{action.hint}</p>
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

          <div className="mono mt-3 border-t border-line pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Active screenshot: {formatScreenshotNumber(activeScreenshotIndex)}
          </div>
        </section>

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
        />
      </main>
    </div>
  );
}
