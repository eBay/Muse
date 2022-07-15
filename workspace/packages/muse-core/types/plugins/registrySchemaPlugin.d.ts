declare function _exports(): {
    name: string;
    museCore: {
        registry: {
            storage: {
                beforeSet: (ctx: any, key: any, value: any) => Promise<void>;
            };
        };
    };
};
export = _exports;
