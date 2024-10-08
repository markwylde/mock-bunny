import http from 'node:http';
import url from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const storage = new Map<string, string>();

interface ServerOptions {
  storageZoneName?: string;
  accessKey?: string;
  uploadFolder?: string;
  publicRead?: boolean;
}

export function createServer(options: ServerOptions = {}) {
  const {
    storageZoneName = 'test-storage',
    accessKey = 'test-access-key',
    uploadFolder,
    publicRead = false
  } = options;

  const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const parsedUrl = url.parse(req.url || '');
    const pathName = (parsedUrl.pathname || '').replace(`/${storageZoneName}/`, '');

    const isAccessAllowed =
      (publicRead && req.method === 'GET') ||
      req.headers['accesskey'] === accessKey;

    if (!isAccessAllowed) {
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
  try {
    let data: Buffer;
    if (uploadFolder) {
      const filePath = path.join(uploadFolder, pathName);
      data = await fs.readFile(filePath);
    } else {
      const fileContent = storage.get(pathName);
      if (!fileContent) throw new Error('File not found');
      data = Buffer.from(fileContent);
    }
    res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
  }
}

async function handlePut(pathName: string, req: http.IncomingMessage, res: http.ServerResponse, uploadFolder?: string) {
  try {
    const body = await streamToBuffer(req);
    if (uploadFolder) {
      const filePath = path.join(uploadFolder, pathName);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, body);
    } else {
      storage.set(pathName, body.toString());
    }
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 201, Message: 'File created successfully' }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 500, Message: 'Error storing the file' }));
  }
}

async function handleDelete(pathName: string, res: http.ServerResponse, uploadFolder?: string) {
  try {
    if (uploadFolder) {
      const filePath = path.join(uploadFolder, pathName);
      await fs.unlink(filePath);
    } else {
      if (!storage.has(pathName)) throw new Error('File not found');
      storage.delete(pathName);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 200, Message: 'File deleted successfully' }));
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ HttpCode: 404, Message: 'File not found' }));
  }
}

async function streamToBuffer(stream: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export default createServer;
