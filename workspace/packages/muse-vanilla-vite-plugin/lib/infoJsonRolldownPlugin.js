import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { gzipSizeSync } from 'gzip-size';

function getPkgJson() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
  } catch {
    return {};
  }
}

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
  const pkgJson = getPkgJson();
  let viteConfig;
  let buildStartTime;

  return {
    name: 'rolldown-plugin-muse-vanilla-info-json',

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

      const name = pkgJson.name;
      const branch = getGitBranch();
      const sha = getGitSha();
      const repo =
        typeof pkgJson.repository === 'string'
          ? pkgJson.repository
          : pkgJson.repository?.url || null;
      const esModule = pkgJson.type === 'module';
      const type = pkgJson?.muse?.type || 'normal';

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

      const info = {
        name,
        type,
        deps: [],
        branch,
        sha,
        repo,
        size: { main: mainSize, chunks: chunksSize, media: mediaSize },
        buildTime,
        esModule,
      };

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
