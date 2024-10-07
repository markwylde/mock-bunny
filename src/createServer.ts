import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const storage = new Map<string, string>();

interface ServerOptions {
  storageZoneName?: string;
  accessKey?: string;
  uploadFolder?: string;
}

export function createServer(options: ServerOptions = {}) {
  const {
    storageZoneName = 'test-storage',
    accessKey = 'test-access-key',
    uploadFolder
  } = options;

  const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url || '');
    const pathName = (parsedUrl.pathname || '').replace(`/${storageZoneName}/`, '');

    if (req.headers['accesskey'] !== accessKey) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ HttpCode: 403, Message: 'Invalid access key' }));
    }

    switch (req.method) {
      case 'GET':
        await handleGet(pathName, res, uploadFolder);
        break;
      case 'PUT':
        await handlePut(pathName, req, res, uploadFolder);
        break;
      case 'DELETE':
        await handleDelete(pathName, res, uploadFolder);
        break;
      default:
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ HttpCode: 405, Message: 'Method not allowed' }));
    }
  });

  return server;
}

async function handleGet(pathName: string, res: http.ServerResponse, uploadFolder?: string) {
  if (uploadFolder) {
    const filePath = path.join(uploadFolder, pathName);
    try {
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      res.end(data);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
    }
  } else {
    if (storage.has(pathName)) {
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      res.end(storage.get(pathName));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
    }
  }
}

async function handlePut(pathName: string, req: http.IncomingMessage, res: http.ServerResponse, uploadFolder?: string) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
  }

  if (uploadFolder) {
    const filePath = path.join(uploadFolder, pathName);
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 201, Message: 'File created successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 500, Message: 'Error storing the file' }));
    }
  } else {
    storage.set(pathName, body);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 201, Message: 'File created successfully' }));
  }
}

async function handleDelete(pathName: string, res: http.ServerResponse, uploadFolder?: string) {
  if (uploadFolder) {
    const filePath = path.join(uploadFolder, pathName);
    try {
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 200, Message: 'File deleted successfully' }));
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
    }
  } else {
    if (storage.has(pathName)) {
      storage.delete(pathName);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 200, Message: 'File deleted successfully' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
    }
  }
}

export default createServer;
