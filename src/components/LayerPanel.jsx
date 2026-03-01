import { useRef, useState } from 'react';
import { TEXT_FONT_OPTIONS, TYPOGRAPHY_SCALES } from '../constants';

const alignmentModes = ['left', 'center', 'right'];
const blendModes = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
];

const layerTypeMeta = {
  text: { icon: 'TXT', tone: 'text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-900/30' },
  image: { icon: 'IMG', tone: 'text-emerald-700 bg-emerald-50 dark:text-emerald-200 dark:bg-emerald-900/30' },
  mockup: { icon: 'MCK', tone: 'text-violet-700 bg-violet-50 dark:text-violet-200 dark:bg-violet-900/30' },
  shape: { icon: 'SHP', tone: 'text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-700/40' },
};

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-xs">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <section className="rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{title}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="grid gap-3 px-3 pb-3">{children}</div>}
    </section>
  );
}

function InputClassName() {
  return 'hairline rounded-lg bg-white px-2 py-1.5 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200';
}

export default function LayerPanel({
  screenshot,
  selectedLayer,
  selectedLayerId,
  isExporting,
  exportProgress,
  warnings,
  onSelectLayer,
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
  onCollapse,
}) {
  const orderedLayers = [...screenshot.layers].reverse();
  const selectedWarnings = warnings.filter((item) => item.layerId === selectedLayerId);
  const mockupUploadRef = useRef(null);
  const [openSections, setOpenSections] = useState({
    transform: true,
    appearance: true,
    type: true,
  });
  const exportPercent = Math.max(0, Math.min(100, Math.round(exportProgress?.percent || 0)));
  const isBatchExport = exportProgress?.mode === 'batch';

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const inputClassName = InputClassName();

  return (
    <div className="h-full p-3">
      <div className="divider mb-3 flex items-start justify-between pb-3">
        <div>
          <h2 className="text-base font-semibold">Inspector</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{screenshot.layers.length} layers</p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="btn btn-ghost h-8 w-8 p-0 text-xs"
          aria-label="Collapse inspector panel"
        >
          {'>'}
        </button>
      </div>

      <div className="space-y-1.5 rounded-lg bg-zinc-50/60 p-2 dark:bg-zinc-900/40">
        <div className="px-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Layer stack
        </div>
        <div className="space-y-1">
          <div className="rounded-md px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400">Background (locked)</div>
          {orderedLayers.length === 0 && (
            <div className="rounded-md px-2 py-2 text-xs text-zinc-500 dark:text-zinc-400">No layers yet</div>
          )}
          {orderedLayers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const meta = layerTypeMeta[layer.type] || {
              icon: 'LYR',
              tone: 'text-zinc-700 bg-zinc-100 dark:text-zinc-200 dark:bg-zinc-700/40',
            };

            return (
              <div
                key={layer.id}
                className={`grid grid-cols-[1fr_auto] items-center gap-2 rounded-md px-2 py-2 ${
                  isSelected ? 'bg-blue-50/80 dark:bg-blue-500/20' : 'bg-white/75 dark:bg-zinc-900/60'
                }`}
              >
                <button type="button" onClick={() => onSelectLayer(layer.id)} className="text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex min-w-8 items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.tone}`}
                    >
                      {meta.icon}
                    </span>
                    <span className="text-sm leading-4 text-zinc-900 dark:text-zinc-100">{layer.name}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    <span>{layer.type}</span>
                    {layer.locked && <span className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-zinc-700">Locked</span>}
                    {layer.visible === false && <span className="rounded bg-red-100 px-1 py-0.5 text-red-700 dark:bg-red-900/40 dark:text-red-200">Hidden</span>}
                  </div>
                </button>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onLayerVisibility(layer.id)}
                    className="btn btn-ghost h-7 px-2 py-0 text-[11px]"
                  >
                    {layer.visible === false ? 'Show' : 'Hide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onLayerLockToggle(layer.id)}
                    className="btn btn-ghost h-7 px-2 py-0 text-[11px]"
                  >
                    {layer.locked ? 'Unlock' : 'Lock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    className="btn btn-ghost h-7 min-w-7 p-0 text-[11px]"
                  >
                    ^
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    className="btn btn-ghost h-7 min-w-7 p-0 text-[11px]"
                  >
                    v
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLayer ? (
        <div className="mt-3 grid gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selectedLayer.name}</div>
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{selectedLayer.type}</div>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => onDuplicateLayer(selectedLayer.id)} className="btn btn-ghost text-xs">
                Duplicate
              </button>
              <button type="button" onClick={() => onLayerLockToggle(selectedLayer.id)} className="btn btn-ghost text-xs">
                {selectedLayer.locked ? 'Unlock' : 'Lock'}
              </button>
              <button type="button" onClick={() => onLayerDelete(selectedLayer.id)} className="btn btn-ghost btn-danger text-xs">
                Delete
              </button>
            </div>
          </div>

          {selectedWarnings.length > 0 && (
            <div className="rounded-lg bg-red-50 px-2 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-200">
              {selectedWarnings.map((warning, index) => (
                <p key={`${warning.type}-${index}`}>- {warning.message}</p>
              ))}
            </div>
          )}

          <AccordionSection
            title="Transform"
            isOpen={openSections.transform}
            onToggle={() => toggleSection('transform')}
          >
            <div className="grid grid-cols-3 gap-2">
              <Field label="X">
                <input
                  type="number"
                  value={Math.round(selectedLayer.x || 0)}
                  onChange={(event) => onLayerUpdate(selectedLayer.id, { x: Number(event.target.value) || 0 })}
                  className={inputClassName}
                />
              </Field>
              <Field label="Y">
                <input
                  type="number"
                  value={Math.round(selectedLayer.y || 0)}
                  onChange={(event) => onLayerUpdate(selectedLayer.id, { y: Number(event.target.value) || 0 })}
                  className={inputClassName}
                />
              </Field>
              <Field label="Rotate">
                <input
                  type="number"
                  value={Math.round(selectedLayer.rotation || 0)}
                  onChange={(event) =>
                    onLayerUpdate(selectedLayer.id, { rotation: Number(event.target.value) || 0 })
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center-x')} className="btn btn-ghost text-[11px]">
                Center X
              </button>
              <button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center-y')} className="btn btn-ghost text-[11px]">
                Center Y
              </button>
              <button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center')} className="btn btn-ghost text-[11px]">
                Center
              </button>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Appearance"
            isOpen={openSections.appearance}
            onToggle={() => toggleSection('appearance')}
          >
            <Field label={`Opacity (${Math.round((selectedLayer.opacity ?? 1) * 100)}%)`}>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.01"
                value={selectedLayer.opacity ?? 1}
                onChange={(event) => onLayerUpdate(selectedLayer.id, { opacity: Number(event.target.value) })}
              />
            </Field>

            <Field label="Blend Mode">
              <select
                value={selectedLayer.blendMode || 'normal'}
                onChange={(event) => onLayerUpdate(selectedLayer.id, { blendMode: event.target.value })}
                className={inputClassName}
              >
                {blendModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </Field>
          </AccordionSection>

          <AccordionSection
            title="Type Specific"
            isOpen={openSections.type}
            onToggle={() => toggleSection('type')}
          >
            {selectedLayer.type === 'image' && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Width">
                  <input
                    type="number"
                    value={Math.round(selectedLayer.width || 0)}
                    onChange={(event) =>
                      onLayerUpdate(selectedLayer.id, {
                        width: Math.max(30, Number(event.target.value) || 30),
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
                <Field label="Height">
                  <input
                    type="number"
                    value={Math.round(selectedLayer.height || 0)}
                    onChange={(event) =>
                      onLayerUpdate(selectedLayer.id, {
                        height: Math.max(30, Number(event.target.value) || 30),
                      })
                    }
                    className={inputClassName}
                  />
                </Field>
              </div>
            )}

            {selectedLayer.type === 'shape' && (
              <>
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Style: {selectedLayer.shapeKind || 'orb'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Width">
                    <input
                      type="number"
                      value={Math.round(selectedLayer.width || 0)}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          width: Math.max(40, Number(event.target.value) || 40),
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Height">
                    <input
                      type="number"
                      value={Math.round(selectedLayer.height || 0)}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          height: Math.max(40, Number(event.target.value) || 40),
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field label="Decor Color">
                  <input
                    type="color"
                    value={selectedLayer.color || '#6fa8ff'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { color: event.target.value })}
                    className="hairline h-9 w-full rounded-lg"
                  />
                </Field>

                <Field label="Secondary Color">
                  <input
                    type="color"
                    value={selectedLayer.color2 || '#d6e5ff'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { color2: event.target.value })}
                    className="hairline h-9 w-full rounded-lg"
                  />
                </Field>

                <Field label={`Blur (${Math.round(selectedLayer.blur || 28)}px)`}>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="1"
                    value={selectedLayer.blur || 28}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { blur: Number(event.target.value) })}
                  />
                </Field>

                {selectedLayer.shapeKind === 'ring' && (
                  <Field label={`Stroke (${Math.round(selectedLayer.strokeWidth || 20)}px)`}>
                    <input
                      type="range"
                      min="2"
                      max="120"
                      step="1"
                      value={selectedLayer.strokeWidth || 20}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          strokeWidth: Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                )}

                {(selectedLayer.shapeKind === 'pill' || selectedLayer.shapeKind === 'glow') && (
                  <Field label={`Corner Radius (${Math.round(selectedLayer.cornerRadius || 24)}px)`}>
                    <input
                      type="range"
                      min="0"
                      max="240"
                      step="1"
                      value={selectedLayer.cornerRadius || 24}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          cornerRadius: Number(event.target.value),
                        })
                      }
                    />
                  </Field>
                )}
              </>
            )}

            {selectedLayer.type === 'mockup' && (
              <>
                <Field label="Mockup Style">
                  <select
                    value={selectedLayer.mockupStyle || 'realistic'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { mockupStyle: event.target.value })}
                    className={inputClassName}
                  >
                    <option value="realistic">Realistic</option>
                    <option value="flat">Flat</option>
                    <option value="rounded">Rounded</option>
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="Width">
                    <input
                      type="number"
                      value={Math.round(selectedLayer.width || 0)}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          width: Math.max(180, Number(event.target.value) || 180),
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Height">
                    <input
                      type="number"
                      value={Math.round(selectedLayer.height || 0)}
                      onChange={(event) =>
                        onLayerUpdate(selectedLayer.id, {
                          height: Math.max(300, Number(event.target.value) || 300),
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                </div>

                <Field label="Frame Color">
                  <input
                    type="color"
                    value={selectedLayer.frameColor || '#0f172a'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { frameColor: event.target.value })}
                    className="hairline h-9 w-full rounded-lg"
                  />
                </Field>

                <Field label="Accent Color">
                  <input
                    type="color"
                    value={selectedLayer.accentColor || '#334155'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { accentColor: event.target.value })}
                    className="hairline h-9 w-full rounded-lg"
                  />
                </Field>

                <Field label={`Bezel (${Math.round(selectedLayer.bezel || 20)}px)`}>
                  <input
                    type="range"
                    min="6"
                    max="64"
                    step="1"
                    value={selectedLayer.bezel || 20}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { bezel: Number(event.target.value) })}
                  />
                </Field>

                <Field label={`Corner Radius (${Math.round(selectedLayer.cornerRadius || 80)}px)`}>
                  <input
                    type="range"
                    min="8"
                    max="260"
                    step="1"
                    value={selectedLayer.cornerRadius || 80}
                    onChange={(event) =>
                      onLayerUpdate(selectedLayer.id, {
                        cornerRadius: Number(event.target.value),
                      })
                    }
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => mockupUploadRef.current?.click()}
                  className="btn btn-ghost"
                >
                  Upload Screen Image
                </button>
                <input
                  ref={mockupUploadRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onMockupScreenUpload(selectedLayer.id, file);
                    }
                    event.target.value = '';
                  }}
                />
              </>
            )}

            {selectedLayer.type === 'text' && (
              <>
                <Field label="Text">
                  <textarea
                    value={selectedLayer.text || ''}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { text: event.target.value })}
                    rows={4}
                    className={`${inputClassName} resize-y`}
                  />
                </Field>

                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Characters: {(selectedLayer.text || '').length}
                </div>

                <Field label="Type Scale">
                  <div className="grid grid-cols-3 gap-1">
                    {TYPOGRAPHY_SCALES.map((preset) => {
                      const isActive =
                        Math.round(selectedLayer.fontSize || 0) === preset.fontSize &&
                        Math.abs((selectedLayer.lineHeight || 1.1) - preset.lineHeight) < 0.01 &&
                        Math.round(selectedLayer.width || 0) === preset.width;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            onLayerUpdate(selectedLayer.id, {
                              fontSize: preset.fontSize,
                              lineHeight: preset.lineHeight,
                              width: preset.width,
                            })
                          }
                          className={`btn ${
                            isActive
                              ? 'btn-primary'
                              : 'btn-ghost'
                          } text-xs`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label={`Font Size (${selectedLayer.fontSize || 64}px)`}>
                  <input
                    type="range"
                    min="20"
                    max="240"
                    value={selectedLayer.fontSize || 64}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { fontSize: Number(event.target.value) })}
                  />
                </Field>

                <Field label="Font Family">
                  <select
                    value={selectedLayer.fontFamily || 'IBM Plex Sans'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { fontFamily: event.target.value })}
                    className={inputClassName}
                  >
                    {TEXT_FONT_OPTIONS.map((fontName) => (
                      <option key={fontName} value={fontName}>
                        {fontName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Text Width">
                  <input
                    type="number"
                    value={Math.round(selectedLayer.width || 0)}
                    onChange={(event) =>
                      onLayerUpdate(selectedLayer.id, {
                        width: Math.max(80, Number(event.target.value) || 80),
                      })
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Text Color">
                  <input
                    type="color"
                    value={selectedLayer.color || '#101010'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { color: event.target.value })}
                    className="hairline h-9 w-full rounded-lg"
                  />
                </Field>

                <Field label="Alignment">
                  <div className="grid grid-cols-3 gap-1">
                    {alignmentModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => onLayerUpdate(selectedLayer.id, { align: mode })}
                        className={`btn ${
                          selectedLayer.align === mode ? 'btn-primary' : 'btn-ghost'
                        } text-xs`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}
          </AccordionSection>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-zinc-50/70 px-3 py-3 text-xs text-zinc-500 dark:bg-zinc-900/40 dark:text-zinc-400">
          Select a layer to edit properties.
        </div>
      )}

      <div className="mt-3 grid gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Export</div>

        {isExporting && exportProgress && (
          <div className="grid gap-1 rounded-lg bg-zinc-50 px-2 py-2 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                {exportProgress.message || 'Exporting...'}
              </p>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{exportPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full bg-blue-500 transition-[width] duration-200 ease-out"
                style={{ width: `${exportPercent}%` }}
              />
            </div>
            {isBatchExport && (
              <button
                type="button"
                onClick={onCancelExport}
                className="btn btn-ghost btn-danger mt-1"
              >
                Cancel Export
              </button>
            )}
          </div>
        )}

        <button type="button" onClick={onExportSingle} disabled={isExporting} className="btn btn-ghost">
          {isExporting ? 'Exporting...' : 'Export Active PNG'}
        </button>
        <button type="button" onClick={onExportAll} disabled={isExporting} className="btn btn-primary">
          {isExporting ? 'Building ZIP...' : 'Export All (ZIP)'}
        </button>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Always exported at 1290x2796 PNG, preview scaling ignored.
        </p>
      </div>
    </div>
  );
}
