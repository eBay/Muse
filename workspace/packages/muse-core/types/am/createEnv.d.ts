declare function _exports(params: {
    appName: string;
    envName: string;
    author?: string;
}): Promise<{
    app: any;
    changes: {
        set: {
            path: string;
            value: any;
        };
    };
    error: any;
}>;
export = _exports;
