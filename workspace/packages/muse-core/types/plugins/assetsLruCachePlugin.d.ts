declare function _exports(options?: {}): {
    name: string;
    museCore: {
        assets: {
            storage: {
                cache: import("../cache/MuseLruCache");
            };
        };
    };
};
export = _exports;
