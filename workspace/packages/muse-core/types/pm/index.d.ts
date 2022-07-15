export const createPlugin: (params: {
    pluginName: string;
    type?: string;
    author?: string;
    options?: any;
    msg?: string;
}) => any;
export const getPlugin: (pluginName: any) => Buffer;
export const updatePlugin: (params: {
    pluginName: string;
    appName?: string;
    envName?: string;
    changes?: {
        set?: any;
        unset?: any;
        remove?: any;
        push?: any;
    };
    author?: string;
    msg?: string;
}) => any;
export const getPlugins: (params: any) => Buffer[];
export const buildPlugin: (params?: any) => Promise<{
    error: any;
}>;
export const deletePlugin: (params: {
    pluginName: string;
    author?: string;
    msg?: string; /** @member {function} getDeployedPlugin */
}) => Promise<{
    error: any;
}>;
export const getDeployedPlugin: (appName: string, envName: string, pluginName: string) => any;
export const getDeployedPlugins: (appName: string, envName: string) => any[];
export const deployPlugin: (params: {
    appName: string;
    envMap: {
        "": {
            pluginName: string;
            type: string;
            version?: string;
            options?: any;
        }[];
    };
}) => any;
export const checkDependencies: (params: any) => Promise<{
    dev: any[];
    dist: any[];
}>;
export const undeployPlugin: (params: {
    appName: string;
    envName: string;
    pluginName: string;
    author?: string;
    msg?: string;
}) => any;
export const releasePlugin: (params: {
    pluginName: string;
    version?: string;
    buildDir?: string;
    author?: string;
    msg?: string;
    options?: any;
}) => any;
export const getReleases: (pluginName: any) => Buffer;
export const checkReleaseVersion: (params: any) => Promise<any>;
export const deleteRelease: (params: {
    pluginName: string;
    version: string;
    author?: string;
    msg?: string;
}) => Promise<any>;
export const unregisterRelease: (params: {
    pluginName: string;
    version: string;
    author?: string;
    msg?: string;
}) => Promise<{
    pid: any;
    releases: Uint8Array;
}>;
export const getReleaseAssets: (params: {
    pluginName: string;
    version: string;
    author?: string; /** @member {function} getDeployedPlugin */
    msg?: string;
}) => any[];
