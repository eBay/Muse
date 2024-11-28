declare function _exports(params: {
    pluginName: string;
    appName?: string;
    envName?: string;
    changes?: {
        set?: null | object | object[];
        unset?: null | object | object[];
        remove?: null | object | object[];
        push?: null | object | object[];
    };
    author?: string;
    msg?: string;
}): object;
export = _exports;
