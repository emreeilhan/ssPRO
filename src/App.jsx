import { useEffect, useMemo, useRef, useState } from 'react';
import ScreenshotEditor from './components/ScreenshotEditor';
import { DEVICE_PRESET, EXPORT_LOCALES, MIN_SCREENSHOTS } from './constants';
import { exportAllScreenshots, exportSingleScreenshot } from './utils/exportScreenshots';
import { getLayerWarnings } from './utils/layerChecks';

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File read failed.'));
    reader.readAsDataURL(file);
  });

const readImageDimensions = (source) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error('Image decode failed.'));
    image.src = source;
  });

const buildEmptyScreenshot = (id) => ({
  id,
  backgroundColor: '#ffffff',
  layers: [],
});

const createInitialScreenshots = () =>
  Array.from({ length: MIN_SCREENSHOTS }, (_, index) => buildEmptyScreenshot(index + 1));

const reorderByIndex = (items, fromIndex, toIndex) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const estimateLayerHeight = (layer) => {
  if (!layer) {
    return 0;
  }

  if (typeof layer.height === 'number') {
    return layer.height;
  }

  if (layer.type === 'text') {
    const text = layer.text || '';
    const lines = text.split('\n').length || 1;
    return Math.max(40, (layer.fontSize || 64) * 1.1 * lines);
  }

  return 0;
};

const THEME_STORAGE_KEY = 'sspro-theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function App() {
  const [screenshots, setScreenshots] = useState(createInitialScreenshots);
  const [activeScreenshotId, setActiveScreenshotId] = useState(1);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const screenshotIdRef = useRef(MIN_SCREENSHOTS + 1);
  const layerIdRef = useRef(1);

  const activeScreenshotIndex = screenshots.findIndex((item) => item.id === activeScreenshotId);
  const activeScreenshot =
    activeScreenshotIndex >= 0 ? screenshots[activeScreenshotIndex] : screenshots[0] || null;

  const selectedLayer = activeScreenshot?.layers.find((layer) => layer.id === selectedLayerId) || null;
  const isDarkMode = theme === 'dark';

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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDarkMode, theme]);

  const allocateLayerId = () => `layer_${layerIdRef.current++}`;

  const updateActiveScreenshot = (updater) => {
    setScreenshots((prev) =>
      prev.map((item) => (item.id === activeScreenshotId ? updater(item) : item)),
    );
  };

  const handleBackgroundChange = (color) => {
    updateActiveScreenshot((item) => ({ ...item, backgroundColor: color }));
  };

  const handleAddScreenshot = () => {
    const nextId = screenshotIdRef.current;
    screenshotIdRef.current += 1;
    const newScreenshot = buildEmptyScreenshot(nextId);

    setScreenshots((prev) => [...prev, newScreenshot]);
    setActiveScreenshotId(nextId);
    setSelectedLayerId(null);
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

    setScreenshots((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === activeScreenshot.id);
      if (sourceIndex < 0) {
        return [...prev, clone];
      }

      return [...prev.slice(0, sourceIndex + 1), clone, ...prev.slice(sourceIndex + 1)];
    });

    setActiveScreenshotId(nextId);
    setSelectedLayerId(null);
  };

  const handleDeleteScreenshot = () => {
    if (!activeScreenshot || screenshots.length <= 1) {
      return;
    }

    const index = activeScreenshotIndex;
    setScreenshots((prev) => prev.filter((item) => item.id !== activeScreenshot.id));

    const fallback = screenshots[index + 1] || screenshots[index - 1];
    if (fallback) {
      setActiveScreenshotId(fallback.id);
    }

    setSelectedLayerId(null);
  };

  const handleMoveScreenshot = (screenshotId, direction) => {
    setScreenshots((prev) => {
      const index = prev.findIndex((item) => item.id === screenshotId);
      if (index < 0) {
        return prev;
      }

      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) {
        return prev;
      }

      return reorderByIndex(prev, index, target);
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
    });

    setSelectedLayerId(layerId);
  };

  const handleAddImageLayers = async (fileList) => {
    const files = Array.from(fileList).filter((file) => /image\/(png|jpeg|jpg)/.test(file.type));

    if (!files.length) {
      return;
    }

    const parsedLayers = [];

    for (const file of files) {
      const dataUrl = await readFileAsDataURL(file);
      const dimensions = await readImageDimensions(dataUrl);
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
        dataUrl,
        x: Math.round((DEVICE_PRESET.width - layerWidth) / 2),
        y: Math.round((DEVICE_PRESET.height - layerHeight) / 2),
        width: layerWidth,
        height: layerHeight,
        rotation: 0,
      });
    }

    updateActiveScreenshot((item) => ({
      ...item,
      layers: [...item.layers, ...parsedLayers],
    }));

    setSelectedLayerId(parsedLayers[parsedLayers.length - 1].id);
  };

  const buildDecorPreset = (kind) => {
    const presets = {
      orb: {
        shapeKind: 'orb',
        color: '#6fa8ff',
        color2: '#d6e5ff',
        opacity: 0.36,
        blur: 28,
        width: 440,
        height: 440,
      },
      ring: {
        shapeKind: 'ring',
        color: '#145bff',
        color2: '#8bb0ff',
        opacity: 0.6,
        blur: 10,
        strokeWidth: 26,
        width: 420,
        height: 420,
      },
      pill: {
        shapeKind: 'pill',
        color: '#111827',
        color2: '#4b5563',
        opacity: 0.2,
        blur: 0,
        cornerRadius: 180,
        width: 520,
        height: 180,
      },
      glow: {
        shapeKind: 'glow',
        color: '#ff65a3',
        color2: '#ffd166',
        opacity: 0.34,
        blur: 34,
        cornerRadius: 28,
        width: 500,
        height: 260,
      },
    };

    return presets[kind] || presets.orb;
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
    });

    setSelectedLayerId(layerId);
  };

  const buildMockupPreset = (style) => {
    const presets = {
      realistic: {
        mockupStyle: 'realistic',
        width: 820,
        height: 1680,
        bezel: 26,
        cornerRadius: 120,
        frameColor: '#0f172a',
        accentColor: '#334155',
        screenBg: '#0b0b0b',
        shadowBlur: 46,
        shadowOpacity: 0.34,
      },
      flat: {
        mockupStyle: 'flat',
        width: 800,
        height: 1640,
        bezel: 16,
        cornerRadius: 54,
        frameColor: '#0f172a',
        accentColor: '#0f172a',
        screenBg: '#0b0b0b',
        shadowBlur: 0,
        shadowOpacity: 0,
      },
      rounded: {
        mockupStyle: 'rounded',
        width: 810,
        height: 1660,
        bezel: 22,
        cornerRadius: 164,
        frameColor: '#f8fafc',
        accentColor: '#dbeafe',
        screenBg: '#0b0b0b',
        shadowBlur: 30,
        shadowOpacity: 0.24,
      },
    };

    return presets[style] || presets.realistic;
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
        screenDataUrl: lastImageLayer?.dataUrl || null,
      };

      return {
        ...item,
        layers: [...item.layers, nextLayer],
      };
    });

    setSelectedLayerId(layerId);
  };

  const handleMockupScreenUpload = async (layerId, file) => {
    if (!file || !/image\/(png|jpeg|jpg)/.test(file.type)) {
      return;
    }

    const dataUrl = await readFileAsDataURL(file);
    handleLayerUpdate(layerId, { screenDataUrl: dataUrl });
  };

  const handleLayerUpdate = (layerId, patch) => {
    updateActiveScreenshot((item) => ({
      ...item,
      layers: item.layers.map((layer) => (layer.id === layerId ? { ...layer, ...patch } : layer)),
    }));
  };

  const handleLayerDelete = (layerId) => {
    updateActiveScreenshot((item) => ({
      ...item,
      layers: item.layers.filter((layer) => layer.id !== layerId),
    }));

    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
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

      const nextLayers = [...item.layers];
      nextLayers.splice(index + 1, 0, copy);

      setSelectedLayerId(copy.id);

      return {
        ...item,
        layers: nextLayers,
      };
    });
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

  const handleThemeToggle = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
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
      onToggleTheme={handleThemeToggle}
    />
  );
}
