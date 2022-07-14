export const deletePluginVariable: (params: {
    pluginName: string;
    variables: any[];
    appName: string;
    envNames: any[];
    author?: string;
}) => any;
export const setPluginVariable: (params: {
    pluginName: string;
    variables: any[];
    appName: string;
    envNames: any[];
    author?: string;
}) => any;
export const deleteAppVariable: (params: {
    appName: string;
    variables: any[];
    envNames: any[];
    author?: string;
}) => any;
export const setAppVariable: (params: {
    appName: string;
    variables: any[];
    envNames: any[];
    author?: string;
}) => any;
export const environmentVariablesPlugin: () => {
    name: string;
    museCore: {
        processMuse: (museObj: any) => void;
    };
    museCli: {
        processProgram: (program: any) => void;
    };
};
