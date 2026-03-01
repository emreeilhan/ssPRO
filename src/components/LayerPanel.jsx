import { useEffect, useRef, useState } from 'react';
import { TEXT_FONT_OPTIONS, TYPOGRAPHY_SCALES } from '../constants';
import Button from './ui/Button';
import { Input, Select, Textarea, inputBaseClassName } from './ui/Input';

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
  text: { icon: 'TXT', tone: 'text-blue-700 bg-blue-50 dark:text-blue-100 dark:bg-blue-950/35' },
  image: { icon: 'IMG', tone: 'text-emerald-700 bg-emerald-50 dark:text-emerald-100 dark:bg-emerald-950/35' },
  mockup: { icon: 'MCK', tone: 'text-violet-700 bg-violet-50 dark:text-violet-100 dark:bg-violet-950/35' },
  shape: { icon: 'SHP', tone: 'text-slate-700 bg-slate-100 dark:text-slate-100 dark:bg-white/10' },
};

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-xs">
      <span className="type-meta uppercase text-zinc-500 dark:text-zinc-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function AccordionSection({ title, isOpen, onToggle, children }) {
  return (
    <section className="rounded-lg bg-zinc-50/70 dark:bg-black">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="type-subheading text-zinc-800 dark:text-zinc-100">{title}</span>
        <span className="type-meta">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="grid gap-3 px-3 pb-3">{children}</div>}
    </section>
  );
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
  const [isTypeAdvancedOpen, setIsTypeAdvancedOpen] = useState(false);
  const exportPercent = Math.max(0, Math.min(100, Math.round(exportProgress?.percent || 0)));
  const isBatchExport = exportProgress?.mode === 'batch';
  const selectedLayerType = selectedLayer?.type || null;
  const hasTypeAdvanced =
    selectedLayerType === 'text' || selectedLayerType === 'shape' || selectedLayerType === 'mockup';

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    setIsTypeAdvancedOpen(false);
  }, [selectedLayerId, selectedLayerType]);

  const inputClassName = inputBaseClassName;

  return (
    <div className="h-full p-3">
      <div className="divider mb-3 flex items-start justify-between pb-3">
        <div>
          <h2 className="type-subheading">Inspector</h2>
          <p className="type-meta">{screenshot.layers.length} layers</p>
        </div>
        <Button
          type="button"
          onClick={onCollapse}
          className="h-8 w-8 p-0 text-xs"
          aria-label="Collapse inspector panel"
        >
          {'>'}
        </Button>
      </div>

      <div className="space-y-1.5 rounded-lg bg-zinc-50/60 p-2 dark:bg-black">
        <div className="type-meta px-1 uppercase">
          Layer stack
        </div>
        <div className="space-y-1">
          <div className="type-meta rounded-md px-2 py-1.5">Background (locked)</div>
          {orderedLayers.length === 0 && (
            <div className="type-meta rounded-md px-2 py-2">No layers yet</div>
          )}
          {orderedLayers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const meta = layerTypeMeta[layer.type] || {
              icon: 'LYR',
              tone: 'text-zinc-700 bg-zinc-100 dark:text-zinc-100 dark:bg-white/10',
            };

            return (
              <div
                key={layer.id}
                className={`interactive-card grid grid-cols-[1fr_auto] items-center gap-2 rounded-md px-2 py-2 ${
                  isSelected ? 'bg-blue-50/80 dark:bg-blue-500/24' : 'bg-white/75 dark:bg-black'
                }`}
              >
                <button type="button" onClick={() => onSelectLayer(layer.id)} className="text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex min-w-8 items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.tone}`}
                    >
                      {meta.icon}
                    </span>
                    <span className="type-subheading leading-4 text-zinc-900 dark:text-zinc-50">{layer.name}</span>
                  </div>
                  <div className="type-meta mt-1 flex items-center gap-1 uppercase">
                    <span>{layer.type}</span>
                    {layer.locked && <span className="rounded bg-zinc-200 px-1 py-0.5 dark:bg-white/15">Locked</span>}
                    {layer.visible === false && <span className="rounded bg-red-100 px-1 py-0.5 text-red-700 dark:bg-red-950/35 dark:text-red-100">Hidden</span>}
                  </div>
                </button>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    onClick={() => onLayerVisibility(layer.id)}
                    className="h-7 px-2 py-0 text-[11px]"
                  >
                    {layer.visible === false ? 'Show' : 'Hide'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onLayerLockToggle(layer.id)}
                    className="h-7 px-2 py-0 text-[11px]"
                  >
                    {layer.locked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    className="h-7 min-w-7 p-0 text-[11px]"
                  >
                    ^
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    className="h-7 min-w-7 p-0 text-[11px]"
                  >
                    v
                  </Button>
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
              <div className="type-subheading text-zinc-900 dark:text-zinc-50">{selectedLayer.name}</div>
              <div className="type-meta uppercase">{selectedLayer.type}</div>
            </div>
            <div className="flex gap-1">
              <Button type="button" onClick={() => onDuplicateLayer(selectedLayer.id)} className="text-xs">
                Duplicate
              </Button>
              <Button type="button" onClick={() => onLayerLockToggle(selectedLayer.id)} className="text-xs">
                {selectedLayer.locked ? 'Unlock' : 'Lock'}
              </Button>
              <Button type="button" onClick={() => onLayerDelete(selectedLayer.id)} variant="danger" className="text-xs">
                Delete
              </Button>
            </div>
          </div>

          {selectedWarnings.length > 0 && (
            <div className="type-meta rounded-lg bg-red-50 px-2 py-2 text-red-700 dark:bg-red-950/35 dark:text-red-100">
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
                <Input
                  type="number"
                  value={Math.round(selectedLayer.x || 0)}
                  onChange={(event) => onLayerUpdate(selectedLayer.id, { x: Number(event.target.value) || 0 })}
                />
              </Field>
              <Field label="Y">
                <Input
                  type="number"
                  value={Math.round(selectedLayer.y || 0)}
                  onChange={(event) => onLayerUpdate(selectedLayer.id, { y: Number(event.target.value) || 0 })}
                />
              </Field>
              <Field label="Rotate">
                <Input
                  type="number"
                  value={Math.round(selectedLayer.rotation || 0)}
                  onChange={(event) =>
                    onLayerUpdate(selectedLayer.id, { rotation: Number(event.target.value) || 0 })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-1">
              <Button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center-x')} className="text-[11px]">
                Center X
              </Button>
              <Button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center-y')} className="text-[11px]">
                Center Y
              </Button>
              <Button type="button" onClick={() => onAlignLayer(selectedLayer.id, 'center')} className="text-[11px]">
                Center
              </Button>
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
              <Select
                value={selectedLayer.blendMode || 'normal'}
                onChange={(event) => onLayerUpdate(selectedLayer.id, { blendMode: event.target.value })}
                className={inputClassName}
              >
                {blendModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </Select>
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
                <div className="type-meta uppercase">
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

                {isTypeAdvancedOpen && (
                  <Field label="Secondary Color">
                    <input
                      type="color"
                      value={selectedLayer.color2 || '#d6e5ff'}
                      onChange={(event) => onLayerUpdate(selectedLayer.id, { color2: event.target.value })}
                      className="hairline h-9 w-full rounded-lg"
                    />
                  </Field>
                )}

                {isTypeAdvancedOpen && (
                  <>
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
              </>
            )}

            {selectedLayer.type === 'mockup' && (
              <>
                <Field label="Mockup Style">
                  <Select
                    value={selectedLayer.mockupStyle || 'realistic'}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { mockupStyle: event.target.value })}
                    className={inputClassName}
                  >
                    <option value="realistic">Realistic</option>
                    <option value="flat">Flat</option>
                    <option value="rounded">Rounded</option>
                  </Select>
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

                <Button
                  type="button"
                  onClick={() => mockupUploadRef.current?.click()}
                >
                  Upload Screen Image
                </Button>
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

                {isTypeAdvancedOpen && (
                  <>
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
                  </>
                )}
              </>
            )}

            {selectedLayer.type === 'text' && (
              <>
                <Field label="Text">
                  <Textarea
                    value={selectedLayer.text || ''}
                    onChange={(event) => onLayerUpdate(selectedLayer.id, { text: event.target.value })}
                    rows={4}
                    className={`${inputClassName} resize-y`}
                  />
                </Field>

                <div className="type-meta">
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
                        <Button
                          key={preset.id}
                          type="button"
                          variant={isActive ? 'primary' : 'ghost'}
                          onClick={() =>
                            onLayerUpdate(selectedLayer.id, {
                              fontSize: preset.fontSize,
                              lineHeight: preset.lineHeight,
                              width: preset.width,
                            })
                          }
                          className="text-xs"
                        >
                          {preset.label}
                        </Button>
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

                {isTypeAdvancedOpen && (
                  <>
                    <Field label="Font Family">
                      <Select
                        value={selectedLayer.fontFamily || 'IBM Plex Sans'}
                        onChange={(event) => onLayerUpdate(selectedLayer.id, { fontFamily: event.target.value })}
                        className={inputClassName}
                      >
                        {TEXT_FONT_OPTIONS.map((fontName) => (
                          <option key={fontName} value={fontName}>
                            {fontName}
                          </option>
                        ))}
                      </Select>
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
                          <Button
                            key={mode}
                            type="button"
                            variant={selectedLayer.align === mode ? 'primary' : 'ghost'}
                            onClick={() => onLayerUpdate(selectedLayer.id, { align: mode })}
                            className="text-xs"
                          >
                            {mode}
                          </Button>
                        ))}
                      </div>
                    </Field>
                  </>
                )}
              </>
            )}
            {hasTypeAdvanced && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsTypeAdvancedOpen((prev) => !prev)}
                className="justify-center"
              >
                {isTypeAdvancedOpen ? 'Hide Advanced Controls' : 'Show Advanced Controls'}
              </Button>
            )}
          </AccordionSection>
        </div>
      ) : (
        <div className="type-meta mt-3 rounded-lg bg-zinc-50/70 px-3 py-3 dark:bg-black">
          Select a layer to edit properties.
        </div>
      )}

      <div className="mt-3 grid gap-2">
        <div className="type-meta uppercase">Export</div>

        {isExporting && exportProgress && (
          <div className="grid gap-1 rounded-lg bg-zinc-50 px-2 py-2 dark:bg-black">
            <div className="flex items-center justify-between">
              <p className="type-meta uppercase text-zinc-600 dark:text-zinc-100">
                {exportProgress.message || 'Exporting...'}
              </p>
              <span className="type-meta">{exportPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-zinc-200 dark:bg-white/15">
              <div
                className="h-full bg-blue-500 transition-[width] duration-200 ease-out"
                style={{ width: `${exportPercent}%` }}
              />
            </div>
            {isBatchExport && (
              <Button
                type="button"
                onClick={onCancelExport}
                variant="danger" className="mt-1"
              >
                Cancel Export
              </Button>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={onExportSingle}
          disabled={isExporting}
          loading={isExporting && exportProgress?.mode === 'single'}
          loadingLabel="Exporting..."
        >
          Export Active PNG
        </Button>
        <Button
          type="button"
          onClick={onExportAll}
          disabled={isExporting}
          variant="primary"
          loading={isExporting && exportProgress?.mode === 'batch'}
          loadingLabel="Building ZIP..."
        >
          Export All (ZIP)
        </Button>
        <p className="type-meta">
          Always exported at 1290x2796 PNG, preview scaling ignored.
        </p>
      </div>
    </div>
  );
}
