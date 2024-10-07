import assert from 'node:assert';
import test from 'node:test';
import http from 'node:http';
import createServer from '../src/createServer';

const PORT = 3000;
const STORAGE_ZONE_NAME = 'test-storage';
const ACCESS_KEY = 'test-access-key';

function makeRequest(method: string, path: string, body?: string): Promise<[http.IncomingMessage, string]> {
  return new Promise((resolve, reject) => {
    const req = http.request({
      method,
      hostname: 'localhost',
      port: PORT,
      path: `/${STORAGE_ZONE_NAME}/${path}`,
      headers: {
        'AccessKey': ACCESS_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve([res, data]));
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

test('Mock Bunny CDN Server', async (t) => {
  const server = createServer({ storageZoneName: STORAGE_ZONE_NAME, accessKey: ACCESS_KEY });
  server.listen(PORT);

  await t.test('PUT request - create new file', async () => {
    const [res, body] = await makeRequest('PUT', 'test.txt', 'Hello, World!');
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(JSON.parse(body).Message, 'File created successfully');
  });

  await t.test('GET request - retrieve existing file', async () => {
    const [res, body] = await makeRequest('GET', 'test.txt');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(body, 'Hello, World!');
  });

  await t.test('GET request - file not found', async () => {
    const [res, body] = await makeRequest('GET', 'nonexistent.txt');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(JSON.parse(body).Message, 'File not found');
  });

  await t.test('PUT request - update existing file', async () => {
    const [res, body] = await makeRequest('PUT', 'test.txt', 'Updated content');
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(JSON.parse(body).Message, 'File created successfully');

    const [getRes, getBody] = await makeRequest('GET', 'test.txt');
    assert.strictEqual(getRes.statusCode, 200);
    assert.strictEqual(getBody, 'Updated content');
  });

  await t.test('DELETE request - delete existing file', async () => {
    const [res, body] = await makeRequest('DELETE', 'test.txt');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(JSON.parse(body).Message, 'File deleted successfully');

    const [getRes, getBody] = await makeRequest('GET', 'test.txt');
    assert.strictEqual(getRes.statusCode, 404);
    assert.strictEqual(JSON.parse(getBody).Message, 'File not found');
  });

  await t.test('DELETE request - file not found', async () => {
    const [res, body] = await makeRequest('DELETE', 'nonexistent.txt');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(JSON.parse(body).Message, 'File not found');
  });

  await t.test('Invalid access key', async () => {
    const [res, body] = await new Promise((resolve) => {
      const req = http.request({
        method: 'GET',
        hostname: 'localhost',
        port: PORT,
        path: `/${STORAGE_ZONE_NAME}/test.txt`,
        headers: {
          'AccessKey': 'invalid-key'
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve([res, data]));
      });
      req.end();
    });

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(JSON.parse(body).Message, 'Invalid access key');
  });

  await t.test('Unsupported method', async () => {
    const [res, body] = await new Promise((resolve) => {
      const req = http.request({
        method: 'POST',
        hostname: 'localhost',
        port: PORT,
        path: `/${STORAGE_ZONE_NAME}/test.txt`,
        headers: {
          'AccessKey': ACCESS_KEY
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve([res, data]));
      });
      req.end();
    });

    assert.strictEqual(res.statusCode, 405);
    assert.strictEqual(JSON.parse(body).Message, 'Method not allowed');
  });

  server.close();
});