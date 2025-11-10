import { ref, onUnmounted } from 'vue';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

// Типы
interface BIMViewerConfig {
  canvasElement: HTMLCanvasElement | null;
  explorerElement: HTMLElement | null;
  inspectorElement: HTMLElement | null;
  navCubeCanvasElement: HTMLCanvasElement | null;
  busyModelBackdropElement: HTMLElement | null;
  toolbarElement: HTMLElement | null;
  localeService: any;
}

interface BIMServerConfig {
  basePath: string;
}

export function useBIMViewer() {
  const bimViewer = ref<any | null>(null);
  const bimServer = ref<any | null>(null);
  let localeServiceRef: any = null;

  /**
   * Инициализация BIM Viewer
   */
  const initBIMViewer = async (
    bimServerConfig: BIMServerConfig,
    bimViewerConfig: BIMViewerConfig,
    saveViewpointCallback?: () => void
  ): Promise<boolean> => {
    if (!bimServerConfig?.basePath) {
      console.error('BIM server config must include basePath');
      return false;
    }

    try {
      // Динамический импорт (Vite поддерживает, но пути должны быть статичны!)
      const ServerModule = await import('../assets/bim-viewer/src/server/Server.js');
      const ExtendedViewerModule = await import('../assets/extended-bim-viewer/index.ts');

      bimServer.value = new ServerModule.Server({ basePath: bimServerConfig.basePath });
      bimViewer.value = new ExtendedViewerModule.ExtendedBIMViewer(
        bimServer.value,
        bimViewerConfig,
        saveViewpointCallback
      );

      // Настройка локализации
      if (bimViewerConfig.localeService) {
        localeServiceRef = bimViewerConfig.localeService;
        localeServiceRef.messages = { ...localeServiceRef.messages, ...await loadLocaleMessages() };

        localeServiceRef.on('updated', updateLocalizedElements);
        updateLocalizedElements(); // Инициализация текстов
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize BIM Viewer:', error);
      return false;
    }
  };

  /**
   * Загрузка локализации
   */
  const loadLocaleMessages = async () => {
    try {
      const { messages } = await import('../assets/bim-viewer/locales/messages.js');
      return messages;
    } catch (err) {
      console.warn('Failed to load locale messages, using defaults');
      return {};
    }
  };

  /**
   * Обновление элементов с локализацией
   */
  const updateLocalizedElements = () => {
    if (!bimViewer.value) return;

    // Use the stored localeService reference
    if (!localeServiceRef) return;

    const localizedElements = document.querySelectorAll<HTMLElement>('.xeokit-i18n');

    localizedElements.forEach((el) => {
      // Текст
      if (el.dataset.xeokitI18n) {
        el.textContent = localeServiceRef.translate(el.dataset.xeokitI18n);
      }

      // Подсказки
      if (el.dataset.xeokitI18ntip) {
        const tip = localeServiceRef.translate(el.dataset.xeokitI18ntip);
        if (tip) el.dataset.tippyContent = tip;
      }

      // Инициализация tippy
      if (el.dataset.tippyContent) {
        if (el._tippy) {
          el._tippy.setContent(el.dataset.tippyContent);
        } else {
          tippy(el, {
            appendTo: () => el.parentNode as HTMLElement,
            zIndex: 1000000,
            allowHTML: true,
            placement: 'top',
          });
        }
      }
    });
  };

  /**
   * Загрузка проекта
   */
  const loadProject = (
    projectId: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): boolean => {
    if (!bimViewer.value) {
      console.error('BIM Viewer is not initialized');
      onError?.(new Error('BIM Viewer not initialized'));
      return false;
    }

    try {
      bimViewer.value.loadProject(
        projectId,
        () => {
          console.log(`Project ${projectId} loaded successfully`);
          onSuccess?.();
        },
        (error: any) => {
          console.error(`Error loading project ${projectId}:`, error);
          onError?.(error);
        }
      );
      return true;
    } catch (error) {
      console.error(`Unexpected error loading project ${projectId}:`, error);
      onError?.(error);
      return false;
    }
  };

  /**
   * Уничтожение viewer
   */
  const destroy = () => {
    if (bimViewer.value) {
      bimViewer.value.destroy();
      bimViewer.value = null;
    }
    if (bimServer.value) {
      bimServer.value = null;
    }
  };

  // Автоматическая очистка
  onUnmounted(destroy);

  // Методы для экспорта
  return {
    initBIMViewer,
    loadProject,
    destroy,
    saveBCFViewpoint: () => bimViewer.value?.saveBCFViewpoint?.({}),
    loadBCFViewpointFromFile: (file: File) => bimViewer.value?.loadBCFViewpointFromFile?.(file),
    loadBCFViewpointFromURL: (url: string) => bimViewer.value?.loadBCFViewpointFromURL?.(url),
    customizeToolbar: () => bimViewer.value?.customizeToolbar?.(),
  };
}
