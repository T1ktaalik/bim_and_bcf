/**
 * Default server client which loads content for a {@link BIMViewer} via HTTP from the file system.
 *
 * A BIMViewer is instantiated with an instance of this class.
 *
 * To load content from an alternative source, instantiate BIMViewer with your own custom implementation of this class.
 */
declare class Server {
    /**
     * Constructs a Server.
     *
     * @param cfg Server configuration.
     * @param cfg.basePath Base path for projects.
     */
    constructor(cfg?: { basePath?: string });

    /**
     * Gets information on all available projects.
     *
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getProjects(done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets information for a project.
     *
     * @param projectId ID of the project.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getProject(projectId: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets metadata for a model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getMetadata(projectId: string, modelId: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets geometry for a model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getGeometry(projectId: string, modelId: string, done: (result: ArrayBuffer) => void, error: (message: string) => void): void;

    /**
     * Gets metadata for an object within a model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param objectId ID of the object.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getObjectInfo(projectId: string, modelId: string, objectId: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets existing issues for a model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getIssues(projectId: string, modelId: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets a JSON manifest file for a model that's split into multiple XKT files (and maybe also JSON metadata files).
     *
     * The manifest can have an arbitrary name, and will list all the XKT (and maybe separate JSON metada files)
     * that comprise the model.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param manifestName Filename of the manifest.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getSplitModelManifest(projectId: string, modelId: string, manifestName: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets one of the metadata files within a split model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param metadataFileName Filename of the metadata file.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getSplitModelMetadata(projectId: string, modelId: string, metadataFileName: string, done: (result: any) => void, error: (message: string) => void): void;

    /**
     * Gets one of the XKT geometry files within a split model within a project.
     *
     * @param projectId ID of the project.
     * @param modelId ID of the model.
     * @param geometryFileName Filename of the XKT geometry file.
     * @param done Callback through which the JSON result is returned.
     * @param error Callback through which an error message is returned on error.
     */
    getSplitModelGeometry(projectId: string, modelId: string, geometryFileName: string, done: (result: ArrayBuffer) => void, error: (message: string) => void): void;
}

export { Server };