declare function _exports(options?: {}): {
    name: string;
    museCore: {
        assets: {
            storage: FileStorage;
        };
    };
};
export = _exports;
import FileStorage = require("../storage/FileStorage");
