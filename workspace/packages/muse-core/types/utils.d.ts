export function getPluginId(name: any): any;
export function getPluginName(pluginId: any): any;
export function asyncInvoke(extPoint: any, ...args: any[]): Promise<any[]>;
export function asyncInvokeFirst(extPoint: any, ...args: any[]): Promise<any>;
export function wrappedAsyncInvoke(extPath: any, methodName: any, ...args: any[]): Promise<any>;
export function jsonByYamlBuff(b: any): any;
export function batchAsync(tasks: any, { size, msg }?: {
    size?: number;
    msg?: string;
}): Promise<any[]>;
export function makeRetryAble(executor: any, { times, checker, msg }?: {
    times?: number;
    checker?: () => void;
    msg?: string;
}): (...args: any[]) => Promise<any>;
export function getFilesRecursively(dir: any): Promise<any>;
export function getExtPoint(extPath: any, name: any): any;
export function genNewVersion(oldVersion: any, verionType?: string): string;
export function updateJson(obj: any, changes: any): void;
export function getMuseGlobal(app: any, envName: any): {
    appName: any;
    envName: any;
    plugins: any;
    bootPlugin: any;
};
export function doZip(sourceDir: any, zipFile: any): Promise<any>;
export function parseRegistryKey(key: any): {
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
export function validate(schema: any, data: any): void;
export declare const osUsername: string;
export declare const defaultAssetStorageLocation: string;
export declare const defaultRegistryStorageLocation: string;
