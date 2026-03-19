import fs from 'fs-extra';
import path from 'path';
import { init, parse } from 'es-module-lexer';

/**
 * Vite plugin for generating lib-manifest.json in dev mode.
 * This tracks modules during dev server transformations.
 */
export default function museLibManifestDevPlugin(options = {}) {
  const { pkgJson, museConfig } = options;
  const excludedLibs = museConfig?.sharedLibs?.exclude || [];

  // Track modules and their exports
  const moduleExports = new Map();
  let isInitialized = false;

  return {
    name: 'muse-lib-manifest-dev',
    enforce: 'post', // Run after other transforms

    async buildStart() {
      // Initialize es-module-lexer
      if (!isInitialized) {
        await init;
        isInitialized = true;
      }

      // Clear previous data
      moduleExports.clear();
    },

    async transform(code, id) {
      // Skip virtual modules, node builtins, and external modules
      if (id.startsWith('\0') || id.startsWith('node:') || id.includes('/node_modules/')) {
        return null;
      }

      // Skip non-JS/TS files
      if (!id.match(/\.(m?[jt]sx?)$/)) {
        return null;
      }

      // Find package root for this module
      const modulePackageRoot = findPackageRoot(id);
      if (!modulePackageRoot) return null;

      // Read module's package.json
      const modulePackageJsonPath = path.join(modulePackageRoot, 'package.json');
      if (!fs.existsSync(modulePackageJsonPath)) return null;

      const modulePackageJson = fs.readJsonSync(modulePackageJsonPath);
      if (!modulePackageJson.name || !modulePackageJson.version) return null;

      // Check if module is excluded
      if (excludedLibs.includes(modulePackageJson.name)) return null;

      // Build MUSE module ID
      const relativePath = path.relative(modulePackageRoot, id);
      const museModuleId = `${modulePackageJson.name}@${modulePackageJson.version}/${relativePath}`
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

      try {
        // Parse the code to extract exports
        const [, exports] = parse(code);

        const exportNames = [];

        // Extract named exports
        for (const exp of exports) {
          if (exp.n) {
            exportNames.push(exp.n);
          }
        }

        // Check for default export
        const hasDefaultExport = code.includes('export default') ||
                                exports.some(exp => exp.n === 'default');
        if (hasDefaultExport && !exportNames.includes('default')) {
          exportNames.push('default');
        }

        if (exportNames.length > 0) {
          moduleExports.set(museModuleId, {
            id: museModuleId,
            exports: exportNames,
            buildMeta: {
              providedExports: exportNames,
            },
          });
        }
      } catch (err) {
        // If parsing fails, continue without tracking this module
        console.warn(`Failed to parse exports for ${id}:`, err.message);
      }

      return null; // Don't transform the code
    },

    async buildEnd() {
      // Generate lib-manifest.json after all modules are processed
      const content = {};
      for (const [id, data] of moduleExports) {
        content[id] = data;
      }

      const manifest = {
        name: pkgJson.name,
        type: 'lib',
        content,
      };

      // Output to dev location
      const targetPath = path.join(process.cwd(), 'node_modules/.muse/dev/lib-manifest.json');
      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, JSON.stringify(manifest, null, 2), 'utf8');

      console.log(`✓ Generated lib-manifest.json at ${targetPath}`);
      console.log(`  Tracked ${Object.keys(content).length} shared modules`);
    },
  };
}

/**
 * Find the package root directory for a given module path
 */
function findPackageRoot(modulePath) {
  let currentDir = path.dirname(modulePath);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}
