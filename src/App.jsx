import { useEffect, useMemo, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import ScreenshotEditor from './components/ScreenshotEditor';
import { DEVICE_PRESET, EXPORT_LOCALES, MIN_SCREENSHOTS } from './constants';
import { useThemePreference } from './hooks/useThemePreference';
import { exportAllScreenshots, exportSingleScreenshot } from './utils/exportScreenshots';
import { getImageSource, getMockupScreenSource } from './utils/imageSources';
import { getLayerWarnings } from './utils/layerChecks';
import { createObjectURL, readImageDimensions } from './utils/imageFileUtils';
import { buildDecorPreset, buildMockupPreset } from './utils/layerPresets';
import { hydrateProject, serializeProject } from './utils/projectPersistence';
import {
  buildEmptyScreenshot,
  createInitialScreenshots,
  estimateLayerHeight,
  reorderByIndex,
} from './utils/screenshotHelpers';

const HISTORY_LIMIT = 60;

export default function App() {
  const [screenshots, setScreenshots] = useState(createInitialScreenshots);
  const [activeScreenshotId, setActiveScreenshotId] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [historyPast, setHistoryPast] = useState([]);
  const [historyFuture, setHistoryFuture] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const { isDarkMode, toggleTheme } = useThemePreference();

  const screenshotIdRef = useRef(MIN_SCREENSHOTS + 1);
  const layerIdRef = useRef(1);
  const objectUrlRefCountRef = useRef(new Map());

  const activeScreenshotIndex = screenshots.findIndex((item) => item.id === activeScreenshotId);
  const activeScreenshot =
    activeScreenshotIndex >= 0 ? screenshots[activeScreenshotIndex] : screenshots[0] || null;

  const selectedLayer = activeScreenshot?.layers.find((layer) => layer.id === selectedLayerId) || null;
  const warnings = useMemo(
    () => getLayerWarnings(activeScreenshot, DEVICE_PRESET),
    [activeScreenshot],
  );

  useEffect(() => {
    if (!screenshots.length) {
      return;
    }

    const activeStillExists = screenshots.some((item) => item.id === activeScreenshotId);
    if (!activeStillExists) {
      setActiveScreenshotId(screenshots[0].id);
    }
  }, [activeScreenshotId, screenshots]);

  useEffect(() => {
    if (!selectedLayerId || !activeScreenshot) {
      return;
    }

    const exists = activeScreenshot.layers.some((layer) => layer.id === selectedLayerId);
    if (!exists) {
      setSelectedLayerId(null);
    }
  }, [activeScreenshot, selectedLayerId]);

  const allocateLayerId = () => `layer_${layerIdRef.current++}`;

  const isManagedObjectUrl = (url) => typeof url === 'string' && url.startsWith('blob:');

  const appendSnapshotUrls = (sourceScreenshots, counts) => {
    for (const shot of sourceScreenshots) {
      for (const layer of shot.layers) {
        const imageSrc = getImageSource(layer);
        const screenSrc = getMockupScreenSource(layer);

        if (isManagedObjectUrl(imageSrc)) {
          counts.set(imageSrc, (counts.get(imageSrc) || 0) + 1);
        }

        if (isManagedObjectUrl(screenSrc)) {
          counts.set(screenSrc, (counts.get(screenSrc) || 0) + 1);
        }
      }
    }
  };

  useEffect(() => {
    const nextCounts = new Map();
    appendSnapshotUrls(screenshots, nextCounts);

    for (const entry of historyPast) {
      appendSnapshotUrls(entry.screenshots, nextCounts);
    }

    for (const entry of historyFuture) {
      appendSnapshotUrls(entry.screenshots, nextCounts);
    }

    for (const url of objectUrlRefCountRef.current.keys()) {
      if (!nextCounts.has(url)) {
        window.URL.revokeObjectURL(url);
      }
    }

    objectUrlRefCountRef.current = nextCounts;
  }, [historyFuture, historyPast, screenshots]);

  useEffect(
    () => () => {
      for (const url of objectUrlRefCountRef.current.keys()) {
        window.URL.revokeObjectURL(url);
      }
      objectUrlRefCountRef.current.clear();
    },
    [],
  );

  const commitProjectChange = ({
    nextScreenshots,
    nextActiveScreenshotId = activeScreenshotId,
    nextSelectedLayerId = selectedLayerId,
  }) => {
    const hasScreenshotsChange = nextScreenshots !== screenshots;
    const hasActiveChange = nextActiveScreenshotId !== activeScreenshotId;
    const hasSelectedChange = nextSelectedLayerId !== selectedLayerId;

    if (!hasScreenshotsChange && !hasActiveChange && !hasSelectedChange) {
      return;
    }

    setHistoryPast((prev) => {
      const next = [...prev, { screenshots, activeScreenshotId, selectedLayerId }];
      return next.slice(-HISTORY_LIMIT);
    });
    setHistoryFuture([]);
    setScreenshots(nextScreenshots);
    setActiveScreenshotId(nextActiveScreenshotId);
    setSelectedLayerId(nextSelectedLayerId);
  };

  const updateActiveScreenshot = (updater, options = {}) => {
    if (!activeScreenshot) {
      return;
    }

    const updated = updater(activeScreenshot);
    if (!updated || updated === activeScreenshot) {
      return;
    }

    const nextScreenshots = screenshots.map((item) =>
      item.id === activeScreenshotId ? updated : item,
    );

    commitProjectChange({
      nextScreenshots,
      nextActiveScreenshotId: options.nextActiveScreenshotId ?? activeScreenshotId,
      nextSelectedLayerId: options.nextSelectedLayerId ?? selectedLayerId,
    });
  };

  const handleBackgroundChange = (color) => {
    updateActiveScreenshot((item) => ({ ...item, backgroundColor: color }));
  };

  const handleAddScreenshot = () => {
    const nextId = screenshotIdRef.current;
    screenshotIdRef.current += 1;
    const newScreenshot = buildEmptyScreenshot(nextId);

    commitProjectChange({
      nextScreenshots: [...screenshots, newScreenshot],
      nextActiveScreenshotId: nextId,
      nextSelectedLayerId: null,
    });
  };

  const handleDuplicateScreenshot = () => {
    if (!activeScreenshot) {
      return;
    }

    const nextId = screenshotIdRef.current;
    screenshotIdRef.current += 1;

    const clone = {
      ...activeScreenshot,
      id: nextId,
      layers: activeScreenshot.layers.map((layer) => ({
        ...layer,
        id: allocateLayerId(),
      })),
    };

    const sourceIndex = screenshots.findIndex((item) => item.id === activeScreenshot.id);
    const nextScreenshots =
      sourceIndex < 0
        ? [...screenshots, clone]
        : [...screenshots.slice(0, sourceIndex + 1), clone, ...screenshots.slice(sourceIndex + 1)];

    commitProjectChange({
      nextScreenshots,
      nextActiveScreenshotId: nextId,
      nextSelectedLayerId: null,
    });
  };

  const handleDeleteScreenshot = () => {
    if (!activeScreenshot || screenshots.length <= 1) {
      return;
    }

    const index = activeScreenshotIndex;
    const nextScreenshots = screenshots.filter((item) => item.id !== activeScreenshot.id);
    const fallback = screenshots[index + 1] || screenshots[index - 1];
    const nextActiveScreenshotId = fallback ? fallback.id : activeScreenshotId;

    commitProjectChange({
      nextScreenshots,
      nextActiveScreenshotId,
      nextSelectedLayerId: null,
    });
  };

  const handleMoveScreenshot = (screenshotId, direction) => {
    const index = screenshots.findIndex((item) => item.id === screenshotId);
    if (index < 0) {
      return;
    }

    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= screenshots.length) {
      return;
    }

    commitProjectChange({
      nextScreenshots: reorderByIndex(screenshots, index, target),
    });
  };

  const handleCycleScreenshot = (direction) => {
    if (screenshots.length <= 1) {
      return;
    }

    const step = direction === 'next' ? 1 : -1;
    const currentIndex = screenshots.findIndex((item) => item.id === activeScreenshotId);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + step + screenshots.length) % screenshots.length;

    setActiveScreenshotId(screenshots[nextIndex].id);
    setSelectedLayerId(null);
  };

  const handleAddTextLayer = () => {
    const layerId = allocateLayerId();

    updateActiveScreenshot((item) => {
      const textCount = item.layers.filter((layer) => layer.type === 'text').length + 1;

      const nextLayer = {
        id: layerId,
        type: 'text',
        name: `Text ${textCount}`,
        visible: true,
        locked: false,
        blendMode: 'normal',
        text: 'Headline goes here',
        x: 90,
        y: 420,
        width: 1110,
        fontSize: 118,
        lineHeight: 1.08,
        color: '#101010',
        align: 'left',
        fontFamily: 'IBM Plex Sans',
        opacity: 1,
        rotation: 0,
      };

      return {
        ...item,
        layers: [...item.layers, nextLayer],
      };
    }, { nextSelectedLayerId: layerId });
  };

  const handleAddImageLayers = async (fileList) => {
    const files = Array.from(fileList).filter((file) => /image\/(png|jpeg|jpg)/.test(file.type));

    if (!files.length) {
      return;
    }

    const parsedLayers = [];

    for (const file of files) {
      const imageSrc = createObjectURL(file);
      let dimensions;
      try {
        dimensions = await readImageDimensions(imageSrc);
      } catch (error) {
        window.URL.revokeObjectURL(imageSrc);
        throw error;
      }
      const fitRatio = Math.min(
        (DEVICE_PRESET.width * 0.92) / dimensions.width,
        (DEVICE_PRESET.height * 0.92) / dimensions.height,
        1,
      );

      const layerWidth = Math.round(dimensions.width * fitRatio);
      const layerHeight = Math.round(dimensions.height * fitRatio);

      parsedLayers.push({
        id: allocateLayerId(),
        type: 'image',
        name: `Image ${parsedLayers.length + 1}`,
        visible: true,
        locked: false,
        blendMode: 'normal',
        opacity: 1,
        imageSrc,
        x: Math.round((DEVICE_PRESET.width - layerWidth) / 2),
        y: Math.round((DEVICE_PRESET.height - layerHeight) / 2),
        width: layerWidth,
        height: layerHeight,
        rotation: 0,
      });
    }

    updateActiveScreenshot(
      (item) => ({
        ...item,
        layers: [...item.layers, ...parsedLayers],
      }),
      { nextSelectedLayerId: parsedLayers[parsedLayers.length - 1].id },
    );
  };

  const handleAddDecorLayer = (kind = 'orb') => {
    const layerId = allocateLayerId();
    const preset = buildDecorPreset(kind);

    updateActiveScreenshot((item) => {
      const decorCount = item.layers.filter((layer) => layer.type === 'shape').length + 1;

      const nextLayer = {
        id: layerId,
        type: 'shape',
        shapeKind: preset.shapeKind,
        name: `Decor ${decorCount}`,
        visible: true,
        locked: false,
        blendMode: 'normal',
        x: 160,
        y: 280,
        width: preset.width,
        height: preset.height,
        color: preset.color,
        color2: preset.color2,
        opacity: preset.opacity,
        blur: preset.blur,
        strokeWidth: preset.strokeWidth || 0,
        cornerRadius: preset.cornerRadius || 0,
        rotation: 0,
      };

      return {
        ...item,
        layers: [...item.layers, nextLayer],
      };
    }, { nextSelectedLayerId: layerId });
  };

  const handleAddMockupLayer = (style = 'realistic') => {
    const layerId = allocateLayerId();
    const preset = buildMockupPreset(style);

    updateActiveScreenshot((item) => {
      const mockupCount = item.layers.filter((layer) => layer.type === 'mockup').length + 1;
      const lastImageLayer = [...item.layers].reverse().find((layer) => layer.type === 'image');

      const nextLayer = {
        id: layerId,
        type: 'mockup',
        name: `Mockup ${mockupCount}`,
        visible: true,
        locked: false,
        blendMode: 'normal',
        opacity: 1,
        x: Math.round((DEVICE_PRESET.width - preset.width) / 2),
        y: 560,
        width: preset.width,
        height: preset.height,
        rotation: 0,
        mockupStyle: preset.mockupStyle,
        bezel: preset.bezel,
        cornerRadius: preset.cornerRadius,
        frameColor: preset.frameColor,
        accentColor: preset.accentColor,
        screenBg: preset.screenBg,
        shadowBlur: preset.shadowBlur,
        shadowOpacity: preset.shadowOpacity,
        screenImageSrc: getImageSource(lastImageLayer),
      };

      return {
        ...item,
        layers: [...item.layers, nextLayer],
      };
    }, { nextSelectedLayerId: layerId });
  };

  const handleMockupScreenUpload = async (layerId, file) => {
    if (!file || !/image\/(png|jpeg|jpg)/.test(file.type)) {
      return;
    }

    const screenImageSrc = createObjectURL(file);
    handleLayerUpdate(layerId, { screenImageSrc });
  };

  const handleLayerUpdate = (layerId, patch) => {
    updateActiveScreenshot((item) => {
      const currentLayer = item.layers.find((layer) => layer.id === layerId);

      if (!currentLayer) {
        return item;
      }

      const nextLayer = { ...currentLayer, ...patch };

      return {
        ...item,
        layers: item.layers.map((layer) => (layer.id === layerId ? nextLayer : layer)),
      };
    });
  };

  const handleLayerDelete = (layerId) => {
    updateActiveScreenshot(
      (item) => ({
        ...item,
        layers: item.layers.filter((layer) => layer.id !== layerId),
      }),
      { nextSelectedLayerId: selectedLayerId === layerId ? null : selectedLayerId },
    );
  };

  const handleLayerVisibility = (layerId) => {
    updateActiveScreenshot((item) => ({
      ...item,
      layers: item.layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: layer.visible === false ? true : false } : layer,
      ),
    }));
  };

  const handleLayerLockToggle = (layerId) => {
    updateActiveScreenshot((item) => ({
      ...item,
      layers: item.layers.map((layer) =>
        layer.id === layerId ? { ...layer, locked: layer.locked === true ? false : true } : layer,
      ),
    }));
  };

  const handleDuplicateLayer = (layerId) => {
    let duplicateId = null;
    updateActiveScreenshot((item) => {
      const index = item.layers.findIndex((layer) => layer.id === layerId);
      if (index < 0) {
        return item;
      }

      const source = item.layers[index];
      const copy = {
        ...source,
        id: allocateLayerId(),
        name: `${source.name} Copy`,
        locked: false,
        x: Math.round((source.x || 0) + 26),
        y: Math.round((source.y || 0) + 26),
      };
      duplicateId = copy.id;

      const nextLayers = [...item.layers];
      nextLayers.splice(index + 1, 0, copy);

      return {
        ...item,
        layers: nextLayers,
      };
    }, { nextSelectedLayerId: duplicateId || selectedLayerId });
  };

  const handleAlignLayer = (layerId, mode) => {
    updateActiveScreenshot((item) => {
      const targetLayer = item.layers.find((layer) => layer.id === layerId);
      if (!targetLayer) {
        return item;
      }

      const layerWidth = targetLayer.width || 0;
      const layerHeight = estimateLayerHeight(targetLayer);
      const patch = {};

      if (mode === 'center-x' || mode === 'center') {
        patch.x = Math.round((DEVICE_PRESET.width - layerWidth) / 2);
      }

      if (mode === 'center-y' || mode === 'center') {
        patch.y = Math.round((DEVICE_PRESET.height - layerHeight) / 2);
      }

      return {
        ...item,
        layers: item.layers.map((layer) =>
          layer.id === layerId ? { ...layer, ...patch } : layer,
        ),
      };
    });
  };

  const handleMoveLayer = (layerId, direction) => {
    updateActiveScreenshot((item) => {
      const index = item.layers.findIndex((layer) => layer.id === layerId);
      if (index < 0) {
        return item;
      }

      const target = direction === 'up' ? index + 1 : index - 1;
      if (target < 0 || target >= item.layers.length) {
        return item;
      }

      return {
        ...item,
        layers: reorderByIndex(item.layers, index, target),
      };
    });
  };

  const handleExportSingle = async () => {
    if (!activeScreenshot || activeScreenshotIndex < 0) {
      return;
    }

    setIsExporting(true);

    try {
      await exportSingleScreenshot({
        screenshot: activeScreenshot,
        index: activeScreenshotIndex,
        devicePreset: DEVICE_PRESET,
      });
    } catch (error) {
      window.alert(error.message || 'Single screenshot export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);

    try {
      await exportAllScreenshots({
        screenshots,
        devicePreset: DEVICE_PRESET,
        locales: EXPORT_LOCALES,
      });
    } catch (error) {
      window.alert(error.message || 'Batch export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveProject = async () => {
    setIsExporting(true);

    try {
      const payload = await serializeProject({
        screenshots,
        activeScreenshotId,
      });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      saveAs(blob, `sspro-project-${timestamp}.json`);
    } catch (error) {
      window.alert(error.message || 'Project save failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLoadProject = async (file) => {
    if (!file) {
      return;
    }

    setIsExporting(true);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const hydrated = await hydrateProject(parsed);

      for (const shot of screenshots) {
        for (const layer of shot.layers) {
          releaseObjectUrl(getImageSource(layer));
          releaseObjectUrl(getMockupScreenSource(layer));
        }
      }

      const loadedScreenshots = hydrated.screenshots;
      setScreenshots(loadedScreenshots);

      for (const shot of loadedScreenshots) {
        for (const layer of shot.layers) {
          retainObjectUrl(getImageSource(layer));
          retainObjectUrl(getMockupScreenSource(layer));
        }
      }

      const validActiveId = loadedScreenshots.some((item) => item.id === hydrated.activeScreenshotId)
        ? hydrated.activeScreenshotId
        : loadedScreenshots[0]?.id;

      if (validActiveId) {
        setActiveScreenshotId(validActiveId);
      }

      setSelectedLayerId(null);

      const maxScreenshotId = loadedScreenshots.reduce(
        (max, item) => Math.max(max, Number(item.id) || 0),
        0,
      );
      screenshotIdRef.current = Math.max(MIN_SCREENSHOTS + 1, maxScreenshotId + 1);

      const maxLayerNumber = loadedScreenshots.reduce((max, item) => {
        const shotMax = item.layers.reduce((layerMax, layer) => {
          const match = String(layer.id || '').match(/^layer_(\d+)$/);
          if (!match) {
            return layerMax;
          }
          return Math.max(layerMax, Number(match[1]) || 0);
        }, 0);
        return Math.max(max, shotMax);
      }, 0);
      layerIdRef.current = maxLayerNumber + 1;
    } catch (error) {
      window.alert(error.message || 'Project load failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenshotEditor
      devicePreset={DEVICE_PRESET}
      screenshots={screenshots}
      activeScreenshot={activeScreenshot}
      activeScreenshotId={activeScreenshotId}
      activeScreenshotIndex={activeScreenshotIndex}
      selectedLayer={selectedLayer}
      selectedLayerId={selectedLayerId}
      warnings={warnings}
      isExporting={isExporting}
      isDarkMode={isDarkMode}
      onSelectScreenshot={setActiveScreenshotId}
      onSetSelectedLayer={setSelectedLayerId}
      onBackgroundChange={handleBackgroundChange}
      onAddScreenshot={handleAddScreenshot}
      onDuplicateScreenshot={handleDuplicateScreenshot}
      onDeleteScreenshot={handleDeleteScreenshot}
      onMoveScreenshot={handleMoveScreenshot}
      onCyclePrevScreenshot={() => handleCycleScreenshot('prev')}
      onCycleNextScreenshot={() => handleCycleScreenshot('next')}
      onAddTextLayer={handleAddTextLayer}
      onAddDecorLayer={handleAddDecorLayer}
      onAddMockupLayer={handleAddMockupLayer}
      onAddImageLayers={handleAddImageLayers}
      onLayerUpdate={handleLayerUpdate}
      onMockupScreenUpload={handleMockupScreenUpload}
      onLayerDelete={handleLayerDelete}
      onLayerVisibility={handleLayerVisibility}
      onLayerLockToggle={handleLayerLockToggle}
      onDuplicateLayer={handleDuplicateLayer}
      onAlignLayer={handleAlignLayer}
      onMoveLayer={handleMoveLayer}
      onExportSingle={handleExportSingle}
      onExportAll={handleExportAll}
      onSaveProject={handleSaveProject}
      onLoadProject={handleLoadProject}
      onToggleTheme={toggleTheme}
    />
  );
}
