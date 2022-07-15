declare function _exports(options?: {}): {
    name: string;
    museCore: {
        registry: {
            storage: FileStorage;
        };
    };
};
export = _exports;
import FileStorage = require("../storage/FileStorage");
