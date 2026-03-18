# pic-scale

AI-powered image upscaler built with Real-ESRGAN.

## Stack

- **Monorepo**: Turborepo
- **Backend**: NestJS, PostgreSQL, Redis, BullMQ, MinIO (S3-compatible)
- **Frontend**: React, Vite
- **AI Service**: FastAPI, Real-ESRGAN

## Services

| Service       | URL                   |
| ------------- | --------------------- |
| Backend API   | http://localhost:3000 |
| Frontend      | http://localhost:5173 |
| Upscaler API  | http://localhost:8000 |
| MinIO Console | http://localhost:9001 |
| pgweb         | http://localhost:8081 |
| BullBoard     | http://localhost:3001 |

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/stray4x/pic-scale.git
cd pic-scale
pnpm install
```

### 2. Setup upscaler weights

See [services/upscaler/readme.md](./services/upscaler/readme.md)

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

### 4. Start infrastructure

```bash
docker compose up -d
```

### 5. Start development

```bash
# All apps
pnpm dev

# Backend only
pnpm dev:back

# Frontend only
pnpm dev:front
```

## More info

- [Backend](./apps/backend/README.md)
- [Frontend](./apps/frontend/README.md)
- [Upscaler service](./services/upscaler/readme.md)
