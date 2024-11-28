export const assetsFileStoragePlugin: (options?: {}) => {
    name: string;
    museCore: {
        assets: {
            storage: import("../storage/FileStorage");
        };
    };
};
export const assetsLruCachePlugin: (options?: {}) => {
    name: string;
    museCore: {
        assets: {
            storage: {
                cache: import("../cache/MuseLruCache");
            };
        };
    };
};
export const registryFileStoragePlugin: (options?: {}) => {
    name: string;
    museCore: {
        registry: {
            storage: import("../storage/FileStorage");
        };
    };
};
export const dataCachePlugin: () => {
    name: string;
    museCore: {
        data: {
            cache: import("../storage/FileStorage");
        };
    };
};
export const environmentVariablesPlugin: () => {
    name: string;
    museCore: {
        processMuse: (museObj: any) => void;
    };
    museCli: {
        processProgram: (program: any) => void;
    };
};
export const registrySchemaPlugin: () => {
    name: string;
    museCore: {
        registry: {
            storage: {
                beforeSet: (ctx: any, key: any, value: any) => Promise<void>;
            };
        };
    };
};
