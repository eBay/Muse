declare function _exports(params: {
    pluginName: string;
    version: string;
    author?: string;
    msg?: string;
}): Promise<{
    pid: any;
    releases: Uint8Array;
}>;
export = _exports;
