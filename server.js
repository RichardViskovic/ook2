const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let lines = [];
let currentLine = 0;
let clients = [];

function send(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => res.write(payload));
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  if (req.method === 'GET' && pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('\n');
    clients.push(res);
    req.on('close', () => {
      clients = clients.filter(c => c !== res);
    });
    res.write(`event: loadText\ndata: ${JSON.stringify(lines)}\n\n`);
    res.write(`event: highlight\ndata: ${currentLine}\n\n`);
    return;
  }

  if (req.method === 'POST' && pathname === '/upload') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      lines = body.split(/\r?\n/);
      currentLine = 0;
      send('loadText', lines);
      send('highlight', currentLine);
      res.writeHead(200);
      res.end();
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/highlight') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      currentLine = Number(body);
      send('highlight', currentLine);
      res.writeHead(200);
      res.end();
    });
    return;
  }

  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === '.html'
        ? 'text/html'
        : ext === '.js'
        ? 'application/javascript'
        : ext === '.css'
        ? 'text/css'
        : 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
