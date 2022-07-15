export declare const getApp: (appName: string) => any;
export declare const getApps: (params?: any) => any[];
export declare const createApp: (params?: {
    appName: string;
    author?: string;
}) => Promise<any>;
export declare const updateApp: (params: {
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
export declare const deleteApp: (params?: {
    appName: string;
    author?: string;
}) => Promise<{
    error: any;
}>;
export declare const createEnv: (params: {
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
export declare const updateEnv: any;
export declare const deleteEnv: (params: {
    appName: string;
    envName: string;
    author?: string;
}) => any;
declare const _export: (params?: ExportArgument) => Promise<void>;
export { _export as export };
