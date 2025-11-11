import { Viewer } from "@xeokit/xeokit-sdk/dist/xeokit-sdk.es.js";
import { Server } from "./server/Server.js";
import { Controller } from "./Controller.js";

export class BIMViewer extends Controller {
  constructor(server: Server, cfg?: any);
  
  viewer: Viewer;
  
  // Methods that are used in ExtendedBIMViewer
  saveBCFViewpoint(cfg?: any): any;
  loadBCFViewpoint(viewpoint: any, options?: any): void;
  
  // Add other methods as needed
  loadProject(projectId: string, done?: () => void, error?: (errorMsg: string) => void): void;
  destroy(): void;
  customizeToolbar(): void;
}