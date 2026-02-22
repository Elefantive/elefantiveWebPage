// Dev helper: starts Hugo and auto-restarts it when files change.
// Run this instead of "hugo server":
//   node dev-watcher.js
//
// Also run in a separate terminal:
//   npx decap-server
//
// Uses polling (not OS file watchers) because Windows fs.watch is unreliable
// with changes from Node.js processes like Decap CMS proxy.

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Auto-detect Hugo path on Windows (WinGet installs it here)
const HUGO_DEFAULT = process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'hugo.exe')
  : 'hugo';
const HUGO_PATH = process.env.HUGO_PATH || HUGO_DEFAULT;
const HUGO_ARGS = ['server', '--disableFastRender'];
const POLL_MS = 1000;
const DEBOUNCE_MS = 1500;
const PORT_WAIT_MS = 1000;
const WATCH_DIRS = ['content', 'static', 'layouts'];
const WATCH_EXTENSIONS = /\.(md|html|toml|css|jpg|jpeg|png|gif|svg|webp|mp4|webm)$/i;

let hugoProcess = null;
let restartTimer = null;
let restarting = false;
let fileTimestamps = new Map();

// Recursively get all files with their modification times
function scanFiles(dir) {
  const results = new Map();
  if (!fs.existsSync(dir)) return results;

  function walk(d) {
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (WATCH_EXTENSIONS.test(entry.name)) {
          try {
            const stat = fs.statSync(full);
            results.set(full, stat.mtimeMs);
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  walk(dir);
  return results;
}

function killHugoSync() {
  try {
    execSync('taskkill /F /IM hugo.exe', { stdio: 'ignore' });
  } catch (e) {}
}

function startHugo() {
  console.log('\n[dev] Starting Hugo server...');
  hugoProcess = spawn(HUGO_PATH, HUGO_ARGS, {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  hugoProcess.on('error', (err) => {
    console.error('[dev] Failed to start Hugo:', err.message);
    process.exit(1);
  });

  hugoProcess.on('exit', (code) => {
    hugoProcess = null;
    if (!restarting) {
      console.log('[dev] Hugo exited with code', code);
    }
  });
}

function scheduleRestart(changedFile) {
  if (restartTimer) clearTimeout(restartTimer);

  restartTimer = setTimeout(() => {
    console.log('[dev] Change detected:', path.relative(__dirname, changedFile));
    console.log('[dev] Restarting Hugo...');
    restarting = true;

    killHugoSync();
    hugoProcess = null;

    // Wait for port 1313 to be released, then restart
    setTimeout(() => {
      restarting = false;
      startHugo();
    }, PORT_WAIT_MS);
  }, DEBOUNCE_MS);
}

// Poll for file changes
function pollForChanges() {
  let changed = false;
  let changedFile = '';

  for (const dir of WATCH_DIRS) {
    const fullDir = path.join(__dirname, dir);
    const current = scanFiles(fullDir);

    for (const [file, mtime] of current) {
      const prev = fileTimestamps.get(file);
      if (prev === undefined || prev !== mtime) {
        if (prev !== undefined) {
          // File was modified (not just first scan)
          changed = true;
          changedFile = file;
        }
        fileTimestamps.set(file, mtime);
      }
    }

    // Check for deleted files
    for (const [file] of fileTimestamps) {
      if (file.startsWith(fullDir) && !current.has(file)) {
        changed = true;
        changedFile = file;
        fileTimestamps.delete(file);
      }
    }
  }

  if (changed) {
    scheduleRestart(changedFile);
  }
}

// Initial scan to build baseline
function initialScan() {
  for (const dir of WATCH_DIRS) {
    const fullDir = path.join(__dirname, dir);
    const files = scanFiles(fullDir);
    for (const [file, mtime] of files) {
      fileTimestamps.set(file, mtime);
    }
  }
  console.log('[dev] Tracking', fileTimestamps.size, 'files');
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n[dev] Shutting down...');
  killHugoSync();
  process.exit(0);
});

console.log('[dev] Elefantive dev server');
console.log('[dev] Polling every', POLL_MS + 'ms for changes in:', WATCH_DIRS.join(', '));
console.log('');

// Scan, start Hugo, then poll
initialScan();
startHugo();
setInterval(pollForChanges, POLL_MS);
