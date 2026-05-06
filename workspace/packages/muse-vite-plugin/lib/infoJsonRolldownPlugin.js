import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { gzipSizeSync } from 'gzip-size';
import devUtils from '@ebay/muse-dev-utils/lib/utils.js';

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function getGitSha() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function extractLineCoverageFromCobertura(xmlPath) {
  try {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    // Extract line-rate attribute from the root <coverage> element
    const match = xml.match(/<coverage[^>]+line-rate="([^"]+)"/);
    if (match) {
      return parseFloat(match[1]);
    }
  } catch {
    // file not found or unreadable
  }
  return null;
}

function extractLineCoverageFromClover(xmlPath) {
  try {
    const xml = fs.readFileSync(xmlPath, 'utf8');
    // Try lines/coveredlines first, fall back to statements/coveredstatements
    const byLines = xml.match(/<metrics[^>]+lines="(\d+)"[^>]*coveredlines="(\d+)"/);
    if (byLines) {
      const total = parseInt(byLines[1], 10);
      const covered = parseInt(byLines[2], 10);
      return total > 0 ? covered / total : 0;
    }
    const byStatements = xml.match(/<metrics[^>]+statements="(\d+)"[^>]*coveredstatements="(\d+)"/);
    if (byStatements) {
      const total = parseInt(byStatements[1], 10);
      const covered = parseInt(byStatements[2], 10);
      return total > 0 ? covered / total : 0;
    }
  } catch {
    // file not found or unreadable
  }
  return null;
}

function extractLineCoverage() {
  const cobertura = extractLineCoverageFromCobertura(
    path.join(process.cwd(), 'coverage/cobertura-coverage.xml'),
  );
  if (cobertura !== null) return cobertura;
  return extractLineCoverageFromClover(path.join(process.cwd(), 'coverage/clover.xml'));
}

function infoJsonRolldownPlugin() {
  const pkgJson = devUtils.getPkgJson();
  let viteConfig;
  let buildStartTime;

  return {
    name: 'rolldown-plugin-muse-info-json',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    buildStart() {
      buildStartTime = Date.now();
    },

    async generateBundle(options, bundle) {
      if (viteConfig.command === 'serve') return;

      const generateStart = Date.now();
      const buildTime = Date.now() - buildStartTime;

      // name
      const name = pkgJson.name;

      // deps: muse lib plugins this plugin depends on
      const museLibs = devUtils.getMuseLibs();
      const deps = museLibs.map((lib) => ({ name: lib.name, version: lib.version }));

      // git info
      const branch = getGitBranch();
      const sha = getGitSha();

      // repo: repository url from package.json
      const repo =
        typeof pkgJson.repository === 'string'
          ? pkgJson.repository
          : pkgJson.repository?.url || null;

      // esModule
      const esModule = pkgJson.type === 'module';

      // size: gzipped sizes
      let mainSize = 0;
      let chunksSize = 0;
      let mediaSize = 0;

      for (const b of Object.values(bundle)) {
        if (b.type === 'chunk') {
          const size = gzipSizeSync(b.code || '');
          if (b.isEntry) mainSize = size;
          chunksSize += size;
        } else if (b.type === 'asset' && b.fileName?.startsWith('assets/')) {
          mediaSize += gzipSizeSync(b.source || '');
        }
      }

      const size = {
        main: mainSize,
        chunks: chunksSize,
        media: mediaSize,
      };

      // type from package.json muse.type
      const type = pkgJson?.muse?.type || 'normal';

      // build the info object
      const info = {
        name,
        type,
        deps,
        branch,
        sha,
        repo,
        size,
        buildTime,
        esModule,
      };

      // ut: line coverage from coverage/cobertura-coverage.xml if it exists
      const lineCoverage = extractLineCoverage();
      if (lineCoverage !== null) {
        info.ut = { lineCoverage: Math.round(lineCoverage * 10000) / 100 };
      }

      this.emitFile({
        type: 'asset',
        fileName: 'info.json',
        source: JSON.stringify(info, null, 2),
      });

      console.log(`info.json generated in ${Date.now() - generateStart}ms`);
    },
  };
}

export default infoJsonRolldownPlugin;
