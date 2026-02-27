import { useRef } from 'react';
import CanvasStage from './CanvasStage';
import LayerPanel from './LayerPanel';

function formatScreenshotNumber(index) {
  return String(index + 1).padStart(2, '0');
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
  isDarkMode,
  onSelectScreenshot,
  onSetSelectedLayer,
  onBackgroundChange,
  onAddScreenshot,
  onDuplicateScreenshot,
  onDeleteScreenshot,
  onMoveScreenshot,
  onAddTextLayer,
  onAddDecorLayer,
  onAddImageLayers,
  onLayerUpdate,
  onLayerDelete,
  onLayerVisibility,
  onMoveLayer,
  onExportSingle,
  onExportAll,
  onToggleTheme,
}) {
  const fileInputRef = useRef(null);

  if (!activeScreenshot) {
    return null;
  }

  const selectedTextLength = selectedLayer?.type === 'text' ? selectedLayer.text.length : 0;

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (files && files.length) {
      await onAddImageLayers(files);
    }

    event.target.value = '';
  };

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
                    className="text-left"
                  >
                    <div className="mono text-sm font-medium">{formatScreenshotNumber(index)}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{shot.layers.length} layers</div>
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
          <div className="mb-3 grid gap-2 border-b border-line pb-3 md:grid-cols-[auto_auto_auto_auto_auto_auto_auto_1fr] md:items-center">
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

          <CanvasStage
            screenshot={activeScreenshot}
            devicePreset={devicePreset}
            selectedLayerId={selectedLayerId}
            onSelectLayer={onSetSelectedLayer}
            onLayerUpdate={onLayerUpdate}
            onAddImageLayers={onAddImageLayers}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={handleFileSelect}
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
          warnings={warnings}
          onSelectLayer={onSetSelectedLayer}
          onLayerUpdate={onLayerUpdate}
          onLayerDelete={onLayerDelete}
          onLayerVisibility={onLayerVisibility}
          onMoveLayer={onMoveLayer}
          onExportSingle={onExportSingle}
          onExportAll={onExportAll}
        />
      </main>
    </div>
  );
}
