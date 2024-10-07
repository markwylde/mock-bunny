# Mock Bunny

Mock Bunny is a lightweight mock server that simulates the Bunny.net CDN API. It's designed to help developers test their applications that interact with Bunny.net without making actual API calls.

## Features

- Simulates Bunny.net Storage API endpoints
- Supports GET, PUT, and DELETE operations
- In-memory storage for quick testing
- File system storage for persistent testing
- Configurable storage zone name and access key
- TypeScript support

## Installation

```bash
npm install mock-bunny
```

## Usage

### Basic Setup

```javascript
import mockBunny from 'mock-bunny';

const server = mockBunny({
  storageZoneName: 'my-storage',
  accessKey: 'my-access-key',
  uploadFolder: './uploaded-files'
});

server.listen(3000, () => {
  console.log('Mock Bunny CDN server is running on http://localhost:3000');
});
```

### Docker Usage

You can also run Mock Bunny using Docker. Our Docker image is available on GitHub Container Registry.

To pull the latest image:

```bash
docker pull ghcr.io/markwylde/mock-bunny:latest
```

To run the container:

```bash
docker run -p 3000:3000 ghcr.io/markwylde/mock-bunny:latest
```

You can customize the storage zone name, access key, and upload folder using environment variables:

```bash
docker run -p 3000:3000 \
  -e STORAGE_ZONE_NAME=my-custom-zone \
  -e ACCESS_KEY=my-custom-key \
  -e UPLOAD_FOLDER=/app/uploaded-files \
  -v /path/on/host:/app/uploaded-files \
  ghcr.io/markwylde/mock-bunny:latest
```

### API

The mock server supports the following operations:

- `GET /:storageZoneName/:fileName` - Retrieve a file
- `PUT /:storageZoneName/:fileName` - Upload or update a file
- `DELETE /:storageZoneName/:fileName` - Delete a file

All requests should include the `AccessKey` header with the configured access key.

## Configuration

You can configure the mock server by passing options to the `mockBunny` function:

```javascript
mockBunny({
  storageZoneName: 'custom-storage', // Default: 'test-storage'
  accessKey: 'custom-key', // Default: 'test-access-key'
  uploadFolder: './custom-upload-folder' // Optional: for file system storage
});
```

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Build the project: `npm run build`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
