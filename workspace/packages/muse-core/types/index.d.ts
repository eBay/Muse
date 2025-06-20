export const logger: {};
export function registerPlugin(p: any): void;
export const am: {
    getApp: (appName: string) => any;
    getApps: (params?: any) => any[];
    createApp2: (params?: {
        appName: string;
        author?: string;
    }) => Promise<any>;
    updateApp: (params: {
        appName: string;
        changes?: {
            set?: any;
            unset?: any;
            remove?: any;
            push?: any;
        };
        author: string;
        msg: string;
    }) => any;
    deleteApp: (params?: {
        appName: string;
        author?: string;
    }) => Promise<{
        error: any;
    }>;
    createEnv: (params: {
        appName: string;
        envName: string;
        author?: string;
    }) => Promise<{
        app: any;
        changes: {
            set: {
                path: string;
                value: any;
            };
        };
        error: any;
    }>;
    updateEnv: any;
    deleteEnv: (params: {
        appName: string;
        envName: string;
        author?: string;
    }) => any;
    export: (params?: ExportArgument) => Promise<void>;
};
export const pm: {
    createPlugin: (params: {
        pluginName: string;
        type?: string;
        author?: string;
        options?: any;
        msg?: string;
    }) => any;
    getPlugin: (pluginName: any) => Buffer;
    updatePlugin: (params: {
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
    getPlugins: (params: any) => Buffer[];
    buildPlugin: (params?: any) => Promise<{
        error: any;
    }>;
    deletePlugin: (params: {
        pluginName: string;
        author?: string;
        msg?: string;
    }) => Promise<{
        error: any;
    }>;
    getDeployedPlugin: (appName: string, envName: string, pluginName: string) => any;
    getDeployedPlugins: (appName: string, envName: string) => any[];
    deployPlugin: (params: {
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
    checkDependencies: (params: any) => Promise<{
        dev: any[];
        dist: any[];
    }>;
    undeployPlugin: (params: {
        appName: string;
        envName: string;
        pluginName: string;
        author?: string;
        msg?: string;
    }) => any;
    releasePlugin: (params: {
        pluginName: string;
        version?: string;
        buildDir?: string;
        author?: string;
        msg?: string;
        options?: any;
    }) => any;
    getReleases: (pluginName: any) => Buffer;
    checkReleaseVersion: (params: any) => Promise<any>;
    deleteRelease: (params: {
        pluginName: string;
        version: string;
        author?: string;
        msg?: string;
    }) => Promise<any>;
    unregisterRelease: (params: {
        pluginName: string;
        version: string;
        author?: string;
        msg?: string;
    }) => Promise<{
        pid: any;
        releases: Uint8Array;
    }>;
    getReleaseAssets: (params: {
        pluginName: string;
        version: string;
        author?: string;
        msg?: string;
    }) => any[];
};
export const req: {
    createRequest: (params?: {
        type: string;
        payload: any;
        options: string;
        author?: string;
        msg?: string;
    }) => request;
    completeRequest: ({ requestId, msg, author }: {
        requestId: string;
        author?: string;
        msg?: string;
    }) => request;
    deleteRequest: (params: {
        requestId: string;
        author?: string;
        msg?: string;
    }) => request;
    getRequest: (requestId: string) => Buffer;
    getRequests: (params?: any) => any[];
    updateRequest: (params: {
        requestId: string;
        changes: any;
        author?: string;
        msg?: string;
    }) => request;
    updateStatus: (params: {
        requestId: string;
        status: string;
        author?: string;
        msg?: string;
    }) => request;
    deleteStatus: (params: {
        requestId: string;
        status: string;
        author?: string;
        msg?: string;
    }) => request;
};
export const data: typeof import("./data");
export const storage: {
    cache: any;
    assets: import("./storage/Storage");
    registry: import("./storage/Storage");
    FileStorage: typeof import("./storage/FileStorage");
    Storage: typeof import("./storage/Storage");
};
export const utils: {
    getPluginId: (name: any) => any;
    getPluginName: (pluginId: any) => any;
    asyncInvoke: (extPoint: any, ...args: any[]) => Promise<any[]>;
    asyncInvokeFirst: (extPoint: any, ...args: any[]) => Promise<any>;
    wrappedAsyncInvoke: (extPath: any, methodName: any, ...args: any[]) => Promise<any>;
    jsonByYamlBuff: (b: any) => any;
    batchAsync: (tasks: any, { size, msg }?: {
        size?: number;
        msg?: string;
    }) => Promise<any[]>;
    makeRetryAble: (executor: any, { times, checker, msg }?: {
        times?: number;
        checker?: () => void;
        msg?: string;
    }) => (...args: any[]) => Promise<any>;
    getFilesRecursively: (dir: any) => Promise<any>;
    getExtPoint: (extPath: any, name: any) => any;
    genNewVersion: (oldVersion: any, verionType?: string) => string;
    updateJson: (obj: any, changes: any) => void;
    getMuseGlobal: (app: any, envName: any) => {
        appName: any;
        envName: any;
        plugins: any;
        bootPlugin: any;
    };
    doZip: (sourceDir: any, zipFile: any) => Promise<any>;
    parseRegistryKey: (key: any) => {
        type: string;
        appName: any;
        pluginName?: undefined;
        envName?: undefined;
        id?: undefined;
    } | {
        type: string;
        pluginName: any;
        appName?: undefined;
        envName?: undefined;
        id?: undefined;
    } | {
        type: string;
        pluginName: any;
        appName: any;
        envName: any;
        id?: undefined;
    } | {
        type: string;
        id: any;
        appName?: undefined;
        pluginName?: undefined;
        envName?: undefined;
    };
    validate: (schema: any, data: any) => void;
    osUsername: string;
    defaultAssetStorageLocation: string;
    defaultRegistryStorageLocation: string;
};
import config = require("./config");
import plugin = require("js-plugin");
export { config, plugin };
