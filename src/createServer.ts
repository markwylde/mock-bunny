import http from 'node:http';
import url from 'node:url';

const storage = new Map<string, string>();

interface ServerOptions {
  storageZoneName?: string;
  accessKey?: string;
}

export function createServer(options: ServerOptions = {}) {
  const { storageZoneName = 'test-storage', accessKey = 'test-access-key' } = options;

  const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url || '');
    const pathName = (parsedUrl.pathname || '').replace(`/${storageZoneName}/`, '');

    if (req.headers['accesskey'] !== accessKey) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ HttpCode: 403, Message: 'Invalid access key' }));
    }

    switch (req.method) {
      case 'GET':
        handleGet(pathName, res);
        break;
      case 'PUT':
        await handlePut(pathName, req, res);
        break;
      case 'DELETE':
        handleDelete(pathName, res);
        break;
      default:
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ HttpCode: 405, Message: 'Method not allowed' }));
    }
  });

  return server;
}

function handleGet(pathName: string, res: http.ServerResponse) {
  if (storage.has(pathName)) {
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(storage.get(pathName));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
  }
}

async function handlePut(pathName: string, req: http.IncomingMessage, res: http.ServerResponse) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
  }
  storage.set(pathName, body);
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ HttpCode: 201, Message: 'File created successfully' }));
}

function handleDelete(pathName: string, res: http.ServerResponse) {
  if (storage.has(pathName)) {
    storage.delete(pathName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 200, Message: 'File deleted successfully' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
  }
}

export default createServer;
