import { BIMViewer } from '../bim-viewer/src/BIMViewer.js';

/**
 * Extended BIM Viewer class that extends the base BIMViewer
 * This class can be used to add custom functionality to the BIM viewer
 */
export class ExtendedBIMViewer extends BIMViewer {
  private saveViewpointCallback?: () => void;
  private toolbarElement: HTMLElement | null = null;

  /**
   * Constructs an ExtendedBIMViewer.
   * @param {Server} server Data access strategy.
   * @param {*} cfg Configuration.
   * @param {Function} saveViewpointCallback Callback function to save viewpoint
   */
  constructor(server: any, cfg: any = {}, saveViewpointCallback?: () => void) {
    super(server, cfg);
    this.saveViewpointCallback = saveViewpointCallback;
    // Store reference to toolbar element from config
    this.toolbarElement = cfg.toolbarElement || null;
  }

  /**
   * Custom method to save the current BCF viewpoint
   * @param {*} cfg Configuration for saving the viewpoint
   */
  override saveBCFViewpoint(cfg = {}) {
    const viewpoint = super.saveBCFViewpoint(cfg);
    
    // Trigger file download as JSON
    this.downloadBCFViewpointAsJSON(viewpoint);
    
    if (this.saveViewpointCallback) {
      this.saveViewpointCallback();
    }
    return viewpoint;
  }

  /**
   * Downloads the BCF viewpoint as a JSON file
   * @param {*} viewpoint The BCF viewpoint object
   */
  downloadBCFViewpointAsJSON(viewpoint: any) {
    // Convert viewpoint to JSON string
    const viewpointJSON = JSON.stringify(viewpoint, null, 2);
    
    // Create a blob from the JSON string
    const blob = new Blob([viewpointJSON], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'viewpoint.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Custom method to load a BCF viewpoint from a JSON file
   * @param {File} file The BCF JSON file to load
   */
  loadBCFViewpointFromFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const viewpoint = JSON.parse(event.target?.result as string);
        // Load the viewpoint using the base BIMViewer method
        super.loadBCFViewpoint(viewpoint, {
          rayCast: true,
          immediate: true,
          reset: true
        });
        console.log('BCF viewpoint loaded successfully');
      } catch (error) {
        console.error('Error loading BCF viewpoint:', error);
      }
    };
    reader.readAsText(file);
  }

  /**
   * Custom method to load a BCF viewpoint from a URL
   * @param {string} url The URL of the BCF JSON file to load
   */
  async loadBCFViewpointFromURL(url: string) {
    try {
      const response = await fetch(url);
      const viewpoint = await response.json();
      // Load the viewpoint using the base BIMViewer method
      super.loadBCFViewpoint(viewpoint, {
        rayCast: true,
        immediate: true,
        reset: true
      });
      console.log('BCF viewpoint loaded successfully from URL');
    } catch (error) {
      console.error('Error loading BCF viewpoint from URL:', error);
    }
  }

  /**
   * Custom method to customize the toolbar
   * This method can be extended to add custom toolbar buttons
   */
  customizeToolbar() {
    // Add custom toolbar buttons here
    console.log('Customizing toolbar...');
    
    // Example: Add a custom button to the toolbar within a button group
    if (this.toolbarElement) {
      // Create a button group to maintain consistent layout
      const buttonGroup = document.createElement('div');
      buttonGroup.className = 'xeokit-btn-group';
      
      // Insert the button group at the beginning of the toolbar to ensure it's in the row
      if (this.toolbarElement.firstChild) {
        this.toolbarElement.insertBefore(buttonGroup, this.toolbarElement.firstChild);
      } else {
        this.toolbarElement.appendChild(buttonGroup);
      }
    } else {
      console.warn('Toolbar element not available for customization');
    }
  }
}