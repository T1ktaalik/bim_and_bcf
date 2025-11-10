import {Controller} from "../Controller.js";

/** @private */
class PropertiesInspector extends Controller {

    constructor(parent, cfg = {}) {

        super(parent);

        // propertiesTabElement is now optional since we're using buttons/headers instead of tabs
        // We'll use a propertiesButtonElement or propertiesHeaderElement instead if provided
        this._propertiesTabElement = cfg.propertiesTabElement; // For backward compatibility
        this._propertiesButtonElement = cfg.propertiesButtonElement; // New parameter for button element
        this._propertiesHeaderElement = cfg.propertiesHeaderElement; // New parameter for header element

        if (!this._propertiesTabElement && !this._propertiesButtonElement && !this._propertiesHeaderElement) {
            throw "Missing config: propertiesTabElement or propertiesButtonElement or propertiesHeaderElement";
        }

        if (!cfg.propertiesElement) {
            throw "Missing config: propertiesElement";
        }

        this._metaObject = null;

        this._propertiesElement = cfg.propertiesElement;
        
        // Try to find the tab button for backward compatibility
        if (this._propertiesTabElement) {
            this._propertiesTabButtonElement = this._propertiesTabElement.querySelector(".xeokit-tab-btn");
            if (!this._propertiesTabButtonElement) {
                throw "Missing DOM element: ,xeokit-tab-btn";
            }
        }

        this._onModelLoaded = this.viewer.scene.on("modelLoaded", (modelId) => {
            // Handle model loaded event if needed
        });

        this._onModelUnloaded = this.viewer.scene.on("modelUnloaded", (modelId) => {
            if (this._metaObject) {
                const metaModels = this._metaObject.metaModels;
                for (let i = 0, len = metaModels.length; i < len; i++) {
                    if (metaModels[i].id === modelId) {
                        this.clear();
                        return;
                    }
                }
            }
        });

        this.bimViewer.on("reset", () => {
            this.clear();
        });

        document.addEventListener('click', this._clickListener = (e) => {
            if (!e.target.matches('.xeokit-accordion .xeokit-accordion-button')) {
                return;
            } else {
                const container = e.target.parentElement;
                const panel = container.querySelector('.xeokit-accordion-panel');

                if (!container.classList.contains('active')) {
                    // Opening the panel
                    container.classList.add('active');

                    // Calculate the full height of the content
                    const scrollHeight = panel.scrollHeight;

                    // Set the height to the full content height
                    panel.style.height = scrollHeight + 'px';
                } else {
                    // Closing the panel
                    // First set explicit height based on current height
                    panel.style.height = panel.scrollHeight + 'px';

                    // Force a reflow
                    panel.offsetHeight;

                    // Now set height to 0 for smooth animation
                    panel.style.height = '0px';

                    // Remove active class after transition completes
                    panel.addEventListener('transitionend', function removeActive() {
                        container.classList.remove('active');
                        panel.removeEventListener('transitionend', removeActive);
                    }, { once: true });
                }
            }
        });

        // Add a resize listener to handle content changes
        window.addEventListener('resize', () => {
            const activeContainers = document.querySelectorAll('.xeokit-accordion-container.active');

            activeContainers.forEach(container => {
                const panel = container.querySelector('.xeokit-accordion-panel');

                // Temporarily set height to auto to measure true height
                const originalHeight = panel.style.height;
                panel.style.height = 'auto';
                const scrollHeight = panel.scrollHeight;

                // Set back to calculated height
                panel.style.height = scrollHeight + 'px';
            });
        });

        this.clear();
    }

    showObjectPropertySets(objectId) {
        const metaObject = this.viewer.metaScene.metaObjects[objectId];
        if (!metaObject) {
            return;
        }
        const propertySets = metaObject.propertySets;
        if (propertySets && propertySets.length > 0) {
            this._setPropertySets(metaObject, propertySets);
        } else {
            this._setPropertySets(metaObject);
        }
        this._metaObject = metaObject;
    }

    clear() {
        const html = [],
            localizedText = this.viewer.localeService.translate('propertiesInspector.noObjectSelectedWarning') || 'No object inspected. Right-click or long-tab an object and select \'Inspect Properties\' to view its properties here.';
        html.push(`<div class="element-attributes">`);
        html.push(`<p class="xeokit-i18n subsubtitle no-object-selected-warning" data-xeokit-i18n="propertiesInspector.noObjectSelectedWarning">${localizedText}</p>`);
        html.push(`</div>`);
        const htmlStr = html.join("");
       this._propertiesElement.innerHTML = htmlStr;
    }

    _setPropertySets(metaObject, propertySets) {
        const html = [];
        html.push(`<div class="element-attributes">`);
        if (!metaObject) {
            html.push(`<p class="subsubtitle">No object selected</p>`);
        } else {
            html.push('<table class="xeokit-table">');
            html.push(`<tr><td class="td1">Name:</td><td class="td2">${metaObject.name}</td></tr>`);
            if (metaObject.type) {
                html.push(`<tr><td class="td1">Class:</td><td class="td2">${metaObject.type}</td></tr>`);
            }
            html.push(`<tr><td class="td1">UUID:</td><td class="td2">${metaObject.originalSystemId}</td></tr>`);
            html.push(`<tr><td class="td1">Viewer ID:</td><td class="td2">${metaObject.id}</td></tr>`);
            const attributes = metaObject.attributes;
            if (attributes) {
                for (let key in attributes) {
                    html.push(`<tr><td class="td1">${capitalizeFirstChar(key)}:</td><td class="td2">${attributes[key]}</td></tr>`);
                }
            }
            html.push('</table>');
            if (!propertySets || propertySets.length === 0) {
                const localizedText = this.viewer.localeService.translate('propertiesInspector.noPropSetWarning') || 'No properties sets found for this object';
                html.push(`<p class="xeokit-i18n subtitle xeokit-no-prop-set-warning" data-xeokit-i18n="propertiesInspector.noPropSetWarning">${localizedText}</p>`);
                html.push(`</div>`);
            } else {
                html.push(`</div>`);
                html.push(`<div class="xeokit-accordion">`);
                for (let i = 0, len = propertySets.length; i < len; i++) {
                    const propertySet = propertySets[i];
                    const properties = propertySet.properties || [];
                    if (properties.length > 0) {
                        html.push(`<div class="xeokit-accordion-container">
                                        <p class="xeokit-accordion-button"><span></span>${propertySet.name}</p>                                       
                                        <div class="xeokit-accordion-panel">                                           
                                            <table class="xeokit-table"><tbody>`);
                        for (let i = 0, len = properties.length; i < len; i++) {
                            const property = properties[i];
                            html.push(`<tr><td class="td1">${property.name || property.label}:</td><td class="td2">${property.value}</td></tr>`);
                        }
                        html.push(`</tbody></table>
                        </div>
                        </div>`);
                    } else {
                        //  html.push(`<p class="subtitle">No properties sets found.</p>`);
                    }
                }
                html.push(`</div>`);
            }
        }
        this._propertiesElement.innerHTML = html.join("");
    }

    setEnabled(enabled) {
        if (!enabled) {
            // Check for the new header element first, then button element, then fall back to the old tab button
            if (this._propertiesHeaderElement) {
                this._propertiesHeaderElement.classList.add("disabled");
            } else if (this._propertiesButtonElement) {
                this._propertiesButtonElement.classList.add("disabled");
            } else if (this._propertiesTabButtonElement) {
                this._propertiesTabButtonElement.classList.add("disabled");
            }
        } else {
            // Check for the new header element first, then button element, then fall back to the old tab button
            if (this._propertiesHeaderElement) {
                this._propertiesHeaderElement.classList.remove("disabled");
            } else if (this._propertiesButtonElement) {
                this._propertiesButtonElement.classList.remove("disabled");
            } else if (this._propertiesTabButtonElement) {
                this._propertiesTabButtonElement.classList.remove("disabled");
            }
        }
    }

    destroy() {
        super.destroy();
        this.viewer.scene.off(this._onModelUnloaded);
        document.removeEventListener('click', this._clickListener);
    }
}

function capitalizeFirstChar(str) {
    if (!str) {
        return str;
    }
   return str.charAt(0).toUpperCase() + str.slice(1);
}

export {PropertiesInspector};