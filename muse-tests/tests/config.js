import path from 'path';

export const MUSE_REPO_REMOTE = path.join(__dirname, '../../');
export const WORKING_DIR = path.join(__dirname, '../tmp');
export const MUSE_REPO_LOCAL = path.join(WORKING_DIR, 'muse-repo');
export const VERDACCIO_STORAGE = path.join(WORKING_DIR, 'verdaccio-storage');
export const LOCAL_NPM_REGISTRY_PORT = 4873;
export const LOCAL_NPM_REGISTRY = `http://localhost:${LOCAL_NPM_REGISTRY_PORT}/`;
