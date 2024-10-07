import createServer from './createServer.js';

const server = createServer({
  storageZoneName: 'my-storage',
  accessKey: 'my-access-key',
  uploadFolder: './uploaded-files'
});

server.listen(3000, () => {
  console.log('Mock Bunny CDN server is running on http://localhost:3000');
});
