import fs from 'fs-extra';
import path from 'path';

/**
 * Vite/Rollup plugin that generates lib-manifest.json for lib type plugins.
 * Similar to MuseManifestPlugin in muse-webpack-plugin.
 *
 * For lib plugins, this tracks all modules and their exports to enable
 * shared module resolution in consuming plugins.
 */
export default function museLibManifestPlugin(options = {}) {
  const { isDev, mode, pkgJson, museConfig } = options;
  const excludedLibs = museConfig?.sharedLibs?.exclude || [];

  // Track modules and their exports across the build
  const moduleExports = new Map();

  return {
    name: 'muse-lib-manifest',

    // Analyze modules to extract export information
    moduleParsed(moduleInfo) {
      // Skip modules without exports or that are external
      if (!moduleInfo.id || moduleInfo.isExternal) return;

      // Only process modules from the project source or dependencies
      // Skip virtual modules and node builtins
      if (moduleInfo.id.startsWith('\0') || moduleInfo.id.startsWith('node:')) {
        return;
      }

      // Find the package root for this module
      const modulePackageRoot = findPackageRoot(moduleInfo.id);
      if (!modulePackageRoot) return;

      // Read the module's package.json to get name and version
      const modulePackageJsonPath = path.join(modulePackageRoot, 'package.json');
      if (!fs.existsSync(modulePackageJsonPath)) return;

      const modulePackageJson = fs.readJsonSync(modulePackageJsonPath);
      if (!modulePackageJson.name || !modulePackageJson.version) return;

      // Check if this module is in the exclude list
      if (excludedLibs.includes(modulePackageJson.name)) return;

      // Build the MUSE module ID: package@version/relative/path
      const relativePath = path.relative(modulePackageRoot, moduleInfo.id);
      const museModuleId = `${modulePackageJson.name}@${modulePackageJson.version}/${relativePath}`
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

      // Extract export names from the module
      const exportNames = [];

      // Check for named exports
      if (moduleInfo.exports && Array.isArray(moduleInfo.exports)) {
        exportNames.push(...moduleInfo.exports.filter(name => name !== 'default'));
      }

      // Check for default export
      const hasDefaultExport = moduleInfo.exports?.includes('default') ||
                              moduleInfo.hasDefaultExport;
      if (hasDefaultExport) {
        exportNames.push('default');
      }

      // Store module export information
      if (exportNames.length > 0) {
        moduleExports.set(museModuleId, {
          id: museModuleId,
          exports: exportNames,
          buildMeta: {
            providedExports: exportNames,
          },
        });
      }
    },

    // Generate the manifest file after all modules are processed
    async generateBundle() {
      // Build the manifest content
      const content = {};
      for (const [id, data] of moduleExports) {
        content[id] = data;
      }

      // Create the manifest object
      const manifest = {
        name: pkgJson.name,
        type: 'lib',
        content,
      };

      // Determine output path based on dev vs production
      let targetPath;
      if (isDev) {
        // Dev mode: output to node_modules/.muse/dev/
        targetPath = path.join(process.cwd(), 'node_modules/.muse/dev/lib-manifest.json');
      } else {
        // Production mode: output to build/{mode}/
        const buildMode = mode === 'e2e-test' ? 'test' : mode === 'development' ? 'dev' : 'dist';
        targetPath = path.join(process.cwd(), 'build', buildMode, 'lib-manifest.json');
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(targetPath));

      // Write the manifest file
      const manifestContent = JSON.stringify(manifest, null, 2);
      await fs.writeFile(targetPath, manifestContent, 'utf8');

      console.log(`✓ Generated lib-manifest.json at ${targetPath}`);
      console.log(`  Tracked ${Object.keys(content).length} shared modules`);
    },
  };
}

/**
 * Find the package root directory for a given module path
 * by walking up the directory tree until finding a package.json
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
