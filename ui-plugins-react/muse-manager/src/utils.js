export const getPluginId = name => (name.startsWith('@') ? name.replace('/', '.') : name);
