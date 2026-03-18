# pic-scale — Backend

## Requirements

- Node.js >= 18
- pnpm
- Docker

## Setup

```bash
cp .env.example .env
```

## API

| Method | Endpoint    | Description                         |
| ------ | ----------- | ----------------------------------- |
| `POST` | `/upload`   | Upload image and create upscale job |
| `GET`  | `/jobs`     | Get all jobs                        |
| `GET`  | `/jobs/:id` | Get job by id                       |

## WebSocket

Connect to `/upscale` namespace:

```js
// Subscribe to job updates
socket.emit('subscribe:job', jobId);

// Listen for updates
socket.on('job:updated', (data) => {
  // { jobId, status, resultUrl?, errorMessage? }
});
```

## Run

```bash
# from monorepo root
pnpm dev:back

# from current directory
pnpm dev
```
