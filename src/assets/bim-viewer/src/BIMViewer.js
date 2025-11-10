import {BCFViewpointsPlugin, FastNavPlugin, math, stats, Viewer,} from "@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js";

import {Controller} from "./Controller.js";
import {BusyModal} from "./BusyModal.js";
import {ResetAction} from "./toolbar/ResetAction.js";
import {FitAction} from "./toolbar/FitAction.js";
import {FirstPersonMode} from "./toolbar/FirstPersonMode.js";
import {HideTool} from "./toolbar/HideTool.js";
import {SelectionTool} from "./toolbar/SelectionTool.js";
import {ShowSpacesMode} from "./toolbar/ShowSpacesMode.js";
import {QueryTool} from "./toolbar/QueryTool.js";
import {SectionTool} from "./toolbar/SectionTool.js";
import {NavCubeMode} from "./toolbar/NavCubeMode.js";

import {ModelsExplorer} from "./explorer/ModelsExplorer.js";
import {ObjectsExplorer} from "./explorer/ObjectsExplorer.js";
import {ClassesExplorer} from "./explorer/ClassesExplorer.js";
import {StoreysExplorer} from "./explorer/StoreysExplorer.js";

import {ThreeDMode} from "./toolbar/ThreeDMode.js";
import {ObjectContextMenu} from "./contextMenus/ObjectContextMenu.js";
import {CanvasContextMenu} from "./contextMenus/CanvasContextMenu.js";
import {OrthoMode} from "./toolbar/OrthoMode.js";
import {PropertiesInspector} from "./inspector/PropertiesInspector.js";
import {ObjectsKdTree3} from "./collision/ObjectsKdTree3.js";
import {MarqueeSelectionTool} from "./toolbar/MarqueeSelectionTool.js";
import {MeasureDistanceTool} from "./toolbar/MeasureDistanceTool.js";
import {MeasureAngleTool} from "./toolbar/MeasureAngleTool.js";


const hideEdgesMinDrawCount = 5; // FastNavPlugin enables dynamic edges when xeokit's per-frame draw count drops below this
const scaleCanvasResolutionMinDrawCount = 1000; // FastNavPlugin switches to low-res canvas when xeokit's per-frame draw count rises above this

function createExplorerTemplate(cfg) {
    // Create explorer template using a single template literal
    const explorerTemplate = `<div class="xeokit-explorer-nav">
        <div class="xeokit-btn-group xeokit-explorer-buttons">
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-models-btn active" data-xeokit-i18n="modelsExplorer.title" data-explorer-view="models">Models</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-objects-btn" data-xeokit-i18n="objectsExplorer.title" data-explorer-view="objects">Objects</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-classes-btn" data-xeokit-i18n="classesExplorer.title" data-explorer-view="classes">Classes</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-storeys-btn" data-xeokit-i18n="storeysExplorer.title" data-explorer-view="storeys">Storeys</button>
        </div>
</div>
<div class="xeokit-explorer-content">
    <div class="xeokit-explorer-view xeokit-models-view visible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-loadAllModels xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.loadAll" data-xeokit-i18ntip="modelsExplorer.loadAllTip" data-tippy-content="Load all models">Load all</button>
            <button type="button" class="xeokit-i18n xeokit-unloadAllModels xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.unloadAll"  data-xeokit-i18ntip="modelsExplorer.unloadAllTip" data-tippy-content="Unload all models">Unload all</button>
            ${cfg.enableEditModels ? `<button type="button" class="xeokit-i18n xeokit-addModel xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.add"  data-xeokit-i18ntip="modelsExplorer.addTip" data-tippy-content="Add model">Add</button>` : ``}
        </div>
        <div class="xeokit-models" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-objects-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllObjects xeokit-btn disabled" data-xeokit-i18n="objectsExplorer.showAll" data-xeokit-i18ntip="objectsExplorer.showAllTip" data-tippy-content="Show all objects">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllObjects xeokit-btn disabled" data-xeokit-i18n="objectsExplorer.hideAll" data-xeokit-i18ntip="objectsExplorer.hideAllTip" data-tippy-content="Hide all objects">Hide all</button>
        </div>
        <div class="xeokit-objects xeokit-tree-panel" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-classes-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllClasses xeokit-btn disabled" data-xeokit-i18n="classesExplorer.showAll"  data-xeokit-i18ntip="classesExplorer.hideAllTip" data-tippy-content="Show all classes">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllClasses xeokit-btn disabled" data-xeokit-i18n="classesExplorer.hideAll" data-xeokit-i18ntip="classesExplorer.hideAllTip" data-tippy-content="Hide all classes">Hide all</button>
        </div>
        <div class="xeokit-classes xeokit-tree-panel" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-storeys-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllStoreys xeokit-btn disabled" data-xeokit-i18n="storeysExplorer.showAll" data-xeokit-i18ntip="storeysExplorer.showAllTip" data-tippy-content="Show all storeys">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllStoreys xeokit-btn disabled" data-xeokit-i18n="storeysExplorer.hideAll" data-xeokit-i18ntip="storeysExplorer.hideAllTip" data-tippy-content="Hide all storeys">Hide all</button>
        </div>
        <div class="xeokit-storeys xeokit-tree-panel"></div>
    </div>
</div>`;
    return explorerTemplate;
}

function createModelExplorerTemplate(cfg) {
    // Create explorer navigation buttons
    const modelExplorerTemplate = `<div class="xeokit-explorer-nav">
        <div class="xeokit-btn-group xeokit-explorer-buttons">
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-models-btn active" data-xeokit-i18n="modelsExplorer.title" data-explorer-view="models">Models</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-objects-btn" data-xeokit-i18n="objectsExplorer.title" data-explorer-view="objects">Objects</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-classes-btn" data-xeokit-i18n="classesExplorer.title" data-explorer-view="classes">Classes</button>
            <button type="button" class="xeokit-i18n xeokit-explorer-btn xeokit-storeys-btn" data-xeokit-i18n="storeysExplorer.title" data-explorer-view="storeys">Storeys</button>
        </div>
    </div>`;
    
    // Create explorer content containers
    modelExplorerTemplate += `<div class="xeokit-explorer-content">`;
    modelExplorerTemplate += `
    <div class="xeokit-explorer-view xeokit-models-view visible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-loadAllModels xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.loadAll" data-xeokit-i18ntip="modelsExplorer.loadAllTip" data-tippy-content="Load all models">Load all</button>
            <button type="button" class="xeokit-i18n xeokit-unloadAllModels xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.unloadAll"  data-xeokit-i18ntip="modelsExplorer.unloadAllTip" data-tippy-content="Unload all models">Unload all</button>` +
        (cfg.enableEditModels ? `<button type="button" class="xeokit-i18n xeokit-addModel xeokit-btn disabled" data-xeokit-i18n="modelsExplorer.add"  data-xeokit-i18ntip="modelsExplorer.addTip" data-tippy-content="Add model">Add</button>` : ``) + `</div>
        <div class="xeokit-models" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-objects-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllObjects xeokit-btn disabled" data-xeokit-i18n="objectsExplorer.showAll" data-xeokit-i18ntip="objectsExplorer.showAllTip" data-tippy-content="Show all objects">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllObjects xeokit-btn disabled" data-xeokit-i18n="objectsExplorer.hideAll" data-xeokit-i18ntip="objectsExplorer.hideAllTip" data-tippy-content="Hide all objects">Hide all</button>
        </div>
        <div class="xeokit-objects xeokit-tree-panel" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-classes-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllClasses xeokit-btn disabled" data-xeokit-i18n="classesExplorer.showAll"  data-xeokit-i18ntip="classesExplorer.hideAllTip" data-tippy-content="Show all classes">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllClasses xeokit-btn disabled" data-xeokit-i18n="classesExplorer.hideAll" data-xeokit-i18ntip="classesExplorer.hideAllTip" data-tippy-content="Hide all classes">Hide all</button>
        </div>
        <div class="xeokit-classes xeokit-tree-panel" ></div>
    </div>
    <div class="xeokit-explorer-view xeokit-storeys-view invisible">
        <div class="xeokit-btn-group">
            <button type="button" class="xeokit-i18n xeokit-showAllStoreys xeokit-btn disabled" data-xeokit-i18n="storeysExplorer.showAll" data-xeokit-i18ntip="storeysExplorer.showAllTip" data-tippy-content="Show all storeys">Show all</button>
            <button type="button" class="xeokit-i18n xeokit-hideAllStoreys xeokit-btn disabled" data-xeokit-i18n="storeysExplorer.hideAll" data-xeokit-i18ntip="storeysExplorer.hideAllTip" data-tippy-content="Hide all storeys">Hide all</button>
        </div>
        <div class="xeokit-storeys xeokit-tree-panel"></div>
    </div>`;
    modelExplorerTemplate += `</div>`;
    return modelExplorerTemplate;
}

function createToolbarTemplate(cfg = {}) {
    const toolbarTemplate = `<div class="xeokit-toolbar">
    <!-- Reset button -->
    <div class="xeokit-btn-group">
        <button type="button" class="xeokit-i18n xeokit-reset xeokit-btn fa fa-home fa-2x disabled" data-xeokit-i18ntip="toolbar.resetViewTip" data-tippy-content="Reset view"></button>
    </div>
    <div class="xeokit-btn-group" role="group">
        <!-- 3D Mode button -->
        <button type="button" class="xeokit-i18n xeokit-threeD xeokit-btn fa fa-cube fa-2x disabled" data-xeokit-i18ntip="toolbar.toggle2d3dTip" data-tippy-content="Toggle 2D/3D"></button>
        <!-- Perspective/Ortho Mode button -->
        <button type="button" class="xeokit-i18n xeokit-ortho xeokit-btn fa fa-th fa-2x  disabled" data-xeokit-i18ntip="toolbar.togglePerspectiveTip" data-tippy-content="Toggle Perspective/Ortho"></button>
        <!-- Fit button -->
        <button type="button" class="xeokit-i18n xeokit-fit xeokit-btn fa fa-crop fa-2x disabled" data-xeokit-i18ntip="toolbar.viewFitTip" data-tippy-content="View fit"></button>
        <!-- First Person mode button -->
        <button type="button" class="xeokit-i18n xeokit-firstPerson xeokit-btn fa fa-male fa-2x disabled" data-xeokit-i18ntip="toolbar.firstPersonTip" data-tippy-content="Toggle first-person mode"></button>
          <!-- Show/hide IFCSpaces -->
        <button type="button" class="xeokit-i18n xeokit-showSpaces xeokit-btn fab fa-codepen fa-2x disabled" data-xeokit-i18ntip="toolbar.showSpacesTip" data-tippy-content="Show IFCSpaces"></button>   
    </div>
    <!-- Tools button group -->
    <div class="xeokit-btn-group" role="group">
        <!-- Hide tool button -->
        <button type="button" class="xeokit-i18n xeokit-hide xeokit-btn fa fa-eraser fa-2x disabled" data-xeokit-i18ntip="toolbar.hideObjectsTip" data-tippy-content="Hide objects"></button>
        <!-- Select tool button -->
        <button type="button" class="xeokit-i18n xeokit-select xeokit-btn fa fa-mouse-pointer fa-2x disabled" data-xeokit-i18ntip="toolbar.selectObjectsTip" data-tippy-content="Select objects"></button>    
          <!-- Marquee select tool button -->
        <button type="button" class="xeokit-i18n xeokit-marquee xeokit-btn fas fa-object-group fa-2x disabled" data-xeokit-i18ntip="toolbar.marqueeSelectTip" data-tippy-content="Marquee select objects"></button>`
        + (cfg.enableMeasurements ? `<!-- Measure distance tool button -->
        <button type="button" class="xeokit-i18n xeokit-measure-distance xeokit-btn fa fa-ruler fa-2x disabled" data-xeokit-i18ntip="toolbar.measureDistanceTip" data-tippy-content="Measure distance"></button>  
          <!-- Measure angle tool button -->
        <button type="button" class="xeokit-i18n xeokit-measure-angle xeokit-btn fa fa-chevron-left fa-2x disabled" data-xeokit-i18ntip="toolbar.measureAngleTip" data-tippy-content="Measure angle"></button>`
            : ` `)
        + `<!-- section tool button -->
        <button type="button" class="xeokit-i18n xeokit-section xeokit-btn fa fa-cut fa-2x disabled" data-xeokit-i18ntip="toolbar.sliceObjectsTip" data-tippy-content="Slice objects">
            <div class="xeokit-i18n xeokit-section-menu-button disabled" data-xeokit-i18ntip="toolbar.slicesMenuTip"  data-tippy-content="Slices menu">
                <span class="xeokit-arrow-down xeokit-section-menu-button-arrow"></span>
            </div>
            <div class="xeokit-i18n xeokit-section-counter" data-xeokit-i18ntip="toolbar.numSlicesTip" data-tippy-content="Number of existing slices"></div>
        </button>
    </div>
</div>`;
    return toolbarTemplate;
}

function createInspectorTemplate() {
    // Create inspector header
    let inspectorTemplate = `<div class="xeokit-explorer-nav">
        <div class="xeokit-btn-group xeokit-inspector-buttons">
            <div class="xeokit-i18n xeokit-properties-header xeokit-properties-btn active" data-xeokit-i18n="propertiesInspector.title" data-inspector-view="properties">Properties</div>
        </div>
    </div>`;
    
    // Create inspector content containers
    inspectorTemplate += `<div class="xeokit-explorer-content">
    <div class="xeokit-explorer-view xeokit-properties-view visible">
        <div class="xeokit-properties"></div>
    </div>
</div>`;
    return inspectorTemplate;
}

function initExplorer(containerElement) {

    const explorerNavClass = 'xeokit-explorer-nav';
    const explorerButtonClass = 'xeokit-explorer-btn';
    const explorerViewClass = 'xeokit-explorer-view';
    const activeClass = 'active';
    const invisibleClass = 'invisible';
    const visibleClass = 'visible';

    // Activates the chosen explorer view and deactivates the rest
    function activateExplorerView(container, viewName, viewType) {
        // Deactivate all buttons and views
        const buttons = container.querySelectorAll('.' + explorerButtonClass);
        const views = container.querySelectorAll('.' + explorerViewClass);
        
        // Remove active class from all buttons
        buttons.forEach(button => button.classList.remove(activeClass));
        
        // Make all views invisible
        views.forEach(view => {
            view.classList.remove(visibleClass);
            view.classList.add(invisibleClass);
        });
        
        // Activate the selected button and view
        let selectedButton, selectedView;
        if (viewType === 'explorer') {
            selectedButton = container.querySelector(`[data-explorer-view="${viewName}"]`);
            selectedView = container.querySelector(`.xeokit-${viewName}-view`);
        } else if (viewType === 'inspector') {
            selectedButton = container.querySelector(`[data-inspector-view="${viewName}"]`);
            selectedView = container.querySelector(`.xeokit-${viewName}-view`);
        }
        
        // Add active class to selected button
        if (selectedButton) selectedButton.classList.add(activeClass);
        
        // Make selected view visible
        if (selectedView) {
            selectedView.classList.remove(invisibleClass);
            selectedView.classList.add(visibleClass);
        }
    }

    // Initialize each explorer container
    let explorerContainers = containerElement.querySelectorAll('.' + explorerNavClass);
    for (let i = 0; i < explorerContainers.length; i++) {
        let explorerContainer = explorerContainers[i];
        let parentContainer = explorerContainer.parentNode;
        
        // Check if this is an inspector or explorer
        const isInspector = parentContainer.querySelector('[data-inspector-view]') !== null;
        const viewType = isInspector ? 'inspector' : 'explorer';
        
        // Activate the first view by default
        if (viewType === 'explorer') {
            activateExplorerView(parentContainer, 'models', viewType);
        } else if (viewType === 'inspector') {
            activateExplorerView(parentContainer, 'properties', viewType);
        }
        
        // Add event listeners to explorer/inspector buttons
        let explorerButtons = parentContainer.querySelectorAll('.' + explorerButtonClass);
        explorerButtons.forEach(button => {
            // Only add click event listeners to actual buttons, not header elements
            if (button.tagName.toLowerCase() === 'button') {
                button.addEventListener('click', function (event) {
                    if (this.classList.contains("disabled")) {
                        return;
                    }
                    
                    let viewName;
                    if (viewType === 'explorer') {
                        viewName = this.getAttribute('data-explorer-view');
                    } else if (viewType === 'inspector') {
                        viewName = this.getAttribute('data-inspector-view');
                    }
                    activateExplorerView(parentContainer, viewName, viewType);
                });
            }
        });
    }
}


/**
 * @desc A BIM viewer based on the [xeokit SDK](http://xeokit.io).
 *
 *
 */
class BIMViewer extends Controller {

    /**
     * Constructs a BIMViewer.
     * @param {Server} server Data access strategy.
     * @param {*} cfg Configuration.
     * @param {Boolean} [cfg.enableEditModels=false] Set ````true```` to show "Add", "Edit" and "Delete" options in the Models tab's context menu.
     * @param {Boolean} [cfg.enableMeasurements=true] Set ````true```` to enable distance and angle measurements with the BIMViewer.
     * @param {Boolean} [cfg.keyboardEventsElement] Optional reference to HTML element on which key events should be handled. Defaults to the HTML Document.
     * @param {Node | undefined} [cfg.containerElement] Optional reference of an existing DOM Node (e.g. ShadowRoot), which encapsulates all HTML elements related to viewer plugins, defaults to ````document.body````. 
     */
    constructor(server, cfg = {}) {

        if (!cfg.canvasElement) {
            throw "Config expected: canvasElement";
        }

        if (!cfg.explorerElement) {
            throw "Config expected: explorerElement";
        }

        if (!cfg.toolbarElement) {
            throw "Config expected: toolbarElement";
        }

        if (!cfg.navCubeCanvasElement) {
            throw "Config expected: navCubeCanvasElement";
        }

        const canvasElement = cfg.canvasElement;
        const explorerElement = cfg.explorerElement;
        const inspectorElement = cfg.inspectorElement;
        const toolbarElement = cfg.toolbarElement;
        const navCubeCanvasElement = cfg.navCubeCanvasElement;
        const busyModelBackdropElement = cfg.busyModelBackdropElement;
        const modelExplorerElement = cfg.modelExplorerElement; // New model explorer element

        explorerElement.oncontextmenu = (e) => {
            e.preventDefault();
        };
        
        if (modelExplorerElement) {
            modelExplorerElement.oncontextmenu = (e) => {
                e.preventDefault();
            };
        }

        toolbarElement.oncontextmenu = (e) => {
            e.preventDefault();
        };

        navCubeCanvasElement.oncontextmenu = (e) => {
            e.preventDefault();
        };

        const viewer = new Viewer({
            localeService: cfg.localeService,
            canvasElement: canvasElement,
            keyboardEventsElement: cfg.keyboardEventsElement,
            transparent: false,
            backgroundColor: [1, 1, 1],
            backgroundColorFromAmbientLight: false,
            saoEnabled: true,
            pbrEnabled: false,
            colorTextureEnabled: true,


            // Enhances the efficiency of SectionPlane creation by proactively allocating Viewer resources
            // for a specified quantity of SectionPlanes. Introducing this parameter streamlines the initial
            // creation speed of SectionPlanes, particularly up to the designated quantity. This parameter
            // internally configures renderer logic for the specified number of SectionPlanes, eliminating
            // the need for setting up logic with each SectionPlane creation and thereby enhancing responsiveness.
            // It is important to consider that each SectionPlane imposes rendering performance, so it is
            // recommended to set this value to a quantity that aligns with your expected usage.

            numCachedSectionPlanes: 4
        });

        super(null, cfg, server, viewer);

        this._containerElement = cfg.containerElement || document.body;
        this._configs = {};

        this._enableAddModels = !!cfg.enableEditModels;
        this._enableMeasurements = (cfg.enableMeasurements !== false);
        this._enablePropertiesInspector = !!cfg.inspectorElement;

        /**
         * The xeokit [Viewer](https://xeokit.github.io/xeokit-sdk/docs/class/src/viewer/Viewer.js~Viewer.html) at the core of this BIMViewer.
         *
         * @type {Viewer}
         */
        this.viewer = viewer;

        this._objectsKdTree3 = new ObjectsKdTree3(({
            viewer
        }))

        this._customizeViewer();
        this._initCanvasContextMenus();

        explorerElement.innerHTML = createExplorerTemplate(cfg);
        
        // If a separate model explorer element is provided, initialize it with the model explorer template
        if (modelExplorerElement) {
            modelExplorerElement.innerHTML = createModelExplorerTemplate(cfg);
        }
        
        toolbarElement.innerHTML = createToolbarTemplate({ enableMeasurements: this._enableMeasurements });
        if (this._enablePropertiesInspector) {
            inspectorElement.innerHTML = createInspectorTemplate();
        }

        this._explorerElement = explorerElement;
        this._modelExplorerElement = modelExplorerElement; // Store reference to model explorer element
        this._inspectorElement = inspectorElement;

        initExplorer(explorerElement);
        if (this._enablePropertiesInspector) {
            initExplorer(inspectorElement);
        }
        
        // Initialize model explorer tabs if separate element is provided
        if (modelExplorerElement) {
            initExplorer(modelExplorerElement);
        }

        // Determine which element to use for the models explorer
        const modelsElementContainer = modelExplorerElement || explorerElement;
        
        // If modelExplorerElement is provided, only include the models tab in the main explorer
        const includeOtherTabsInMainExplorer = !this._modelExplorerElement;
        
        this._modelsExplorer = new ModelsExplorer(this, {
            enableMeasurements: this._enableMeasurements,
            modelsTabElement: modelsElementContainer.querySelector(".xeokit-modelsTab"), // Keep for backward compatibility
            modelsButtonElement: modelsElementContainer.querySelector(".xeokit-models-btn"), // New parameter for button element
            loadModelsButtonElement: modelsElementContainer.querySelector(".xeokit-loadAllModels"), // Can be undefined
            unloadModelsButtonElement: modelsElementContainer.querySelector(".xeokit-unloadAllModels"),
            addModelButtonElement: modelsElementContainer.querySelector(".xeokit-addModel"), // Can be undefined
            modelsElement: modelsElementContainer.querySelector(".xeokit-models"),
            enableEditModels: this._enableAddModels,
            containerElement: this._containerElement,
            isInSeparateElement: !!modelExplorerElement // Pass flag indicating if models explorer is in separate element
        });

        if (includeOtherTabsInMainExplorer) {
            this._objectsExplorer = new ObjectsExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                objectsTabElement: explorerElement.querySelector(".xeokit-objectsTab"), // Keep for backward compatibility
                objectsButtonElement: explorerElement.querySelector(".xeokit-objects-btn"), // New parameter for button element
                showAllObjectsButtonElement: explorerElement.querySelector(".xeokit-showAllObjects"),
                hideAllObjectsButtonElement: explorerElement.querySelector(".xeokit-hideAllObjects"),
                objectsElement: explorerElement.querySelector(".xeokit-objects"),
                containerElement: this._containerElement
            });

            this._classesExplorer = new ClassesExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                classesTabElement: explorerElement.querySelector(".xeokit-classesTab"), // Keep for backward compatibility
                classesButtonElement: explorerElement.querySelector(".xeokit-classes-btn"), // New parameter for button element
                showAllClassesButtonElement: explorerElement.querySelector(".xeokit-showAllClasses"),
                hideAllClassesButtonElement: explorerElement.querySelector(".xeokit-hideAllClasses"),
                classesElement: explorerElement.querySelector(".xeokit-classes"),
                containerElement: this._containerElement
            });

            this._storeysExplorer = new StoreysExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                storeysTabElement: explorerElement.querySelector(".xeokit-storeysTab"), // Keep for backward compatibility
                storeysButtonElement: explorerElement.querySelector(".xeokit-storeys-btn"), // New parameter for button element
                showAllStoreysButtonElement: explorerElement.querySelector(".xeokit-showAllStoreys"),
                hideAllStoreysButtonElement: explorerElement.querySelector(".xeokit-hideAllStoreys"),
                storeysElement: explorerElement.querySelector(".xeokit-storeys"),
                containerElement: this._containerElement
            });
        }

        // Initialize objects explorer for model explorer element if it exists
        if (this._modelExplorerElement) {
            this._modelObjectsExplorer = new ObjectsExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                objectsTabElement: this._modelExplorerElement.querySelector(".xeokit-objectsTab"), // Keep for backward compatibility
                objectsButtonElement: this._modelExplorerElement.querySelector(".xeokit-objects-btn"), // New parameter for button element
                showAllObjectsButtonElement: this._modelExplorerElement.querySelector(".xeokit-showAllObjects"),
                hideAllObjectsButtonElement: this._modelExplorerElement.querySelector(".xeokit-hideAllObjects"),
                objectsElement: this._modelExplorerElement.querySelector(".xeokit-objects"),
                containerElement: this._containerElement
            });
            
            this._modelClassesExplorer = new ClassesExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                classesTabElement: this._modelExplorerElement.querySelector(".xeokit-classesTab"), // Keep for backward compatibility
                classesButtonElement: this._modelExplorerElement.querySelector(".xeokit-classes-btn"), // New parameter for button element
                showAllClassesButtonElement: this._modelExplorerElement.querySelector(".xeokit-showAllClasses"),
                hideAllClassesButtonElement: this._modelExplorerElement.querySelector(".xeokit-hideAllClasses"),
                classesElement: this._modelExplorerElement.querySelector(".xeokit-classes"),
                containerElement: this._containerElement
            });
            
            this._modelStoreysExplorer = new StoreysExplorer(this, {
                enableMeasurements: this._enableMeasurements,
                storeysTabElement: this._modelExplorerElement.querySelector(".xeokit-storeysTab"), // Keep for backward compatibility
                storeysButtonElement: this._modelExplorerElement.querySelector(".xeokit-storeys-btn"), // New parameter for button element
                showAllStoreysButtonElement: this._modelExplorerElement.querySelector(".xeokit-showAllStoreys"),
                hideAllStoreysButtonElement: this._modelExplorerElement.querySelector(".xeokit-hideAllStoreys"),
                storeysElement: this._modelExplorerElement.querySelector(".xeokit-storeys"),
                containerElement: this._containerElement
            });
        }

        if (this._enablePropertiesInspector) {
            this._propertiesInspector = new PropertiesInspector(this, {
                propertiesTabElement: inspectorElement.querySelector(".xeokit-propertiesTab"), // Keep for backward compatibility
                propertiesButtonElement: inspectorElement.querySelector(".xeokit-properties-btn"), // New parameter for button element
                propertiesHeaderElement: inspectorElement.querySelector(".xeokit-properties-header"), // New parameter for header element
                propertiesElement: inspectorElement.querySelector(".xeokit-properties")
            });
        }

        this._resetAction = new ResetAction(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-reset"),
            active: false
        });

        this._fitAction = new FitAction(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-fit"),
            active: false
        });

        // Allows Three-D and First Person toggle buttons to cooperatively switch
        // CameraControl#navMode between "orbit", "firstPerson" and "planView" modes

        const cameraControlNavModeMediator = new (function (bimViewer) {

            let threeDActive = false;
            let firstPersonActive = false;

            this.setThreeDModeActive = (active) => {
                if (active) {
                    bimViewer._firstPersonMode.setActive(false);
                    bimViewer._marqueeSelectionTool.setEnabled(true);
                    bimViewer.viewer.cameraControl.navMode = "orbit";
                } else {
                    bimViewer._marqueeSelectionTool.setEnabled(false);
                    bimViewer._marqueeSelectionTool.setActive(false);
                    bimViewer._firstPersonMode.setActive(false);
                    bimViewer.viewer.cameraControl.navMode = "planView";
                }
                threeDActive = active;
            };

            this.setFirstPersonModeActive = (active) => {
                bimViewer.viewer.cameraControl.navMode = active ? "firstPerson" : (threeDActive ? "orbit" : "planView");
                firstPersonActive = active;
            };

        })(this);

        this._threeDMode = new ThreeDMode(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-threeD"),
            cameraControlNavModeMediator,
            active: false
        });

        this._orthoMode = new OrthoMode(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-ortho"),
            active: false
        });

        this._firstPersonMode = new FirstPersonMode(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-firstPerson"),
            cameraControlNavModeMediator,
            active: false
        });

        this._hideTool = new HideTool(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-hide"),
            active: false
        });

        this._selectionTool = new SelectionTool(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-select"),
            active: false
        });

        this._marqueeSelectionTool = new MarqueeSelectionTool(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-marquee"),
            active: false,
            objectsKdTree3: this._objectsKdTree3
        });

        this._showSpacesMode = new ShowSpacesMode(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-showSpaces"),
            active: false
        });

        this._queryTool = new QueryTool(this, {
            active: false
        });

        this._sectionTool = new SectionTool(this, {
            buttonElement: toolbarElement.querySelector(".xeokit-section"),
            counterElement: toolbarElement.querySelector(".xeokit-section-counter"),
            menuButtonElement: toolbarElement.querySelector(".xeokit-section-menu-button"),
            menuButtonArrowElement: toolbarElement.querySelector(".xeokit-section-menu-button-arrow"),
            active: false,
            containerElement: this._containerElement
        });

        if (this._enableMeasurements) {

            this._measureDistanceTool = new MeasureDistanceTool(this, {
                buttonElement: toolbarElement.querySelector(".xeokit-measure-distance"),
                active: false
            });

            this._measureAngleTool = new MeasureAngleTool(this, {
                buttonElement: toolbarElement.querySelector(".xeokit-measure-angle"),
                active: false
            });
        }

        this._navCubeMode = new NavCubeMode(this, {
            navCubeCanvasElement: navCubeCanvasElement,
            active: true
        });

        this._busyModal = new BusyModal(this, {
            busyModalBackdropElement: busyModelBackdropElement
        });

        this._threeDMode.setActive(true);
        this._firstPersonMode.setActive(false);
        this._navCubeMode.setActive(true);

        this._modelsExplorer.on("modelLoaded", (modelId) => {
            if (this._modelsExplorer.getNumModelsLoaded() > 0) {
                this.setControlsEnabled(true);
            }
            this.fire("modelLoaded", modelId);
        });

        this._modelsExplorer.on("modelUnloaded", (modelId) => {
            if (this._modelsExplorer.getNumModelsLoaded() === 0) {
                this.setControlsEnabled(false);
                this.openTab("models");
            }
            this.fire("modelUnloaded", modelId);
        });

        this._resetAction.on("reset", () => {
            this.fire("reset", true);
        });

        this._mutexActivation([
            this._hideTool,
            this._selectionTool,
            this._marqueeSelectionTool,
            this._sectionTool,
            this._enableMeasurements ? this._measureDistanceTool : null,
            this._enableMeasurements ? this._measureAngleTool : null
        ]);

        // If modelExplorerElement is provided, only include the objects, classes, and storeys buttons in the main explorer
        // (variable already declared above)
        if (includeOtherTabsInMainExplorer) {
            explorerElement.querySelector(".xeokit-showAllObjects").addEventListener("click", (event) => {
                this.setAllObjectsVisible(true);
                this.setAllObjectsXRayed(false);
                event.preventDefault();
            });

            explorerElement.querySelector(".xeokit-hideAllObjects").addEventListener("click", (event) => {
                this.setAllObjectsVisible(false);
                event.preventDefault();
            });

            explorerElement.querySelector(".xeokit-showAllClasses").addEventListener("click", (event) => {
                this.setAllObjectsVisible(true);
                this.setAllObjectsXRayed(false);
                event.preventDefault();
            });

            explorerElement.querySelector(".xeokit-hideAllClasses").addEventListener("click", (event) => {
                this.setAllObjectsVisible(false);
                event.preventDefault();
            });

            explorerElement.querySelector(".xeokit-showAllStoreys").addEventListener("click", (event) => {
                this.setAllObjectsVisible(true);
                this.setAllObjectsXRayed(false);
                event.preventDefault();
            });

            explorerElement.querySelector(".xeokit-hideAllStoreys").addEventListener("click", (event) => {
                this.setAllObjectsVisible(false);
                event.preventDefault();
            });
        }

        // Add event listeners for model explorer buttons, checking if elements exist
        // (they might not exist if model explorer is in a separate element)
        const loadAllModelsButton = explorerElement.querySelector(".xeokit-loadAllModels");
        if (loadAllModelsButton) {
            loadAllModelsButton.addEventListener("click", (event) => {
                this.setControlsEnabled(false); // For quick UI feedback
                this.loadAllModels();
                event.preventDefault();
            });
        }

        const unloadAllModelsButton = explorerElement.querySelector(".xeokit-unloadAllModels");
        if (unloadAllModelsButton) {
            unloadAllModelsButton.addEventListener("click", (event) => {
                this.setControlsEnabled(false); // For quick UI feedback
                this._modelsExplorer.unloadAllModels();
                event.preventDefault();
            });
        }

        if (this._enableAddModels) {
            const addModelButton = explorerElement.querySelector(".xeokit-addModel");
            if (addModelButton) {
                addModelButton.addEventListener("click", (event) => {
                    this.fire("addModel", {});
                    event.preventDefault();
                });
            }
        }
        
        // Add event listeners for model explorer buttons in separate element
        if (this._modelExplorerElement) {
            const modelExplorerLoadAllModelsButton = this._modelExplorerElement.querySelector(".xeokit-loadAllModels");
            if (modelExplorerLoadAllModelsButton) {
                modelExplorerLoadAllModelsButton.addEventListener("click", (event) => {
                    this.setControlsEnabled(false); // For quick UI feedback
                    this.loadAllModels();
                    event.preventDefault();
                });
            }

            const modelExplorerUnloadAllModelsButton = this._modelExplorerElement.querySelector(".xeokit-unloadAllModels");
            if (modelExplorerUnloadAllModelsButton) {
                modelExplorerUnloadAllModelsButton.addEventListener("click", (event) => {
                    this.setControlsEnabled(false); // For quick UI feedback
                    this._modelsExplorer.unloadAllModels();
                    event.preventDefault();
                });
            }

            if (this._enableAddModels) {
                const modelExplorerAddModelButton = this._modelExplorerElement.querySelector(".xeokit-addModel");
                if (modelExplorerAddModelButton) {
                    modelExplorerAddModelButton.addEventListener("click", (event) => {
                        this.fire("addModel", {});
                        event.preventDefault();
                    });
                }
            }
        }

        this._bcfViewpointsPlugin = new BCFViewpointsPlugin(this.viewer, {
            xrayAsZeroAlpha: true
        });

        this._fastNavPlugin = new FastNavPlugin(viewer, {
            hideEdges: true,
            hideSAO: true,
            hidePBR: false,
            hideColorTexture: false,
            hideTransparentObjects: false,
            scaleCanvasResolution: false,
            scaleCanvasResolutionFactor: 0.6
        });

        // this.viewer.scene.on("rendered", () => {
        //     const fastNavPlugin = this._fastNavPlugin;
        //     fastNavPlugin.hideEdges = (hideEdgesMinDrawCount < (stats.frame.drawElements + stats.frame.drawArrays));
        //     fastNavPlugin.scaleCanvasResolution = (scaleCanvasResolutionMinDrawCount < (stats.frame.drawElements + stats.frame.drawArrays));
        // });

        this._initConfigs();
        this.setControlsEnabled(false);
    }

    /**
     * Returns the LocaleService that was configured on this Viewer.
     *
     * @return {LocaleService} The LocaleService.
     */
    get localeService() {
        return this.viewer.localeService;
    }

    _customizeViewer() {

        const scene = this.viewer.scene;

        // Emphasis effects

        scene.xrayMaterial.fill = false;
        scene.xrayMaterial.fillAlpha = 0.3;
        scene.xrayMaterial.fillColor = [0, 0, 0];
        scene.xrayMaterial.edges = true;
        scene.xrayMaterial.edgeAlpha = 0.1;
        scene.xrayMaterial.edgeColor = [0, 0, 0];

        scene.highlightMaterial.edges = true;
        scene.highlightMaterial.edgeColor = [1, 1, 1];
        scene.highlightMaterial.edgeAlpha = 1.0;
        scene.highlightMaterial.fill = true;
        scene.highlightMaterial.fillAlpha = 0.1;
        scene.highlightMaterial.fillColor = [1, 0, 0];

        scene.selectedMaterial.edges = true;
        scene.selectedMaterial.edgeColor = [1, 1, 1];
        scene.selectedMaterial.edgeAlpha = 1.0;
        scene.selectedMaterial.fill = true;
        scene.selectedMaterial.fillAlpha = 0.1;
        scene.selectedMaterial.fillColor = [0, 1, 0];

        //------------------------------------------------------------------------------------------------------------------
        // Configure points material
        //------------------------------------------------------------------------------------------------------------------

        scene.pointsMaterial.pointSize = 1;
        scene.pointsMaterial.roundPoints = true;
        scene.pointsMaterial.perspectivePoints = true;
        scene.pointsMaterial.minPerspectivePointSize = 2;
        scene.pointsMaterial.maxPerspectivePointSize = 4;

        // Camera control

        this.viewer.cameraControl.panRightClick = false;
        this.viewer.cameraControl.followPointer = true;
        this.viewer.cameraControl.doublePickFlyTo = false;
        this.viewer.cameraControl.smartPivot = true;

        // Dolly tweaks for best precision when aligning camera for BCF snapshots

        this.viewer.cameraControl.keyboardDollyRate = 100.0;
        this.viewer.cameraControl.mouseWheelDollyRate = 100.0;
        this.viewer.cameraControl.dollyInertia = 0;
        this.viewer.cameraControl.dollyMinSpeed = 0.04;
        this.viewer.cameraControl.dollyProximityThreshold = 30.0;

        const cameraPivotElement = document.createRange().createContextualFragment("<div class='xeokit-camera-pivot-marker'></div>").firstChild;
        this._containerElement.appendChild(cameraPivotElement);
        this.viewer.cameraControl.pivotElement = cameraPivotElement;

        scene.camera.perspective.near = 0.01;
        scene.camera.perspective.far = 3000.0;
        scene.camera.ortho.near = 0.01;
        scene.camera.ortho.far = 2000.0; //

        // Scalable Ambient Obscurance (SAO) defaults
        // Since SAO is non-interactive, set to higher-quality

        const sao = scene.sao;
        sao.enabled = true;
        sao.numSamples = 50;
        sao.kernelRadius = 200;
    }

    _initCanvasContextMenus() {

        this._canvasContextMenu = new CanvasContextMenu(this, {
            hideOnAction: true,
            enableMeasurements: this._enableMeasurements,
            parentNode: this._containerElement
        });
        this._objectContextMenu = new ObjectContextMenu(this, {
            hideOnAction: true,
            enableMeasurements: this._enableMeasurements,
            parentNode: this._containerElement
        });

        const getCanvasPosFromEvent = function (event) {
            const canvasPos = [];
            if (!event) {
                event = window.event;
                canvasPos[0] = event.x;
                canvasPos[1] = event.y;
            } else {
                let element = event.target;
                let totalOffsetLeft = 0;
                let totalOffsetTop = 0;
                let totalScrollX = 0;
                let totalScrollY = 0;
                while (element.offsetParent) {
                    totalOffsetLeft += element.offsetLeft;
                    totalOffsetTop += element.offsetTop;
                    totalScrollX += element.scrollLeft;
                    totalScrollY += element.scrollTop;
                    element = element.offsetParent;
                }
                canvasPos[0] = event.pageX + totalScrollX - totalOffsetLeft;
                canvasPos[1] = event.pageY + totalScrollY - totalOffsetTop;
            }
            return canvasPos;
        };

        this.viewer.scene.canvas.canvas.addEventListener('contextmenu', (event) => {

            const canvasPos = getCanvasPosFromEvent(event);

            const hit = this.viewer.scene.pick({
                canvasPos
            });

            if (hit && hit.entity.isObject) {
                this._canvasContextMenu.hide();
                this._objectContextMenu.context = {
                    viewer: this.viewer,
                    bimViewer: this,
                    showObjectInExplorers: (objectId) => {
                        const openTabId = this.getOpenTab();
                        if (openTabId !== "objects" && openTabId !== "classes" && openTabId !== "storeys") {
                            // Scroll won't work if tab not open
                            this.openTab("objects");
                        }
                        this.showObjectInExplorers(objectId);
                    },
                    entity: hit.entity
                };
                this._objectContextMenu.show(event.pageX, event.pageY);
            } else {
                this._objectContextMenu.hide();
                this._canvasContextMenu.context = {
                    viewer: this.viewer,
                    bimViewer: this
                };
                this._canvasContextMenu.show(event.pageX, event.pageY);
            }
        });
    }

    _initConfigs() {
        this.setConfigs({
            "cameraNear": "0.05",
            "cameraFar": "3000.0",
            "smartPivot": true,
            "saoEnabled": true,
            "pbrEnabled": false,
            "scaleCanvasResolution": false,
            "saoBias": 0.5,
            "saoIntensity": 0.15,
            "saoNumSamples": 40,
            "saoKernelRadius": 100,
            "edgesEnabled": true,
            "xrayContext": true,
            "xrayPickable": false,
            "selectedGlowThrough": true,
            "highlightGlowThrough": true,
            "backgroundColor": [1.0, 1.0, 1.0],
            "externalMetadata": false,
            "dtxEnabled": false
        });
    }

    /**
     * Sets a batch of viewer configurations.
     *
     * Note that this method is not to be confused with {@link BIMViewer#setViewerState}, which batch-updates various states of the viewer's UI and 3D view.
     *
     * See [Viewer Configurations](https://xeokit.github.io/xeokit-bim-viewer/docs/#viewer-configurations) for the list of available configurations.
     *
     * @param {*} viewerConfigs Map of key-value configuration pairs.
     */
    setConfigs(viewerConfigs) {
        for (let name in viewerConfigs) {
            if (viewerConfigs.hasOwnProperty(name)) {
                const value = viewerConfigs[name];
                this.setConfig(name, value);
            }
        }
    }

    /**
     * Sets a viewer configuration.
     *
     * See [Viewer Configurations](https://xeokit.github.io/xeokit-bim-viewer/docs/#viewer-configurations) for the list of available configurations.
     *
     * @param {String} name Configuration name.
     * @param {*} value Configuration value.
     */
    setConfig(name, value) {

        function parseBool(value) {
            return ((value === true) || (value === "true"));
        }

        try {
            switch (name) {

                case "backgroundColor":
                    const rgbColor = value;
                    this.setBackgroundColor(rgbColor);
                    this._configs[name] = rgbColor;
                    break;

                case "cameraNear":
                    const near = parseFloat(value);
                    this.viewer.scene.camera.perspective.near = near;
                    this.viewer.scene.camera.ortho.near = near;
                    this._configs[name] = near;
                    break;

                case "cameraFar":
                    const far = parseFloat(value);
                    this.viewer.scene.camera.perspective.far = far;
                    // this.viewer.scene.camera.ortho.far = far;
                    this._configs[name] = far;
                    break;

                case "smartPivot":
                    this.viewer.cameraControl.smartPivot = this._configs[name] = parseBool(value);
                    break;

                case "saoEnabled":
                    this._fastNavPlugin.saoEnabled = this._configs[name] = parseBool(value);
                    break;

                case "saoBias":
                    this.viewer.scene.sao.bias = parseFloat(value);
                    break;

                case "saoIntensity":
                    this.viewer.scene.sao.intensity = parseFloat(value);
                    break;

                case "saoKernelRadius":
                    this.viewer.scene.sao.kernelRadius = this._configs[name] = parseFloat(value);
                    break;

                case "saoNumSamples":
                    this.viewer.scene.sao.numSamples = this._configs[name] = parseFloat(value);
                    break;

                case "saoBlur":
                    this.viewer.scene.sao.blur = this._configs[name] = parseBool(value);
                    break;

                case "edgesEnabled":
                    this._fastNavPlugin.edgesEnabled = this._configs[name] = parseBool(value);
                    break;

                case "pbrEnabled":
                    this._fastNavPlugin.pbrEnabled = this._configs[name] = parseBool(value);
                    break;

                case "scaleCanvasResolution":
                    this._fastNavPlugin.scaleCanvasResolution = this._configs[name] = parseBool(value);
                    break;

                case "viewFitFOV":
                    this.viewer.cameraFlight.fitFOV = this._configs[name] = parseFloat(value);
                    break;

                case "viewFitDuration":
                    this.viewer.cameraFlight.duration = this._configs[name] = parseFloat(value);
                    break;

                case "perspectiveFOV":
                    this.viewer.camera.perspective.fov = this._configs[name] = parseFloat(value);
                    break;

                case "excludeUnclassifiedObjects":
                    this._configs[name] = parseBool(value);
                    break;

                case "xrayContext":
                    this._configs[name] = value;
                    break;

                case "xrayPickable":
                    this._configs[name] = parseBool(value);
                    break;

                case "selectedGlowThrough":
                    const selectedGlowThrough = this._configs[name] = parseBool(value);
                    const selectedMaterial = this.viewer.scene.selectedMaterial;
                    selectedMaterial.glowThrough = selectedGlowThrough;
                    selectedMaterial.fillAlpha = selectedGlowThrough ? 0.5 : 1.0;
                    selectedMaterial.edgeAlpha = selectedGlowThrough ? 0.5 : 1.0;
                    break;

                case "highlightGlowThrough":
                    const highlightGlowThrough = this._configs[name] = parseBool(value);
                    const highlightMaterial = this.viewer.scene.highlightMaterial;
                    highlightMaterial.glowThrough = highlightGlowThrough;
                    highlightMaterial.fillAlpha = highlightGlowThrough ? 0.5 : 1.0;
                    highlightMaterial.edgeAlpha = highlightGlowThrough ? 0.5 : 1.0;
                    break;

                case "externalMetadata":
                    this._configs[name] = parseBool(value);
                    break;

                case "showSpaces":
                    this._configs[name] = parseBool(value);
                    this._showSpacesMode.setActive(value);
                    break;

                case "dtxEnabled":
                    this._configs[name] = parseBool(value);
                    this.viewer.scene.dtxEnabled = value;
                    break;

                case "objectColors":
                    this._configs[name] = value;
                    this._modelsExplorer.setObjectColors(value);
                    break;

                default:
                    this.warn("setConfig() - unsupported configuration: '" + name + "'");
            }

        } catch (e) {
            this.error("setConfig() - failed to configure '" + name + "': " + e);
        }
    }

    /**
     * Gets the value of a viewer configuration.
     *
     * These are set with {@link BIMViewer#setConfig} and {@link BIMViewer#setConfigs}.
     *
     * @param {String} name Configuration name.
     * @ereturns {*} Configuration value.
     */
    getConfig(name) {
        return this._configs[name];
    }

    //------------------------------------------------------------------------------------------------------------------
    // Content querying methods
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Gets information on all available projects.
     * Gets information on all available projects.
     *
     * See [Getting Info on Available Projects](https://xeokit.github.io/xeokit-bim-viewer/docs/#getting-info-on-available-projects) for usage.
     *
     * @param {Function} done Callback invoked on success, into which the projects information JSON is passed.
     * @param {Function} error Callback invoked on failure, into which the error message string is passed.
     */
    getProjectsInfo(done, error) {
        if (!done) {
            this.error("getProjectsInfo() - Argument expected: 'done'");
            return;
        }
        this.server.getProjects(done, (errorMsg) => {
            this.error("getProjectsInfo() - " + errorMsg);
            if (error) {
                error(errorMsg);
            }
        });
    }

    /**
     * Gets information on the given project.
     *
     * See [Getting Info on a Project](https://xeokit.github.io/xeokit-bim-viewer/docs/#getting-info-on-a-project) for usage.
     *
     * @param {String} projectId ID of the project to get information on. Must be the ID of one of the projects in the information obtained by {@link BIMViewer#getProjects}.
     * @param {Function} done Callback invoked on success, into which the project information JSON is passed.
     * @param {Function} error Callback invoked on failure, into which the error message string is passed.
     */
    getProjectInfo(projectId, done, error) {
        if (!projectId) {
            this.error("getProjectInfo() - Argument expected: projectId");
            return;
        }
        if (!done) {
            this.error("getProjectInfo() - Argument expected: 'done'");
            return;
        }
        this.server.getProject(projectId,
            done, (errorMsg) => {
                this.error("getProjectInfo() - " + errorMsg);
                if (error) {
                    error(errorMsg);
                }
            });
    }

    /**
     * Gets information on the given object, belonging to the given model, within the given project.
     *
     * See [Getting Info on an Object](https://xeokit.github.io/xeokit-bim-viewer/docs/#getting-info-on-an-object) for usage.
     *
     * @param {String} projectId ID of the project to get information on. Must be the ID of one of the projects in the information obtained by {@link BIMViewer#getProjects}.
     * @param {String} modelId ID of a model within the project. Must be the ID of one of the models in the information obtained by {@link BIMViewer#getProjectInfo}.
     * @param {String} objectId ID of an object in the model.
     * @param {Function} done Callback invoked on success, into which the object information JSON is passed.
     * @param {Function} error Callback invoked on failure, into which the error message string is passed.
     */
    getObjectInfo(projectId, modelId, objectId, done, error) {
        if (!projectId) {
            this.error("getObjectInfo() - Argument expected: projectId");
            return;
        }
        if (!modelId) {
            this.error("getObjectInfo() - Argument expected: modelId");
            return;
        }
        if (!objectId) {
            this.error("getObjectInfo() - Argument expected: objectId");
            return;
        }
        if (!done) {
            this.error("getProjectInfo() - Argument expected: 'done'");
            return;
        }
        this.server.getObjectInfo(projectId, modelId, objectId,
            done,
            (errorMsg) => {
                if (error) {
                    error(errorMsg);
                }
            });
    }

    //------------------------------------------------------------------------------------------------------------------
    // Content loading methods
    //------------------------------------------------------------------------------------------------------------------

    /**
     * Loads a project into the viewer.
     *
     * Unloads any currently loaded project and its models first. If the given project is already loaded, will unload that project first.
     *
     * @param {String} projectId ID of the project to load. Must be the ID of one of the projects in the information obtained by {@link BIMViewer#getProjects}.
     * @param {Function} done Callback invoked on success.
     * @param {Function} error Callback invoked on failure, into which the error message string is passed.
     */
    loadProject(projectId, done, error) {
        if (!projectId) {
            this.error("loadProject() - Argument expected: objectId");
            return;
        }
        this._modelsExplorer.loadProject(projectId,
            () => {
                if (done) {
                    done();
                }
            }, (errorMsg) => {
                this.error("loadProject() - " + errorMsg);
                if (error) {
                    error(errorMsg);
                }
            });
    }

    /**
     * Unloads whatever project is currently loaded.
     */
    unloadProject() {
        this._modelsExplorer.unloadProject();
        this.openTab("models");
        this.setControlsEnabled(false); // For quick UI feedback
    }

    /**
     * Returns the ID of the currently loaded project, if any.
     *
     * @returns {String} The ID of the currently loaded project, otherwise ````null```` if no project is currently loaded.
     */
    getLoadedProjectId() {
        return this._modelsExplorer.getLoadedProjectId();
    }

    /**
     * Returns the IDs of the models in the currently loaded project.
     *
     * @returns {String[]} The IDs of the models in the currently loaded project.
     */
    getModelIds() {
        return this._modelsExplorer.getModelIds();
    }

    /**
     * Loads a model into the viewer.
     *
     * Assumes that the project containing the model is currently loaded.
     *
     * @param {String} modelId ID of the model to load. Must be the ID of one of the models in the currently loaded project.
     * @param {Function} done Callback invoked on success.
     * @param {Function} error Callback invoked on failure, into which the error message string is passed.
     */
    loadModel(modelId, done, error) {
        if (!modelId) {
            this.error("loadModel() - Argument expected: modelId");
            return;
        }
        this._modelsExplorer.loadModel(modelId,
            () => {
                if (done) {
                    done();
                }
            }, (errorMsg) => {
                this.error("loadModel() - " + errorMsg);
                if (error) {
                    error(errorMsg);
                }
            });
    }

    /**
     * Load all models in the currently loaded project.
     *
     * Doesn't reload any models that are currently loaded.
     *
     * @param {Function} done Callback invoked on successful loading of the models.
     */
    loadAllModels(done = function () {
    }) {
        const modelIds = this._modelsExplorer.getModelIds();
        const loadNextModel = (i, done2) => {
            if (i >= modelIds.length) {
                done2();
            } else {
                const modelId = modelIds[i];
                if (!this._modelsExplorer.isModelLoaded(modelId)) {
                    this._modelsExplorer.loadModel(modelId, () => {
                        loadNextModel(i + 1, done2);
                    }, (errorMsg) => {
                        this.error("loadAllModels() - " + errorMsg);
                        loadNextModel(i + 1, done2);
                    });
                } else {
                    loadNextModel(i + 1, done2);
                }
            }
        };
        loadNextModel(0, done);
    }

    /**
     * Returns the IDs of the currently loaded models, if any.
     *
     * @returns {String[]} The IDs of the currently loaded models, otherwise an empty array if no models are currently loaded.
     */
    getLoadedModelIds() {
        return this._modelsExplorer._getLoadedModelIds();
    }

    /**
     * Gets if the given model is loaded.
     *
     * @param {String} modelId ID of the model to check. Must be the ID of one of the models in the currently loaded project.
     * @returns {Boolean} True if the given model is loaded.
     */
    isModelLoaded(modelId) {
        if (!modelId) {
            this.error("unloadModel() - Argument expected: modelId");
            return;
        }
        return this._modelsExplorer.isModelLoaded(modelId);
    }

    /**
     * Unloads a model from the viewer.
     *
     * Does nothing if the model is not currently loaded.
     *
     * @param {String} modelId ID of the model to unload.
     */
    unloadModel(modelId) {
        if (!modelId) {
            this.error("unloadModel() - Argument expected: modelId");
            return;
        }
        this._modelsExplorer.unloadModel(modelId);
    }

    /**
     * Unloads all currently loaded models.
     */
    unloadAllModels() {
        this._modelsExplorer.unloadAllModels();
    }

    /**
     * Edits a model.
     *
     * Assumes that the project containing the model is currently loaded.
     *
     * @param {String} modelId ID of the model to edit. Must be the ID of one of the models in the currently loaded project.
     */
    editModel(modelId) {
        this.fire("editModel", {
            modelId: modelId
        });
    }

    /**
     * Deletes a model.
     *
     * Assumes that the project containing the model is currently loaded.
     *
     * @param {String} modelId ID of the model to delete. Must be the ID of one of the models in the currently loaded project.
     */
    deleteModel(modelId) {
        this.fire("deleteModel", {
            modelId: modelId
        });
    }

    /**
     * Adds a model.
     *
     */
    addModel() {
        this.fire("addModel", {});
    }

    /**
     * Sets the viewer's background color.
     *
     * @param {Number[]} rgbColor Three-element array of RGB values, each in range ````[0..1]````.
     */
    setBackgroundColor(rgbColor) {
        this.viewer.scene.canvas.backgroundColor = rgbColor;
    }

    /**
     * Sets where the colors for model objects will be loaded from.
     *
     * Options are:
     *
     * * "model" - (default) load colors from models, and
     * * "viewer" - load colors from the viewer's inbuilt table of colors for IFC types.
     *
     * This is "model" by default.
     *
     * @deprecated
     * @param {String} source Where colors will be loaded from - "model" or "viewer".
     */
    setObjectColorSource(source) {
        console.log("BIMViewer.setObjectColorSource() is now deprecated and no longer functional. By default, " +
            "BIMViewer.getObjectColorSource() will now always return the (formerly) default value of `model`.");
    }

    /**
     * Gets where the colors for model objects will be loaded from.
     *
     * This is "model" by default.
     *
     * @deprecated
     * @return {String} Where colors will be loaded from - "model" to get colors from the model, or "viewer" to get them from the viewer's built-in table of colors for IFC types.
     */
    getObjectColorSource() {
        return "model";
    }

    /**
     * Updates viewer UI state according to the properties in the given object.
     *
     * Note that, since some updates could be animated (e.g. flying the camera to fit objects to view) this
     * method optionally takes a callback, which it invokes after updating the UI.
     *
     * Also, this method is not to be confused with {@link BIMViewer#setConfigs}, which is used to batch-update various configurations and user preferences on the viewer.
     *
     * See [Viewer States](https://xeokit.github.io/xeokit-bim-viewer/docs/#viewer_states) for the list of states that may be batch-updated with this method.
     *
     * @param {Object} viewerState Specifies the viewer UI state updates.
     * @param {Function} done Callback invoked on successful update of the viewer states.
     */
    setViewerState(viewerState, done = () => {
    }) {
        if (viewerState.tabOpen) {
            this.openTab(viewerState.tabOpen);
        }
        
        // If modelExplorerElement is provided, use the model explorer explorers, otherwise use the main explorer explorers
        const objectsExplorer = this._modelObjectsExplorer || this._objectsExplorer;
        const classesExplorer = this._modelClassesExplorer || this._classesExplorer;
        const storeysExplorer = this._modelStoreysExplorer || this._storeysExplorer;
        
        if (viewerState.expandObjectsTree && objectsExplorer) {
            objectsExplorer.expandTreeViewToDepth(viewerState.expandObjectsTree);
        }
        if (viewerState.expandClassesTree && classesExplorer) {
            classesExplorer.expandTreeViewToDepth(viewerState.expandClassesTree);
        }
        if (viewerState.expandStoreysTree && storeysExplorer) {
            storeysExplorer.expandTreeViewToDepth(viewerState.expandStoreysTree);
        }
        if (viewerState.setCamera) {
            this.setCamera(viewerState.setCamera);
        }
        this._parseSelectedStorey(viewerState, () => {
            this._parseThreeDMode(viewerState, () => {
                done();
            });
        });
    }

    _parseSelectedStorey(viewerState, done) {
        if (viewerState.selectedStorey) {
            this.selectStorey(viewerState.selectedStorey);
            done();
        } else {
            done();
        }
    }

    _parseThreeDMode(viewerState, done) {
        const activateThreeDMode = (viewerState.threeDActive !== false);
        this.set3DEnabled(activateThreeDMode, done);
    }

    /**
     * Highlights the given object in the tree views within the Objects, Classes and Storeys tabs.
     *
     * Also scrolls the object's node into view within each tree, then highlights it.
     *
     * De-highlights whatever node is currently highlighted in each of those trees.
     *
     * @param {String} objectId ID of the object
     */
    showObjectInExplorers(objectId) {
        if (!objectId) {
            this.error("showObjectInExplorers() - Argument expected: objectId");
            return;
        }
        
        // If modelExplorerElement is provided, use the model explorer explorers, otherwise use the main explorer explorers
        const objectsExplorer = this._modelObjectsExplorer || this._objectsExplorer;
        const classesExplorer = this._modelClassesExplorer || this._classesExplorer;
        const storeysExplorer = this._modelStoreysExplorer || this._storeysExplorer;
        
        if (objectsExplorer) {
            objectsExplorer.showNodeInTreeView(objectId);
        }
        if (classesExplorer) {
            classesExplorer.showNodeInTreeView(objectId);
        }
        if (storeysExplorer) {
            storeysExplorer.showNodeInTreeView(objectId);
        }
        this.fire("openExplorer", {});
    }

    /**
     * De-highlights the object previously highlighted with {@link BIMViewer#showObjectInExplorers}.
     *
     * This only de-highlights the node. If the node is currently scrolled into view, then the node will remain in view.
     *
     * For each tab, does nothing if a node is currently highlighted.
     */
    unShowObjectInExplorers() {
        // If modelExplorerElement is provided, use the model explorer explorers, otherwise use the main explorer explorers
        const objectsExplorer = this._modelObjectsExplorer || this._objectsExplorer;
        const classesExplorer = this._modelClassesExplorer || this._classesExplorer;
        const storeysExplorer = this._modelStoreysExplorer || this._storeysExplorer;
        
        if (objectsExplorer) {
            objectsExplorer.unShowNodeInTreeView();
        }
        if (classesExplorer) {
            classesExplorer.unShowNodeInTreeView();
        }
        if (storeysExplorer) {
            storeysExplorer.unShowNodeInTreeView();
        }
    }

    /**
     * Shows the properties of the given object in the Properties tab.
     *
     * @param {String} objectId ID of the object
     */
    showObjectProperties(objectId) {
        if (!objectId) {
            this.error("showObjectInExplorers() - Argument expected: objectId");
            return;
        }
        if (this._enablePropertiesInspector) {
            this._propertiesInspector.showObjectPropertySets(objectId);
        }
        this.fire("openInspector", {});
    }

    /**
     * Sets whether or not the given objects are visible.
     *
     * @param {String[]} objectIds IDs of objects.
     * @param {Boolean} visible True to set objects visible, false to set them invisible.
     */
    setObjectsVisible(objectIds, visible) {
        this._withObjectsInSubtree(objectIds, (entity) => {
            entity.visible = visible;
        });
    }

    /**
     * Sets the visibility of all objects.
     *
     * @param {Boolean} visible True to set objects visible, false to set them invisible.
     */
    setAllObjectsVisible(visible) {
        if (visible) {
            this.viewer.scene.setObjectsVisible(this.viewer.scene.objectIds, true);
        } else {
            this.viewer.scene.setObjectsVisible(this.viewer.scene.visibleObjectIds, false);
        }
    }

    /**
     * Sets whether or not the given objects are X-rayed.
     *
     * @param {String[]} objectIds IDs of objects.
     * @param {Boolean} xrayed Whether or not to X-ray the objects.
     */
    setObjectsXRayed(objectIds, xrayed) {
        this._withObjectsInSubtree(objectIds, (entity) => {
            entity.xrayed = xrayed;
        });
    }

    /**
     * Sets whether or not all objects are X-rayed.
     *
     * @param {Boolean} xrayed Whether or not to set all objects X-rayed.
     */
    setAllObjectsXRayed(xrayed) {
        if (xrayed) {
            this.viewer.scene.setObjectsXRayed(this.viewer.scene.objectIds, true);
        } else {
            this.viewer.scene.setObjectsXRayed(this.viewer.scene.xrayedObjectIds, false);
        }
    }

    /**
     * Sets whether or not the given objects are selected.
     *
     * @param {String[]} objectIds IDs of objects.
     * @param {Boolean} selected Whether or not to set the objects selected.
     */
    setObjectsSelected(objectIds, selected) {
        this._withObjectsInSubtree(objectIds, (entity) => {
            entity.selected = selected;
        });
    }

    /**
     * Sets whether or not all objects are selected.
     *
     * @param {Boolean} selected Whether or not to set all objects selected.
     */
    setAllObjectsSelected(selected) {
        if (selected) {
            this.viewer.scene.setObjectsSelected(this.viewer.scene.objectIds, true);
        } else {
            this.viewer.scene.setObjectsSelected(this.viewer.scene.selectedObjectIds, false);
        }
    }

    _withObjectsInSubtree(objectIds, callback) {
        if (!objectIds) {
            this.error("Argument expected: objectIds");
            return;
        }
        for (let i = 0, len = objectIds.length; i < len; i++) {
            const objectId = objectIds[i];
            this.viewer.metaScene.withMetaObjectsInSubtree(objectId, (metaObject) => {
                const entity = this.viewer.scene.objects[metaObject.id];
                if (entity) {
                    callback(entity);
                }
            });
        }
    }

    /**
     * Flies the camera to fit the given object in view.
     *
     * @param {String} objectId ID of the object
     * @param {Function} done Callback invoked on completion
     */
    flyToObject(objectId, done) {
        if (!objectId) {
            this.error("flyToObject() - Argument expected: objectId");
            return;
        }
        const viewer = this.viewer;
        const scene = viewer.scene;
        const objectIds = [];
        this.viewer.metaScene.withMetaObjectsInSubtree(objectId, (metaObject) => {
            if (scene.objects[metaObject.id]) {
                objectIds.push(metaObject.id);
            }
        });
        if (objectIds.length === 0) {
            this.error("Object not found in viewer: '" + objectId + "'");
            if (done) {
                done();
            }
            return;
        }
        scene.setObjectsVisible(objectIds, true);
        scene.setObjectsHighlighted(objectIds, true);
        const aabb = scene.getAABB(objectIds);
        viewer.cameraFlight.flyTo({
            aabb: aabb
        }, () => {
            if (done) {
                done();
            }
            setTimeout(function () {
                scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
            }, 500);
        });
        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
    }

    /**
     * Flies the camera to fit the given objects in view.
     *
     * @param {String[]} objectIds IDs of the objects
     * @param {Function} done Callback invoked on completion
     */
    viewFitObjects(objectIds, done) {
        if (!objectIds) {
            this.error("flyToObject() - Argument expected: objectIds");
            return;
        }
        const viewer = this.viewer;
        const scene = viewer.scene;

        const entityIds = [];

        for (var i = 0, len = objectIds.length; i < len; i++) {
            const objectId = objectIds[i];
            this.viewer.metaScene.withMetaObjectsInSubtree(objectId, (metaObject) => {
                if (scene.objects[metaObject.id]) {
                    entityIds.push(metaObject.id);
                }
            });
        }
        if (entityIds.length === 0) {
            if (done) {
                done();
            }
            return;
        }
        scene.setObjectsVisible(entityIds, true);
        scene.setObjectsHighlighted(entityIds, true);
        const aabb = scene.getAABB(entityIds);
        viewer.cameraFlight.flyTo({
            aabb: aabb
        }, () => {
            if (done) {
                done();
            }
            setTimeout(function () {
                scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
            }, 500);
        });
        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
    }

    /**
     * Flies the camera to fit all objects in view.
     *
     * @param {Function} done Callback invoked on completion
     */
    viewFitAll(done) {
        const viewer = this.viewer;
        const scene = viewer.scene;
        const aabb = scene.getAABB();
        viewer.cameraFlight.flyTo({
            aabb: aabb
        }, () => {
            if (done) {
                done();
            }
        });
        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
    }

    /**
     * Jumps the camera to fit the given object in view.
     *
     * @param {String} objectId ID of the object
     */
    jumpToObject(objectId) {
        if (!objectId) {
            this.error("jumpToObject() - Argument expected: objectId");
            return;
        }
        const viewer = this.viewer;
        const scene = viewer.scene;
        const objectIds = [];
        this.viewer.metaScene.withMetaObjectsInSubtree(objectId, (metaObject) => {
            if (scene.objects[metaObject.id]) {
                objectIds.push(metaObject.id);
            }
        });
        if (objectIds.length === 0) {
            this.error("Object not found in viewer: '" + objectId + "'");
            return;
        }
        scene.setObjectsVisible(objectIds, true);
        const aabb = scene.getAABB(objectIds);
        viewer.cameraFlight.jumpTo({
            aabb: aabb
        });
        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
    }

    /**
     * Sets the camera to the given position.
     *
     * @param {Number[]} [params.eye] Eye position.
     * @param {Number[]} [params.look] Point of interest.
     * @param {Number[]} [params.up] Direction of "up".
     */
    setCamera(params) {
        const viewer = this.viewer;
        const scene = viewer.scene;
        const camera = scene.camera;
        if (params.eye) {
            camera.eye = params.eye;
        }
        if (params.look) {
            camera.look = params.look;
        }
        if (params.up) {
            camera.up = params.up;
        }
    }

    /**
     * Fits the given models in view.
     *
     * @param {String[]} modelIds ID of the models.
     * @param {Function} [done] Callback invoked on completion. Will be animated if this is given, otherwise will be instantaneous.
     */
    viewFitModels(modelIds, done) {
        if (!modelIds) {
            this.error("viewFitModels() - Argument expected: modelIds");
            return;
        }
        const viewer = this.viewer;
        const scene = viewer.scene;
        const aabb = math.AABB3();
        math.collapseAABB3(aabb);
        for (var i = 0, len = modelIds.length; i < len; i++) {
            const modelId = modelIds[i];
            const model = scene.models[modelId];
            if (!model) {
                this.error("Model not found in viewer: '" + modelId + "'");
                continue;
            }
            model.visible = true;
            model.highlighted = true;
            math.expandAABB3(aabb, model.aabb);
        }
        if (done) {
            viewer.cameraFlight.flyTo({
                aabb: aabb
            }, () => {
                done();
                setTimeout(function () {
                    scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
                }, 500);
            });
        } else {
            viewer.cameraFlight.jumpTo({
                aabb: aabb
            });
            setTimeout(function () {
                scene.setObjectsHighlighted(scene.highlightedObjectIds, false);
            }, 500);
        }
        viewer.cameraControl.pivotPos = math.getAABB3Center(aabb);
    }

    /**
     * Opens the specified viewer tab.
     *
     * The available tabs are:
     *
     *  * "models" - the Models tab, which lists the models available within the currently loaded project,
     *  * "objects" - the Objects tab, which contains a tree view for each loaded model, organized to indicate the containment hierarchy of their objects,
     *  * "classes" - the Classes tab, which contains a tree view for each loaded model, with nodes grouped by IFC types of their objects,
     *  * "storeys" - the Storeys tab, which contains a tree view for each loaded model, with nodes grouped within ````IfcBuildingStoreys````, sub-grouped by their IFC types, and
     *  * "properties" - the Properties tab, which shows property sets for a given object.
     *
     * @param {String} tabId ID of the tab to open - see method description.
     */
    openTab(tabId) {
        if (!tabId) {
            this.error("openTab() - Argument expected: tabId");
            return;
        }
        let buttonSelector;
        let targetElement;
        
        switch (tabId) {
            case "models":
                buttonSelector = "xeokit-models-btn";
                // Use model explorer element if available, otherwise fallback to main explorer
                targetElement = this._modelExplorerElement || this._explorerElement;
                break;
            case "objects":
                buttonSelector = "xeokit-objects-btn";
                targetElement = this._explorerElement;
                break;
            case "classes":
                buttonSelector = "xeokit-classes-btn";
                targetElement = this._explorerElement;
                break;
            case "storeys":
                buttonSelector = "xeokit-storeys-btn";
                targetElement = this._explorerElement;
                break;
            case "properties":
                buttonSelector = "xeokit-properties-btn";
                targetElement = this._inspectorElement;
                break;
            default:
                this.error("openTab() - tab not recognized: '" + tabId + "'");
                return;
        }
        this._openTab(targetElement, buttonSelector);
    }

    _openTab(element, buttonSelector) {
        const buttonClass = 'xeokit-explorer-btn';
        const activeClass = 'active';
        const viewClass = 'xeokit-explorer-view';
        const invisibleClass = 'invisible';
        const visibleClass = 'visible';
        
        // Deactivate all buttons and views
        let buttons = element.querySelectorAll("." + buttonClass);
        let views = element.querySelectorAll("." + viewClass);
        
        // Remove active class from all buttons
        buttons.forEach(button => button.classList.remove(activeClass));
        
        // Make all views invisible
        views.forEach(view => {
            view.classList.remove(visibleClass);
            view.classList.add(invisibleClass);
        });
        
        // Activate the selected button and corresponding view
        let selectedButton = element.querySelector("." + buttonSelector);
        if (selectedButton) {
            selectedButton.classList.add(activeClass);
            
            // Get the view name from the button's data attribute
            let viewName = selectedButton.getAttribute('data-explorer-view') || selectedButton.getAttribute('data-inspector-view');
            if (viewName) {
                let selectedView = element.querySelector(".xeokit-" + viewName + "-view");
                if (selectedView) {
                    selectedView.classList.remove(invisibleClass);
                    selectedView.classList.add(visibleClass);
                }
            }
        }
    }

    /**
     * Returns the ID of the currently open viewer tab.
     *
     * The available tabs are:
     *
     *  * "models" - the Models tab, which lists the models available within the currently loaded project,
     *  * "objects" - the Objects tab, which contains a tree view for each loaded model, organized to indicate the containment hierarchy of their objects,
     *  * "classes" - the Classes tab, which contains a tree view for each loaded model, with nodes grouped by IFC types of their objects,
     *  * "storeys" - the Storeys tab, which contains a tree view for each loaded model, with nodes grouped within ````IfcBuildingStoreys````, sub-grouped by their IFC types,
     *  * "properties" - the Properties tab, which shows property sets for a given object, and
     *  * "none" - no tab is open; this is unlikely, since one of the above tabs should be open at a any time, but here for robustness.
     */
    getOpenTab() {
        function hasClass(element, className) {
            if (!element) {
                return false;
            }
            return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
        }

        const activeClass = 'active';
        const visibleClass = 'visible';
        
        // Check model explorer element first if it exists, otherwise check main explorer
        let modelsButton = null;
        let modelsView = null;
        if (this._modelExplorerElement) {
            modelsButton = this._modelExplorerElement.querySelector(".xeokit-models-btn");
            modelsView = this._modelExplorerElement.querySelector(".xeokit-models-view");
        } else {
            modelsButton = this._explorerElement.querySelector(".xeokit-models-btn");
            modelsView = this._explorerElement.querySelector(".xeokit-models-view");
        }
        
        if (hasClass(modelsView, visibleClass) && hasClass(modelsButton, activeClass)) {
            return "models";
        }
        
        let objectsButton = this._explorerElement.querySelector(".xeokit-objects-btn");
        let objectsView = this._explorerElement.querySelector(".xeokit-objects-view");
        if (hasClass(objectsView, visibleClass) && hasClass(objectsButton, activeClass)) {
            return "objects";
        }
        
        let classesButton = this._explorerElement.querySelector(".xeokit-classes-btn");
        let classesView = this._explorerElement.querySelector(".xeokit-classes-view");
        if (hasClass(classesView, visibleClass) && hasClass(classesButton, activeClass)) {
            return "classes";
        }
        
        let storeysButton = this._explorerElement.querySelector(".xeokit-storeys-btn");
        let storeysView = this._explorerElement.querySelector(".xeokit-storeys-view");
        if (hasClass(storeysView, visibleClass) && hasClass(storeysButton, activeClass)) {
            return "storeys";
        }
        
        let propertiesButton = this._inspectorElement.querySelector(".xeokit-properties-btn");
        let propertiesView = this._inspectorElement.querySelector(".xeokit-properties-view");
        if (hasClass(propertiesView, visibleClass) && hasClass(propertiesButton, activeClass)) {
            return "properties";
        }
        
        return "none";
    }

    /**
     * Switches the viewer between 2D and 3D viewing modes.
     *
     * @param {Boolean} enabled Set true to switch into 3D mode, else false to switch into 2D mode.
     * @param {Function} done Callback to invoke when switch complete. Supplying this callback causes an animated transition. Otherwise, the transition will be instant.
     */
    set3DEnabled(enabled, done) {
        this._threeDMode.setActive(enabled, done);
    }

    /**
     * Gets whether the viewer is in 3D or 2D viewing mode.
     *
     * @returns {boolean} True when in 3D mode, else false.
     */
    get3DEnabled() {
        return this._threeDMode.getActive();
    }

    /**
     * Sets whether IFCSpace types are ever shown.
     *
     * @param {Boolean} shown Set true to allow IFCSpaces to be shown, else false to always keep them hidden.
     */
    setSpacesShown(shown) {
        this._showSpacesMode.setActive(shown);
    }

    /**
     * Gets whether the viewer allows IFCSpace types to be shown.
     *
     * @returns {boolean} True to allow IFCSpaces to be shown, else false to always keep them hidden.
     */
    getSpacesShown() {
        return this._showSpacesMode.getActive();
    }

    /**
     * Sets whether the viewer is in orthographic viewing mode.
     *
     * The viewer is either in orthographic mode or perspective mode. The viewer is in perspective mode by default.
     *
     * @param {Boolean} enabled Set true to switch into ortho mode, else false to switch into perspective mode.
     * @param {Function} done Callback to invoke when switch complete. Supplying this callback causes an animated transition. Otherwise, the transition will be instant.
     */
    setOrthoEnabled(enabled, done) {
        this._orthoMode.setActive(enabled, done);
    }

    /**
     * Gets whether the viewer is in orthographic viewing mode.
     *
     * The viewer is either in orthographic mode or perspective mode. The viewer is in perspective mode by default.
     *
     * @returns {boolean} True when in ortho mode, else false when in perspective mode.
     */
    getOrthoEnabled() {
        return this._orthoMode.getActive();
    }

    /**
     * Transitions the viewer into an isolated view of the given building storey.
     *
     * Does nothing and logs an error if no object of the given ID is in the viewer, or if the object is not an ````IfcBuildingStorey````.
     *
     * @param {String} storeyObjectId ID of an ````IfcBuildingStorey```` object.
     * @param {Function} [done] Optional callback to invoke on completion. When provided, the transition will be animated, with the camera flying into position. Otherwise, the transition will be instant, with the camera jumping into position.
     */
    selectStorey(storeyObjectId, done) {
        const metaScene = this.viewer.metaScene;
        const storeyMetaObject = metaScene.metaObjects[storeyObjectId];
        if (!storeyMetaObject) {
            this.error("selectStorey() - Object is not found: '" + storeyObjectId + "'");
            return;
        }
        if (storeyMetaObject.type !== "IfcBuildingStorey") {
            this.error("selectStorey() - Object is not an IfcBuildingStorey: '" + storeyObjectId + "'");
            return;
        }
        this._storeysExplorer.selectStorey(storeyObjectId, done);
    }

    /**
     * Saves viewer state to a BCF viewpoint.
     *
     * This does not save information about the project and model(s) that are currently loaded. When loading the viewpoint,
     * the viewer will assume that the same project and models will be currently loaded (the BCF viewpoint specification
     * does not contain that information).
     *
     * Note that xeokit's {@link Camera#look} is the **point-of-interest**, whereas the BCF ````camera_direction```` is a
     * direction vector. Therefore, we save ````camera_direction```` as the vector from {@link Camera#eye} to {@link Camera#look}.
     *
     * @param {*} [options] Options for getting the viewpoint.
     * @param {Boolean} [options.spacesVisible=false] Indicates whether ````IfcSpace```` types should be forced visible in the viewpoint.
     * @param {Boolean} [options.openingsVisible=false] Indicates whether ````IfcOpening```` types should be forced visible in the viewpoint.
     * @param {Boolean} [options.spaceBoundariesVisible=false] Indicates whether the boundaries of ````IfcSpace```` types should be visible in the viewpoint.
     * @param {Boolean} [options.reverseClippingPlanes=false] When ````true````, clipping planes are reversed (https://github.com/buildingSMART/BCF-XML/issues/193)
     * @param {Boolean} [options.defaultInvisible=false] When ````true````, will save the default visibility of all objects
     * as ````false````. This means that when we load the viewpoint again, and there are additional models loaded that
     * were not saved in the viewpoint, those models will be hidden when we load the viewpoint, and that only the
     * objects in the viewpoint will be visible.
     * @returns {*} BCF JSON viewpoint object
     * @example
     *
     * const viewpoint = bimViewer.saveBCFViewpoint({
     *     spacesVisible: false,          // Default
     *     spaceBoundariesVisible: false, // Default
     *     openingsVisible: false         // Default
     * });
     *
     * // viewpoint will resemble the following:
     *
     * {
     *     perspective_camera: {
     *         camera_view_point: {
     *             x: 0.0,
     *             y: 0.0,
     *             z: 0.0
     *         },
     *         camera_direction: {
     *             x: 1.0,
     *             y: 1.0,
     *             z: 2.0
     *         },
     *         camera_up_vector: {
     *             x: 0.0,
     *             y: 0.0,
     *             z: 1.0
     *         },
     *         field_of_view: 90.0
     *     },
     *     lines: [],
     *     clipping_planes: [{
     *         location: {
     *             x: 0.5,
     *             y: 0.5,
     *             z: 0.5
     *         },
     *         direction: {
     *             x: 1.0,
     *             y: 0.0,
     *             z: 0.0
     *         }
     *     }],
     *     bitmaps: [],
     *     snapshot: {
     *         snapshot_type: png,
     *         snapshot_data: "data:image/png;base64,......"
     *     },
     *     components: {
     *         visibility: {
     *             default_visibility: false,
     *             exceptions: [{
     *                 ifc_guid: 4$cshxZO9AJBebsni$z9Yk,
     *                 originating_system: xeokit.io,
     *                 authoring_tool_id: xeokit/v1.0
     *             }]
     *        },
     *         selection: [{
     *            ifc_guid: "4$cshxZO9AJBebsni$z9Yk",
     *         }]
     *     }
     * }
     */
    saveBCFViewpoint(options) {
        return this._bcfViewpointsPlugin.getViewpoint(options);
    }

    /**
     * Sets viewer state to the given BCF viewpoint.
     *
     * This assumes that the viewer currently contains the same project and model(s) that were loaded at the time that the
     * viewpoint was originally saved (the BCF viewpoint specification does not contain that information).
     *
     * Note that xeokit's {@link Camera#look} is the **point-of-interest**, whereas the BCF ````camera_direction```` is a
     * direction vector. Therefore, when loading a BCF viewpoint, we set {@link Camera#look} to the absolute position
     * obtained by offsetting the BCF ````camera_view_point````  along ````camera_direction````.
     *
     * When loading a viewpoint, we also have the option to find {@link Camera#look} as the closest point of intersection
     * (on the surface of any visible and pickable {@link Entity}) with a 3D ray fired from ````camera_view_point```` in
     * the direction of ````camera_direction````.
     *
     * @param {*} bcfViewpoint  BCF JSON viewpoint object or "reset" / "RESET" to reset the viewer, which clears SectionPlanes,
     * shows default visible entities and restores camera to initial default position.
     * @param {*} [options] Options for setting the viewpoint.
     * @param {Boolean} [options.rayCast=true] When ````true```` (default), will attempt to set {@link Camera#look} to the closest
     * point of surface intersection with a ray fired from the BCF ````camera_view_point```` in the direction of ````camera_direction````.
     * @param {Boolean} [options.immediate=true] When ````true```` (default), immediately set camera position.
     * @param {Boolean} [options.duration] Flight duration in seconds.  Overrides {@link CameraFlightAnimation#duration}.
     * @param {Boolean} [options.reset=true] When ````true```` (default), set {@link Entity#xrayed} and {@link Entity#highlighted} ````false```` on all scene objects.
     * @param {Boolean} [options.reverseClippingPlanes=false] When ````true````, clipping planes are reversed (https://github.com/buildingSMART/BCF-XML/issues/193)
     * @param {Boolean} [options.updateCompositeObjects=false] When ````true````, then when visibility and selection updates refer to composite objects (eg. an IfcBuildingStorey),
     * then this method will apply the updates to objects within those composites.
     */
    loadBCFViewpoint(bcfViewpoint, options) {
        if (!bcfViewpoint) {
            this.error("loadBCFViewpoint() - Argument expected: bcfViewpoint");
            return;
        }
        this._orthoMode.setActive(this.viewer.camera.projection === "ortho");
        this._bcfViewpointsPlugin.setViewpoint(bcfViewpoint, options);
    }

    /**
     * Resets the view.
     *
     * This resets object appearances (visibility, selection, highlight and X-ray), sets camera to
     * default position, and removes section planes.
     */
    resetView() {
        this._resetAction.reset();
    }

    /**
     * Enables or disables the various buttons and controls throughout the viewer.
     *
     * This also makes various buttons appear disabled.
     *
     * @param {Boolean} enabled Whether or not to disable the controls.
     */
    setControlsEnabled(enabled) {

        // Explorer

        // Models tab is always enabled
        // Enable/disable main explorer explorers if they exist
        if (this._objectsExplorer) {
            this._objectsExplorer.setEnabled(enabled);
        }
        if (this._classesExplorer) {
            this._classesExplorer.setEnabled(enabled);
        }
        if (this._storeysExplorer) {
            this._storeysExplorer.setEnabled(enabled);
        }
        
        // Enable/disable model explorer explorers if they exist
        if (this._modelObjectsExplorer) {
            this._modelObjectsExplorer.setEnabled(enabled);
        }
        if (this._modelClassesExplorer) {
            this._modelClassesExplorer.setEnabled(enabled);
        }
        if (this._modelStoreysExplorer) {
            this._modelStoreysExplorer.setEnabled(enabled);
        }

        // Toolbar

        this._resetAction.setEnabled(enabled);
        this._fitAction.setEnabled(enabled);
        this._threeDMode.setEnabled(enabled);
        this._orthoMode.setEnabled(enabled);
        this._firstPersonMode.setEnabled(enabled);
        this._queryTool.setEnabled(enabled);
        this._hideTool.setEnabled(enabled);
        this._selectionTool.setEnabled(enabled);
        this._marqueeSelectionTool.setEnabled(enabled);
        this._showSpacesMode.setEnabled(enabled);
        if (this._enableMeasurements) {
            this._measureDistanceTool.setEnabled(enabled);
            this._measureAngleTool.setEnabled(enabled);
        }
        this._sectionTool.setEnabled(enabled);

        if (this._enablePropertiesInspector) {
            this._propertiesInspector.setEnabled(enabled);
        }
    }

    /**
     * Sets whether or not keyboard camera control is enabled.
     *
     * This is useful when we don't want key events over the canvas to clash with other UI elements outside the canvas.
     *
     * Default value is ````true````.
     *
     * @param {Boolean} enabled Set ````true```` to enable keyboard input.
     */
    setKeyboardEnabled(enabled) {
        this.viewer.scene.input.keyboardEnabled = enabled;
    }

    /**
     * Gets whether keyboard camera control is enabled.
     *
     * This is useful when we don't want key events over the canvas to clash with other UI elements outside the canvas.
     *
     * Default value is ````true````.
     *
     * @returns {Boolean} Returns ````true```` if keyboard input is enabled.
     */
    getKeyboardEnabled() {
        return this.viewer.scene.input.keyboardEnabled;
    }

    /**
     * Clears sections.
     *
     * Sections are the slicing planes, that we use to section models in order to see interior structures.
     */
    clearSections() {
        this._sectionTool.clear();
    }

    /**
     * Disables all sections.
     */
    disableSections() {
        this._sectionTool.disableSections();
    }

    /**
     * Enables all sections.
     */
    enableSections() {
        this._sectionTool.enableSections();
    }

    /**
     * Inverts the direction of sections.
     */
    flipSections() {
        this._sectionTool.flipSections();
    }

    /**
     * Hides the section edition control, if currently shown.
     */
    hideSectionEditControl() {
        this._sectionTool.hideControl();
    }

    /**
     * Returns the number of sections that currently exist.
     *
     * sections are the sliceing planes, that we use to slice models in order to see interior structures.
     *
     * @returns {Number} The number of sections.
     */
    getNumSections() {
        return this._sectionTool.getNumSections();
    }

    /**
     * Gets if measurements are enabled for this BIMViewer.
     * This is immutable and is set via the BIMViewer constructor.
     * @returns {boolean}
     */
    getEnableMeasurements() {
        return this._enableMeasurements;
    }

    /**
     * Clears measurements.
     */
    clearMeasurements() {
        if (this._enableMeasurements) {
            this._measureDistanceTool.clear();
            this._measureAngleTool.clear();
        }
    }

    /**
     * Returns the number of measurements that currently exist.
     *
     * @returns {Number} The number of measurements.
     */
    getNumMeasurements() {
        return this._measureDistanceTool.getNumMeasurements() + this._measureAngleTool.getNumMeasurements();
    }

    /**
     * Sets the visibility of axis lines for measurements.
     *
     * So far, this only includes distance measurements. This is not relevant for angle measurements.
     *
     * @param {Boolean} axisVisible Set `true` to show axis wires, else `false` to hide them.
     */
    setMeasurementsAxisVisible(axisVisible) {
        if (this._enableMeasurements) {
            this._measureDistanceTool.setMeasurementsAxisVisible(axisVisible);
        }
    }

    /**
     * Gets the visibility of axis lines for measurements.
     *
     * So far, this only includes distance measurements. This is not relevant for angle measurements.
     *
     * @returns {Boolean}  `true` if axis wires are visible, else `false` if hidden.
     */
    getMeasurementsAxisVisible() {
        return (this._enableMeasurements) ? this._measureDistanceTool.getMeasurementsAxisVisible() : false;
    }

    /**
     * Sets whether pointer snapping is enabled for measurements.
     *
     * @param {Boolean} snappingEnabled Set `true` to enable snapping, else `false` to disable.
     */
    setMeasurementsSnappingEnabled(snappingEnabled) {
        if (this._enableMeasurements) {
            this._measureDistanceTool.setSnappingEnabled(snappingEnabled);
        }
    }

    /**
     * Gets whether pointer snapping is enabled for measurements.
     *
     * @returns {Boolean} `true` if snapping is enabled, else `false` if disabled.
     */
    getMeasurementsSnappingEnabled() {
        return (this._enableMeasurements) ? this._measureDistanceTool.getSnappingEnabled() : false;
    }

    /**
     * Destroys the viewer, freeing all resources.
     */
    destroy() {
        this.viewer.destroy();
        this._bcfViewpointsPlugin.destroy();
        this._canvasContextMenu.destroy();
        this._objectContextMenu.destroy();
    }
}

export {BIMViewer};
