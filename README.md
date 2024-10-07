# Mock Bunny

Mock Bunny is a lightweight mock server that simulates the Bunny.net CDN API. It's designed to help developers test their applications that interact with Bunny.net without making actual API calls.

## Features

- Simulates Bunny.net Storage API endpoints
- Supports GET, PUT, and DELETE operations
- In-memory storage for quick testing
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
  accessKey: 'my-access-key'
});

server.listen(3000, () => {
  console.log('Mock Bunny CDN server is running on http://localhost:3000');
});
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
  accessKey: 'custom-key' // Default: 'test-access-key'
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
