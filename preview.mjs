import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = '/gorkilandproduction/';
const directory = fileURLToPath(new URL('./dist', import.meta.url));
const port = Number(process.argv[2] ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === base.slice(0, -1)) {
      res.writeHead(302, { Location: base }).end();
      return;
    }
    if (!url.pathname.startsWith(base)) {
      res.writeHead(404).end('Not found');
      return;
    }
    const path = resolve(directory, decodeURIComponent(url.pathname.slice(base.length)));
    if (path !== directory && !path.startsWith(directory + sep)) {
      res.writeHead(404).end('Not found');
      return;
    }
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    if (file !== path && !url.pathname.endsWith('/')) {
      res.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Превью: http://127.0.0.1:${port}${base}`));
