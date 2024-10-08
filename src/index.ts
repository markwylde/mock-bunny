import createServer from './createServer.js';

const server = createServer({
  storageZoneName: process.env.STORAGE_ZONE_NAME,
  accessKey: process.env.ACCESS_KEY,
  uploadFolder: process.env.UPLOAD_FOLDER,
  publicRead: process.env.PUBLIC_READ === 'true',
});

server.listen(3000, () => {
  console.log('Mock Bunny CDN server is running on http://localhost:3000');
});
